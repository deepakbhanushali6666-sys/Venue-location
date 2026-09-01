import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 3650;
const MAX_BYTES = 8 * 1024 * 1024;

export function PhotoUploader({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const uploaded: string[] = [];
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
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("venue-photos").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
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
            <div key={url} className="group relative overflow-hidden rounded-md border border-border">
              <img src={url} alt={`Venue photo ${i + 1}`} loading="lazy" className="h-24 w-full object-cover" />
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
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-navy px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wide text-navy disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        <span className="text-xs text-muted-foreground">JPG or PNG, up to 8 MB each. First photo is the cover.</span>
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
