import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  listLeadContactAccess,
  previewAdminSubscriptionAccount,
  setLeadContactAccess,
  type AdminSubscriptionAccountPreview,
  type LeadContactAccessAccount,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/lead-access")({
  head: () => ({
    meta: [
      { title: "Lead Access | VENUES LOCATION Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadAccessPage,
});

type PendingAccessChange = {
  account: LeadContactAccessAccount;
  enabled: boolean;
};

function LeadAccessPage() {
  const [accounts, setAccounts] = useState<LeadContactAccessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<AdminSubscriptionAccountPreview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState<PendingAccessChange | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listLeadContactAccess()
      .then(({ accounts: result }) => {
        if (!cancelled) setAccounts(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load approved accounts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const searchAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setSearching(true);
    setPreview(null);
    setPreviewError("");
    try {
      setPreview(await previewAdminSubscriptionAccount(normalizedEmail));
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Could not find account");
    } finally {
      setSearching(false);
    }
  };

  const confirmChange = async () => {
    if (!pending || saving) return;
    setSaving(true);
    try {
      await setLeadContactAccess(pending.account.id, pending.enabled);
      toast.success(
        pending.enabled ? "Lead contact access approved" : "Lead contact access revoked",
      );
      setPending(null);
      if (pending.enabled) {
        setPreview(null);
        setEmail("");
      }
      setRefresh((value) => value + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update lead access");
    } finally {
      setSaving(false);
    }
  };

  const pendingAccountName = pending?.account.full_name || "Name not provided";

  return (
    <main className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy">Lead Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Approve or revoke access to enquiry phone numbers and email addresses.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRefresh((value) => value + 1)}
              disabled={loading}
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
        </header>

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-xl font-extrabold text-navy">Find an account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by the email used to register. Review the account details before confirming
            access.
          </p>
          <form
            onSubmit={(event) => void searchAccount(event)}
            className="mt-4 flex flex-wrap gap-2"
          >
            <label htmlFor="lead-access-email" className="sr-only">
              Account email
            </label>
            <input
              id="lead-access-email"
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setPreview(null);
                setPreviewError("");
              }}
              placeholder="user@example.com"
              className="w-full max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-navy-foreground disabled:opacity-60"
            >
              {searching ? "Searching..." : "Preview account"}
            </button>
          </form>

          {previewError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {previewError}
            </p>
          )}

          {preview && (
            <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-4">
              <h3 className="font-bold text-navy">Account preview</h3>
              <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-semibold text-navy">
                  {preview.account.full_name || "Not provided"}
                </dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all font-semibold text-navy">{preview.account.email}</dd>
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="font-semibold text-navy">
                  {preview.account.mobile || "Not provided"}
                </dd>
                <dt className="text-muted-foreground">Current lead access</dt>
                <dd className="font-semibold text-navy">
                  {preview.account.auto_lead_contact ? "Already approved" : "Not approved"}
                </dd>
              </dl>
              {preview.account.auto_lead_contact ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  This account already has automatic lead-contact access.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setPending({
                      account: {
                        ...preview.account,
                        auto_lead_contact: false,
                      },
                      enabled: true,
                    })
                  }
                  className="mt-4 rounded-md bg-gold px-4 py-2 text-sm font-extrabold text-gold-foreground"
                >
                  Review and approve access
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-extrabold text-navy">Approved accounts</h2>
            <p className="text-sm text-muted-foreground">
              {accounts.length} account{accounts.length === 1 ? "" : "s"} with access
            </p>
          </div>
          {error ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          ) : loading ? (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              Loading accounts...
            </p>
          ) : accounts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No accounts currently have automatic lead-contact access.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">User Name</th>
                    <th className="pr-4">Email</th>
                    <th className="pr-4">Mobile</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-t border-border">
                      <td className="py-3 pr-4 font-bold text-navy">
                        {account.full_name || "Not provided"}
                      </td>
                      <td className="break-all pr-4">{account.email}</td>
                      <td className="whitespace-nowrap pr-4">{account.mobile || "Not provided"}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setPending({ account, enabled: false })}
                          className="rounded-full border border-destructive/30 px-3 py-1 text-xs font-bold text-destructive hover:bg-destructive/5"
                        >
                          Turn off
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending?.enabled ? "Confirm lead access approval" : "Confirm access revocation"}
            </DialogTitle>
            <DialogDescription>
              Review the account details and requested access change.
            </DialogDescription>
          </DialogHeader>
          {pending && (
            <div className="rounded-md border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-bold text-navy">{pendingAccountName}</p>
              <p className="break-all text-muted-foreground">{pending.account.email}</p>
              <p className="text-muted-foreground">
                {pending.account.mobile || "Mobile not provided"}
              </p>
              <p className="mt-3">
                Automatic access to enquiry phone numbers and email addresses will be{" "}
                <strong>{pending.enabled ? "enabled" : "disabled"}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setPending(null)}
              disabled={saving}
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmChange()}
              disabled={saving || !pending}
              className={`rounded-md px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50 ${
                pending?.enabled ? "bg-navy" : "bg-destructive"
              }`}
            >
              {saving
                ? "Saving..."
                : pending?.enabled
                  ? "Confirm auto-approval"
                  : "Confirm turn off"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
