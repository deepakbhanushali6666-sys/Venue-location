import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { getVenueReviews, upsertReview } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export type PublicReview = {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  owner_reply: string;
  owner_reply_at: string | null;
};

export function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${i <= Math.round(value) ? "fill-gold text-gold" : "text-border"}`} />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i} star`}>
          <Star className={`size-6 ${i <= value ? "fill-gold text-gold" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

export function VenueReviews({ venueId, venueName }: { venueId: string; venueName: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [mine, setMine] = useState<{ id: string; status: string; rating: number; title: string; comment: string } | null>(
    null,
  );
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { reviews: rows, mine: own } = await getVenueReviews(venueId);
    setReviews(rows as unknown as PublicReview[]);
    if (own) {
      const o = own as unknown as { id: string; status: string; rating: number; title: string; comment: string };
      setMine({ id: o.id, status: o.status, rating: o.rating, title: o.title, comment: o.comment });
      setRating(o.rating);
      setTitle(o.title);
      setComment(o.comment);
    } else {
      setMine(null);
    }
    // Re-run when the signed-in user changes so "mine" reflects the current session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (comment.trim().length < 10) return void toast.error("Please write at least 10 characters.");
    setSaving(true);
    try {
      await upsertReview({
        venue_id: venueId,
        rating,
        title: title.trim().slice(0, 120),
        comment: comment.trim().slice(0, 2000),
        reviewer_name: (user.user_metadata?.["full_name"] as string) || user.email?.split("@")[0] || "Guest",
      });
      toast.success("Thank you! Your review is awaiting moderation.");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <h2 className="section-title text-base text-navy">Reviews & Ratings</h2>
        <div className="flex items-center gap-2 text-sm">
          <Stars value={average} />
          <span className="font-display font-extrabold text-navy">{average ? average.toFixed(1) : "—"}</span>
          <span className="text-muted-foreground">({reviews.length})</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet for {venueName}. Be the first to review.</p>
        )}
        {reviews.map((r) => (
          <article key={r.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-navy">{r.reviewer_name || "Guest"}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Stars value={r.rating} className="size-3.5" />
              {r.title && <span className="text-sm font-semibold text-navy">{r.title}</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{r.comment}</p>
            {r.owner_reply && (
              <div className="mt-3 rounded-md border-l-4 border-gold bg-secondary/60 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-navy">
                  Reply from {venueName}
                  {r.owner_reply_at && (
                    <span className="ml-2 font-normal normal-case text-muted-foreground">
                      {new Date(r.owner_reply_at).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">{r.owner_reply}</p>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-5">
        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/auth" className="font-bold text-gold">
              Sign in
            </Link>{" "}
            to write a review for this venue.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <h3 className="font-display text-base font-extrabold text-navy">
              {mine ? "Update your review" : "Write a review"}
            </h3>
            {mine && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status: {mine.status}
              </p>
            )}
            <StarPicker value={rating} onChange={setRating} />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              placeholder="Share your experience with this venue…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-gold px-5 py-2.5 text-sm font-bold text-gold-foreground disabled:opacity-60"
            >
              {saving ? "Submitting…" : mine ? "Resubmit for moderation" : "Submit review"}
            </button>
            <p className="text-xs text-muted-foreground">Reviews appear publicly once approved by our team.</p>
          </form>
        )}
      </div>
    </div>
  );
}
