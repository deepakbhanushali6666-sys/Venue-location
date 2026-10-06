import { createPayment, createVenue, createVenueDraft, listAmenities, listCategories, listLocations, listPurposes, type AmenityRecord, type CategoryRecord } from "@/lib/api";
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Check, Eye, EyeOff, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cities, states } from "@/data/venues";
import { BUSINESS, PAYMENT_DETAILS, PLAN, PRO_MARKETING_PLAN, upiLink } from "@/data/business";
import { useAuth } from "@/hooks/useAuth";
import { PhotoUploader } from "@/components/site/PhotoUploader";
import { supabase } from "@/integrations/supabase/client";
import basicPlanImage from "@/assets/cat-film.jpg";
import verifiedPlanImage from "@/assets/cat-resort.jpg";
import premiumPlanImage from "@/assets/cat-hotel.jpg";
import proPlanImage from "@/assets/cat-studio.jpg";

export const Route = createFileRoute("/list-your-venue")({
  head: () => ({
    meta: [
      { title: "List Your Venue | VENUES LOCATION Venue Owner Registration" },
      {
        name: "description",
        content:
          "List your venue or film location on VENUES LOCATION for free, or choose optional annual plans for verified listings and marketing.",
      },
      { property: "og:title", content: "List Your Venue | VENUES LOCATION" },
      {
        property: "og:description",
        content: "Start with a free basic listing or choose optional plans for more visibility and promotion.",
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
  area: z.string().trim().max(120).optional(),
  pincode: z.string().trim().refine((value) => !value || /^[1-9][0-9]{5}$/.test(value), "Enter a valid 6-digit PIN Code").optional(),
  category: z.string().optional(),
  filmCategory: z.string().optional(),
  address: z.string().trim().min(5, "Enter the venue location").max(240),
  gst: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(600).optional(),
});

const listingPlans = [
  {
    name: "Basic Listing",
    id: "basic",
    price: "₹0",
    period: "",
    description: "Create your venue profile and start receiving enquiries.",
    features: ["Add property details", "Up to 10 venue photos", "Choose accepted booking types", "Appear in relevant searches", "Receive customer enquiries"],
    image: basicPlanImage,
    imageAlt: "Heritage courtyard available as a film location",
    theme: "border-emerald-200 bg-emerald-50/80",
    check: "text-emerald-600",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
    action: "LIST YOUR VENUE",
    href: "#venue-registration",
  },
  {
    name: "Verified Listing",
    id: "verified",
    price: "₹3,650",
    period: "/ year",
    description: "Build trust with a verified profile and enhanced presentation.",
    features: ["Everything in Basic", "Up to 20 venue photos", "Verified profile badge", "Add video or reel", "Priority in search results", "Contact and enquiry tools"],
    image: verifiedPlanImage,
    imageAlt: "Resort pool and waterfront venue",
    theme: "border-blue-200 bg-blue-50/80",
    check: "text-blue-600",
    button: "bg-blue-600 text-white hover:bg-blue-700",
    action: "GET VERIFIED",
    href: "#venue-registration",
    note: "Pay by UPI. Your listing is submitted after payment verification.",
  },
  {
    name: "Premium",
    price: "Contact Us",
    period: "",
    description: "Get more visibility and attract more bookings.",
    features: ["Everything in Verified", "Featured placement", "Priority visibility", "Social media promotion opportunities", "The Location Magazine features"],
    image: premiumPlanImage,
    imageAlt: "Modern high-rise venue location",
    theme: "border-amber-200 bg-amber-50/80",
    check: "text-amber-600",
    button: "bg-amber-500 text-navy hover:bg-amber-400",
    action: "ENQUIRE FOR PREMIUM",
    href: `https://wa.me/91${BUSINESS.phone}?text=${encodeURIComponent("Hi, I would like to know more about the Premium venue listing plan.")}`,
    external: true,
    badge: "POPULAR",
  },
  {
    name: "Pro Marketing",
    id: "pro",
    price: "₹36,500",
    period: "/ year",
    description: "Complete marketing support for maximum exposure.",
    features: ["Everything in Premium", "Up to 20 venue photos", "Dedicated promotional support", "Social media promotion", "Reels and video promotion", "The Location Magazine promotion", "Content and campaign support"],
    image: proPlanImage,
    imageAlt: "Film production studio with lighting equipment",
    theme: "border-rose-200 bg-rose-50/80",
    check: "text-rose-600",
    button: "bg-rose-600 text-white hover:bg-rose-700",
    action: "GET PRO MARKETING",
    href: "#venue-registration",
    note: "Pay by UPI. Your listing is submitted after payment verification.",
  },
] as const;

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
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [filmCategories, setFilmCategories] = useState<CategoryRecord[]>([]);
  const [amenities, setAmenities] = useState<AmenityRecord[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedListingPurposes, setSelectedListingPurposes] = useState<string[]>([]);
  const [bookingOptions, setBookingOptions] = useState<string[]>(bookingPurposes.map(([, label]) => label));
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [formStates, setFormStates] = useState<string[]>(states);
  const [formCities, setFormCities] = useState<string[]>(cities);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFilmCategory, setSelectedFilmCategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedFilmSubcategories, setSelectedFilmSubcategories] = useState<string[]>([]);
  const [accountNotice, setAccountNotice] = useState<"created" | "confirmation" | "existing" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "verified" | "pro">("basic");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [payerName, setPayerName] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const ownerId = user?.id;

  useEffect(() => {
    listCategories()
      .then(({ categories: rows }) => setCategories(rows))
      .catch(() => toast.error("Could not load venue categories"));
    listCategories("film")
      .then(({ categories: rows }) => setFilmCategories(rows))
      .catch(() => toast.error("Could not load film location categories"));
    listAmenities()
      .then(({ amenities: rows }) => setAmenities(rows))
      .catch(() => toast.error("Could not load venue amenities"));
    listLocations()
      .then(({ locations }) => {
        setFormStates(locations.filter((location) => location.kind === "state").map((location) => location.name));
        setFormCities(locations.filter((location) => location.kind === "city").map((location) => location.name));
      })
      .catch(() => undefined);
    listPurposes()
      .then(({ purposes: rows }) => setBookingOptions(rows.map((purpose) => purpose.name)))
      .catch(() => undefined);
  }, []);

  // Reset the chosen subcategories whenever the owning category changes so
  // stale selections from a previous category can't be submitted.
  useEffect(() => {
    setSelectedSubcategories([]);
  }, [selectedCategory]);
  useEffect(() => {
    setSelectedFilmSubcategories([]);
  }, [selectedFilmCategory]);

  const filmOnly = selectedListingPurposes.includes("Film Shooting Locations") && !selectedListingPurposes.includes("Venue Bookings");
  const venueAndFilm = selectedListingPurposes.includes("Film Shooting Locations") && selectedListingPurposes.includes("Venue Bookings");
  const categoryOptions = filmOnly ? filmCategories : categories;
  const subcategoryOptions =
    categoryOptions.find((c) => c.name === selectedCategory)?.subcategories ?? [];
  const filmSubcategoryOptions =
    filmCategories.find((category) => category.name === selectedFilmCategory)?.subcategories ?? [];
  const navigate = useNavigate();
  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";
  const selectedPaymentPlan = selectedPlan === "pro" ? PRO_MARKETING_PLAN : PLAN;

  const submitVerifiedPayment = async () => {
    if (!draftId || !paymentReference.trim() || submittingPayment) return;
    setSubmittingPayment(true);
    try {
      await createPayment({
        amount: selectedPaymentPlan.amount,
        plan_code: selectedPaymentPlan.code,
        method: "upi",
        reference: paymentReference.trim(),
        payer_name: payerName.trim(),
        venue_draft_id: draftId,
      });
      setPaymentSubmitted(true);
      toast.success("Payment reference submitted", {
        description: "After verification, your listing will be submitted for admin approval.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit payment reference");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || authLoading || uploading || draftId) return;
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
    if (selectedListingPurposes.length === 0) {
      toast.error("Select at least one listing purpose");
      return;
    }
    const includesVenueBookings = selectedListingPurposes.includes("Venue Bookings");
    const includesFilmLocations = selectedListingPurposes.includes("Film Shooting Locations");
    const selectedCategoryRecord = categoryOptions.find((category) => category.name === parsed.data.category);
    if (!selectedCategoryRecord) {
      setErrors({ category: includesVenueBookings ? "Select a venue category" : "Select a film location category" });
      return;
    }
    const d = parsed.data;
    const selectedFilmCategoryRecord = includesFilmLocations
      ? venueAndFilm
        ? filmCategories.find((category) => category.name === d.filmCategory)
        : selectedCategoryRecord
      : undefined;
    if (venueAndFilm && !selectedFilmCategoryRecord) {
      toast.error("Select a film location category");
      return;
    }
    const photoLimit = selectedPlan === "basic" ? 10 : 20;
    if (photos.length > photoLimit) {
      toast.error(`${selectedPlan === "basic" ? "Basic" : "Paid"} listings allow up to ${photoLimit} photos. Remove ${photos.length - photoLimit} photo${photos.length - photoLimit === 1 ? "" : "s"} to continue.`);
      return;
    }

    if (!ownerId) {
      const password = data["password"] ?? "";
      if (password.length < 8) {
        setErrors({ password: "Use at least 8 characters" });
        return;
      }
      if (password !== data["confirmPassword"]) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }
      setBusy(true);
      try {
        const { data: signup, error } = await supabase.auth.signUp({
          email: d.email,
          password,
          options: { data: { full_name: d.ownerName, mobile: d.mobile } },
        });
        if (error) throw error;
        if (!signup.session) {
          setAccountNotice("confirmation");
          return;
        }
        setAccountNotice("created");
        toast.success(selectedPlan !== "basic" ? "Account created. Continue to payment." : "Account created. Add your photos and submit your venue for approval.");
      } catch (err) {
        if (err instanceof Error && /already registered|already exists/i.test(err.message)) {
          setAccountNotice("existing");
        } else {
          toast.error(err instanceof Error ? err.message : "Could not create account");
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    const slug = `${d.venueName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
    const listingPayload = {
      name: d.venueName,
      slug,
      category: selectedCategoryRecord.slug,
      subcategory: selectedSubcategories,
      film_category: selectedFilmCategoryRecord?.slug ?? "",
      film_subcategory: includesFilmLocations
        ? venueAndFilm ? selectedFilmSubcategories : selectedSubcategories
        : [],
      city: d.city,
      state: d.state,
      area: d.area ?? "",
      pincode: d.pincode ?? "",
      address: d.address,
      description: d.notes ?? "",
      gst_number: d.gst ?? "",
      photos,
      amenities: selectedAmenities,
      suitable_for: selectedListingPurposes,
      booking_purposes: selectedPurposes,
      booking_restrictions: selectedRestrictions,
      map_query: `${d.venueName}, ${d.city}`,
    };
    try {
      if (selectedPlan !== "basic") {
        const { draft } = await createVenueDraft({ ...listingPayload, plan_code: selectedPaymentPlan.code });
        setDraftId(draft.id);
        setAccountNotice(null);
        toast.success("Listing draft saved. Complete payment to submit it for approval.");
        return;
      }

      await createVenue(listingPayload);
      toast.success("Venue submitted for approval", {
        description: "Track status and enquiries from your owner dashboard.",
      });
      formEl.reset();
      setPhotos([]);
      setSelectedAmenities([]);
      setSelectedPurposes([]);
      setSelectedListingPurposes([]);
      setSelectedRestrictions([]);
      setSelectedCategory("");
      setSelectedFilmCategory("");
      setSelectedSubcategories([]);
      setSelectedFilmSubcategories([]);
      setAccountNotice(null);
      void navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit venue");
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) =>
    errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  const allBookingsSelected = bookingOptions.length > 0 && selectedPurposes.length === bookingOptions.length;
  const listingPurposeOptions = ["Venue Bookings", "Film Shooting Locations"] as const;
  const allListingPurposesSelected =
    listingPurposeOptions.length > 0 && selectedListingPurposes.length === listingPurposeOptions.length;

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

      <section className="mx-auto max-w-7xl px-4 py-8" aria-labelledby="plans-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="plans-heading" className="font-display text-2xl font-extrabold text-navy">Choose Your Plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Start with a Basic Listing at ₹0. Upgrade anytime for more visibility and promotion.</p>
          </div>
          <p className="rounded-md bg-gold px-4 py-2 text-center font-display text-sm font-extrabold uppercase text-gold-foreground">
            Free to List<br />Pay to Grow
          </p>
        </div>
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {listingPlans.map((plan) => (
            <article key={plan.name} className={`flex min-w-0 flex-col overflow-hidden rounded-lg border p-4 ${plan.theme} ${"id" in plan && selectedPlan === plan.id ? "ring-2 ring-navy ring-offset-2" : ""}`}>
              <div className="flex min-h-7 items-start justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold text-navy">{plan.name}</h3>
                {"badge" in plan && plan.badge && (
                  <span className="rounded bg-amber-400 px-2 py-1 text-[10px] font-extrabold text-navy">{plan.badge}</span>
                )}
              </div>
              <p className="mt-1 font-display text-3xl font-extrabold leading-tight text-navy">
                {plan.price}<span className="text-sm font-semibold text-muted-foreground">{plan.period}</span>
              </p>
              <p className="mt-2 min-h-10 text-sm text-foreground/80">{plan.description}</p>
              <ul className="mt-4 flex-1 space-y-2 text-xs leading-snug text-foreground/85">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`mt-0.5 size-4 shrink-0 ${plan.check}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <img src={plan.image} alt={plan.imageAlt} className="mt-4 aspect-video w-full rounded-md object-cover" />
              {"id" in plan ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    document.getElementById("venue-registration")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  aria-pressed={selectedPlan === plan.id}
                  className={`mt-3 flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-center text-xs font-extrabold transition-colors ${plan.button}`}
                >
                  {selectedPlan === plan.id ? "SELECTED" : plan.action}
                </button>
              ) : (
                <a
                  href={plan.href}
                  target={"external" in plan && plan.external ? "_blank" : undefined}
                  rel={"external" in plan && plan.external ? "noreferrer" : undefined}
                  className={`mt-3 flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-center text-xs font-extrabold transition-colors ${plan.button}`}
                >
                  {plan.action}
                </a>
              )}
              {"note" in plan && plan.note && <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">{plan.note}</p>}
            </article>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-navy">
          <Info className="mt-0.5 size-4 shrink-0 text-sky-700" />
          <span><strong>Basic Listing is free.</strong> Paid plans add visibility and promotional services. Enquiries and bookings depend on customer demand, property suitability and availability.</span>
        </p>
      </section>

      <div id="venue-registration" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-12">
        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="section-title text-lg text-navy">Venue Owner Registration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selected plan: <strong className="text-navy">{selectedPlan === "basic" ? "Basic Listing · Free" : `${selectedPaymentPlan.name.replace("VENUES LOCATION ", "")} · ${selectedPaymentPlan.amount.toLocaleString("en-IN")}/year`}</strong>
          </p>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <fieldset disabled={Boolean(draftId)} className="space-y-3 disabled:opacity-75">
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
            {!ownerId && !authLoading && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create Password*"
                    className={`${field} pr-10`}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  {err("password")}
                </div>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm Password*"
                    className={`${field} pr-10`}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  {err("confirmPassword")}
                </div>
              </div>
            )}
            <div>
              <input name="venueName" placeholder="Venue Name*" className={field} maxLength={120} />
              {err("venueName")}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <select name="city" defaultValue="" className={field}>
                  <option value="">City*</option>
                  {formCities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {err("city")}
              </div>
              <div>
                <select name="state" defaultValue="" className={field}>
                  <option value="">State*</option>
                  {formStates.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {err("state")}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="area"
                placeholder="Area / Locality (optional)"
                className={field}
                maxLength={120}
              />
              <div>
                <input
                  name="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="PIN Code (optional)"
                  className={field}
                  maxLength={6}
                  pattern="[1-9][0-9]{5}"
                  title="Enter a valid 6-digit Indian PIN Code"
                />
                {err("pincode")}
              </div>
            </div>
            <fieldset className="rounded-md border border-border bg-background p-4">
              <legend className="px-1 font-display text-xs font-extrabold uppercase tracking-wide text-navy">
                For what purpose do you want to use this property?
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedFilmCategory("");
                    setSelectedListingPurposes((current) =>
                      current.length === listingPurposeOptions.length ? [] : [...listingPurposeOptions],
                    );
                  }}
                  aria-pressed={allListingPurposesSelected}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    allListingPurposesSelected
                      ? "border-gold bg-gold text-gold-foreground"
                      : "border-border bg-background text-navy hover:bg-secondary"
                  }`}
                >
                  {allListingPurposesSelected ? "Clear All" : "Select All"}
                </button>
                {listingPurposeOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground/85">
                    <input
                      type="checkbox"
                      checked={selectedListingPurposes.includes(option)}
                      onChange={(event) => {
                        setSelectedCategory("");
                        setSelectedFilmCategory("");
                        setSelectedListingPurposes((current) =>
                          event.target.checked ? [...current, option] : current.filter((item) => item !== option),
                        );
                      }}
                      className="size-4 accent-gold"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            {selectedListingPurposes.length > 0 && <div>
              <select
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={field}
              >
                <option value="">{filmOnly ? "Film Location Category*" : "Venue Category*"}</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err("category")}
            </div>}
            {selectedListingPurposes.length > 0 && subcategoryOptions.length > 0 && (
              <fieldset className="rounded-md border border-border bg-background p-4">
                <legend className="px-1 font-display text-xs font-extrabold uppercase tracking-wide text-navy">
                  {filmOnly ? "Film Location Subcategories (optional)" : "Venue Subcategories (optional)"}
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {subcategoryOptions.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-foreground/85">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(s.name)}
                        onChange={(event) =>
                          setSelectedSubcategories((current) =>
                            event.target.checked ? [...current, s.name] : current.filter((item) => item !== s.name),
                          )
                        }
                        className="size-4 accent-gold"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {venueAndFilm && (
              <>
                <select
                  name="filmCategory"
                  value={selectedFilmCategory}
                  onChange={(event) => setSelectedFilmCategory(event.target.value)}
                  className={field}
                  required
                >
                  <option value="">Film Location Category*</option>
                  {filmCategories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                {selectedFilmCategory && filmSubcategoryOptions.length > 0 && (
                  <fieldset className="rounded-md border border-border bg-background p-4">
                    <legend className="px-1 font-display text-xs font-extrabold uppercase tracking-wide text-navy">
                      Film Location Subcategories (optional)
                    </legend>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {filmSubcategoryOptions.map((subcategory) => (
                        <label key={subcategory.id} className="flex items-center gap-2 text-sm text-foreground/85">
                          <input
                            type="checkbox"
                            checked={selectedFilmSubcategories.includes(subcategory.name)}
                            onChange={(event) =>
                              setSelectedFilmSubcategories((current) =>
                                event.target.checked
                                  ? [...current, subcategory.name]
                                  : current.filter((item) => item !== subcategory.name),
                              )
                            }
                            className="size-4 accent-gold"
                          />
                          {subcategory.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </>
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
            {ownerId ? (
              <div className="grid">
                <PhotoUploader
                  userId={ownerId}
                  value={photos}
                  onChange={setPhotos}
                  onBusyChange={setUploading}
                  maxPhotos={selectedPlan === "basic" ? 10 : 20}
                />
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                Create a new account with the password above, or <Link to="/auth" target="_blank" rel="noreferrer" className="font-bold text-gold">sign in</Link> if you already have one.
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
                onClick={() => setSelectedPurposes((current) => current.length === bookingOptions.length ? [] : bookingOptions)}
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
                {bookingOptions.map((purpose) => (
                  <label key={purpose} className="flex items-start gap-2 text-sm text-foreground/85">
                    <input
                      type="checkbox"
                      checked={selectedPurposes.includes(purpose)}
                      onChange={(event) => setSelectedPurposes((current) => event.target.checked ? [...current, purpose] : current.filter((item) => item !== purpose))}
                      className="mt-0.5 size-4 shrink-0 accent-gold"
                    />
                    <span>{bookingPurposes.find(([, label]) => label === purpose)?.[0] ?? "✨"} {purpose}</span>
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
            </fieldset>
            <button
              type="submit"
              disabled={busy || authLoading || uploading || Boolean(draftId) || (!ownerId && accountNotice !== null)}
              className="w-full rounded-md bg-gold px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-gold-foreground hover:opacity-90 disabled:opacity-60"
            >
              {uploading ? "Uploading photos…" : busy ? "Please wait…" : draftId ? "Listing draft saved" : !ownerId && accountNotice === "created" ? "Signing you in…" : !ownerId ? "Create Account & Continue" : selectedPlan !== "basic" ? "Save Draft & Continue to Payment" : "Submit for Approval"}
            </button>
            {draftId && (
              <section className="rounded-lg border border-blue-200 bg-blue-50 p-4" aria-labelledby="verified-payment-heading">
                <h3 id="verified-payment-heading" className="font-display text-base font-extrabold text-navy">
                  Pay {selectedPaymentPlan.amount.toLocaleString("en-IN")} to continue
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scan the QR with your UPI app. After payment, enter the UTR/reference number. We’ll verify it before sending your listing for approval.
                </p>
                <div className="mt-4 grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center">
                  <div className="mx-auto rounded-md bg-white p-3">
                    <QRCodeSVG
                      value={upiLink(selectedPaymentPlan.amount, selectedPaymentPlan.name)}
                      size={196}
                      level="M"
                      includeMargin
                      aria-label="UPI payment QR code"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-navy">UPI ID: <strong>{PAYMENT_DETAILS.upiId}</strong></p>
                    <dl className="grid gap-x-4 gap-y-2 rounded-md border border-blue-200 bg-white p-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">Account name</dt>
                        <dd className="font-bold text-navy">{PAYMENT_DETAILS.accountName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Bank</dt>
                        <dd className="font-bold text-navy">{PAYMENT_DETAILS.bankName}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">Branch</dt>
                        <dd className="font-bold text-navy">{PAYMENT_DETAILS.branch}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Account number</dt>
                        <dd className="font-bold text-navy">{PAYMENT_DETAILS.accountNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">IFSC</dt>
                        <dd className="font-bold text-navy">{PAYMENT_DETAILS.ifsc}</dd>
                      </div>
                    </dl>
                    <a
                      href={upiLink(selectedPaymentPlan.amount, selectedPaymentPlan.name)}
                      className="inline-flex rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-navy"
                    >
                      Open UPI app · ₹{selectedPaymentPlan.amount.toLocaleString("en-IN")}
                    </a>
                    {paymentSubmitted ? (
                      <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
                        Payment reference received. Your listing will be submitted for admin approval after we verify the payment. You can track it from your dashboard.
                      </p>
                    ) : (
                      <div className="grid gap-2">
                        <input
                          value={payerName}
                          onChange={(event) => setPayerName(event.target.value)}
                          placeholder="Name on payment (optional)"
                          className={field}
                        />
                        <input
                          value={paymentReference}
                          onChange={(event) => setPaymentReference(event.target.value)}
                          placeholder="UPI UTR / transaction reference*"
                          className={field}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => void submitVerifiedPayment()}
                          disabled={submittingPayment || !paymentReference.trim()}
                          className="rounded-md bg-navy px-4 py-2.5 text-sm font-bold text-navy-foreground disabled:opacity-50"
                        >
                          {submittingPayment ? "Submitting reference…" : "Submit Payment Reference"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            {accountNotice && (
              <div role="status" aria-live="polite" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-950">
                {accountNotice === "created" && (
                  <p><strong>Account created.</strong> Upload photos above, then click “{selectedPlan !== "basic" ? "Save Draft & Continue to Payment" : "Submit for Approval"}”. Your listing has not been submitted yet.</p>
                )}
                {accountNotice === "confirmation" && (
                  <p><strong>Account created.</strong> Confirm your email, then <Link to="/auth" target="_blank" rel="noreferrer" className="font-bold underline">sign in in a new tab</Link> and return here to submit your listing. This form will stay open.</p>
                )}
                {accountNotice === "existing" && (
                  <p><strong>This email already has an account.</strong> <Link to="/auth" target="_blank" rel="noreferrer" className="font-bold underline">Sign in in a new tab</Link>, then return here to submit your listing. This form will stay open.</p>
                )}
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              {selectedPlan !== "basic" ? "Payment is manually verified. Listings are then submitted for admin approval and do not go live until approved." : "Basic listings are free and go live after admin approval."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
