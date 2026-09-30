import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VenuePhotoWatermark } from "@/components/site/VenuePhotoWatermark";

const TEN_YEARS = 60 * 60 * 24 * 3650;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 10;
const MAX_IMAGE_DIMENSION = 2400;

async function watermarkPhoto(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not process this photo");

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let fontSize = Math.min(canvas.width * 0.07, canvas.height * 0.12, 84);
    context.font = `bold ${fontSize}px sans-serif`;
    fontSize *= Math.min(1, (canvas.width * 0.82) / context.measureText("VENUES LOCATION").width);
    context.font = `bold ${fontSize}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "rgba(0, 0, 0, 0.6)";
    context.shadowBlur = Math.max(2, fontSize * 0.08);
    context.fillStyle = "rgba(255, 255, 255, 0.46)";
    context.fillText("VENUES LOCATION", canvas.width / 2, canvas.height / 2);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not process this photo")), "image/jpeg", 0.9);
    });
  } finally {
    image.close();
  }
}

export function PhotoUploader({
  userId,
  value,
  onChange,
  onBusyChange,
}: {
  userId: string;
  value: string[];
  onChange: (next: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - value.length;
    if (remaining <= 0) {
      toast.error(`You can upload up to ${MAX_PHOTOS} photos`);
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    const uploaded: string[] = [];
    const selected = Array.from(files);
    if (selected.length > remaining) {
      toast.error(`Only ${remaining} more photo${remaining > 1 ? "s" : ""} allowed (max ${MAX_PHOTOS})`);
    }
    for (const file of selected.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is larger than 8 MB`);
        continue;
      }
      let watermarked: Blob;
      try {
        watermarked = await watermarkPhoto(file);
      } catch {
        toast.error(`Could not watermark ${file.name}`);
        continue;
      }
      const path = `${userId}/wm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from("venue-photos").upload(path, watermarked, {
        cacheControl: "31536000",
        contentType: "image/jpeg",
      });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data, error: signErr } = await supabase.storage
        .from("venue-photos")
        .createSignedUrl(path, TEN_YEARS);
      if (signErr || !data?.signedUrl) {
        toast.error(signErr?.message ?? "Could not generate photo link");
        continue;
      }
      uploaded.push(data.signedUrl);
    }
    setBusy(false);
    onBusyChange?.(false);
    if (inputRef.current) inputRef.current.value = "";
    if (uploaded.length) {
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploaded`);
    }
  };

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 font-display text-xs font-extrabold uppercase tracking-wide text-navy">Venue photos</p>

      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={url} className="group relative overflow-hidden rounded-md border border-border [container-type:inline-size]">
              <img src={url} alt={`Venue photo ${i + 1}`} loading="lazy" className="h-24 w-full object-cover" />
              <VenuePhotoWatermark src={url} />
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== url))}
                className="absolute right-1 top-1 rounded bg-navy/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground"
              >
                Remove
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase text-gold-foreground">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || value.length >= MAX_PHOTOS}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-navy px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wide text-navy disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        <span className="text-xs text-muted-foreground">
          JPG or PNG, up to 8 MB each. First photo is the cover. {value.length}/{MAX_PHOTOS} photos.
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void upload(e.target.files)}
      />
    </div>
  );
}
