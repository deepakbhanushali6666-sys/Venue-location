import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clapperboard, Film, Music, Tv } from "lucide-react";
import { budgetBands, capacityBands, categories as defaultVenueCategories, cities as defaultCities, eventTypes, states as defaultStates, type Venue } from "@/data/venues";
import { VenueCard } from "@/components/site/VenueCard";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import filmImage from "@/assets/cat-film.jpg";
import { listCategories, listLocations, listPurposes, listVenues, type CategoryRecord } from "@/lib/api";
import { rowToVenue, type VenueRow } from "@/lib/venue-mapping";

type FilmSearch = {
  category?: string;
  subcategory?: string;
  city?: string;
  state?: string;
  event?: string;
  budget?: string;
  capacity?: string;
};

export const Route = createFileRoute("/film-locations")({
  validateSearch: (search: Record<string, unknown>): FilmSearch => {
    const out: FilmSearch = {};
    const keys = ["category", "subcategory", "city", "state", "event", "budget", "capacity"] as const;
    for (const key of keys) {
      const value = search[key];
      if (typeof value === "string" && value) out[key] = value;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Film Shooting Locations in India | VENUES LOCATION" },
      {
        name: "description",
        content:
          "Scout havelis, studios, villas, bungalows and period locations for feature films, ad films, music videos and TV shoots. 7000+ shoots facilitated in 25+ years.",
      },
      { property: "og:title", content: "Film Shooting Locations in India | VENUES LOCATION" },
      {
        property: "og:description",
        content: "Production-ready shooting locations with permissions, unit parking and on-ground support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FilmLocations,
});

const services = [
  { icon: Film, title: "Feature Films", text: "Period havelis, streets, mansions and industrial locations with permissions handled." },
  { icon: Tv, title: "TV & OTT", text: "Long-schedule friendly locations and studio floors for serials and web series." },
  { icon: Music, title: "Music Videos", text: "Striking villas, beaches, lawns and rooftops that shoot beautifully on camera." },
  { icon: Clapperboard, title: "Ad Films", text: "Fast turnaround recces, budget-fit options and unit-ready logistics." },
];

function FilmLocations() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [shootVenues, setShootVenues] = useState<Venue[]>([]);
  const [filmCategories, setFilmCategories] = useState<CategoryRecord[]>([]);
  const [venueCategories, setVenueCategories] = useState<CategoryRecord[]>(defaultVenueCategories.map((category, sort_order) => ({ ...category, id: category.slug, sort_order, subcategories: [] })));
  const [locationCities, setLocationCities] = useState(defaultCities);
  const [locationStates, setLocationStates] = useState(defaultStates);
  const [purposes, setPurposes] = useState(eventTypes);

  useEffect(() => {
    let cancelled = false;
    listVenues()
      .then(({ venues }) => {
        if (cancelled) return;
        const next = (venues as unknown as VenueRow[])
          .map(rowToVenue)
          .filter((v) => {
            const purposeValues = v.suitableFor ?? [];
            return (
              purposeValues.includes("Film Shooting Locations") ||
              purposeValues.includes("Film Shoot") ||
              (!purposeValues.length && v.category === "film-shooting-locations")
            );
          });
        setShootVenues(next);
      })
      .catch(() => {
        if (!cancelled) setShootVenues([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    listCategories("film")
      .then(({ categories }) => setFilmCategories(categories))
      .catch(() => undefined);
    listCategories().then(({ categories }) => setVenueCategories(categories)).catch(() => undefined);
    listLocations().then(({ locations }) => {
      setLocationCities(locations.filter((location) => location.kind === "city").map((location) => location.name));
      setLocationStates(locations.filter((location) => location.kind === "state").map((location) => location.name));
    }).catch(() => undefined);
    listPurposes().then(({ purposes: rows }) => setPurposes(rows.map((purpose) => purpose.name))).catch(() => undefined);
  }, []);

  const venueCategorySlugs = new Set(venueCategories.map((category) => category.slug));
  const filmOnlyCategories = filmCategories.filter((category) => !venueCategorySlugs.has(category.slug));
  const selectedCategory = filmOnlyCategories.find((category) => category.slug === search.category);
  const update = (key: keyof FilmSearch, value: string) => {
    const next: FilmSearch = { ...search };
    if (key === "category") delete next.subcategory;
    if (value) next[key] = value;
    else delete next[key];
    void navigate({ to: "/film-locations", search: next });
  };
  const visibleVenues = shootVenues.filter((venue) => {
    if (search.category && (venue.filmCategory || venue.category) !== search.category) return false;
    if (search.subcategory && (venue.filmSubcategory || venue.subcategory) !== search.subcategory) return false;
    if (search.city && venue.city !== search.city) return false;
    if (search.state && venue.state !== search.state) return false;
    if (search.event && !(venue.bookingPurposes ?? venue.suitableFor).includes(search.event)) return false;
    if (search.budget) {
      const band = budgetBands.find((item) => item.label === search.budget);
      if (band && (venue.startingPrice < band.min || venue.startingPrice > band.max)) return false;
    }
    if (search.capacity) {
      const band = capacityBands.find((item) => item.label === search.capacity);
      if (band && (venue.capacity < band.min || venue.capacity > band.max)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    if (!a.featured) return 0;
    const aOrder = a.featuredOrder || Number.MAX_SAFE_INTEGER;
    const bOrder = b.featuredOrder || Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  return (
    <div>
      <section className="relative bg-navy text-navy-foreground">
        <img
          src={filmImage}
          alt="Heritage courtyard film location"
          width={800}
          height={600}
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <h1 className="max-w-3xl font-display text-4xl font-extrabold sm:text-5xl">
            Film Shooting Locations <span className="text-gold">across India</span>
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            25+ years of location scouting for feature films, television, ad films and music videos. We know which
            location works for your schedule, budget and lighting — and we get you in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <s.icon className="size-8 text-gold" />
              <h2 className="mt-3 font-display text-lg font-bold text-navy">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title text-2xl text-navy">Shoot-ready locations</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <select
              value={search.city ?? ""}
              onChange={(event) => update("city", event.target.value)}
              aria-label="City"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">All cities</option>
              {locationCities.map((city) => <option key={city}>{city}</option>)}
            </select>
            <select
              value={search.state ?? ""}
              onChange={(event) => update("state", event.target.value)}
              aria-label="State"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">All states</option>
              {locationStates.map((state) => <option key={state}>{state}</option>)}
            </select>
            <select
              value={search.category ?? ""}
              onChange={(event) => update("category", event.target.value)}
              aria-label="Film location type"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">All film location types</option>
              {filmOnlyCategories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </select>
            <select
              value={search.subcategory ?? ""}
              onChange={(event) => update("subcategory", event.target.value)}
              aria-label="Film location subcategory"
              disabled={!selectedCategory}
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm disabled:opacity-60"
            >
              <option value="">All subcategories</option>
              {selectedCategory?.subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>)}
            </select>
            <select
              value={search.event ?? ""}
              onChange={(event) => update("event", event.target.value)}
              aria-label="Purpose"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Any purpose</option>
              {purposes.map((purpose) => <option key={purpose}>{purpose}</option>)}
            </select>
            <select
              value={search.capacity ?? ""}
              onChange={(event) => update("capacity", event.target.value)}
              aria-label="Guest capacity"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Any capacity</option>
              {capacityBands.map((band) => <option key={band.label}>{band.label}</option>)}
            </select>
            <select
              value={search.budget ?? ""}
              onChange={(event) => update("budget", event.target.value)}
              aria-label="Budget"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Any budget</option>
              {budgetBands.map((band) => <option key={band.label}>{band.label}</option>)}
            </select>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Showing {visibleVenues.length} film location{visibleVenues.length === 1 ? "" : "s"}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVenues.length > 0 ? (
              visibleVenues.map((v) => <VenueCard key={v.slug} venue={v} />)
            ) : (
              <p className="text-sm text-muted-foreground">No film locations match these filters yet.</p>
            )}
          </div>
          <div className="mt-8">
            <Link
              to="/venues"
              search={{ category: "film-shooting-locations" }}
              className="inline-block rounded-md border border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-secondary"
            >
              Browse all film locations
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="section-title text-2xl text-navy">Send us your shoot brief</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share the look you need, shoot dates and budget — we'll revert with a recce list.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <EnquiryForm />
        </div>
      </section>
    </div>
  );
}
