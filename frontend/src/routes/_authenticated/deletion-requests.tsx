import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  clearDeletionRequest,
  deleteLead,
  deleteVenue,
  listDeletionRequests,
  type DeletionRequest,
} from "@/lib/api";
import { useRoles } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/deletion-requests")({
  head: () => ({
    meta: [
      { title: "Deletion Requests | VENUES LOCATION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeletionRequestsPage,
});

function DeletionRequestsPage() {
  const [userId, setUserId] = useState<string>();
  const [checked, setChecked] = useState(false);
  const { isAdmin } = useRoles(userId);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
      setChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    listDeletionRequests()
      .then(({ requests: rows }) => setRequests(rows))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Could not load deletion requests"),
      );
  }, [isAdmin]);

  const clearRequest = async (request: DeletionRequest) => {
    setBusyId(request.id);
    try {
      await clearDeletionRequest(request.id);
      setRequests((rows) => rows.filter((row) => row.id !== request.id));
      toast.success("Deletion request cleared");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not clear request");
    } finally {
      setBusyId(null);
    }
  };

  const deleteTarget = async (request: DeletionRequest) => {
    const what =
      request.target_type === "venue"
        ? `venue "${request.target_label}"`
        : `enquiry ${request.target_label}`;
    if (!window.confirm(`Delete ${what} permanently? This cannot be undone.`)) return;

    setBusyId(request.id);
    try {
      if (request.target_type === "venue" && request.venue_id) {
        await deleteVenue(request.venue_id);
      } else if (request.target_type === "lead" && request.lead_id) {
        await deleteLead(request.lead_id);
      }
      // The request row cascades away with the record; clear it defensively anyway.
      await clearDeletionRequest(request.id).catch(() => undefined);
      setRequests((rows) => rows.filter((row) => row.id !== request.id));
      toast.success(request.target_type === "venue" ? "Venue deleted" : "Enquiry deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete record");
    } finally {
      setBusyId(null);
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

  const venueRequests = requests.filter((r) => r.target_type === "venue");
  const leadRequests = requests.filter((r) => r.target_type === "lead");

  const renderTable = (rows: DeletionRequest[], targetHeading: string, emptyText: string) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-215 text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-2">Code</th>
            <th>{targetHeading}</th>
            <th>Details</th>
            <th>Requested by</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Requested</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((request) => (
            <tr key={request.id} className="border-t border-border align-top">
              <td className="py-3 font-bold text-navy">{request.property_code || "—"}</td>
              <td className="font-semibold text-navy">{request.target_label || "—"}</td>
              <td className="text-xs text-muted-foreground">{request.target_details || "—"}</td>
              <td>{request.requester_name || "—"}</td>
              <td>{request.requester_mobile || "—"}</td>
              <td>{request.requester_email || "—"}</td>
              <td className="whitespace-nowrap">
                {new Date(request.created_at).toLocaleString("en-IN")}
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void clearRequest(request)}
                    disabled={busyId === request.id}
                    title="Dismiss the request without deleting the record"
                    aria-label={`Clear deletion request for ${request.target_label}`}
                    className="rounded-md border border-border px-2 py-1 text-xs font-bold text-navy disabled:opacity-50"
                  >
                    Clear Request
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteTarget(request)}
                    disabled={busyId === request.id}
                    title="Delete permanently"
                    aria-label={`Delete ${request.target_label}`}
                    className="rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-4 text-muted-foreground">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-7xl">
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
          <h2 className="font-display text-xl font-extrabold text-navy">
            Property Deletion Requests ({venueRequests.length})
          </h2>
          {renderTable(venueRequests, "Property", "No property deletion requests yet.")}
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-xl font-extrabold text-navy">
            Lead Deletion Requests ({leadRequests.length})
          </h2>
          {renderTable(leadRequests, "Lead ID", "No lead deletion requests yet.")}
        </section>
      </div>
    </div>
  );
}
