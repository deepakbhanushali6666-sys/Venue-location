import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getPayment, getProfile } from "@/lib/api";
import { BUSINESS, PLAN, formatINR } from "@/data/business";

export const Route = createFileRoute("/_authenticated/invoice/$paymentId")({
  head: () => ({
    meta: [
      { title: "Subscription Invoice | VENUES LOCATION" },
      { name: "description", content: "Download and print your VENUES LOCATION annual subscription invoice." },
      { property: "og:title", content: "Subscription Invoice | VENUES LOCATION" },
      { property: "og:description", content: "Your VENUES LOCATION annual listing subscription invoice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvoicePage,
});

type Payment = {
  id: string;
  owner_id: string;
  amount: number;
  method: string;
  reference: string;
  payer_name: string;
  status: string;
  invoice_number: string;
  verified_at: string | null;
  created_at: string;
};

type Profile = { full_name: string; email: string; mobile: string };

function InvoicePage() {
  const { paymentId } = Route.useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { payment: pay } = await getPayment(paymentId);
        setPayment(pay as unknown as Payment);
        if (pay) {
          const { profile } = await getProfile((pay as { owner_id: string }).owner_id);
          setProfile(profile as unknown as Profile | null);
        }
      } catch {
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [paymentId]);

  if (loading) return <div className="px-4 py-16 text-center text-sm text-muted-foreground">Loading invoice…</div>;
  if (!payment)
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
        <Link to="/dashboard" className="mt-3 inline-block font-bold text-gold">
          Back to dashboard
        </Link>
      </div>
    );

  const verified = payment.status === "verified";
  const taxable = Math.round((payment.amount / 1.18) * 100) / 100;
  const gst = Math.round((payment.amount - taxable) * 100) / 100;
  const date = payment.verified_at ?? payment.created_at;

  return (
    <div className="bg-sand px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/dashboard" className="text-sm font-bold text-navy">
            ← Back to dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded-md bg-navy px-5 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground"
          >
            Print / Save PDF
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-panel print:border-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-navy">{BUSINESS.legalName}</h1>
              <p className="text-sm text-muted-foreground">{BUSINESS.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{BUSINESS.address}</p>
              <p className="text-sm text-muted-foreground">
                {BUSINESS.phone} · {BUSINESS.email}
              </p>
              {BUSINESS.gstin && <p className="text-sm text-muted-foreground">GSTIN: {BUSINESS.gstin}</p>}
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-extrabold uppercase tracking-wide text-gold">Tax Invoice</div>
              <div className="mt-1 text-sm text-navy">{payment.invoice_number || "Pending verification"}</div>
              <div className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString("en-IN")}</div>
              {!verified && (
                <div className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase text-navy">
                  {payment.status}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 border-b border-border py-6 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Billed to</div>
              <div className="font-bold text-navy">{profile?.full_name || payment.payer_name || "Venue Owner"}</div>
              <div className="text-sm text-muted-foreground">{profile?.email}</div>
              <div className="text-sm text-muted-foreground">{profile?.mobile}</div>
            </div>
            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Payment</div>
              <div className="font-bold uppercase text-navy">{payment.method}</div>
              <div className="text-sm text-muted-foreground">Ref: {payment.reference || "—"}</div>
            </div>
          </div>

          <table className="mt-6 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2">Description</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="py-3">
                  <div className="font-bold text-navy">{PLAN.name}</div>
                  <div className="text-muted-foreground">Annual venue listing subscription ({PLAN.period})</div>
                </td>
                <td className="text-right">{formatINR(taxable)}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-2 text-muted-foreground">GST @ 18% (inclusive)</td>
                <td className="text-right">{formatINR(gst)}</td>
              </tr>
              <tr className="border-t-2 border-navy">
                <td className="py-3 font-display font-extrabold uppercase text-navy">Total paid</td>
                <td className="text-right font-display text-lg font-extrabold text-navy">{formatINR(payment.amount)}</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-6 text-xs text-muted-foreground">
            {verified
              ? "Payment received with thanks. This is a computer-generated invoice and does not require a signature."
              : "This payment is awaiting verification. The invoice becomes final once our team confirms the transaction."}
            {!BUSINESS.gstin && " GST is shown as an inclusive estimate until the GSTIN is configured."}
          </p>
        </div>
      </div>
    </div>
  );
}
