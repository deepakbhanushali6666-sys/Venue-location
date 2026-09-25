import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createAmenity, deleteAmenity, listAmenities, type AmenityRecord } from "@/lib/api";

export function AmenitiesPanel() {
  const [amenities, setAmenities] = useState<AmenityRecord[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { amenities: rows } = await listAmenities();
      setAmenities(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load amenities");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createAmenity({ name: name.trim(), sort_order: amenities.length + 1 });
      setName("");
      toast.success("Amenity added");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add amenity");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (amenity: AmenityRecord) => {
    if (!window.confirm(`Delete amenity "${amenity.name}"?`)) return;
    try {
      await deleteAmenity(amenity.id);
      toast.success("Amenity deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete amenity");
    }
  };

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
      <h2 className="font-display text-xl font-extrabold text-navy">Venue Amenities</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void add()}
          placeholder="New amenity name"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button type="button" onClick={() => void add()} disabled={busy || !name.trim()} className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60">
          Add amenity
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
            {amenity.name}
            <button type="button" onClick={() => void remove(amenity)} aria-label={`Delete ${amenity.name}`} className="text-destructive">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
