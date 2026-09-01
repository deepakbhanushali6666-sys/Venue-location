import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listReviewsForModeration, moderateReview, replyToReview } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { Stars } from "@/components/site/VenueReviews";

export type ReviewRow = {
  id: string;
  venue_id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  admin_note: string;
  created_at: string;
  owner_reply: string;
  owner_reply_at: string | null;
};

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

export function ReviewsPanel({
  mode,
  venueNames,
  venueIds,
}: {
  mode: "admin" | "owner";
  venueNames: Record<string, string>;
  venueIds?: string[];
}) {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(mode === "admin" ? "pending" : "all");

  const load = useCallback(async () => {
    if (mode === "owner" && (!venueIds || venueIds.length === 0)) {
      setRows([]);
      return;
    }
    try {
      const { reviews } = await listReviewsForModeration();
      const all = reviews as unknown as ReviewRow[];
      setRows(mode === "owner" && venueIds ? all.filter((r) => venueIds.includes(r.venue_id)) : all);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load reviews");
    }
  }, [mode, venueIds]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);

  const moderate = async (id: string, status: "approved" | "rejected") => {
    const note = status === "rejected" ? (window.prompt("Reason for rejecting this review?") ?? "") : "";
    try {
      await moderateReview(id, status, note.slice(0, 500));
      toast.success(status === "approved" ? "Review published" : "Review rejected");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not moderate review");
    }
  };

  const saveReply = async (id: string) => {
    setSavingReply(true);
    try {
      await replyToReview(id, replyText.trim().slice(0, 1500));
      toast.success(replyText.trim() ? "Reply published" : "Reply removed");
      setReplyOpen(null);
      setReplyText("");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save reply");
    } finally {
      setSavingReply(false);
    }
  };

  const exportCsv = () =>
    downloadCsv(
      `oms-reviews-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Venue", "Reviewer", "Rating", "Title", "Comment", "Status"],
      visible.map((r) => [
        new Date(r.created_at).toLocaleDateString("en-IN"),
        venueNames[r.venue_id] ?? r.venue_id,
        r.reviewer_name,
        r.rating,
        r.title,
        r.comment,
        r.status,
      ]),
    );

  const average = rows.filter((r) => r.status === "approved");
  const avgValue = average.length ? average.reduce((s, r) => s + r.rating, 0) / average.length : 0;

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy">
            {mode === "admin" ? "Review Moderation" : "Reviews for your venues"}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={avgValue} className="size-3.5" />
            {avgValue ? avgValue.toFixed(1) : "—"} average from {average.length} published ·{" "}
            {rows.filter((r) => r.status === "pending").length} pending
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                filter === f ? "bg-navy text-navy-foreground" : "border border-border text-navy"
              }`}
            >
              {f}
            </button>
          ))}
          <button onClick={exportCsv} className="rounded-md border border-border px-3 py-1.5 text-xs font-bold text-navy">
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {visible.length === 0 && <p className="text-sm text-muted-foreground">No reviews in this view.</p>}
        {visible.map((r) => (
          <article key={r.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-navy">{venueNames[r.venue_id] ?? "Venue"}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  by {r.reviewer_name || "Guest"} · {new Date(r.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                {r.status}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Stars value={r.rating} className="size-3.5" />
              {r.title && <span className="text-sm font-semibold text-navy">{r.title}</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{r.comment}</p>
            {r.owner_reply && (
              <div className="mt-3 rounded-md border-l-4 border-gold bg-secondary/60 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-navy">Your reply</div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">{r.owner_reply}</p>
              </div>
            )}
            {mode === "owner" && r.status === "approved" && (
              <div className="mt-3">
                {replyOpen === r.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Write a public reply to this review…"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => void saveReply(r.id)}
                        disabled={savingReply}
                        className="rounded-md bg-gold px-4 py-1.5 text-xs font-bold text-gold-foreground disabled:opacity-60"
                      >
                        {savingReply ? "Saving…" : "Publish reply"}
                      </button>
                      <button
                        onClick={() => setReplyOpen(null)}
                        className="rounded-md border border-border px-4 py-1.5 text-xs font-bold text-navy"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReplyOpen(r.id);
                      setReplyText(r.owner_reply ?? "");
                    }}
                    className="rounded-md border border-border px-4 py-1.5 text-xs font-bold text-navy"
                  >
                    {r.owner_reply ? "Edit reply" : "Reply"}
                  </button>
                )}
              </div>
            )}
            {r.admin_note && <p className="mt-2 text-xs text-muted-foreground">Moderator note: {r.admin_note}</p>}
            {mode === "admin" && (
              <div className="mt-3 flex gap-2">
                {r.status !== "approved" && (
                  <button
                    onClick={() => moderate(r.id, "approved")}
                    className="rounded-md bg-gold px-4 py-1.5 text-xs font-bold text-gold-foreground"
                  >
                    Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => moderate(r.id, "rejected")}
                    className="rounded-md border border-border px-4 py-1.5 text-xs font-bold text-navy"
                  >
                    Reject
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
