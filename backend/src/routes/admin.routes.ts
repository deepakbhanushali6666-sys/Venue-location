import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const adminRouter = Router();

const AUDIT_COLUMNS = "id, action, entity_type, entity_id, entity_label, from_value, to_value, created_at, actor_id";

// Admin: combined dashboard data (venues, leads, subscriptions, payments, audit log) in one call.
adminRouter.get("/overview", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const client = req.client!;
    const [venues, leads, subscriptions, payments, audit] = await Promise.all([
      client
        .from("venues")
        .select("id, name, city, category, status, featured, created_at")
        .order("created_at", { ascending: false }),
      client
        .from("leads")
        .select("id, lead_code, customer_name, mobile, email, purpose, budget, status, venue_name, venue_id, message, created_at")
        .order("created_at", { ascending: false }),
      client.from("subscriptions").select("id, owner_id, status, expires_on, invoice_number"),
      client.from("payments").select("*").order("created_at", { ascending: false }),
      client.from("audit_log").select(AUDIT_COLUMNS).order("created_at", { ascending: false }).limit(500),
    ]);

    if (venues.error) throw venues.error;
    if (leads.error) throw leads.error;
    if (subscriptions.error) throw subscriptions.error;
    if (payments.error) throw payments.error;
    if (audit.error) throw audit.error;

    res.json({
      venues: venues.data,
      leads: leads.data,
      subscriptions: subscriptions.data,
      payments: payments.data,
      audit: audit.data,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: refresh just the audit log (used after a moderation action).
adminRouter.get("/audit-log", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("audit_log")
      .select(AUDIT_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    res.json({ audit: data });
  } catch (err) {
    next(err);
  }
});

