import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { createPayment, listMyPayments } from "@/lib/api";
import { BUSINESS, PAYMENT_DETAILS, PLAN, formatINR, upiLink } from "@/data/business";

type PaymentRow = {
  id: string;
  amount: number;
  method: string;
  reference: string;
  status: string;
  admin_note: string;
  invoice_number: string;
  created_at: string;
};

type SubRow = {
  status: string;
  amount: number;
  started_on: string | null;
  expires_on: string | null;
  invoice_number: string;
};

const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";

function daysLeft(expires: string | null) {
  if (!expires) return null;
  const ms = new Date(expires).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function SubscriptionPanel({ userId, sub, onChange }: { userId: string; sub: SubRow | null; onChange: () => void }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPayments = async () => {
    const { payments } = await listMyPayments();
    setPayments(payments as unknown as PaymentRow[]);
  };

  useEffect(() => {
    void loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const pending = payments.find((p) => p.status === "pending");
  const left = daysLeft(sub?.expires_on ?? null);
  const isActive = sub?.status === "active" && (left === null || left > 0);

  const submitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const reference = String(f.get("reference") ?? "").trim();
    if (!reference) {
      toast.error("Enter the UPI / bank reference number");
      return;
    }
    setSaving(true);
    try {
      await createPayment({
        amount: PLAN.amount,
        method: String(f.get("method") ?? "upi"),
        reference,
        payer_name: String(f.get("payer_name") ?? "").trim(),
        note: String(f.get("note") ?? "").trim(),
      });
      toast.success("Payment submitted. We'll verify and activate within 24 hours.");
      setOpen(false);
      void loadPayments();
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy">Subscription</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {PLAN.name} — {formatINR(PLAN.amount)} for {PLAN.period}.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            isActive ? "bg-gold text-gold-foreground" : "bg-secondary text-navy"
          }`}
        >
          {isActive ? "Active" : (sub?.status ?? "inactive")}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Valid till</div>
          <div className="font-bold text-navy">{sub?.expires_on ?? "—"}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Days remaining</div>
          <div className="font-bold text-navy">{left !== null && left > 0 ? left : "—"}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Latest invoice</div>
          <div className="font-bold text-navy">{sub?.invoice_number || "—"}</div>
        </div>
      </div>

      <ul className="mt-4 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
        {PLAN.features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>

      {pending && (
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-navy">
          Payment reference <strong>{pending.reference}</strong> is awaiting verification by our team.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md bg-gold px-5 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-gold-foreground"
        >
          {open ? "Close" : isActive ? `Renew ${formatINR(PLAN.amount)}` : `Pay ${formatINR(PLAN.amount)} / year`}
        </button>
        <a
          href={`https://wa.me/91${BUSINESS.phone}?text=${encodeURIComponent("Hi, I need help with my VENUES LOCATION subscription payment.")}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-navy px-5 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-navy"
        >
          Payment help
        </a>
      </div>

      {open && (
        <div className="mt-5 grid gap-5 rounded-lg border border-border p-4 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-base font-extrabold text-navy">Step 1 — Pay {formatINR(PLAN.amount)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay by UPI or bank transfer, then submit the reference number for verification.
            </p>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">UPI ID</dt>
                <dd className="font-bold text-navy">{PAYMENT_DETAILS.upiId}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Account name</dt>
                <dd className="font-bold text-navy">{PAYMENT_DETAILS.accountName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Bank</dt>
                <dd className="font-bold text-navy">{PAYMENT_DETAILS.bankName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Account no.</dt>
                <dd className="font-bold text-navy">{PAYMENT_DETAILS.accountNumber}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">IFSC</dt>
                <dd className="font-bold text-navy">{PAYMENT_DETAILS.ifsc}</dd>
              </div>
            </dl>
            <a
              href={upiLink(PLAN.amount, "VENUES LOCATION annual listing")}
              className="mt-3 inline-block rounded-md border border-gold px-4 py-2 text-sm font-bold text-navy"
            >
              Open UPI app
            </a>
          </div>

          <form onSubmit={submitPayment} className="grid gap-3">
            <h3 className="font-display text-base font-extrabold text-navy">Step 2 — Submit payment details</h3>
            <select name="method" className={input} defaultValue="upi">
              <option value="upi">UPI</option>
              <option value="bank">Bank transfer / NEFT</option>
              <option value="cash">Cash / cheque</option>
            </select>
            <input name="reference" placeholder="UPI UTR / transaction reference" className={input} />
            <input name="payer_name" placeholder="Name on the payment" className={input} />
            <textarea name="note" rows={2} placeholder="Note for our team (optional)" className={input} />
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-navy px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Submit for verification"}
            </button>
          </form>
        </div>
      )}

      {payments.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-155 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2">Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-3">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                  <td>{formatINR(p.amount)}</td>
                  <td className="uppercase">{p.method}</td>
                  <td>{p.reference}</td>
                  <td className="font-bold capitalize text-navy">
                    {p.status}
                    {p.status === "rejected" && p.admin_note ? ` — ${p.admin_note}` : ""}
                  </td>
                  <td>
                    {p.status === "verified" ? (
                      <Link to="/invoice/$paymentId" params={{ paymentId: p.id }} className="font-bold text-gold">
                        {p.invoice_number || "View"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
