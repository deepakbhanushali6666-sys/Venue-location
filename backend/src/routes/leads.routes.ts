import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { LEAD_COLUMNS, withLeadContacts } from "../lib/leadContacts.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const leadsRouter = Router();

// Public: submit an enquiry (equivalent to the submit_lead RPC used by the site's forms).
leadsRouter.post("/", async (req, res, next) => {
  try {
    const {
      customer_name,
      mobile,
      email = "",
      purpose = "Other",
      venue_id = null,
      venue_name = "",
      event_date = null,
      budget = "",
      guest_count = null,
      message = "",
    } = req.body;

    if (!customer_name?.trim() || !mobile?.trim()) {
      res.status(400).json({ error: "Name and mobile are required" });
      return;
    }

    const { data, error } = await supabasePublic.rpc("submit_lead", {
      p_customer_name: customer_name,
      p_mobile: mobile,
      p_email: email,
      p_purpose: purpose,
      p_venue_id: venue_id,
      p_venue_name: venue_name,
      p_event_date: event_date,
      p_budget: budget,
      p_guest_count: guest_count,
      p_message: message,
    });
    if (error) throw error;
    res.status(201).json({ leadCode: data });
  } catch (err) {
    next(err);
  }
});

// Owner dashboards show leads only for venues currently owned by the signed-in account.
leadsRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    let query = req.client!
      .from("leads")
      .select(LEAD_COLUMNS)
      .order("created_at", { ascending: false });

    const { data: venues, error: venuesError } = await req.client!
      .from("venues")
      .select("id")
      .eq("owner_id", req.user!.id);
    if (venuesError) throw venuesError;

    const venueIds = (venues ?? []).map((v) => v.id);
    if (venueIds.length === 0) {
      res.json({ leads: [] });
      return;
    }
    query = query.in("venue_id", venueIds);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ leads: await withLeadContacts(req.client!, data) });
  } catch (err) {
    next(err);
  }
});

// Auth: venue owner (of the related venue) or admin can update a lead's status.
leadsRouter.patch("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data: lead, error: fetchError } = await req.client!
      .from("leads")
      .select("venue_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    if (!req.user!.isAdmin) {
      const { data: venue } = await req.client!
        .from("venues")
        .select("owner_id")
        .eq("id", lead.venue_id)
        .maybeSingle();
      if (!venue || venue.owner_id !== req.user!.id) {
        res.status(403).json({ error: "Not allowed to modify this lead" });
        return;
      }
    }

    const { status } = req.body;
    const { data, error } = await req.client!
      .from("leads")
      .update({ status })
      .eq("id", req.params.id)
      .select(LEAD_COLUMNS)
      .single();
    if (error) throw error;
    res.json({ lead: data });
  } catch (err) {
    next(err);
  }
});

leadsRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("leads")
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

