import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteVenue } from "@/lib/api";
import { useIsAdmin } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/deletion-requests")({
  head: () => ({
    meta: [
      { title: "Deletion Requests | VENUES LOCATION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeletionRequestsPage,
});

type DeletionRequestRow = {
  id: string;
  venueId: string;
  property_code: string;
  venueName: string;
  ownerName: string;
  mobile: string;
  email: string;
  requestedAt: string;
};

const KEY = "venue-deletion-requests";

function DeletionRequestsPage() {
  const [userId, setUserId] = useState<string>();
  const [checked, setChecked] = useState(false);
  const isAdmin = useIsAdmin(userId);
  const [requests, setRequests] = useState<DeletionRequestRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
      setChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const rows = JSON.parse(localStorage.getItem(KEY) ?? "[]") as DeletionRequestRow[];
    setRequests(rows);
  }, [isAdmin]);

  const clearRequest = (id: string) => {
    const nextRows = requests.filter((request) => request.id !== id);
    setRequests(nextRows);
    localStorage.setItem(KEY, JSON.stringify(nextRows));
    toast.success("Deletion request cleared");
  };

  const deleteRequestedVenue = async (request: DeletionRequestRow) => {
    if (
      !window.confirm(
        `Delete ${request.venueName} permanently? This cannot be undone.`,
      )
    )
      return;
    setDeletingId(request.id);
    try {
      await deleteVenue(request.venueId);
      const nextRows = requests.filter((row) => row.id !== request.id);
      setRequests(nextRows);
      localStorage.setItem(KEY, JSON.stringify(nextRows));
      toast.success("Venue deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete venue");
    } finally {
      setDeletingId(null);
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

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-navy">Deletion Requests</h1>
          <Link
            to="/admin"
            className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
          >
            Back to Admin Panel
          </Link>
        </div>

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Code</th>
                  <th>Venue</th>
                  <th>Owner</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-muted-foreground">
                      No deletion requests yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="border-t border-border">
                      <td className="py-3 font-bold text-navy">{request.property_code || "-"}</td>
                      <td>{request.venueName}</td>
                      <td>{request.ownerName || "-"}</td>
                      <td>{request.mobile || "-"}</td>
                      <td>{request.email || "-"}</td>
                      <td>{new Date(request.requestedAt).toLocaleString("en-IN")}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => clearRequest(request.id)}
                            className="rounded-md border border-border px-2 py-1 text-xs font-bold text-navy"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteRequestedVenue(request)}
                            disabled={deletingId === request.id}
                            title="Delete venue"
                            aria-label={`Delete ${request.venueName}`}
                            className="rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
