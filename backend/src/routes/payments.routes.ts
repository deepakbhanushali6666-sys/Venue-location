import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const paymentsRouter = Router();

const PAID_LISTING_PLANS = {
  verified_listing: { amount: 3650, name: "VENUES LOCATION Verified Listing" },
  pro_marketing: { amount: 36500, name: "VENUES LOCATION Pro Marketing" },
} as const;

// Auth: owner submits a payment for their annual subscription.
paymentsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const {
      plan_code = "verified_listing",
      method = "upi",
      reference = "",
      payer_name = "",
      note = "",
      venue_draft_id,
    } = req.body;
    const plan = PAID_LISTING_PLANS[plan_code as keyof typeof PAID_LISTING_PLANS];
    if (!plan) {
      res.status(400).json({ error: "Select a valid subscription plan" });
      return;
    }
    if (!String(reference).trim()) {
      res.status(400).json({ error: "Enter the UPI transaction reference" });
      return;
    }
    let paymentNote = String(note).trim();

    if (venue_draft_id) {
      const { data: draft, error: draftError } = await req.client!
        .from("venue_listing_drafts")
        .select("id, owner_id, submitted_venue_id, payload")
        .eq("id", venue_draft_id)
        .eq("owner_id", req.user!.id)
        .maybeSingle();
      if (draftError) throw draftError;
      if (!draft) {
        res.status(404).json({ error: "Venue listing draft not found" });
        return;
      }
      if (draft.submitted_venue_id) {
        res.status(409).json({ error: "This listing has already been submitted" });
        return;
      }

      const { data: activePayment, error: paymentCheckError } = await req.client!
        .from("payments")
        .select("id")
        .eq("venue_draft_id", venue_draft_id)
        .in("status", ["pending", "verified"])
        .maybeSingle();
      if (paymentCheckError) throw paymentCheckError;
      if (activePayment) {
        res.status(409).json({ error: "A payment for this listing is already awaiting verification" });
        return;
      }

      const listing = draft.payload as { name?: string; city?: string; plan_code?: string };
      if (listing.plan_code !== plan_code) {
        res.status(409).json({ error: "Payment plan does not match the saved listing draft" });
        return;
      }
      paymentNote = `${plan.name}: ${listing.name ?? ""}, ${listing.city ?? ""}`;
    }

    const { data, error } = await req.client!
      .from("payments")
      .insert({
        owner_id: req.user!.id,
        amount: plan.amount,
        method: venue_draft_id ? "upi" : method,
        plan_code,
        reference,
        payer_name,
        note: paymentNote,
        ...(venue_draft_id ? { venue_draft_id } : {}),
        status: "pending",
      })
      .select()
      .single();
    if (error?.code === "23505" && venue_draft_id) {
      res.status(409).json({ error: "A payment for this listing is already awaiting verification" });
      return;
    }
    if (error) throw error;
    res.status(201).json({ payment: data });
  } catch (err) {
    next(err);
  }
});

// Auth: owner's own payment history.
paymentsRouter.get("/mine", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("payments")
      .select("*")
      .eq("owner_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ payments: data });
  } catch (err) {
    next(err);
  }
});

// Admin: all payments (admin panel).
paymentsRouter.get("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ payments: data });
  } catch (err) {
    next(err);
  }
});

// Auth: single payment, viewable by its owner or an admin (invoice page).
paymentsRouter.get("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!
      .from("payments")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    if (data.owner_id !== req.user!.id && !req.user!.isAdmin) {
      res.status(403).json({ error: "Not allowed to view this payment" });
      return;
    }
    res.json({ payment: data });
  } catch (err) {
    next(err);
  }
});

// Admin: verify a payment. Runs as the admin's own JWT so the verify_payment
// SECURITY DEFINER function's auth.uid() checks and audit log resolve correctly.
paymentsRouter.post("/:id/verify", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { data, error } = await req.client!.rpc("verify_payment", { p_payment_id: req.params.id });
    if (error) throw error;
    res.json({ invoiceNumber: data });
  } catch (err) {
    next(err);
  }
});

// Admin: reject a payment, same reasoning as verify above.
paymentsRouter.post("/:id/reject", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { reason = "" } = req.body;
    const { error } = await req.client!.rpc("reject_payment", {
      p_payment_id: req.params.id,
      p_reason: reason,
    });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

