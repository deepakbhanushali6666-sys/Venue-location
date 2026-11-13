import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createPayment, listMyPayments, type AccountSubscription } from "@/lib/api";
import {
  BUSINESS,
  INDIAN_STATES_AND_UTS,
  INVOICE_SUPPLIER,
  PAYMENT_DETAILS,
  PLAN,
  PRO_MARKETING_PLAN,
  formatINR,
  planPaymentAmount,
  upiLink,
} from "@/data/business";

type PaymentRow = {
  id: string;
  amount: number;
  plan_code?: string;
  legacy_gst_inclusive?: boolean;
  method: string;
  reference: string;
  status: string;
  admin_note: string;
  invoice_number: string;
  invoice_to_name: string;
  invoice_to_address: string;
  invoice_to_state: string;
  invoice_to_gstin: string;
  verified_at: string | null;
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
  const [invoicePayment, setInvoicePayment] = useState<PaymentRow | null>(null);

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
        amount: planPaymentAmount(selectedPlan.amount),
        plan_code: selectedPlan.code,
        method: String(f.get("method") ?? "upi"),
        reference,
        payer_name: String(f.get("payer_name") ?? "").trim(),
        note: String(f.get("note") ?? "").trim(),
        invoice_to_name: String(f.get("invoice_to_name") ?? "").trim(),
        invoice_to_address: String(f.get("invoice_to_address") ?? "").trim(),
        invoice_to_state: String(f.get("invoice_to_state") ?? "").trim(),
        invoice_to_gstin: String(f.get("invoice_to_gstin") ?? "").trim().toUpperCase(),
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
            {isActive
              ? `Plan value ${formatINR(currentPlan.amount)} for ${currentPlan.period}; GST is added to new payments.`
              : "Upgrade below to upload more photos."}
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
        A GST invoice is available for each payment after our team verifies it. GST at 18% is added to the plan price.
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
                {formatINR(PLAN.amount)} + GST / year - 20 photos per property
              </option>
              <option value={PRO_MARKETING_PLAN.code}>
                {formatINR(PRO_MARKETING_PLAN.amount)} + GST / year - 60 photos per property
              </option>
            </select>
            <span className="font-normal text-muted-foreground">
              The selected allowance starts after payment verification. Existing photos are kept.
            </span>
          </label>
          <div>
            <h3 className="font-display text-base font-extrabold text-navy">
              Step 1 — Pay {formatINR(planPaymentAmount(selectedPlan.amount))}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan value {formatINR(selectedPlan.amount)} + 18% GST{" "}
              ({formatINR(planPaymentAmount(selectedPlan.amount))} total). Pay by UPI or bank
              transfer, then submit the reference number for verification.
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
              href={upiLink(planPaymentAmount(selectedPlan.amount), selectedPlan.name)}
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
            <label className="grid gap-1 text-sm font-semibold text-navy">
              Billing name
              <input
                name="invoice_to_name"
                required
                maxLength={120}
                autoComplete="organization"
                placeholder="Person or business name for the invoice"
                className={input}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-navy">
              Billing address
              <textarea
                name="invoice_to_address"
                required
                maxLength={500}
                autoComplete="street-address"
                placeholder="Full billing address"
                rows={2}
                className={input}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-navy">
              Billing state / union territory
              <select
                name="invoice_to_state"
                required
                className={input}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a state or union territory
                </option>
                {INDIAN_STATES_AND_UTS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-navy">
              GSTIN (optional)
              <input
                name="invoice_to_gstin"
                maxLength={15}
                autoCapitalize="characters"
                placeholder="15-character GSTIN, if registered"
                className={input}
              />
            </label>
            <textarea
              name="note"
              rows={2}
              placeholder="Note for our team (optional)"
              className={input}
            />
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
                  <td>
                    {p.status === "verified" ? (
                      <div className="grid justify-items-start gap-1">
                        <span>{p.invoice_number || "Not issued"}</span>
                        {p.invoice_number &&
                          p.invoice_to_name &&
                          p.invoice_to_address &&
                          p.invoice_to_state && (
                            <button
                              type="button"
                              onClick={() => setInvoicePayment(p)}
                              className="font-bold text-blue-700 underline print:hidden"
                            >
                              Download GST invoice
                            </button>
                          )}
                      </div>
                    ) : (
                      "Awaiting verification"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoicePayment && (
        <div
          className="gst-invoice-overlay fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gst-invoice-title"
        >
          <div className="gst-invoice-sheet mx-auto w-full max-w-3xl bg-white p-6 text-slate-950 shadow-2xl sm:p-10">
            <div className="gst-invoice-controls mb-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-white"
              >
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={() => setInvoicePayment(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Close
              </button>
            </div>
            <InvoiceDocument payment={invoicePayment} />
          </div>
        </div>
      )}
    </section>
  );
}

function InvoiceDocument({ payment }: { payment: PaymentRow }) {
  const total = payment.amount;
  const plan = payment.plan_code === PRO_MARKETING_PLAN.code ? PRO_MARKETING_PLAN : PLAN;
  const legacyInclusive = payment.legacy_gst_inclusive ?? total === plan.amount;
  const taxable = legacyInclusive ? Math.round((total / 1.18) * 100) / 100 : plan.amount;
  const tax = Math.round((total - taxable) * 100) / 100;
  const sameState = payment.invoice_to_state.trim().toLowerCase() === "maharashtra";
  const halfTax = Math.round((tax / 2) * 100) / 100;
  const otherHalfTax = Math.round((tax - halfTax) * 100) / 100;
  const invoiceDate = new Date(payment.verified_at ?? payment.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <article className="text-sm">
      <header className="border-b-2 border-slate-900 pb-5 text-center">
        <h1 id="gst-invoice-title" className="text-xl font-extrabold uppercase tracking-wide">
          Tax Invoice
        </h1>
        <h2 className="mt-3 text-lg font-extrabold uppercase">{INVOICE_SUPPLIER.legalName}</h2>
        <p className="mt-1">{INVOICE_SUPPLIER.address}</p>
        <p className="mt-1 font-semibold">GSTIN: {INVOICE_SUPPLIER.gstin}</p>
      </header>

      <div className="grid gap-4 border-b border-slate-300 py-5 sm:grid-cols-2">
        <div>
          <h3 className="font-bold uppercase tracking-wide">Bill to</h3>
          <p className="mt-2 font-semibold">{payment.invoice_to_name}</p>
          <p className="whitespace-pre-line">{payment.invoice_to_address}</p>
          <p>{payment.invoice_to_state}</p>
          {payment.invoice_to_gstin && <p>GSTIN: {payment.invoice_to_gstin}</p>}
        </div>
        <dl className="grid grid-cols-[auto_1fr] content-start gap-x-3 gap-y-1">
          <dt className="font-semibold">Invoice number</dt>
          <dd className="break-all">{payment.invoice_number}</dd>
          <dt className="font-semibold">Invoice date</dt>
          <dd>{invoiceDate}</dd>
          <dt className="font-semibold">Place of supply</dt>
          <dd>{payment.invoice_to_state}</dd>
          <dt className="font-semibold">Payment reference</dt>
          <dd className="break-all">{payment.reference}</dd>
        </dl>
      </div>

      <table className="mt-5 w-full border-collapse text-left">
        <thead>
          <tr className="border-y border-slate-400">
            <th className="py-2 pr-2">Description</th>
            <th className="px-2 py-2 text-right">GST</th>
            <th className="py-2 pl-2 text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-2">
              {plan.name} — annual subscription
              <span className="block text-xs text-slate-600">Taxable value</span>
            </td>
            <td className="px-2 py-3 text-right">18%</td>
            <td className="py-3 pl-2 text-right">{formatINR(taxable)}</td>
          </tr>
          {sameState ? (
            <>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-2">CGST</td>
                <td className="px-2 py-2 text-right">9%</td>
                <td className="py-2 pl-2 text-right">{formatINR(halfTax)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-2">SGST</td>
                <td className="px-2 py-2 text-right">9%</td>
                <td className="py-2 pl-2 text-right">{formatINR(otherHalfTax)}</td>
              </tr>
            </>
          ) : (
            <tr className="border-b border-slate-200">
              <td className="py-2 pr-2">IGST</td>
              <td className="px-2 py-2 text-right">18%</td>
              <td className="py-2 pl-2 text-right">{formatINR(tax)}</td>
            </tr>
          )}
          <tr className="border-t-2 border-slate-900 font-extrabold">
            <td colSpan={2} className="py-3 pr-2 text-right">
              Total (including GST)
            </td>
            <td className="py-3 pl-2 text-right">{formatINR(total)}</td>
          </tr>
        </tbody>
      </table>

      <footer className="mt-12 flex justify-end">
        <div className="min-w-52 border-t border-slate-400 pt-2 text-center">
          For {INVOICE_SUPPLIER.legalName}
          <p className="mt-8 font-semibold">Authorized Signatory</p>
        </div>
      </footer>
    </article>
  );
}
