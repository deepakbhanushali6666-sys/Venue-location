import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  type CategoryRecord,
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  listCategories,
  updateCategory,
  updateSubcategory,
} from "@/lib/api";

export function CategoriesPanel() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { categories: rows } = await listCategories();
      setCategories(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load categories");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setBusy(true);
    try {
      await createCategory({ name });
      setNewCategory("");
      toast.success("Category added");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setBusy(false);
    }
  };

  const renameCategory = async (id: string, name: string) => {
    try {
      await updateCategory(id, { name });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename category");
    }
  };

  const removeCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}" and all its subcategories?`)) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete category");
    }
  };

  const addSubcategory = async (categoryId: string) => {
    const name = (newSubcategory[categoryId] ?? "").trim();
    if (!name) return;
    try {
      await createSubcategory(categoryId, { name });
      setNewSubcategory((prev) => ({ ...prev, [categoryId]: "" }));
      toast.success("Subcategory added");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add subcategory");
    }
  };

  const renameSubcategory = async (id: string, name: string) => {
    try {
      await updateSubcategory(id, { name });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename subcategory");
    }
  };

  const removeSubcategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete subcategory "${name}"?`)) return;
    try {
      await deleteSubcategory(id);
      toast.success("Subcategory deleted");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete subcategory");
    }
  };

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
      <h2 className="font-display text-xl font-extrabold text-navy">
        Venue Categories &amp; Subcategories
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the category and subcategory options shown on the listing form. Changes apply
        immediately.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void addCategory()}
          placeholder="New category name"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={() => void addCategory()}
          disabled={busy || !newCategory.trim()}
          className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60"
        >
          Add category
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {categories.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                defaultValue={c.name}
                onBlur={(e) =>
                  e.target.value.trim() &&
                  e.target.value !== c.name &&
                  void renameCategory(c.id, e.target.value)
                }
                className="rounded-md border border-transparent bg-transparent px-1 py-1 font-display text-base font-extrabold text-navy outline-none focus:border-gold focus:bg-background"
              />
              <button
                onClick={() => void removeCategory(c.id, c.name)}
                aria-label={`Delete ${c.name}`}
                className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {c.subcategories.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs"
                >
                  <input
                    defaultValue={s.name}
                    onBlur={(e) =>
                      e.target.value.trim() &&
                      e.target.value !== s.name &&
                      void renameSubcategory(s.id, e.target.value)
                    }
                    style={{ width: `${Math.max(s.name.length, 4)}ch` }}
                    className="bg-transparent font-semibold text-navy outline-none"
                  />
                  <button
                    onClick={() => void removeSubcategory(s.id, s.name)}
                    aria-label={`Delete ${s.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </span>
              ))}
              {c.subcategories.length === 0 && (
                <span className="text-xs text-muted-foreground">No subcategories yet.</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={newSubcategory[c.id] ?? ""}
                onChange={(e) => setNewSubcategory((prev) => ({ ...prev, [c.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && void addSubcategory(c.id)}
                placeholder="New subcategory name"
                className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-gold"
              />
              <button
                onClick={() => void addSubcategory(c.id)}
                disabled={!(newSubcategory[c.id] ?? "").trim()}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-bold text-navy disabled:opacity-60"
              >
                Add subcategory
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>
    </section>
  );
}
