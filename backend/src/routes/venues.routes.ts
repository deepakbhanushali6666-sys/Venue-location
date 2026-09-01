import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const venuesRouter = Router();

// Public: approved venues only, with optional filters.
venuesRouter.get("/", async (req, res, next) => {
  try {
    let query = supabasePublic
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    const { category, city, search } = req.query;
    if (typeof category === "string" && category) query = query.eq("category", category);
    if (typeof city === "string" && city) query = query.eq("city", city);
    if (typeof search === "string" && search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ venues: data });
  } catch (err) {
    next(err);
  }
});

// Auth: venues owned by the current user (dashboard).
venuesRouter.get("/mine", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("venues")
      .select("*")
      .eq("owner_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ venues: data });
  } catch (err) {
    next(err);
  }
});

// Public: single approved venue by slug.
venuesRouter.get("/:slug", async (req, res, next) => {
  try {
    const { data, error } = await supabasePublic
      .from("venues")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("status", "approved")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Venue not found" });
      return;
    }
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Auth: create a venue owned by the current user.
venuesRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("venues")
      .insert({ ...req.body, owner_id: req.user!.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Auth: owner can edit their own venue details; admin can additionally set status/featured.
venuesRouter.patch("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data: existing, error: fetchError } = await req.client!
      .from("venues")
      .select("owner_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) {
      res.status(404).json({ error: "Venue not found" });
      return;
    }
    if (existing.owner_id !== req.user!.id && !req.user!.isAdmin) {
      res.status(403).json({ error: "Not allowed to modify this venue" });
      return;
    }

    const { status, featured, owner_id, ...rest } = req.body;
    const updates: Record<string, unknown> = { ...rest };
    if (req.user!.isAdmin) {
      if (status !== undefined) updates.status = status;
      if (featured !== undefined) updates.featured = featured;
    }

    const { data, error } = await req.client!
      .from("venues")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Admin: approve/reject a venue.
venuesRouter.patch("/:id/status", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { status } = req.body;
    const { data, error } = await req.client!
      .from("venues")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Admin: toggle featured flag.
venuesRouter.patch("/:id/featured", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { featured } = req.body;
    const { data, error } = await req.client!
      .from("venues")
      .update({ featured })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

