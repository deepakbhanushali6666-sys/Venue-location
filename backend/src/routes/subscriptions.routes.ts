import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const subscriptionsRouter = Router();

// Auth: the current owner's subscription (dashboard).
subscriptionsRouter.get("/mine", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("subscriptions")
      .select("*")
      .eq("owner_id", req.user!.id)
      .maybeSingle();
    if (error) throw error;
    res.json({ subscription: data });
  } catch (err) {
    next(err);
  }
});

// Admin: all subscriptions (admin panel).
subscriptionsRouter.get("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("subscriptions")
      .select("id, owner_id, status, expires_on, invoice_number");
    if (error) throw error;
    res.json({ subscriptions: data });
  } catch (err) {
    next(err);
  }
});

