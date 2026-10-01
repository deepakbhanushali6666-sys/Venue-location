import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const leadContactRequestsRouter = Router();

// Admin: all access requests with the property and requester attached.
leadContactRequestsRouter.get("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const client = req.client!;
    const { data: requests, error } = await client
      .from("lead_contact_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = requests ?? [];
    if (rows.length === 0) {
      res.json({ requests: [] });
      return;
    }

    const [venues, profiles] = await Promise.all([
      client
        .from("venues")
        .select("id, property_code, name")
        .in("id", rows.map((r) => r.venue_id)),
      client
        .from("profiles")
        .select("id, full_name, email, mobile")
        .in("id", rows.map((r) => r.requester_id)),
    ]);
    if (venues.error) throw venues.error;
    if (profiles.error) throw profiles.error;

    const venueById = new Map((venues.data ?? []).map((v) => [v.id, v]));
    const profileById = new Map((profiles.data ?? []).map((p) => [p.id, p]));

    res.json({
      requests: rows.map((row) => ({
        ...row,
        property_code: venueById.get(row.venue_id)?.property_code ?? "",
        venue_name: venueById.get(row.venue_id)?.name ?? "",
        requester_name: profileById.get(row.requester_id)?.full_name ?? "",
        requester_email: profileById.get(row.requester_id)?.email ?? "",
        requester_mobile: profileById.get(row.requester_id)?.mobile ?? "",
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Auth: the caller's own requests, used to label the dashboard buttons.
leadContactRequestsRouter.get("/mine", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("lead_contact_requests")
      .select("id, venue_id, status, created_at")
      .eq("requester_id", req.user!.id);
    if (error) throw error;
    res.json({ requests: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// Auth: ask for contact access to every enquiry of one property.
leadContactRequestsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const venueId = String(req.body?.venue_id ?? "");
    if (!venueId) {
      res.status(400).json({ error: "venue_id is required" });
      return;
    }

    const { data: venue, error: venueError } = await req.client!
      .from("venues")
      .select("id, owner_id")
      .eq("id", venueId)
      .maybeSingle();
    if (venueError) throw venueError;
    if (!venue) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    if (venue.owner_id !== req.user!.id && !req.user!.isStaff) {
      res.status(403).json({ error: "Not allowed to request access for this property" });
      return;
    }

    const { data, error } = await req.client!
      .from("lead_contact_requests")
      .insert({ venue_id: venueId, requester_id: req.user!.id, status: "pending" })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        res.status(409).json({ error: "A request for this property already exists." });
        return;
      }
      throw error;
    }

    res.status(201).json({ request: data });
  } catch (err) {
    next(err);
  }
});

// Admin: approve or reject.
leadContactRequestsRouter.patch("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const status = String(req.body?.status ?? "");
    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      res.status(400).json({ error: "status must be approved, rejected or pending" });
      return;
    }

    const { data, error } = await req.client!
      .from("lead_contact_requests")
      .update({ status, decided_at: new Date().toISOString(), decided_by: req.user!.id })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ request: data });
  } catch (err) {
    next(err);
  }
});
