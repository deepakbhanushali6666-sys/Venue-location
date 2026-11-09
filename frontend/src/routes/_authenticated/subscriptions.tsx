import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  assignAdminSubscription,
  listSubscriptionOwners,
  previewAdminSubscriptionAccount,
  revokeAdminSubscription,
  setTeamMemberAutoContact,
  type AdminSubscription,
  type AdminSubscriptionAccountPreview,
  type AdminSubscriptionPlanCode,
} from "@/lib/api";
import { formatINR } from "@/data/business";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions | VENUES LOCATION Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriptionsPage,
});

type PendingAction =
  | {
      kind: "assign";
      account: AdminSubscriptionAccountPreview;
      planCode: AdminSubscriptionPlanCode;
      autoLeadContact: boolean;
    }
  | { kind: "toggle"; subscription: AdminSubscription; enabled: boolean }
  | { kind: "revoke"; subscription: AdminSubscription };

const PLAN_OPTIONS: {
  code: AdminSubscriptionPlanCode;
  name: string;
  amount: number;
  photoLimit: number;
}[] = [
  { code: "verified_listing", name: "Verified Listing", amount: 3650, photoLimit: 20 },
  { code: "pro_marketing", name: "Pro Marketing", amount: 36500, photoLimit: 60 },
];

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [account, setAccount] = useState<AdminSubscriptionAccountPreview | null>(null);
  const [accountError, setAccountError] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [planCode, setPlanCode] = useState<AdminSubscriptionPlanCode>("verified_listing");
  const [autoLeadContact, setAutoLeadContact] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

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

  const searchAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = searchEmail.trim().toLowerCase();
    if (!email) return;
    setLookupBusy(true);
    setAccount(null);
    setAccountError("");
    try {
      const result = await previewAdminSubscriptionAccount(email);
      setAccount(result);
      setAutoLeadContact(result.account.auto_lead_contact);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Could not find account");
    } finally {
      setLookupBusy(false);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction || actionBusy) return;
    setActionBusy(true);
    try {
      if (pendingAction.kind === "assign") {
        await assignAdminSubscription(
          pendingAction.account.account.id,
          pendingAction.planCode,
          pendingAction.autoLeadContact,
        );
        toast.success("Subscription activated");
        setAccount(null);
      } else if (pendingAction.kind === "toggle") {
        await setTeamMemberAutoContact(pendingAction.subscription.owner_id, pendingAction.enabled);
        toast.success(
          pendingAction.enabled
            ? "Automatic lead contact access enabled"
            : "Automatic lead contact access disabled",
        );
      } else {
        await revokeAdminSubscription(pendingAction.subscription.owner_id);
        toast.success("Subscription revoked");
      }
      setPendingAction(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not apply subscription change");
    } finally {
      setActionBusy(false);
    }
  };

  const actionAccount =
    pendingAction?.kind === "assign" ? pendingAction.account.account : pendingAction?.subscription;
  const selectedPlan =
    pendingAction?.kind === "assign"
      ? PLAN_OPTIONS.find((plan) => plan.code === pendingAction.planCode)
      : null;

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy">Subscriptions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preview accounts before activating, changing lead-contact access, or revoking a plan.
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
          <h2 className="font-display text-xl font-extrabold text-navy">
            Find account and preview plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by the email used to register the account. The selected plan and lead-contact
            access are applied only after you review and approve the preview.
          </p>
          <form
            onSubmit={(event) => void searchAccount(event)}
            className="mt-4 flex flex-wrap gap-2"
          >
            <label className="sr-only" htmlFor="subscription-account-email">
              Account email
            </label>
            <input
              id="subscription-account-email"
              type="email"
              required
              value={searchEmail}
              onChange={(event) => {
                setSearchEmail(event.target.value);
                setAccount(null);
                setAccountError("");
              }}
              placeholder="user@example.com"
              className="w-full max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={lookupBusy}
              className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-navy-foreground disabled:opacity-60"
            >
              {lookupBusy ? "Searching..." : "Search account"}
            </button>
          </form>

          {accountError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {accountError}
            </p>
          )}

          {account && (
            <div className="mt-5 grid gap-5 rounded-lg border border-border bg-secondary/30 p-4 lg:grid-cols-[1fr_1fr]">
              <div>
                <h3 className="font-bold text-navy">Account found</h3>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-semibold text-navy">
                    {account.account.full_name || "Not provided"}
                  </dd>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="break-all font-semibold text-navy">{account.account.email}</dd>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-semibold text-navy">
                    {account.account.mobile || "Not provided"}
                  </dd>
                  <dt className="text-muted-foreground">Properties</dt>
                  <dd className="font-semibold text-navy">{account.property_count}</dd>
                  <dt className="text-muted-foreground">Current plan</dt>
                  <dd className="font-semibold text-navy">
                    {account.subscription?.plan_name ?? "No subscription"}
                    {account.subscription ? ` · ${account.subscription.status}` : ""}
                  </dd>
                  <dt className="text-muted-foreground">Valid till</dt>
                  <dd className="font-semibold text-navy">
                    {account.subscription?.expires_on ?? "Not set"}
                  </dd>
                  <dt className="text-muted-foreground">Lead-contact auto approval</dt>
                  <dd className="font-semibold text-navy">
                    {account.account.auto_lead_contact ? "On" : "Off"}
                  </dd>
                </dl>
              </div>

              <div className="grid content-start gap-4">
                <label className="grid gap-1 text-sm font-bold text-navy">
                  Subscription plan
                  <select
                    value={planCode}
                    onChange={(event) =>
                      setPlanCode(event.target.value as AdminSubscriptionPlanCode)
                    }
                    className="rounded-md border border-border bg-background px-3 py-2 font-normal"
                  >
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan.code} value={plan.code}>
                        {plan.name} · {formatINR(plan.amount)} / year · {plan.photoLimit} photos per
                        property
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-start gap-3 rounded-md border border-border bg-background p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={autoLeadContact}
                    onChange={(event) => setAutoLeadContact(event.target.checked)}
                    className="mt-0.5 size-4 accent-gold"
                  />
                  <span>
                    <span className="block font-bold text-navy">
                      Auto-approve lead contact details
                    </span>
                    <span className="text-muted-foreground">
                      When on, this account can see enquiry phone numbers and emails for its own
                      properties. You can turn it off later.
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPendingAction({
                      kind: "assign",
                      account,
                      planCode,
                      autoLeadContact,
                    })
                  }
                  className="w-fit rounded-md bg-gold px-4 py-2 text-sm font-extrabold text-gold-foreground"
                >
                  Preview changes
                </button>
              </div>
            </div>
          )}
        </section>

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
                <table className="w-full min-w-310 text-left text-sm">
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
                      <th>Lead Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-t border-border align-top">
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
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({
                                kind: "toggle",
                                subscription,
                                enabled: !subscription.auto_lead_contact,
                              })
                            }
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              subscription.auto_lead_contact
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {subscription.auto_lead_contact ? "On · turn off" : "Off · turn on"}
                          </button>
                        </td>
                        <td>
                          <div className="flex flex-col items-start gap-2">
                            {subscription.status === "active" && (
                              <button
                                type="button"
                                onClick={() => setPendingAction({ kind: "revoke", subscription })}
                                className="text-xs font-bold text-destructive underline"
                              >
                                Revoke plan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan={13} className="py-4 text-muted-foreground">
                          No subscribed accounts yet.
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

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !actionBusy) setPendingAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review subscription change</DialogTitle>
            <DialogDescription>
              Check the account and requested changes before approving.
            </DialogDescription>
          </DialogHeader>

          {pendingAction && actionAccount && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-secondary/30 p-4 text-sm">
                <h3 className="font-bold text-navy">Account</h3>
                <p className="mt-2 font-semibold text-navy">
                  {"full_name" in actionAccount
                    ? actionAccount.full_name || "Name not provided"
                    : actionAccount.owner_name || "Name not provided"}
                </p>
                <p className="break-all text-muted-foreground">
                  {"email" in actionAccount ? actionAccount.email : actionAccount.owner_email}
                </p>
                <p className="text-muted-foreground">
                  {"mobile" in actionAccount
                    ? actionAccount.mobile || "Phone not provided"
                    : actionAccount.owner_mobile || "Phone not provided"}
                </p>
                {pendingAction.kind === "assign" && (
                  <p className="mt-2 text-muted-foreground">
                    {pendingAction.account.property_count} current properties
                  </p>
                )}
              </div>

              {pendingAction.kind === "assign" ? (
                <div className="space-y-2 rounded-md border border-gold/50 bg-gold/10 p-4 text-sm">
                  <p>
                    <strong>Plan:</strong> {selectedPlan?.name}
                  </p>
                  <p>
                    <strong>Annual price:</strong> {selectedPlan && formatINR(selectedPlan.amount)}
                  </p>
                  <p>
                    <strong>Term:</strong> 1 year (extends an existing future expiry by one year)
                  </p>
                  <p>
                    <strong>Photo allowance:</strong> {selectedPlan?.photoLimit} per property
                  </p>
                  <p>
                    <strong>Lead-contact auto approval:</strong>{" "}
                    {pendingAction.autoLeadContact ? "On" : "Off"}
                  </p>
                  <p className="border-t border-gold/30 pt-2 text-xs text-muted-foreground">
                    Manual admin activation does not collect payment or generate a GST invoice.
                  </p>
                </div>
              ) : pendingAction.kind === "toggle" ? (
                <p className="rounded-md border border-border bg-secondary/30 p-4 text-sm">
                  Automatic lead-contact access will be{" "}
                  <strong>{pendingAction.enabled ? "turned on" : "turned off"}</strong> for this
                  account’s own properties. This does not change the subscription plan.
                </p>
              ) : (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  Revoke <strong>{pendingAction.subscription.plan_name}</strong>. The plan status
                  will become cancelled and the account will return to the free photo allowance.
                  Lead-contact auto approval remains{" "}
                  <strong>{pendingAction.subscription.auto_lead_contact ? "on" : "off"}</strong> and
                  can be changed separately.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setPendingAction(null)}
              disabled={actionBusy}
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmAction()}
              disabled={actionBusy || !pendingAction}
              className={`rounded-md px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50 ${
                pendingAction?.kind === "revoke" ? "bg-destructive" : "bg-navy"
              }`}
            >
              {actionBusy
                ? "Applying..."
                : pendingAction?.kind === "assign"
                  ? "Approve and activate"
                  : pendingAction?.kind === "toggle"
                    ? "Confirm access change"
                    : "Confirm revocation"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
