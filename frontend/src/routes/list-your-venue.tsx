import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { BadgeCheck, IndianRupee, ImagePlus, LineChart } from "lucide-react";
import { cities, states } from "@/data/venues";
import { createVenue, listAmenities, listCategories, submitLead, type AmenityRecord, type CategoryRecord } from "@/lib/api";
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
        content:
          "Get genuine enquiries from weddings, corporates and production houses. ₹3,650 per year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListYourVenue,
});

const schema = z.object({
  ownerName: z.string().trim().min(2, "Enter your name").max(80),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  venueName: z.string().trim().min(2, "Enter the venue name").max(120),
  city: z.string().min(1, "Select a city"),
  state: z.string().min(1, "Select a state"),
  category: z.string().min(1, "Select a category"),
  subcategory: z.string().trim().max(80).optional(),
  address: z.string().trim().min(5, "Enter the venue location").max(240),
  gst: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(600).optional(),
});

const benefits = [
  {
    icon: BadgeCheck,
    title: "Verified listing",
    text: "Your venue is reviewed and approved by our team before going live.",
  },
  {
    icon: LineChart,
    title: "Genuine leads",
    text: "Every enquiry reaches you with a Lead ID, contact details and event brief.",
  },
  {
    icon: ImagePlus,
    title: "Full control",
    text: "Update photos, pricing and details anytime from your owner dashboard.",
  },
  {
    icon: IndianRupee,
    title: "One simple plan",
    text: "₹3,650 per year. No commission on bookings, invoice provided.",
  },
];

const bookingPurposes = [
  ["🎬", "Film / Movie Shoot"],
  ["📺", "TV Serial Shoot"],
  ["🎥", "Web Series / OTT Shoot"],
  ["📢", "Advertisement / TVC Shoot"],
  ["🎵", "Music Video Shoot"],
  ["📸", "Photo Shoot"],
  ["👗", "Fashion / Catalogue / E-commerce Shoot"],
  ["💑", "Pre-Wedding Shoot"],
  ["💍", "Wedding"],
  ["🌴", "Destination Wedding"],
  ["💒", "Engagement / Reception"],
  ["🎂", "Birthday Party"],
  ["🎉", "Private Party / Celebration"],
  ["👶", "Baby Shower / Family Function"],
  ["🏢", "Corporate Event"],
  ["🧳", "Corporate Off-site"],
  ["🤝", "Conference / Meeting"],
  ["🎤", "Seminar / Workshop / Training"],
  ["🚀", "Product / Brand Launch"],
  ["🛍️", "Exhibition / Pop-up / Showcase"],
  ["🎭", "Performance / Cultural Event"],
  ["🧘", "Wellness / Yoga / Retreat"],
  ["🏡", "Staycation / Weekend Stay"],
  ["🏖️", "Holiday / Vacation Stay"],
  ["🍽️", "Private Dining / Food Event"],
  ["🎙️", "Podcast / Interview / Content Creation"],
  ["🎬", "Reality Show / Digital Content"],
  ["✨", "Other"],
] as const;

const bookingRestrictions = [
  "No night shoots",
  "No alcohol",
  "No loud music",
  "No weddings",
  "No parties",
  "No overnight stay",
  "No large crews",
  "Other restrictions",
] as const;

function ListYourVenue() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [amenities, setAmenities] = useState<AmenityRecord[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    listCategories()
      .then(({ categories: rows }) => setCategories(rows))
      .catch(() => toast.error("Could not load venue categories"));
    listAmenities()
      .then(({ amenities: rows }) => setAmenities(rows))
      .catch(() => toast.error("Could not load venue amenities"));
  }, []);

  const subcategoryOptions =
    categories.find((c) => c.name === selectedCategory)?.subcategories ?? [];
  const navigate = useNavigate();
  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";

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
      const description = d.notes ?? "";
      try {
        await createVenue({
          name: d.venueName,
          slug,
          category: categorySlug,
          subcategory: d.subcategory ?? "",
          city: d.city,
          state: d.state,
          address: d.address,
          description,
          gst_number: d.gst ?? "",
          photos,
          amenities: selectedAmenities,
          booking_purposes: selectedPurposes,
          booking_restrictions: selectedRestrictions,
          map_query: `${d.venueName}, ${d.city}`,
        });
        toast.success("Venue submitted for approval", {
          description: "Track status and enquiries from your owner dashboard.",
        });
        formEl.reset();
        setPhotos([]);
        setSelectedAmenities([]);
        setSelectedPurposes([]);
        setSelectedRestrictions([]);
        setSelectedCategory("");
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
          d.subcategory ? `Subcategory: ${d.subcategory}` : "",
          `Location: ${d.address}, ${d.city}, ${d.state}`,
          selectedAmenities.length ? `Amenities: ${selectedAmenities.join(", ")}` : "",
          selectedPurposes.length ? `Booking purposes accepted: ${selectedPurposes.join(", ")}` : "",
          selectedRestrictions.length ? `Booking restrictions: ${selectedRestrictions.join(", ")}` : "",
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
      setSelectedAmenities([]);
      setSelectedPurposes([]);
      setSelectedRestrictions([]);
      setSelectedCategory("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit registration");
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) =>
    errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  const allBookingsSelected = selectedPurposes.length === bookingPurposes.length;

  return (
    <div className="bg-sand">
      <section className="bg-navy py-14 text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            List Your Venue on <span className="text-gold">VENUES LOCATION</span>
          </h1>
          <p className="mt-3 max-w-2xl text-navy-foreground/80">
            Reach wedding families, corporate planners and production houses looking for exactly
            what you offer.
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
                <input
                  name="ownerName"
                  placeholder="Owner Name*"
                  className={field}
                  maxLength={80}
                />
                {err("ownerName")}
              </div>
              <div>
                <input
                  name="mobile"
                  placeholder="Mobile Number*"
                  className={field}
                  maxLength={15}
                />
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
              <select
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={field}
              >
                <option value="">Venue Category*</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err("category")}
            </div>
            {subcategoryOptions.length > 0 && (
              <div>
                <select name="subcategory" defaultValue="" className={field}>
                  <option value="">Venue Sub category (optional)</option>
                  {subcategoryOptions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {err("subcategory")}
              </div>
            )}
            <div>
              <input
                name="address"
                placeholder="Location / Address*"
                className={field}
                maxLength={240}
              />
              {err("address")}
            </div>
            <input
              name="gst"
              placeholder="GST Number (optional)"
              className={field}
              maxLength={20}
            />
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
            {amenities.length > 0 && (
              <fieldset className="rounded-md border border-border bg-background p-4">
                <legend className="px-1 font-display text-xs font-extrabold uppercase tracking-wide text-navy">Amenities</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-2 text-sm text-foreground/85">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity.name)}
                        onChange={(event) => setSelectedAmenities((current) => event.target.checked ? [...current, amenity.name] : current.filter((item) => item !== amenity.name))}
                        className="size-4 accent-gold"
                      />
                      {amenity.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset className="rounded-md border border-border bg-background p-4">
              <legend className="px-1 font-display text-xs font-extrabold uppercase tracking-wide text-navy">
                What types of bookings do you accept?
              </legend>
              <p className="mt-1 text-xs text-muted-foreground">Select all that apply.</p>
              <button
                type="button"
                role="switch"
                aria-checked={allBookingsSelected}
                aria-label="Select all suitable bookings"
                onClick={() => setSelectedPurposes((current) => current.length === bookingPurposes.length ? [] : bookingPurposes.map(([, label]) => label))}
                className="mt-3 inline-flex items-center gap-3"
              >
                <span
                  className={`relative inline-flex h-8 w-16 items-center rounded-full p-1 transition-colors ${
                    allBookingsSelected ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <span
                    className={`absolute size-6 rounded-full bg-white shadow transition-transform ${
                      allBookingsSelected ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                  <span className="relative z-10 w-full text-[10px] font-extrabold text-white">
                    {allBookingsSelected ? "ON" : "OFF"}
                  </span>
                </span>
                <span className="text-xs font-bold text-navy">Select All Suitable Bookings</span>
              </button>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bookingPurposes.map(([icon, label]) => (
                  <label key={label} className="flex items-start gap-2 text-sm text-foreground/85">
                    <input
                      type="checkbox"
                      checked={selectedPurposes.includes(label)}
                      onChange={(event) => setSelectedPurposes((current) => event.target.checked ? [...current, label] : current.filter((item) => item !== label))}
                      className="mt-0.5 size-4 shrink-0 accent-gold"
                    />
                    <span>{icon} {label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded-md border border-border bg-background p-4">
              <legend className="px-1 font-display text-xs font-extrabold uppercase tracking-wide text-navy">Booking restrictions</legend>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bookingRestrictions.map((restriction) => (
                  <label key={restriction} className="flex items-start gap-2 text-sm text-foreground/85">
                    <input
                      type="checkbox"
                      checked={selectedRestrictions.includes(restriction)}
                      onChange={(event) => setSelectedRestrictions((current) => event.target.checked ? [...current, restriction] : current.filter((item) => item !== restriction))}
                      className="mt-0.5 size-4 shrink-0 accent-gold"
                    />
                    <span>{restriction}</span>
                  </label>
                ))}
              </div>
            </fieldset>
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
