import { Router } from "express";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const paymentsRouter = Router();

// Auth: owner submits a payment for their annual subscription.
paymentsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { amount, method, reference = "", payer_name = "", note = "" } = req.body;
    const { data, error } = await req.client!
      .from("payments")
      .insert({
        owner_id: req.user!.id,
        amount,
        method,
        reference,
        payer_name,
        note,
        status: "pending",
      })
      .select()
      .single();
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

