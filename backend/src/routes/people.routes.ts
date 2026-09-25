import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const peopleRouter = Router();
const SECTIONS = ["team", "advisor"] as const;
type Section = (typeof SECTIONS)[number];

peopleRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabasePublic
      .from("people_profiles")
      .select("*")
      .order("section")
      .order("sort_order")
      .order("name");
    if (error) throw error;
    res.json({ profiles: data ?? [] });
  } catch (err) {
    next(err);
  }
});

peopleRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { section, name, title, description, photo_url, sort_order } = req.body as {
      section?: string;
      name?: string;
      title?: string;
      description?: string;
      photo_url?: string;
      sort_order?: number;
    };
    if (!section || !SECTIONS.includes(section as Section)) {
      res.status(400).json({ error: "section must be 'team' or 'advisor'" });
      return;
    }
    if (!name?.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const { data, error } = await req.client!
      .from("people_profiles")
      .insert({
        section,
        name: name.trim(),
        title: title?.trim() ?? "",
        description: description?.trim() ?? "",
        photo_url: photo_url?.trim() ?? "",
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ profile: data });
  } catch (err) {
    next(err);
  }
});

peopleRouter.patch("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { section, name, title, description, photo_url, sort_order } = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (section !== undefined && SECTIONS.includes(section as Section)) updates.section = section;
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof title === "string") updates.title = title.trim();
    if (typeof description === "string") updates.description = description.trim();
    if (typeof photo_url === "string") updates.photo_url = photo_url.trim();
    if (typeof sort_order === "number") updates.sort_order = sort_order;
    const { data, error } = await req.client!
      .from("people_profiles")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

peopleRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("people_profiles").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
