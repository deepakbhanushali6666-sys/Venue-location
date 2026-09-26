import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createPurpose, deletePurpose, listPurposes, updatePurpose, type PurposeRecord } from "@/lib/api";

export function PurposesPanel() {
  const [purposes, setPurposes] = useState<PurposeRecord[]>([]);
  const [newPurpose, setNewPurpose] = useState("");

  const load = async () => {
    try {
      const { purposes: rows } = await listPurposes();
      setPurposes(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load purposes");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async () => {
    const name = newPurpose.trim();
    if (!name) return;
    try {
      await createPurpose({ name, sort_order: purposes.length + 1 });
      setNewPurpose("");
      toast.success("Purpose added");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add purpose");
    }
  };

  const rename = async (purpose: PurposeRecord, name: string) => {
    if (!name.trim() || name.trim() === purpose.name) return;
    try {
      await updatePurpose(purpose.id, { name: name.trim() });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename purpose");
    }
  };

  const remove = async (purpose: PurposeRecord) => {
    if (!window.confirm(`Delete purpose "${purpose.name}"?`)) return;
    try {
      await deletePurpose(purpose.id);
      toast.success("Purpose deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete purpose");
    }
  };

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
      <h2 className="font-display text-xl font-extrabold text-navy">Enquiry Purposes</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage purpose options used in searches and enquiry forms. Changes apply immediately.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={newPurpose}
          onChange={(event) => setNewPurpose(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void add()}
          placeholder="New purpose"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={!newPurpose.trim()}
          className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60"
        >
          Add purpose
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {purposes.map((purpose) => (
          <div key={purpose.id} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <input
              defaultValue={purpose.name}
              aria-label={`Purpose name: ${purpose.name}`}
              onBlur={(event) => void rename(purpose, event.target.value)}
              className="min-w-20 bg-transparent text-sm font-semibold text-navy outline-none"
            />
            <button
              type="button"
              onClick={() => void remove(purpose)}
              aria-label={`Delete ${purpose.name}`}
              className="text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {purposes.length === 0 && <p className="text-sm text-muted-foreground">No purposes configured.</p>}
      </div>
    </section>
  );
}
