import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const locationsRouter = Router();

locationsRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabasePublic.from("venue_locations").select("*").order("kind").order("sort_order").order("name");
    if (error) throw error;
    res.json({ locations: data ?? [] });
  } catch (err) {
    next(err);
  }
});

locationsRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { kind, name, sort_order } = req.body as { kind?: string; name?: string; sort_order?: number };
    if (kind !== "state" && kind !== "city") {
      res.status(400).json({ error: "kind must be state or city" });
      return;
    }
    if (!name?.trim()) {
      res.status(400).json({ error: "Location name is required" });
      return;
    }
    const { data, error } = await req.client!.from("venue_locations").insert({ kind, name: name.trim(), sort_order: sort_order ?? 0 }).select().single();
    if (error) throw error;
    res.status(201).json({ location: data });
  } catch (err) {
    next(err);
  }
});

locationsRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venue_locations").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
