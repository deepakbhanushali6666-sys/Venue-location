import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const galleryRouter = Router();

const SECTIONS = ["testimonial", "celebrity"] as const;
const MEDIA_TYPES = ["photo", "video"] as const;

// Public: all gallery items, grouped/ordered for display.
galleryRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabasePublic
      .from("gallery_items")
      .select("*")
      .order("section")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    res.json({ items: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// Admin: add a photo (storage URL) or video link to a section.
galleryRouter.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { section, media_type, url } = req.body as {
      section?: string;
      media_type?: string;
      url?: string;
    };
    if (!section || !SECTIONS.includes(section as (typeof SECTIONS)[number])) {
      res.status(400).json({ error: "section must be 'testimonial' or 'celebrity'" });
      return;
    }
    if (!url?.trim()) {
      res.status(400).json({ error: "url is required" });
      return;
    }
    const type =
      media_type && MEDIA_TYPES.includes(media_type as (typeof MEDIA_TYPES)[number])
        ? media_type
        : "photo";
    const { data, error } = await req.client!
      .from("gallery_items")
      .insert({ section, media_type: type, url: url.trim() })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ item: data });
  } catch (err) {
    next(err);
  }
});

// Admin: delete a gallery item.
galleryRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("gallery_items").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
