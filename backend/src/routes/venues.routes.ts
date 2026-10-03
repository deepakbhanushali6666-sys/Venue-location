import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const venuesRouter = Router();

// Public: approved venues only, with optional filters.
venuesRouter.get("/", async (req, res, next) => {
  try {
    let query = supabasePublic
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    const { category, city, search } = req.query;
    if (typeof category === "string" && category) query = query.eq("category", category);
    if (typeof city === "string" && city) query = query.eq("city", city);
    if (typeof search === "string" && search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ venues: data });
  } catch (err) {
    next(err);
  }
});

// Auth: venues owned by the current user (dashboard).
venuesRouter.get("/mine", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("venues")
      .select("*")
      .eq("owner_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ venues: data });
  } catch (err) {
    next(err);
  }
});

// Public: single approved venue by slug.
venuesRouter.get("/:slug", async (req, res, next) => {
  try {
    const { data, error } = await supabasePublic
      .from("venues")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("status", "approved")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Venue not found" });
      return;
    }
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Auth: create a venue owned by the current user.
venuesRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { ownerName, mobile, email, venueName, gst, notes, property_code, ...rest } = req.body ?? {};
    const payload = {
      ...rest,
      owner_id: req.user!.id,
      status: "pending",
      description: typeof rest.description === "string" ? rest.description : typeof notes === "string" ? notes : "",
      gst_number: typeof rest.gst_number === "string" ? rest.gst_number : typeof gst === "string" ? gst : "",
      photos: Array.isArray(rest.photos) ? rest.photos : [],
      amenities: Array.isArray(rest.amenities) ? rest.amenities : [],
      suitable_for: Array.isArray(rest.suitable_for) ? rest.suitable_for : [],
      booking_purposes: Array.isArray(rest.booking_purposes) ? rest.booking_purposes : [],
      booking_restrictions: Array.isArray(rest.booking_restrictions) ? rest.booking_restrictions : [],
    };

    const { data, error } = await req.client!
      .from("venues")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Auth: owner can edit their own venue details; admin can additionally set status/featured.
venuesRouter.patch("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data: existing, error: fetchError } = await req.client!
      .from("venues")
      .select("owner_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) {
      res.status(404).json({ error: "Venue not found" });
      return;
    }
    if (existing.owner_id !== req.user!.id && !req.user!.isAdmin) {
      res.status(403).json({ error: "Not allowed to modify this venue" });
      return;
    }

    const { status, featured, owner_id, property_code, ...rest } = req.body;
    const updates: Record<string, unknown> = { ...rest };
    if (req.user!.isAdmin) {
      if (status !== undefined) updates.status = status;
      if (featured !== undefined) updates.featured = featured;
    }

    const { data, error } = await req.client!
      .from("venues")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Admin: approve/reject a venue.
venuesRouter.patch("/:id/status", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { status } = req.body;
    const { data, error } = await req.client!
      .from("venues")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Admin: toggle featured flag.
venuesRouter.patch("/:id/featured", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { featured } = req.body;
    const { data, error } = await req.client!
      .from("venues")
      .update({ featured })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Admin: set the featured display position; zero keeps the default newest-first order.
venuesRouter.patch("/:id/featured-order", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const featuredOrder = Number(req.body?.featured_order);
    if (!Number.isInteger(featuredOrder) || featuredOrder < 0) {
      res.status(400).json({ error: "featured_order must be a non-negative integer" });
      return;
    }

    const { data, error } = await req.client!
      .from("venues")
      .update({ featured_order: featuredOrder })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ venue: data });
  } catch (err) {
    next(err);
  }
});

// Admin: preview a venue transfer to an existing account identified by email or mobile.
venuesRouter.post("/:id/transfer-preview", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const propertyCode = String(req.body?.property_code ?? "").trim();
    const accountIdentifier = String(req.body?.account_identifier ?? "").trim();
    if (!propertyCode || !accountIdentifier) {
      res.status(400).json({ error: "Property code and registered owner email or mobile are required" });
      return;
    }

    const { data: venue, error: venueError } = await req.client!
      .from("venues")
      .select("id, property_code, name, city, state, status, owner_id")
      .eq("id", req.params.id)
      .eq("property_code", propertyCode)
      .maybeSingle();
    if (venueError) throw venueError;
    if (!venue) {
      res.status(404).json({ error: "Venue not found or property code does not match" });
      return;
    }

    const isEmail = accountIdentifier.includes("@");
    const profileQuery = req.client!
      .from("profiles")
      .select("id, full_name, email, mobile")
      .eq(isEmail ? "email" : "mobile", isEmail ? accountIdentifier.toLowerCase() : accountIdentifier)
      .limit(2);
    const [{ data: matches, error: profileError }, { data: currentOwner, error: ownerError }, { count, error: leadsError }] = await Promise.all([
      profileQuery,
      req.client!.from("profiles").select("id, full_name, email, mobile").eq("id", venue.owner_id).maybeSingle(),
      req.client!.from("leads").select("id", { count: "exact", head: true }).or(`venue_id.eq.${venue.id},property_code.eq.${venue.property_code}`),
    ]);
    if (profileError) throw profileError;
    if (ownerError) throw ownerError;
    if (leadsError) throw leadsError;
    if (!matches?.length) {
      res.status(404).json({ error: "No account matches that email or mobile. The owner must register first." });
      return;
    }
    if (matches.length > 1) {
      res.status(409).json({ error: "More than one account matches that mobile. Use the owner's registered email instead." });
      return;
    }
    if (matches[0].id === venue.owner_id) {
      res.status(409).json({ error: "This account already owns the venue" });
      return;
    }

    res.json({
      preview: {
        venue,
        current_owner: currentOwner,
        new_owner: matches[0],
        lead_count: count ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: atomically transfer venue ownership and revoke the old owner's contact access.
venuesRouter.post("/:id/transfer-owner", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const propertyCode = String(req.body?.property_code ?? "").trim();
    const newOwnerId = String(req.body?.new_owner_id ?? "").trim();
    if (!propertyCode || !newOwnerId) {
      res.status(400).json({ error: "Property code and new owner account are required" });
      return;
    }

    const { data, error } = await req.client!.rpc("transfer_venue_owner", {
      p_venue_id: req.params.id,
      p_property_code: propertyCode,
      p_new_owner_id: newOwnerId,
    });
    if (error) throw error;
    res.json({ transfer: data });
  } catch (err) {
    next(err);
  }
});

// Admin: permanently delete a venue.
venuesRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await req.client!.from("venues").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

