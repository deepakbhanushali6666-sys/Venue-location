import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { createCroppedJpeg } from "@/lib/image-crop";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  createPeopleProfile,
  deletePeopleProfile,
  listPeopleProfiles,
  updatePeopleProfile,
  type PeopleProfile,
  type PeopleSection,
} from "@/lib/api";

const MAX_BYTES = 8 * 1024 * 1024;
const sections: { key: PeopleSection; label: string }[] = [
  { key: "team", label: "Our Team" },
  { key: "advisor", label: "Advisors" },
];

export function PeoplePanel() {
  const [profiles, setProfiles] = useState<PeopleProfile[]>([]);
  const [section, setSection] = useState<PeopleSection>("team");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [editing, setEditing] = useState<PeopleProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  useEffect(() => {
    if (!cropFile) {
      setCropImage("");
      return;
    }
    const url = URL.createObjectURL(cropFile);
    setCropImage(url);
    return () => URL.revokeObjectURL(url);
  }, [cropFile]);

  const load = async () => {
    try {
      const { profiles: rows } = await listPeopleProfiles();
      setProfiles(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load team profiles");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Photo must be 8 MB or smaller");
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      setCropFile(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open this image");
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const cropExistingPhoto = async () => {
    setBusy(true);
    try {
      const response = await fetch(photoUrl);
      if (!response.ok) throw new Error("Could not load the existing photo");
      const blob = await response.blob();
      await uploadPhoto(new File([blob], "profile-photo", { type: blob.type }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load the existing photo");
    } finally {
      setBusy(false);
    }
  };

  const saveCrop = async () => {
    if (!cropFile || !croppedArea || busy) return;
    setBusy(true);
    try {
      const photo = await createCroppedJpeg(cropFile, croppedArea, 1200, 900);
      const path = `people/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from("gallery-media").upload(path, photo, {
        cacheControl: "31536000",
        contentType: "image/jpeg",
      });
      if (error) throw error;
      setPhotoUrl(supabase.storage.from("gallery-media").getPublicUrl(path).data.publicUrl);
      setCropFile(null);
      toast.success("Photo cropped and uploaded. Save the profile to publish it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload cropped photo");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setName("");
    setTitle("");
    setDescription("");
    setPhotoUrl("");
    setEditing(null);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        section,
        name: name.trim(),
        title: title.trim(),
        description: description.trim(),
        photo_url: photoUrl,
        sort_order: editing?.sort_order ?? 0,
      };
      if (editing) {
        await updatePeopleProfile(editing.id, payload);
        toast.success("Profile updated");
      } else {
        await createPeopleProfile(payload);
        toast.success("Profile added");
      }
      reset();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (profile: PeopleProfile) => {
    setEditing(profile);
    setSection(profile.section);
    setName(profile.name);
    setTitle(profile.title);
    setDescription(profile.description);
    setPhotoUrl(profile.photo_url);
  };

  const remove = async (profile: PeopleProfile) => {
    if (!window.confirm(`Delete ${profile.name}'s profile?`)) return;
    try {
      await deletePeopleProfile(profile.id);
      toast.success("Profile deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete profile");
    }
  };

  return (
    <section id="admin-people" className="mt-8 scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-panel">
      <h2 className="font-display text-xl font-extrabold text-navy">Team & Advisors</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add names, photos, titles and descriptions shown on the public pages.</p>
      <Dialog open={cropFile !== null} onOpenChange={(open) => { if (!open && !busy) setCropFile(null); }}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto" onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }} onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}>
          <DialogTitle>Crop profile photo</DialogTitle>
          <DialogDescription>Drag the photo to position the face, then adjust zoom. The crop matches the public team and advisor cards.</DialogDescription>
          <div className="relative h-48 overflow-hidden rounded-md bg-secondary sm:h-72">
            {cropImage && <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={4 / 3} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedArea(pixels)} />}
          </div>
          <label className="grid gap-2 text-sm font-bold text-navy">
            Zoom
            <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} disabled={busy} />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" disabled={busy} onClick={() => setCropFile(null)} className="rounded-md border border-border px-4 py-2 text-sm font-bold">Cancel</button>
            <button type="button" disabled={busy || !croppedArea} onClick={() => void saveCrop()} className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60">{busy ? "Uploading..." : "Crop & Upload"}</button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select value={section} onChange={(e) => setSection(e.target.value as PeopleSection)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          {sections.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title / role" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-md border border-navy px-3 py-2 text-sm font-bold text-navy disabled:opacity-60">
          <Upload className="size-4" /> {photoUrl ? "Replace photo" : "Upload photo"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void uploadPhoto(e.target.files?.[0])} />
        {photoUrl && (
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <img src={photoUrl} alt="Profile photo preview" className="aspect-4/3 w-48 rounded-md bg-secondary object-contain" />
            <button type="button" disabled={busy} onClick={() => void cropExistingPhoto()} className="rounded-md border border-navy px-3 py-2 text-sm font-bold text-navy disabled:opacity-60">Crop current photo</button>
          </div>
        )}
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="md:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => void save()} disabled={busy} className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60">
          {editing ? "Update profile" : "Add profile"}
        </button>
        {editing && <button type="button" onClick={reset} className="rounded-md border border-border px-4 py-2 text-sm font-bold">Cancel</button>}
      </div>
      <div className="mt-6 space-y-3">
        {sections.map((item) => (
          <div key={item.key}>
            <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-navy">{item.label}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {profiles.filter((profile) => profile.section === item.key).map((profile) => (
                <div key={profile.id} className="flex gap-3 rounded-lg border border-border p-3">
                  {profile.photo_url ? <img src={profile.photo_url} alt="" className="h-12 w-16 rounded-md bg-secondary object-contain" /> : <div className="h-12 w-16 rounded-md bg-secondary" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.title}</p>
                    <div className="mt-2 flex gap-3">
                      <button type="button" onClick={() => startEdit(profile)} className="inline-flex items-center gap-1 text-xs font-bold text-navy"><Pencil className="size-3" /> Edit</button>
                      <button type="button" onClick={() => void remove(profile)} className="inline-flex items-center gap-1 text-xs font-bold text-destructive"><Trash2 className="size-3" /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
