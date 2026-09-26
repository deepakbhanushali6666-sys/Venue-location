import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import {
  createGalleryItem,
  deleteGalleryItem,
  listGalleryItems,
  type GalleryItem,
  type GallerySection,
} from "@/lib/api";

const MAX_BYTES = 8 * 1024 * 1024;

const sections: { key: GallerySection; label: string }[] = [
  { key: "testimonial", label: "Client Testimonials" },
  { key: "celebrity", label: "Celebrity Collaborations" },
];

function SectionEditor({
  section,
  label,
  items,
  onChanged,
}: {
  section: GallerySection;
  label: string;
  items: GalleryItem[];
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is larger than 8 MB`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${section}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("gallery-media").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("gallery-media").getPublicUrl(path);
      try {
        await createGalleryItem({ section, media_type: "photo", url: data.publicUrl });
        uploaded += 1;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save photo");
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (uploaded) {
      toast.success(`${uploaded} photo${uploaded > 1 ? "s" : ""} added`);
      onChanged();
    }
  };

  const addVideo = async () => {
    const url = videoUrl.trim();
    if (!url) return;
    if (!getYouTubeEmbedUrl(url)) {
      toast.error("Enter a valid YouTube video link");
      return;
    }
    setBusy(true);
    try {
      await createGalleryItem({ section, media_type: "video", url });
      setVideoUrl("");
      toast.success("Video link added");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add video link");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: GalleryItem) => {
    if (!window.confirm("Remove this item from the gallery?")) return;
    try {
      await deleteGalleryItem(item.id);
      toast.success("Removed");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove item");
    }
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="font-display text-base font-extrabold text-navy">{label}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void uploadPhotos(e.target.files)}
        />
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void addVideo()}
          placeholder="Paste a YouTube video link"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          type="button"
          disabled={busy || !videoUrl.trim()}
          onClick={() => void addVideo()}
          className="rounded-md bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold-foreground disabled:opacity-60"
        >
          Add video
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-video overflow-hidden rounded-md border border-border bg-secondary">
              {item.media_type === "photo" ? (
                <img src={item.url} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Video className="size-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => void remove(item)}
                className="absolute right-1 top-1 rounded bg-navy/80 p-1 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GalleryPanel() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  const load = async () => {
    try {
      const { items: rows } = await listGalleryItems();
      setItems(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load gallery items");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section id="admin-gallery" className="mt-8 scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-panel">
      <h2 className="font-display text-xl font-extrabold text-navy">Gallery</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload photos or paste YouTube links for the public Gallery page. Photos are auto-cropped to fit the
        carousel box.
      </p>
      <div className="mt-4 space-y-4">
        {sections.map((s) => (
          <SectionEditor
            key={s.key}
            section={s.key}
            label={s.label}
            items={items.filter((i) => i.section === s.key)}
            onChanged={() => void load()}
          />
        ))}
      </div>
    </section>
  );
}
