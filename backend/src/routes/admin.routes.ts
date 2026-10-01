import { Router } from "express";
import { requireAdmin, requireAuth, requireStaff, type AuthedRequest } from "../middleware/auth.js";

export const adminRouter = Router();

const AUDIT_COLUMNS = "id, action, entity_type, entity_id, entity_label, from_value, to_value, created_at, actor_id";

// Admin/team: combined dashboard data (venues, leads, subscriptions, payments, audit log) in one call.
adminRouter.get("/overview", requireAuth, requireStaff, async (req: AuthedRequest, res, next) => {
  try {
    const client = req.client!;
    const [venues, leads, subscriptions, payments, audit] = await Promise.all([
      client
        .from("venues")
        .select("id, property_code, name, city, state, category, subcategory, suitable_for, booking_purposes, booking_restrictions, status, featured, created_at")
        .order("created_at", { ascending: false }),
      client
        .from("leads")
        .select("id, lead_code, property_code, customer_name, mobile, email, purpose, budget, status, venue_name, venue_id, message, created_at")
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

// Admin/team: property code directory.
adminRouter.get("/properties", requireAuth, requireStaff, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("venues")
      .select("id, property_code, name, city, state, category, suitable_for, status")
      .order("created_at")
      .order("id");
    if (error) throw error;
    res.json({ properties: data });
  } catch (err) {
    next(err);
  }
});

// Admin/team: refresh just the audit log (used after a moderation action).
adminRouter.get("/audit-log", requireAuth, requireStaff, async (req: AuthedRequest, res, next) => {
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

// Admin/team: every property with its full detail sheet plus the enquiries filed against it.
adminRouter.get("/property-leads", requireAuth, requireStaff, async (req: AuthedRequest, res, next) => {
  try {
    const [properties, leads] = await Promise.all([
      req.client!
        .from("venues")
        .select(
          "id, property_code, name, category, subcategory, city, state, area, address, capacity, starting_price, parking, description, amenities, suitable_for, booking_purposes, booking_restrictions, photos, status, created_at",
        )
        .order("property_code"),
      req.client!
        .from("leads")
        .select(
          "id, lead_code, property_code, venue_id, venue_name, customer_name, mobile, email, purpose, event_date, budget, guest_count, message, status, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);

    if (properties.error) throw properties.error;
    if (leads.error) throw leads.error;

    res.json({ properties: properties.data, leads: leads.data });
  } catch (err) {
    next(err);
  }
});

// Admin: who currently holds the read-only "team" role.
adminRouter.get("/team", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data: roles, error } = await req.client!
      .from("user_roles")
      .select("user_id")
      .eq("role", "team");
    if (error) throw error;

    const ids = (roles ?? []).map((row) => (row as { user_id: string }).user_id);
    if (ids.length === 0) {
      res.json({ members: [] });
      return;
    }

    const { data: profiles, error: profilesError } = await req.client!
      .from("profiles")
      .select("id, full_name, email, mobile")
      .in("id", ids);
    if (profilesError) throw profilesError;

    res.json({
      members: ids.map((id) => {
        const profile = (profiles ?? []).find((p) => (p as { id: string }).id === id);
        return { id, full_name: "", email: "", mobile: "", ...(profile ?? {}) };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// Admin: grant the team role to an existing account, looked up by its email.
adminRouter.post("/team", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const { data: profile, error: profileError } = await req.client!
      .from("profiles")
      .select("id, full_name, email, mobile")
      .ilike("email", email)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) {
      res.status(404).json({ error: "No account found with that email. Ask them to sign up first." });
      return;
    }

    const memberId = (profile as { id: string }).id;
    const { error } = await req.client!
      .from("user_roles")
      .upsert({ user_id: memberId, role: "team" }, { onConflict: "user_id,role" });
    if (error) throw error;

    res.status(201).json({ member: profile });
  } catch (err) {
    next(err);
  }
});

// Admin: revoke the team role.
adminRouter.delete("/team/:userId", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!
      .from("user_roles")
      .delete()
      .eq("user_id", req.params.userId)
      .eq("role", "team");
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

