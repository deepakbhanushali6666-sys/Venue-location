import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const deletionRequestsRouter = Router();

// Admin: every pending request, newest first.
deletionRequestsRouter.get("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("deletion_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ requests: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// Auth: raise a request for a venue or a lead. Contact details come from the
// requester's own profile, never from the client payload.
deletionRequestsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const targetType = String(req.body?.target_type ?? "");
    const targetId = String(req.body?.target_id ?? "");
    if (targetType !== "venue" && targetType !== "lead") {
      res.status(400).json({ error: "target_type must be 'venue' or 'lead'" });
      return;
    }
    if (!targetId) {
      res.status(400).json({ error: "target_id is required" });
      return;
    }

    const client = req.client!;
    const { data: profile } = await client
      .from("profiles")
      .select("full_name, email, mobile")
      .eq("id", req.user!.id)
      .maybeSingle();

    let propertyCode = "";
    let label = "";
    let details = "";

    if (targetType === "venue") {
      const { data: venue, error } = await client
        .from("venues")
        .select("property_code, name, city, state")
        .eq("id", targetId)
        .maybeSingle();
      if (error) throw error;
      if (!venue) {
        res.status(404).json({ error: "Venue not found" });
        return;
      }
      propertyCode = venue.property_code ?? "";
      label = venue.name ?? "";
      details = [venue.city, venue.state].filter(Boolean).join(", ");
    } else {
      const { data: lead, error } = await client
        .from("leads")
        .select("lead_code, property_code, customer_name, mobile, venue_name")
        .eq("id", targetId)
        .maybeSingle();
      if (error) throw error;
      if (!lead) {
        res.status(404).json({ error: "Enquiry not found" });
        return;
      }
      propertyCode = lead.property_code ?? "";
      label = lead.lead_code ?? "";
      details = [lead.customer_name, lead.mobile, lead.venue_name].filter(Boolean).join(" · ");
    }

    const payload = {
      target_type: targetType,
      venue_id: targetType === "venue" ? targetId : null,
      lead_id: targetType === "lead" ? targetId : null,
      property_code: propertyCode,
      target_label: label,
      target_details: details,
      requester_id: req.user!.id,
      requester_name: profile?.full_name ?? "",
      requester_mobile: profile?.mobile ?? "",
      requester_email: profile?.email ?? req.user!.email ?? "",
    };

    const { data, error } = await client
      .from("deletion_requests")
      .insert(payload)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        res.status(409).json({ error: "A deletion request for this record already exists." });
        return;
      }
      throw error;
    }

    res.status(201).json({ request: data });
  } catch (err) {
    next(err);
  }
});

// Admin: dismiss a request without deleting the underlying record.
deletionRequestsRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("deletion_requests").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
