import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { eventTypes } from "@/data/venues";
import { submitLead } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  mobile: z.string().trim().regex(/^[0-9+\s-]{8,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  purpose: z.string().min(1, "Select a purpose"),
  eventDate: z.string().optional(),
  budget: z.string().trim().max(40).optional(),
  message: z.string().trim().max(800).optional(),
});

export function EnquiryForm({
  venueName,
  venueId,
  compact = false,
}: {
  venueName?: string;
  venueId?: string | undefined;
  compact?: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const data = Object.fromEntries(form) as Record<string, string>;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { leadCode } = await submitLead({
        customer_name: parsed.data.name,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        purpose: parsed.data.purpose,
        venue_name: venueName ?? "",
        budget: parsed.data.budget ?? "",
        message: parsed.data.message ?? "",
        ...(venueId ? { venue_id: venueId } : {}),
        ...(parsed.data.eventDate ? { event_date: parsed.data.eventDate } : {}),
      });
      toast.success(`Enquiry received — Lead ${leadCode ?? "created"}`, {
        description: `Our team will contact you on ${parsed.data.mobile} within 24 hours.`,
      });
      formEl.reset();
    } catch {
      toast.error("We couldn't submit your enquiry. Please try again or call us.");
    } finally {
      setBusy(false);
    }
  };


  const field = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {venueName && <input type="hidden" name="venue" value={venueName} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input name="name" placeholder="Your Name*" className={field} maxLength={80} />
          {errors["name"] && <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>}
        </div>
        <div>
          <input name="mobile" placeholder="Mobile Number*" className={field} maxLength={15} />
          {errors["mobile"] && <p className="mt-1 text-xs text-destructive">{errors["mobile"]}</p>}
        </div>
      </div>
      <div>
        <input name="email" placeholder="Email Address*" className={field} maxLength={120} />
        {errors["email"] && <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <select name="purpose" defaultValue="" className={field}>
            <option value="">Purpose*</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors["purpose"] && <p className="mt-1 text-xs text-destructive">{errors["purpose"]}</p>}
        </div>
        <input name="eventDate" type="date" aria-label="Event date" className={field} />
      </div>
      <input name="budget" placeholder="Approximate Budget (₹)" className={field} maxLength={40} />
      {!compact && (
        <textarea
          name="message"
          rows={3}
          placeholder="Tell us about your requirement"
          className={field}
          maxLength={800}
        />
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-navy px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send Enquiry"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Every enquiry is logged with a Lead ID and tracked till booking.
      </p>
    </form>
  );
}
