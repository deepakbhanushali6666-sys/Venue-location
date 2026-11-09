import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { PAID_LISTING_PLANS, subscriptionPhotoLimit } from "../lib/subscriptions.js";

export const subscriptionsRouter = Router();

const PLAN_CODES = Object.keys(PAID_LISTING_PLANS) as (keyof typeof PAID_LISTING_PLANS)[];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

subscriptionsRouter.get("/admin-preview", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const email = String(req.query.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Enter a valid account email address" });
      return;
    }

    const { data: profile, error: profileError } = await req.client!
      .from("profiles")
      .select("id, full_name, email, mobile, auto_lead_contact")
      .ilike("email", email.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) {
      res.status(404).json({ error: "No account found with that email. Ask them to sign up first." });
      return;
    }

    const [{ data: subscription, error: subscriptionError }, { count: propertyCount, error: propertyError }] =
      await Promise.all([
        req.client!
          .from("subscriptions")
          .select("id, plan_name, amount, status, started_on, expires_on, invoice_number")
          .eq("owner_id", profile.id)
          .maybeSingle(),
        req.client!
          .from("venues")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", profile.id),
      ]);
    if (subscriptionError) throw subscriptionError;
    if (propertyError) throw propertyError;

    res.json({
      account: profile,
      subscription: subscription
        ? {
            ...subscription,
            status:
              subscription.status === "active" &&
              subscription.expires_on !== null &&
              subscription.expires_on < new Date().toISOString().slice(0, 10)
                ? "expired"
                : subscription.status,
          }
        : null,
      property_count: propertyCount ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.post("/admin-assign", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const ownerId = String(req.body?.owner_id ?? "").trim();
    const planCode = String(req.body?.plan_code ?? "");
    const autoLeadContact = req.body?.auto_lead_contact;
    if (!UUID_PATTERN.test(ownerId)) {
      res.status(400).json({ error: "owner_id must be a valid account ID" });
      return;
    }
    if (!PLAN_CODES.includes(planCode as keyof typeof PAID_LISTING_PLANS)) {
      res.status(400).json({ error: "Choose a supported subscription plan" });
      return;
    }
    if (typeof autoLeadContact !== "boolean") {
      res.status(400).json({ error: "auto_lead_contact must be true or false" });
      return;
    }

    const { data, error } = await req.client!.rpc("admin_assign_subscription", {
      p_owner_id: ownerId,
      p_plan_code: planCode,
      p_auto_lead_contact: autoLeadContact,
    });
    if (error) {
      if (
        (error.code === "PGRST202" || error.code === "42883") &&
        error.message.includes("admin_assign_subscription")
      ) {
        res.status(503).json({
          error:
            "Subscription management is not installed in the database yet. Run the latest supabase/account_photo_limits.sql in the Supabase SQL Editor, then try again.",
        });
        return;
      }
      throw error;
    }
    res.json({ subscription: data });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.post("/admin/:ownerId/revoke", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.ownerId)) {
      res.status(400).json({ error: "ownerId must be a valid account ID" });
      return;
    }
    const { data, error } = await req.client!
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("owner_id", req.params.ownerId)
      .select("id, owner_id, plan_name, amount, status, started_on, expires_on, invoice_number")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Subscription not found for this account" });
      return;
    }
    res.json({ subscription: data });
  } catch (err) {
    next(err);
  }
});

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
      req.client!.from("profiles").select("id, full_name, mobile, email, auto_lead_contact").in("id", ownerIds),
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
          auto_lead_contact: Boolean(owner?.auto_lead_contact),
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
