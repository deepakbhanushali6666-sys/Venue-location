import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteVenue,
  getAdminOverview,
  getAuditLog,
  rejectPayment as apiRejectPayment,
  setVenueFeatured,
  setVenueStatus,
  verifyPayment as apiVerifyPayment,
} from "@/lib/api";
import { useIsAdmin } from "@/hooks/useAuth";
import { downloadCsv } from "@/lib/csv";
import { ReviewsPanel } from "@/components/site/ReviewsPanel";
import { CategoriesPanel } from "@/components/site/CategoriesPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel | VENUES LOCATION" },
      {
        name: "description",
        content: "VENUES LOCATION admin panel for venues, leads, owners and subscriptions.",
      },
      { property: "og:title", content: "Admin Panel | VENUES LOCATION" },
      { property: "og:description", content: "Manage venues, leads, owners and subscriptions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

type VenueRow = {
  id: string;
  name: string;
  city: string;
  category: string;
  status: string;
  featured: boolean;
  created_at: string;
};

type LeadRow = {
  id: string;
  lead_code: string;
  customer_name: string;
  mobile: string;
  email: string;
  purpose: string;
  budget: string;
  status: string;
  venue_name: string;
  venue_id: string | null;
  message: string;
  created_at: string;
};

type Breakdown = { key: string; enquiries: number; booked: number; rate: number };

type SubRow = {
  id: string;
  owner_id: string;
  status: string;
  expires_on: string | null;
  invoice_number: string;
};

type PaymentRow = {
  id: string;
  owner_id: string;
  amount: number;
  method: string;
  reference: string;
  payer_name: string;
  note: string;
  status: string;
  admin_note: string;
  invoice_number: string;
  created_at: string;
};

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_label: string;
  from_value: string;
  to_value: string;
  created_at: string;
  actor_id: string | null;
};

const ACTION_LABELS: Record<string, string> = {
  venue_created: "Venue submitted",
  venue_status_changed: "Venue approval changed",
  venue_featured_changed: "Venue featured changed",
  lead_created: "Enquiry received",
  lead_status_changed: "Lead status changed",
  payment_verified: "Payment verified",
  payment_rejected: "Payment rejected",
  review_status_changed: "Review moderated",
};

function AdminPanel() {
  const [userId, setUserId] = useState<string>();
  const isAdmin = useIsAdmin(userId);
  const [checked, setChecked] = useState(false);
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [auditFilter, setAuditFilter] = useState<string>("all");
  const [rangeDays, setRangeDays] = useState<number>(90);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
      setChecked(true);
    });
  }, []);

  const loadAll = async () => {
    try {
      const {
        venues: v,
        leads: l,
        subscriptions: s,
        payments: p,
        audit: a,
      } = await getAdminOverview();
      setVenues(v as unknown as VenueRow[]);
      setLeads(l as unknown as LeadRow[]);
      setSubs(s as unknown as SubRow[]);
      setPayments(p as unknown as PaymentRow[]);
      setAudit(a as unknown as AuditRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load admin data");
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    void loadAll();
  }, [isAdmin]);

  const verifyPayment = async (id: string) => {
    try {
      const { invoiceNumber } = await apiVerifyPayment(id);
      toast.success(`Payment verified. Invoice ${invoiceNumber ?? ""}`);
      void loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify payment");
    }
  };

  const rejectPayment = async (id: string) => {
    const reason = window.prompt("Reason for rejecting this payment?") ?? "";
    try {
      await apiRejectPayment(id, reason);
      toast.success("Payment rejected");
      void loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reject payment");
    }
  };

  const pipeline = useMemo(() => {
    const order = ["New", "Contacted", "Negotiation", "Site Visit", "Booked", "Closed"];
    return order.map((status) => ({
      status,
      count: leads.filter((l) => l.status === status).length,
    }));
  }, [leads]);

  const byPurpose = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => map.set(l.purpose || "Other", (map.get(l.purpose || "Other") ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const activity30d = useMemo(() => {
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = audit.filter((a) => new Date(a.created_at).getTime() >= since);
    return {
      approvals: recent.filter(
        (a) => a.action === "venue_status_changed" && a.to_value === "approved",
      ).length,
      rejections: recent.filter(
        (a) => a.action === "venue_status_changed" && a.to_value === "rejected",
      ).length,
      enquiries: recent.filter((a) => a.action === "lead_created").length,
      statusChanges: recent.filter((a) => a.action === "lead_status_changed").length,
    };
  }, [audit]);

  const venueById = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  const rangedLeads = useMemo(() => {
    if (rangeDays === 0) return leads;
    const since = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
    return leads.filter((l) => new Date(l.created_at).getTime() >= since);
  }, [leads, rangeDays]);

  const buildBreakdown = (rows: LeadRow[], pick: (l: LeadRow) => string): Breakdown[] => {
    const map = new Map<string, { enquiries: number; booked: number }>();
    rows.forEach((l) => {
      const key = pick(l) || "Unassigned";
      const entry = map.get(key) ?? { enquiries: 0, booked: 0 };
      entry.enquiries += 1;
      if (l.status === "Booked") entry.booked += 1;
      map.set(key, entry);
    });
    return [...map.entries()]
      .map(([key, v]) => ({
        key,
        ...v,
        rate: v.enquiries ? Math.round((v.booked / v.enquiries) * 100) : 0,
      }))
      .sort((a, b) => b.enquiries - a.enquiries);
  };

  const byCategory = useMemo(
    () =>
      buildBreakdown(rangedLeads, (l) =>
        l.venue_id ? (venueById.get(l.venue_id)?.category ?? "") : "",
      ),
    [rangedLeads, venueById],
  );

  const byCity = useMemo(
    () =>
      buildBreakdown(rangedLeads, (l) =>
        l.venue_id ? (venueById.get(l.venue_id)?.city ?? "") : "",
      ),
    [rangedLeads, venueById],
  );

  const topVenues = useMemo(
    () => buildBreakdown(rangedLeads, (l) => l.venue_name).slice(0, 8),
    [rangedLeads],
  );

  const monthlyTrend = useMemo(() => {
    const months: { label: string; enquiries: number; booked: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const rows = leads.filter((l) => {
        const c = new Date(l.created_at);
        return `${c.getFullYear()}-${c.getMonth()}` === key;
      });
      months.push({
        label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        enquiries: rows.length,
        booked: rows.filter((l) => l.status === "Booked").length,
      });
    }
    return months;
  }, [leads]);

  const conversion = useMemo(() => {
    const booked = rangedLeads.filter((l) => l.status === "Booked").length;
    const open = rangedLeads.filter((l) => !["Booked", "Closed"].includes(l.status)).length;
    return {
      enquiries: rangedLeads.length,
      booked,
      open,
      rate: rangedLeads.length ? Math.round((booked / rangedLeads.length) * 100) : 0,
    };
  }, [rangedLeads]);

  const filteredAudit = useMemo(
    () => (auditFilter === "all" ? audit : audit.filter((a) => a.action === auditFilter)),
    [audit, auditFilter],
  );

  const refreshAudit = async () => {
    try {
      const { audit } = await getAuditLog();
      setAudit(audit as unknown as AuditRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh audit log");
    }
  };

  if (checked && !isAdmin) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-sand px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account does not have admin privileges.
          </p>
          <Link to="/dashboard" className="mt-4 inline-block font-bold text-gold">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const setStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    try {
      await setVenueStatus(id, status);
      setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success(`Venue ${status}`);
      void refreshAudit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update venue status");
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      await setVenueFeatured(id, featured);
      setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, featured } : v)));
      void refreshAudit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update featured status");
    }
  };

  const removeVenue = async (id: string, name: string) => {
    if (!window.confirm(`Delete venue "${name}"? This cannot be undone.`)) return;
    try {
      await deleteVenue(id);
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success("Venue deleted");
      void refreshAudit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete venue");
    }
  };

  const stamp = new Date().toISOString().slice(0, 10);

  const exportAudit = () =>
    downloadCsv(
      `oms-audit-log-${stamp}.csv`,
      ["Date", "Action", "Entity Type", "Entity", "From", "To", "Actor ID"],
      filteredAudit.map((a) => [
        new Date(a.created_at).toLocaleString("en-IN"),
        ACTION_LABELS[a.action] ?? a.action,
        a.entity_type,
        a.entity_label,
        a.from_value,
        a.to_value,
        a.actor_id ?? "system/public",
      ]),
    );

  const exportLeads = () =>
    downloadCsv(
      `oms-leads-${stamp}.csv`,
      ["Lead ID", "Name", "Mobile", "Venue", "Purpose", "Budget", "Status"],
      leads.map((l) => [
        l.lead_code,
        l.customer_name,
        l.mobile,
        l.venue_name,
        l.purpose,
        l.budget,
        l.status,
      ]),
    );

  const exportVenues = () =>
    downloadCsv(
      `oms-venues-${stamp}.csv`,
      ["Venue", "City", "Category", "Status", "Featured", "Created"],
      venues.map((v) => [
        v.name,
        v.city,
        v.category,
        v.status,
        v.featured ? "Yes" : "No",
        new Date(v.created_at).toLocaleDateString("en-IN"),
      ]),
    );

  const rangeLabel = rangeDays === 0 ? "all time" : `last ${rangeDays} days`;

  const exportAnalytics = () =>
    downloadCsv(
      `oms-analytics-${stamp}.csv`,
      ["Metric", "Value"],
      [
        ...stats.map((s) => [s.label, s.value]),
        ["Approvals (30d)", activity30d.approvals],
        ["Rejections (30d)", activity30d.rejections],
        ["Enquiries (30d)", activity30d.enquiries],
        ["Lead status changes (30d)", activity30d.statusChanges],
        ...pipeline.map((p) => [`Leads · ${p.status}`, p.count]),
        ...byPurpose.map(([purpose, count]) => [`Purpose · ${purpose}`, count]),
        [`Conversion rate (${rangeLabel})`, `${conversion.rate}%`],
        [`Enquiries (${rangeLabel})`, conversion.enquiries],
        [`Booked (${rangeLabel})`, conversion.booked],
        [`Open leads (${rangeLabel})`, conversion.open],
        ...monthlyTrend.map((m) => [
          `Trend · ${m.label}`,
          `${m.enquiries} enquiries / ${m.booked} booked`,
        ]),
      ],
    );

  const exportBreakdown = (name: string, title: string, rows: Breakdown[]) =>
    downloadCsv(
      `oms-${name}-${stamp}.csv`,
      [title, "Enquiries", "Booked", "Conversion %"],
      rows.map((r) => [r.key, r.enquiries, r.booked, r.rate]),
    );

  const stats = [
    { label: "Total Venues", value: venues.length },
    { label: "Pending Approval", value: venues.filter((v) => v.status === "pending").length },
    { label: "Total Leads", value: leads.length },
    { label: "Bookings", value: leads.filter((l) => l.status === "Booked").length },
    { label: "Active Subscriptions", value: subs.filter((s) => s.status === "active").length },
  ];

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-navy">Admin Panel</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportVenues}
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
            >
              Export venues CSV
            </button>
            <button
              onClick={exportLeads}
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
            >
              Export leads CSV
            </button>
            <button
              onClick={exportAnalytics}
              className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy"
            >
              Export analytics CSV
            </button>
            <Link
              to="/dashboard"
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
            >
              Owner Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-panel">
              <div className="font-display text-3xl font-extrabold text-gold">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
            <h2 className="font-display text-lg font-extrabold text-navy">Last 30 days</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Venue approvals", activity30d.approvals],
                ["Venue rejections", activity30d.rejections],
                ["New enquiries", activity30d.enquiries],
                ["Lead status changes", activity30d.statusChanges],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-display font-extrabold text-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
            <h2 className="font-display text-lg font-extrabold text-navy">Lead pipeline</h2>
            <div className="mt-4 space-y-2">
              {pipeline.map((p) => {
                const pct = leads.length ? Math.round((p.count / leads.length) * 100) : 0;
                return (
                  <div key={p.status}>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{p.status}</span>
                      <span className="font-bold text-navy">{p.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-sand">
                      <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
            <h2 className="font-display text-lg font-extrabold text-navy">Enquiries by purpose</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {byPurpose.map(([purpose, count]) => (
                <li
                  key={purpose}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                >
                  <span className="text-muted-foreground">{purpose}</span>
                  <span className="font-display font-extrabold text-navy">{count}</span>
                </li>
              ))}
              {byPurpose.length === 0 && (
                <li className="text-muted-foreground">No enquiries yet.</li>
              )}
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-navy">Advanced Analytics</h2>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
              <option value={0}>All time</option>
            </select>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: `Enquiries (${rangeLabel})`, value: conversion.enquiries },
              { label: "Booked", value: conversion.booked },
              { label: "Open leads", value: conversion.open },
              { label: "Conversion rate", value: `${conversion.rate}%` },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-sand/60 p-4">
                <div className="font-display text-2xl font-extrabold text-navy">{c.value}</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-navy">
              Enquiry vs booking trend (6 months)
            </h3>
            <div className="mt-3 flex items-end gap-3">
              {monthlyTrend.map((m) => {
                const max = Math.max(1, ...monthlyTrend.map((x) => x.enquiries));
                return (
                  <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-32 w-full items-end justify-center gap-1">
                      <div
                        className="w-3 rounded-t bg-navy"
                        style={{ height: `${(m.enquiries / max) * 100}%` }}
                        title={`${m.enquiries} enquiries`}
                      />
                      <div
                        className="w-3 rounded-t bg-gold"
                        style={{ height: `${(m.booked / max) * 100}%` }}
                        title={`${m.booked} booked`}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{m.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-3 rounded bg-navy" /> Enquiries
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-3 rounded bg-gold" /> Booked
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              { title: "Venue Category", rows: byCategory, file: "by-category" },
              { title: "City", rows: byCity, file: "by-city" },
            ].map((block) => (
              <div key={block.file}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-navy">
                    Enquiries by {block.title.toLowerCase()}
                  </h3>
                  <button
                    onClick={() => exportBreakdown(block.file, block.title, block.rows)}
                    className="text-xs font-bold text-gold"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="py-2">{block.title}</th>
                        <th>Enquiries</th>
                        <th>Booked</th>
                        <th>Conv. %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((r) => (
                        <tr key={r.key} className="border-t border-border">
                          <td className="py-2 font-bold capitalize text-navy">{r.key}</td>
                          <td>{r.enquiries}</td>
                          <td>{r.booked}</td>
                          <td>{r.rate}%</td>
                        </tr>
                      ))}
                      {block.rows.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-3 text-muted-foreground">
                            No data for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-navy">
                Top venues by enquiries
              </h3>
              <button
                onClick={() => exportBreakdown("top-venues", "Venue", topVenues)}
                className="text-xs font-bold text-gold"
              >
                Export CSV
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2">Venue</th>
                    <th>Enquiries</th>
                    <th>Booked</th>
                    <th>Conv. %</th>
                  </tr>
                </thead>
                <tbody>
                  {topVenues.map((r) => (
                    <tr key={r.key} className="border-t border-border">
                      <td className="py-2 font-bold text-navy">{r.key}</td>
                      <td>{r.enquiries}</td>
                      <td>{r.booked}</td>
                      <td>{r.rate}%</td>
                    </tr>
                  ))}
                  {topVenues.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-muted-foreground">
                        No data for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Subscription payments */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy">
                Subscription Payments
              </h2>
              <p className="text-sm text-muted-foreground">
                Verify a payment to activate or extend the owner's annual plan and issue an invoice.
              </p>
            </div>
            <button
              onClick={() =>
                downloadCsv(
                  "oms-payments",
                  ["Date", "Owner", "Amount", "Method", "Reference", "Status", "Invoice"],
                  payments.map((p) => [
                    new Date(p.created_at).toLocaleDateString("en-IN"),
                    p.payer_name || p.owner_id,
                    p.amount,
                    p.method,
                    p.reference,
                    p.status,
                    p.invoice_number,
                  ]),
                )
              }
              className="rounded-md border border-navy px-4 py-2 text-sm font-bold text-navy"
            >
              Export CSV
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-215 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Payer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Invoice</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border align-top">
                    <td className="py-3">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <div className="font-bold text-navy">{p.payer_name || "—"}</div>
                      {p.note && <div className="text-xs text-muted-foreground">{p.note}</div>}
                    </td>
                    <td>₹{p.amount.toLocaleString("en-IN")}</td>
                    <td className="uppercase">{p.method}</td>
                    <td>{p.reference}</td>
                    <td className="font-bold capitalize text-navy">{p.status}</td>
                    <td>
                      {p.status === "verified" ? (
                        <Link
                          to="/invoice/$paymentId"
                          params={{ paymentId: p.id }}
                          className="font-bold text-gold"
                        >
                          {p.invoice_number || "View"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {p.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyPayment(p.id)}
                            className="text-sm font-bold text-gold"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => rejectPayment(p.id)}
                            className="text-sm font-bold text-muted-foreground"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{p.admin_note || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-muted-foreground">
                      No subscription payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-navy">Audit Log</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All activity</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={exportAudit}
                className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-sand"
              >
                Export audit CSV
              </button>
            </div>
          </div>
          <div className="mt-4 max-h-120 overflow-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">When</th>
                  <th>Action</th>
                  <th>Record</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="py-3 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="font-bold text-navy">{ACTION_LABELS[a.action] ?? a.action}</td>
                    <td>{a.entity_label || "—"}</td>
                    <td>{a.from_value || "—"}</td>
                    <td>{a.to_value || "—"}</td>
                  </tr>
                ))}
                {filteredAudit.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-muted-foreground">
                      No activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-xl font-extrabold text-navy">Venues</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Venue</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="py-3 font-bold text-navy">{v.name}</td>
                    <td>{v.city}</td>
                    <td className="capitalize">{v.category}</td>
                    <td>{v.status}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={v.featured}
                        onChange={(e) => toggleFeatured(v.id, e.target.checked)}
                      />
                    </td>
                    <td className="space-x-3">
                      <button
                        onClick={() => setStatus(v.id, "approved")}
                        className="font-bold text-gold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setStatus(v.id, "rejected")}
                        className="font-bold text-destructive"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => void removeVenue(v.id, v.name)}
                        aria-label={`Delete ${v.name}`}
                        className="inline-flex align-middle text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {venues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-muted-foreground">
                      No venues submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <ReviewsPanel
          mode="admin"
          venueNames={Object.fromEntries(venues.map((v) => [v.id, v.name]))}
        />

        <CategoriesPanel />

        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-xl font-extrabold text-navy">All Leads</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Lead ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Venue</th>
                  <th>Purpose</th>
                  <th>Details</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="py-3 font-bold text-navy">{l.lead_code}</td>
                    <td>{l.customer_name}</td>
                    <td>{l.mobile}</td>
                    <td>{l.venue_name || "—"}</td>
                    <td>{l.purpose}</td>
                    <td
                      className="max-w-70 whitespace-pre-line text-xs text-muted-foreground"
                      title={l.message || undefined}
                    >
                      {l.email ? `${l.email}\n` : ""}
                      {l.message || "—"}
                    </td>
                    <td>{l.budget || "—"}</td>
                    <td>{l.status}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-muted-foreground">
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
