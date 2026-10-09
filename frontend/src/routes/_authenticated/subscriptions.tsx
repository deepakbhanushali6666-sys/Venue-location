import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listSubscriptionOwners, type AdminSubscription } from "@/lib/api";
import { formatINR } from "@/data/business";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions | VENUES LOCATION Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listSubscriptionOwners(page)
      .then((result) => {
        if (cancelled) return;
        setSubscriptions(result.subscriptions);
        setTotal(result.total);
        setPageSize(result.pageSize);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load subscriptions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, refresh]);

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy">Subscriptions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Purchased account plans and owner contact details. Property counts include all current
              listings, regardless of approval status.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setRefresh((value) => value + 1)}
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy disabled:opacity-60"
            >
              Refresh
            </button>
            <Link
              to="/admin"
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
            >
              Back to Admin Panel
            </Link>
          </div>
        </div>
        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : loading ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading subscriptions...
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">{total} subscribed accounts</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-275 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2">Owner Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Properties</th>
                      <th>Subscription Plan</th>
                      <th>Annual Price</th>
                      <th>Status</th>
                      <th>Photos / Property</th>
                      <th>Started</th>
                      <th>Valid Till</th>
                      <th>Latest Invoice Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-t border-border">
                        <td className="py-3 font-bold text-navy">
                          {subscription.owner_name || "Not provided"}
                        </td>
                        <td className="whitespace-nowrap">
                          {subscription.owner_mobile || "Not provided"}
                        </td>
                        <td className="break-all">{subscription.owner_email || "Not provided"}</td>
                        <td>{subscription.property_count}</td>
                        <td>{subscription.plan_name}</td>
                        <td className="whitespace-nowrap">{formatINR(subscription.amount)}</td>
                        <td className="capitalize">{subscription.status}</td>
                        <td>{subscription.photo_limit}</td>
                        <td className="whitespace-nowrap">
                          {subscription.started_on ?? "Not set"}
                        </td>
                        <td className="whitespace-nowrap">
                          {subscription.expires_on ?? "Not set"}
                        </td>
                        <td className="whitespace-nowrap">
                          {subscription.invoice_number || "Not issued"}
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-4 text-muted-foreground">
                          No purchased subscriptions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy disabled:opacity-60"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}
                </span>
                <button
                  type="button"
                  disabled={(page + 1) * pageSize >= total}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
