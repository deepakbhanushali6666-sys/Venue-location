import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const categoriesRouter = Router();

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Public: all categories with their subcategories nested, ordered for display.
categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const [categoriesRes, subcategoriesRes] = await Promise.all([
      supabasePublic.from("venue_categories").select("*").order("sort_order").order("name"),
      supabasePublic.from("venue_subcategories").select("*").order("sort_order").order("name"),
    ]);
    if (categoriesRes.error) throw categoriesRes.error;
    if (subcategoriesRes.error) throw subcategoriesRes.error;

    const categories = (categoriesRes.data ?? []).map((c) => ({
      ...c,
      subcategories: (subcategoriesRes.data ?? []).filter((s) => s.category_id === c.id),
    }));
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// Admin: create a category.
categoriesRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    if (!name?.trim()) {
      res.status(400).json({ error: "Category name is required" });
      return;
    }
    const { data, error } = await req.client!
      .from("venue_categories")
      .insert({ name: name.trim(), slug: slugify(name), sort_order: sort_order ?? 0 })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (err) {
    next(err);
  }
});

// Admin: rename or reorder a category.
categoriesRouter.patch("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    const updates: Record<string, unknown> = {};
    if (name?.trim()) {
      updates.name = name.trim();
      updates.slug = slugify(name);
    }
    if (sort_order !== undefined) updates.sort_order = sort_order;
    const { data, error } = await req.client!
      .from("venue_categories")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ category: data });
  } catch (err) {
    next(err);
  }
});

// Admin: delete a category (cascades to its subcategories).
categoriesRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venue_categories").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Admin: create a subcategory under a category.
categoriesRouter.post("/:id/subcategories", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    if (!name?.trim()) {
      res.status(400).json({ error: "Subcategory name is required" });
      return;
    }
    const { data, error } = await req.client!
      .from("venue_subcategories")
      .insert({ category_id: req.params.id, name: name.trim(), slug: slugify(name), sort_order: sort_order ?? 0 })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ subcategory: data });
  } catch (err) {
    next(err);
  }
});

// Admin: rename or reorder a subcategory.
categoriesRouter.patch("/subcategories/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    const updates: Record<string, unknown> = {};
    if (name?.trim()) {
      updates.name = name.trim();
      updates.slug = slugify(name);
    }
    if (sort_order !== undefined) updates.sort_order = sort_order;
    const { data, error } = await req.client!
      .from("venue_subcategories")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ subcategory: data });
  } catch (err) {
    next(err);
  }
});

// Admin: delete a subcategory.
categoriesRouter.delete("/subcategories/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venue_subcategories").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
