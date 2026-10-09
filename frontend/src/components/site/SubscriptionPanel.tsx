import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createPayment, listMyPayments, type AccountSubscription } from "@/lib/api";
import { BUSINESS, PAYMENT_DETAILS, PLAN, PRO_MARKETING_PLAN, formatINR, upiLink } from "@/data/business";

type PaymentRow = {
  id: string;
  amount: number;
  plan_code?: string;
  method: string;
  reference: string;
  status: string;
  admin_note: string;
  invoice_number: string;
  created_at: string;
};

const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";

function daysLeft(expires: string | null) {
  if (!expires) return null;
  const ms = new Date(expires).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function SubscriptionPanel({ userId, sub, onChange }: { userId: string; sub: AccountSubscription | null; onChange: () => void }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCode, setSelectedCode] = useState(PLAN.code);

  const loadPayments = async () => {
    try {
      const { payments } = await listMyPayments();
      setPayments(payments as unknown as PaymentRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load payment history");
    }
  };

  useEffect(() => {
    void loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const pending = payments.find((p) => p.status === "pending");
  const currentPlan =
    sub?.amount === PRO_MARKETING_PLAN.amount
      ? PRO_MARKETING_PLAN
      : PLAN;
  const selectedPlan = selectedCode === PRO_MARKETING_PLAN.code ? PRO_MARKETING_PLAN : PLAN;
  const photoLimit = sub?.photo_limit ?? 10;
  const left = daysLeft(sub?.expires_on ?? null);
  const isActive = photoLimit > 10;

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
        amount: selectedPlan.amount,
        plan_code: selectedPlan.code,
        method: String(f.get("method") ?? "upi"),
        reference,
        payer_name: String(f.get("payer_name") ?? "").trim(),
        note: String(f.get("note") ?? "").trim(),
      });
      toast.success("Payment submitted. We'll verify and activate within 24 hours.");
      setOpen(false);
      await loadPayments();
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="account-subscription" className="mt-8 scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy">Subscription</h2>
          <p className="mt-1 text-sm font-bold text-navy">
            {isActive ? currentPlan.name : "Basic / Free"}: {photoLimit} photos per property.
            {" "}One account plan covers all your existing and future properties.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isActive ? `${formatINR(currentPlan.amount)} for ${currentPlan.period}.` : "Upgrade below to upload more photos."}
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

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Valid till</div>
          <div className="font-bold text-navy">{sub?.expires_on ?? "—"}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Days remaining</div>
          <div className="font-bold text-navy">{left !== null && left > 0 ? left : "—"}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Photos per property</div>
          <div className="font-bold text-navy">{photoLimit}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Latest invoice number</div>
          <div className="font-bold text-navy">{sub?.invoice_number || "Not issued"}</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Invoice numbers are issued after payment verification. Invoice downloads are not available yet.
      </p>

      <ul className="mt-4 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
        {(isActive ? currentPlan.features : ["Free listing", "Up to 10 photos per property"]).map((f) => (
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
          onClick={() => {
            if (!open) setSelectedCode(currentPlan.code);
            setOpen((o) => !o);
          }}
          className="rounded-md bg-gold px-5 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-gold-foreground"
        >
          {open ? "Close" : isActive ? "Upgrade / Renew plan" : "Upgrade plan"}
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
          <label className="grid gap-2 text-sm font-bold text-navy lg:col-span-2">
            Choose your account plan
            <select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)} className={input} disabled={saving}>
              <option value={PLAN.code} disabled={photoLimit > PLAN.photoLimit}>
                {formatINR(PLAN.amount)} / year - 20 photos per property
              </option>
              <option value={PRO_MARKETING_PLAN.code}>
                {formatINR(PRO_MARKETING_PLAN.amount)} / year - 60 photos per property
              </option>
            </select>
            <span className="font-normal text-muted-foreground">
              The selected allowance starts after payment verification. Existing photos are kept.
            </span>
          </label>
          <div>
            <h3 className="font-display text-base font-extrabold text-navy">Step 1 — Pay {formatINR(selectedPlan.amount)}</h3>
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
                <dt className="text-muted-foreground">Branch</dt>
                <dd className="text-right font-bold text-navy">{PAYMENT_DETAILS.branch}</dd>
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
              href={upiLink(selectedPlan.amount, selectedPlan.name)}
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
                <th>Invoice number</th>
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
                  <td>{p.status === "verified" ? p.invoice_number || "Not issued" : "Awaiting verification"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
