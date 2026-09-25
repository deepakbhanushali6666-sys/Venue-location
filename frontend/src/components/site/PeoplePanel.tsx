import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `people/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("gallery-media").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setPhotoUrl(supabase.storage.from("gallery-media").getPublicUrl(path).data.publicUrl);
      toast.success("Photo uploaded");
    }
    setBusy(false);
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
                  {profile.photo_url ? <img src={profile.photo_url} alt="" className="size-16 rounded-md object-cover object-top" /> : <div className="size-16 rounded-md bg-secondary" />}
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
