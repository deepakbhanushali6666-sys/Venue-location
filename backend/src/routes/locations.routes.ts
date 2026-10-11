import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const locationsRouter = Router();

locationsRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabasePublic.from("venue_locations").select("*").order("kind").order("sort_order").order("name");
    if (error) throw error;
    const locations = data ?? [];
    locations.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
      if (a.kind === "city") return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
      return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    });
    res.json({ locations });
  } catch (err) {
    next(err);
  }
});

locationsRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { kind, name, sort_order, state_id } = req.body as { kind?: string; name?: string; sort_order?: number; state_id?: string };
    if (kind !== "state" && kind !== "city") {
      res.status(400).json({ error: "kind must be state or city" });
      return;
    }
    if (!name?.trim()) {
      res.status(400).json({ error: "Location name is required" });
      return;
    }
    if (kind === "city" && !state_id) {
      res.status(400).json({ error: "Select a state for the city" });
      return;
    }
    const { data, error } = await req.client!.from("venue_locations").insert({ kind, name: name.trim(), state_id: kind === "city" ? state_id : null, sort_order: sort_order ?? 0 }).select().single();
    if (error) throw error;
    res.status(201).json({ location: data });
  } catch (err) {
    next(err);
  }
});

locationsRouter.patch("/:id/state", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { state_id } = req.body as { state_id?: string };
    if (!state_id) {
      res.status(400).json({ error: "Select a state for the city" });
      return;
    }
    const { data, error } = await req.client!.from("venue_locations")
      .update({ state_id }).eq("id", req.params.id).eq("kind", "city").select().maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "City not found" });
      return;
    }
    res.json({ location: data });
  } catch (err) {
    next(err);
  }
});

locationsRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venue_locations").delete().eq("id", req.params.id);
    if (error?.code === "23503") {
      res.status(409).json({ error: "Move or delete this state's cities before deleting the state" });
      return;
    }
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
