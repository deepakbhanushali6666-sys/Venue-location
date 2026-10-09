import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { subscriptionPhotoLimit } from "../lib/subscriptions.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/owners", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const page = Number(req.query.page ?? 0);
    if (!Number.isSafeInteger(page) || page < 0 || page > 100000) {
      res.status(400).json({ error: "page must be a non-negative integer up to 100000" });
      return;
    }
    const pageSize = 50;
    const { data, error, count } = await req.client!
      .from("subscriptions")
      .select("id, owner_id, plan_name, amount, status, started_on, expires_on, invoice_number", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    const subscriptions = data ?? [];
    if (subscriptions.length === 0) {
      res.json({ subscriptions: [], total: count ?? 0, pageSize });
      return;
    }
    const ownerIds = subscriptions.map((subscription) => subscription.owner_id);
    const [{ data: profiles, error: profileError }, propertyCounts] = await Promise.all([
      req.client!.from("profiles").select("id, full_name, mobile, email").in("id", ownerIds),
      Promise.all(ownerIds.map(async (ownerId) => {
        const { count: propertyCount, error: propertyError } = await req.client!
          .from("venues")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId);
        if (propertyError) throw propertyError;
        return [ownerId, propertyCount ?? 0] as const;
      })),
    ]);
    if (profileError) throw profileError;
    const owners = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    const counts = new Map(propertyCounts);
    res.json({
      subscriptions: subscriptions.map((subscription) => {
        const owner = owners.get(subscription.owner_id);
        const photoLimit = subscriptionPhotoLimit(subscription);
        return {
          ...subscription,
          owner_name: owner?.full_name ?? null,
          owner_mobile: owner?.mobile ?? null,
          owner_email: owner?.email ?? null,
          property_count: counts.get(subscription.owner_id) ?? 0,
          photo_limit: photoLimit,
          status: subscription.status === "active" && subscription.expires_on !== null &&
            subscription.expires_on < new Date().toISOString().slice(0, 10) ? "expired" : subscription.status,
        };
      }),
      total: count ?? 0,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

// Auth: the current owner's subscription (dashboard).
subscriptionsRouter.get("/mine", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("subscriptions")
      .select("*")
      .eq("owner_id", req.user!.id)
      .maybeSingle();
    if (error) throw error;
    res.json({ subscription: data ? { ...data, photo_limit: subscriptionPhotoLimit(data) } : null });
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
