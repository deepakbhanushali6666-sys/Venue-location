import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { PAID_LISTING_PLANS } from "../lib/subscriptions.js";

export const venueDraftsRouter = Router();

venueDraftsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const payload = req.body?.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      res.status(400).json({ error: "A venue listing draft is required" });
      return;
    }
    if (!payload.name || !payload.slug || !payload.category || !payload.city) {
      res.status(400).json({ error: "Venue name, category and city are required" });
      return;
    }
    if (payload.plan_code !== "verified_listing" && payload.plan_code !== "pro_marketing") {
      res.status(400).json({ error: "Choose a supported paid listing plan" });
      return;
    }
    const plan = payload.plan_code === "pro_marketing" ? PAID_LISTING_PLANS.pro_marketing : PAID_LISTING_PLANS.verified_listing;
    const photoLimit = plan.photoLimit;
    if (Array.isArray(payload.photos) && payload.photos.length > photoLimit) {
      res.status(400).json({ error: `This listing allows up to ${photoLimit} photos` });
      return;
    }

    const { data, error } = await req.client!
      .from("venue_listing_drafts")
      .insert({ owner_id: req.user!.id, payload })
      .select("id")
      .single();
    if (error) throw error;
    res.status(201).json({ draft: data });
  } catch (err) {
    next(err);
  }
});