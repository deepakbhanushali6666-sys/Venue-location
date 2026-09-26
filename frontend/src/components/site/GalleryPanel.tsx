import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { Check, Trash2, Video, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import "react-easy-crop/react-easy-crop.css";
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

async function createCroppedJpeg(file: File, area: Area): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare cropped image");
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not export cropped image")), "image/jpeg", 0.9);
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

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
  const [cropFiles, setCropFiles] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const file = cropFiles[cropIndex];
    if (!file) {
      setCropImage(null);
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setCropImage(imageUrl);
    return () => URL.revokeObjectURL(imageUrl);
  }, [cropFiles, cropIndex]);

  const choosePhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is larger than 8 MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length) {
      setCropFiles(validFiles);
      setCropIndex(0);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
    }
  };

  const cancelCrop = () => {
    setCropFiles([]);
    setCropIndex(0);
    setCroppedArea(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const saveCrop = async () => {
    const file = cropFiles[cropIndex];
    if (!file || !croppedArea) return;
    setBusy(true);
    try {
      const croppedFile = await createCroppedJpeg(file, croppedArea);
      const path = `${section}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from("gallery-media").upload(path, croppedFile, {
        cacheControl: "31536000",
        contentType: "image/jpeg",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("gallery-media").getPublicUrl(path);
      await createGalleryItem({ section, media_type: "photo", url: data.publicUrl });
      const nextIndex = cropIndex + 1;
      if (nextIndex >= cropFiles.length) {
        toast.success(`${cropFiles.length} photo${cropFiles.length > 1 ? "s" : ""} cropped and added`);
        cancelCrop();
        onChanged();
      } else {
        setCropIndex(nextIndex);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedArea(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload cropped photo");
    } finally {
      setBusy(false);
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
          onChange={(e) => choosePhotos(e.target.files)}
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

      {cropFiles[cropIndex] && (
        <div className="fixed inset-0 z-100 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Crop gallery photo">
          <div className="w-full max-w-3xl rounded-lg bg-card p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-extrabold text-navy">Crop photo</h4>
                <p className="text-sm text-muted-foreground">Photo {cropIndex + 1} of {cropFiles.length}. Drag to position, then adjust zoom.</p>
              </div>
              <button type="button" onClick={cancelCrop} disabled={busy} className="rounded-md p-2 text-navy hover:bg-secondary" aria-label="Cancel photo crop"><X className="size-5" /></button>
            </div>
            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-md bg-black">
              <Cropper
                image={cropImage ?? ""}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedArea(pixels)}
              />
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-navy">
              Zoom
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-gold" />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={cancelCrop} disabled={busy} className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void saveCrop()} disabled={busy || !croppedArea} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-50">
                <Check className="size-4" /> {busy ? "Uploading…" : cropIndex + 1 < cropFiles.length ? "Crop & Next" : "Crop & Upload"}
              </button>
            </div>
          </div>
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
