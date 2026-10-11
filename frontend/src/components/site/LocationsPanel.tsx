import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { assignCityState, createLocation, deleteLocation, listLocations, type LocationRecord } from "@/lib/api";

export function LocationsPanel() {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [kind, setKind] = useState<"state" | "city">("city");
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [saving, setSaving] = useState(false);
  const stateLocations = locations.filter((location) => location.kind === "state");

  const load = async () => {
    try {
      const { locations: rows } = await listLocations();
      setLocations(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load locations");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async () => {
    if (saving) return;
    if (!name.trim()) return;
    if (kind === "city" && !stateId) {
      toast.error("Select a state for the city");
      return;
    }
    setSaving(true);
    try {
      await createLocation({ kind, name: name.trim(), ...(kind === "city" ? { state_id: stateId } : {}), sort_order: locations.filter((item) => item.kind === kind).length + 1 });
      setName("");
      toast.success(`${kind === "city" ? "City" : "State"} added`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add location");
    } finally {
      setSaving(false);
    }
  };
  const assignState = async (location: LocationRecord, id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await assignCityState(location.id, id);
      toast.success(`${location.name} assigned to its state`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not assign city state");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (location: LocationRecord) => {
    if (!window.confirm(`Delete ${location.name} from the ${location.kind} list?`)) return;
    try {
      await deleteLocation(location.id);
      toast.success(`${location.kind === "city" ? "City" : "State"} deleted`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete location");
    }
  };

  return (
    <section id="admin-locations" className="mt-8 scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-panel">
      <h2 className="font-display text-xl font-extrabold text-navy">Venue Locations</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manage the state and city choices shown on the listing form.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as "state" | "city")} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="city">City</option>
          <option value="state">State</option>
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} placeholder={`New ${kind} name`} className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <button type="button" onClick={() => void add()} disabled={saving || !name.trim() || (kind === "city" && !stateId)} className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60">Add {kind}</button>
      </div>
      <label className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-navy">
        State for cities
        <select aria-label="State for cities" value={stateId} disabled={saving} onChange={(event) => setStateId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select a state</option>
          {stateLocations.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
        </select>
      </label>
      <p className="mt-2 text-xs text-muted-foreground">Cities below are filtered by the selected state. Assign any unassigned cities using their state selector.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {(["state", "city"] as const).map((locationKind) => (
          <div key={locationKind}>
            <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-navy">{locationKind === "city" ? "Cities" : "States"}</h3>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {locations.filter((location) => location.kind === locationKind &&
                (locationKind === "state" || !stateId || location.state_id === stateId || !location.state_id))
                .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })).map((location) => (
                <div key={location.id} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {location.name}
                  {location.kind === "city" && (
                    <select aria-label={`State for ${location.name}`} value={location.state_id ?? ""} disabled={saving} onChange={(event) => { if (event.target.value) void assignState(location, event.target.value); }} className="max-w-40 rounded border border-border bg-background text-xs">
                      <option value="" disabled>Unassigned - select state</option>
                      {stateLocations.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
                    </select>
                  )}
                  <button type="button" onClick={() => void remove(location)} aria-label={`Delete ${location.name}`} className="text-destructive"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
