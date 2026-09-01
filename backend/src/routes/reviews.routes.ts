import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { optionalAuth, requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const reviewsRouter = Router();

const REVIEW_COLUMNS =
  "id, venue_id, reviewer_id, reviewer_name, rating, title, comment, status, created_at, owner_reply, owner_reply_at";

// Public (+ optional auth): approved reviews for a venue, plus the caller's own review if signed in.
reviewsRouter.get("/venue/:venueId", optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const client = req.client ?? supabasePublic;
    const { data, error } = await client
      .from("venue_reviews")
      .select(REVIEW_COLUMNS)
      .eq("venue_id", req.params.venueId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = data ?? [];
    const reviews = rows.filter((r) => r.status === "approved");
    const mine = req.user ? (rows.find((r) => r.reviewer_id === req.user!.id) ?? null) : null;
    res.json({ reviews, mine });
  } catch (err) {
    next(err);
  }
});

// Auth: reviews for moderation (admin: all; owner: reviews on their own venues).
reviewsRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    let query = req.client!
      .from("venue_reviews")
      .select(
        "id, venue_id, reviewer_name, rating, title, comment, status, admin_note, created_at, owner_reply, owner_reply_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (!req.user!.isAdmin) {
      const { data: venues, error: venuesError } = await req.client!
        .from("venues")
        .select("id")
        .eq("owner_id", req.user!.id);
      if (venuesError) throw venuesError;

      const venueIds = (venues ?? []).map((v) => v.id);
      if (venueIds.length === 0) {
        res.json({ reviews: [] });
        return;
      }
      query = query.in("venue_id", venueIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ reviews: data });
  } catch (err) {
    next(err);
  }
});

// Auth: create or update the caller's own pending review for a venue.
reviewsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { venue_id, rating, title = "", comment = "", reviewer_name = "" } = req.body;
    if (!venue_id || !rating) {
      res.status(400).json({ error: "venue_id and rating are required" });
      return;
    }

    const { data: existing, error: fetchError } = await req.client!
      .from("venue_reviews")
      .select("id")
      .eq("venue_id", venue_id)
      .eq("reviewer_id", req.user!.id)
      .maybeSingle();
    if (fetchError) throw fetchError;

    const payload = {
      venue_id,
      reviewer_id: req.user!.id,
      rating,
      title,
      comment,
      reviewer_name,
      status: "pending",
    };

    const { data, error } = existing
      ? await req.client!.from("venue_reviews").update(payload).eq("id", existing.id).select().single()
      : await req.client!.from("venue_reviews").insert(payload).select().single();
    if (error) throw error;
    res.status(existing ? 200 : 201).json({ review: data });
  } catch (err) {
    next(err);
  }
});

// Admin: approve/reject a review.
reviewsRouter.patch("/:id/moderate", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { status, admin_note = "" } = req.body;
    const { data, error } = await req.client!
      .from("venue_reviews")
      .update({
        status,
        admin_note,
        moderated_by: req.user!.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ review: data });
  } catch (err) {
    next(err);
  }
});

// Auth: venue owner replies to (or clears their reply on) an approved review for their venue.
reviewsRouter.patch("/:id/reply", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { owner_reply = "" } = req.body;
    const { data, error } = await req.client!
      .from("venue_reviews")
      .update({
        owner_reply: String(owner_reply).slice(0, 1500),
        owner_reply_by: req.user!.id,
        owner_reply_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ review: data });
  } catch (err) {
    next(err);
  }
});

