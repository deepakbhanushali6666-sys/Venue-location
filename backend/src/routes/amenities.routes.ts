import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const amenitiesRouter = Router();

amenitiesRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabasePublic
      .from("venue_amenities")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw error;
    res.json({ amenities: data ?? [] });
  } catch (err) {
    next(err);
  }
});

amenitiesRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { name, sort_order } = req.body as { name?: string; sort_order?: number };
    if (!name?.trim()) {
      res.status(400).json({ error: "Amenity name is required" });
      return;
    }
    const { data, error } = await req.client!
      .from("venue_amenities")
      .insert({ name: name.trim(), sort_order: sort_order ?? 0 })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ amenity: data });
  } catch (err) {
    next(err);
  }
});

amenitiesRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venue_amenities").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
