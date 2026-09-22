import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { BadgeCheck, IndianRupee, ImagePlus, LineChart } from "lucide-react";
import { categories, cities, locationTypes, states } from "@/data/venues";
import { createVenue, submitLead } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PhotoUploader } from "@/components/site/PhotoUploader";


export const Route = createFileRoute("/list-your-venue")({
  head: () => ({
    meta: [
      { title: "List Your Venue | VENUES LOCATION Venue Owner Registration" },
      {
        name: "description",
        content:
          "Register your hotel, resort, farmhouse, lawn or studio on VENUES LOCATION. One plan at ₹3,650 per year, verified listing and genuine enquiries from real clients.",
      },
      { property: "og:title", content: "List Your Venue | VENUES LOCATION" },
      {
        property: "og:description",
        content: "Get genuine enquiries from weddings, corporates and production houses. ₹3,650 per year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListYourVenue,
});

const schema = z.object({
  ownerName: z.string().trim().min(2, "Enter your name").max(80),
  mobile: z.string().trim().regex(/^[0-9+\s-]{8,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  venueName: z.string().trim().min(2, "Enter the venue name").max(120),
  city: z.string().min(1, "Select a city"),
  state: z.string().min(1, "Select a state"),
  category: z.string().min(1, "Select a category"),
  address: z.string().trim().min(5, "Enter the venue location").max(240),
  gst: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(600).optional(),
});

const benefits = [
  { icon: BadgeCheck, title: "Verified listing", text: "Your venue is reviewed and approved by our team before going live." },
  { icon: LineChart, title: "Genuine leads", text: "Every enquiry reaches you with a Lead ID, contact details and event brief." },
  { icon: ImagePlus, title: "Full control", text: "Update photos, pricing and details anytime from your owner dashboard." },
  { icon: IndianRupee, title: "One simple plan", text: "₹3,650 per year. No commission on bookings, invoice provided." },
];

function ListYourVenue() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>([]);
  const { user } = useAuth();
  const toggleLocationType = (type: string) => {
    setSelectedLocationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  const navigate = useNavigate();
  const field = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = Object.fromEntries(new FormData(formEl)) as Record<string, string>;
    if (data["acceptTerms"] !== "on") {
      toast.error("Please accept the Terms & Conditions and Privacy Policy to continue");
      return;
    }
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const d = parsed.data;

    if (user) {
      const categorySlug = categories.find((c) => c.name === d.category)?.slug ?? "resorts";
      const slug = `${d.venueName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
      const description = [
        d.notes ?? "",
        selectedLocationTypes.length ? `Location type: ${selectedLocationTypes.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      try {
        await createVenue({
          name: d.venueName,
          slug,
          category: categorySlug,
          city: d.city,
          state: d.state,
          address: d.address,
          description,
          gst_number: d.gst ?? "",
          photos,
          map_query: `${d.venueName}, ${d.city}`,
        });
        toast.success("Venue submitted for approval", {
          description: "Track status and enquiries from your owner dashboard.",
        });
        formEl.reset();
        setPhotos([]);
        setSelectedLocationTypes([]);
        void navigate({ to: "/dashboard" });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not submit venue");
      } finally {
        setBusy(false);
      }
      return;
    }

    try {
      const { leadCode } = await submitLead({
        customer_name: d.ownerName,
        mobile: d.mobile,
        email: d.email,
        purpose: "Venue Listing",
        venue_name: d.venueName,
        message: [
          `Category: ${d.category}`,
          `Location: ${d.address}, ${d.city}, ${d.state}`,
          selectedLocationTypes.length ? `Location type: ${selectedLocationTypes.join(", ")}` : "",
          d.gst ? `GST: ${d.gst}` : "",
          d.notes ?? "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      toast.success(`Registration received${leadCode ? ` (${leadCode})` : ""}`, {
        description: "Create your owner account to add photos and manage enquiries.",
      });
      formEl.reset();
      setSelectedLocationTypes([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit registration");
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;


  return (
    <div className="bg-sand">
      <section className="bg-navy py-14 text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            List Your Venue on <span className="text-gold">VENUES LOCATION</span>
          </h1>
          <p className="mt-3 max-w-2xl text-navy-foreground/80">
            Reach wedding families, corporate planners and production houses looking for exactly what you offer.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-5">
                <b.icon className="size-7 text-gold" />
                <h2 className="mt-2 font-display text-base font-bold text-navy">{b.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-navy p-7 text-navy-foreground">
            <h2 className="section-title text-base text-gold">Subscription</h2>
            <p className="mt-3 font-display text-4xl font-extrabold">
              ₹3,650 <span className="text-base font-semibold text-navy-foreground/70">/ year</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-navy-foreground/85">
              <li>• One plan, all features included</li>
              <li>• Online payment with GST invoice</li>
              <li>• Automatic renewal reminders</li>
              <li>• Unlimited enquiries and photo updates</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="section-title text-lg text-navy">Venue Owner Registration</h2>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <input name="ownerName" placeholder="Owner Name*" className={field} maxLength={80} />
                {err("ownerName")}
              </div>
              <div>
                <input name="mobile" placeholder="Mobile Number*" className={field} maxLength={15} />
                {err("mobile")}
              </div>
            </div>
            <div>
              <input name="email" placeholder="Email Address*" className={field} maxLength={120} />
              {err("email")}
            </div>
            <div>
              <input name="venueName" placeholder="Venue Name*" className={field} maxLength={120} />
              {err("venueName")}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <select name="city" defaultValue="" className={field}>
                  <option value="">City*</option>
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {err("city")}
              </div>
              <div>
                <select name="state" defaultValue="" className={field}>
                  <option value="">State*</option>
                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {err("state")}
              </div>
            </div>
            <div>
              <select name="category" defaultValue="" className={field}>
                <option value="">Venue Category*</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err("category")}
            </div>
            <div>
              <p className="text-xs font-bold text-navy">Type of location / space (optional, select all that apply)</p>
              <div className="mt-2 grid max-h-40 grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-3">
                {locationTypes.map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="size-3.5 accent-gold"
                      checked={selectedLocationTypes.includes(type)}
                      onChange={() => toggleLocationType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <input name="address" placeholder="Location / Address*" className={field} maxLength={240} />
              {err("address")}
            </div>
            <input name="gst" placeholder="GST Number (optional)" className={field} maxLength={20} />
            {user ? (
              <div className="grid">
                <PhotoUploader userId={user.id} value={photos} onChange={setPhotos} />
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                <Link to="/auth" className="font-bold text-gold">
                  Sign in or create an owner account
                </Link>{" "}
                to upload venue photos directly and manage your listing.
              </p>
            )}
            <textarea
              name="notes"
              rows={3}
              placeholder="Capacity, amenities, anything else we should know"
              className={field}
              maxLength={600}
            />
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                name="acceptTerms"
                type="checkbox"
                required
                className="mt-0.5 size-4 shrink-0 accent-gold"
              />
              <span>
                I have read and agree to the VenuesLocation{" "}
                <Link to="/terms" target="_blank" className="font-bold text-navy hover:text-gold">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" target="_blank" className="font-bold text-navy hover:text-gold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-gold px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-gold-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit for Approval"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Listings go live after admin verification. No payment is taken at this step.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
