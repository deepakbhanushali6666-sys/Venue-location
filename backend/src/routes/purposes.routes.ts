import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const purposesRouter = Router();

purposesRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabasePublic
      .from("venue_purposes")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw error;
    res.json({ purposes: data ?? [] });
  } catch (err) {
    next(err);
  }
});

purposesRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    if (!name?.trim()) {
      res.status(400).json({ error: "Purpose name is required" });
      return;
    }
    const { data, error } = await req.client!
      .from("venue_purposes")
      .insert({ name: name.trim(), sort_order: sort_order ?? 0 })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ purpose: data });
  } catch (err) {
    next(err);
  }
});

purposesRouter.patch("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    const updates: Record<string, unknown> = {};
    if (name?.trim()) updates.name = name.trim();
    if (sort_order !== undefined) updates.sort_order = sort_order;
    const { data, error } = await req.client!
      .from("venue_purposes")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ purpose: data });
  } catch (err) {
    next(err);
  }
});

purposesRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venue_purposes").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
