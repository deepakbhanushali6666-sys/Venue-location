import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import {
  budgetBands,
  capacityBands,
  categories,
  cities,
  eventTypes,
  states,
  type Venue,
} from "@/data/venues";
import { VenueCard } from "@/components/site/VenueCard";
import { listVenues } from "@/lib/api";
import { rowToVenue, type VenueRow } from "@/lib/venue-mapping";

type VenueSearch = {
  category?: string;
  city?: string;
  state?: string;
  event?: string;
  budget?: string;
  capacity?: string;
};

export const Route = createFileRoute("/venues/")({
  validateSearch: (search: Record<string, unknown>): VenueSearch => {
    const out: VenueSearch = {};
    const keys = ["category", "city", "state", "event", "budget", "capacity"] as const;
    for (const key of keys) {
      const value = search[key];
      if (typeof value === "string" && value) out[key] = value;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Browse Venues & Locations Across India | VENUES LOCATION" },
      {
        name: "description",
        content:
          "Search 10,000+ hotels, resorts, farmhouses, banquet halls, lawns, studios and film shooting locations by city, budget, capacity and event type.",
      },
      { property: "og:title", content: "Browse Venues & Locations Across India | VENUES LOCATION" },
      {
        property: "og:description",
        content: "Filter verified venues and film locations by city, state, budget, capacity and event type.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VenuesPage,
});

function VenuesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [liveVenues, setLiveVenues] = useState<Venue[]>([]);

  useEffect(() => {
    let cancelled = false;
    listVenues().then(({ venues }) => {
      if (!cancelled) setLiveVenues((venues as unknown as VenueRow[]).map(rowToVenue));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key: keyof VenueSearch, value: string) => {
    const next: VenueSearch = { ...search };
    if (value) next[key] = value;
    else delete next[key];
    navigate({ to: "/venues", search: next });
  };

  const results = liveVenues.filter((v) => {
    if (search["category"] && v.category !== search["category"]) return false;
    if (search["city"] && v.city !== search["city"]) return false;
    if (search["state"] && v.state !== search["state"]) return false;
    if (search["event"] && !v.suitableFor.includes(search["event"])) return false;
    if (search["budget"]) {
      const band = budgetBands.find((b) => b.label === search["budget"]);
      if (band && (v.startingPrice < band.min || v.startingPrice > band.max)) return false;
    }
    if (search["capacity"]) {
      const band = capacityBands.find((b) => b.label === search["capacity"]);
      if (band && (v.capacity < band.min || v.capacity > band.max)) return false;
    }
    return true;
  });

  const select = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <div className="bg-sand">
      <div className="bg-navy py-12 text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="font-display text-4xl font-extrabold">Find Your Venue</h1>
          <p className="mt-2 max-w-2xl text-navy-foreground/75">
            Filter verified venues and film shooting locations by city, state, category, budget, capacity and event
            type.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="section-title flex items-center gap-2 text-base text-navy">
            <SlidersHorizontal className="size-4 text-gold" /> Filters
          </h2>
          <div className="mt-4 space-y-4">
            <Filter label="Venue Type">
              <select className={select} value={search["category"] ?? ""} onChange={(e) => update("category", e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter label="City">
              <select className={select} value={search["city"] ?? ""} onChange={(e) => update("city", e.target.value)}>
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Filter>
            <Filter label="State">
              <select className={select} value={search["state"] ?? ""} onChange={(e) => update("state", e.target.value)}>
                <option value="">All states</option>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Filter>
            <Filter label="Event Type">
              <select className={select} value={search["event"] ?? ""} onChange={(e) => update("event", e.target.value)}>
                <option value="">Any event</option>
                {eventTypes.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </Filter>
            <Filter label="Budget">
              <select className={select} value={search["budget"] ?? ""} onChange={(e) => update("budget", e.target.value)}>
                <option value="">Any budget</option>
                {budgetBands.map((b) => (
                  <option key={b.label}>{b.label}</option>
                ))}
              </select>
            </Filter>
            <Filter label="Guest Capacity">
              <select
                className={select}
                value={search["capacity"] ?? ""}
                onChange={(e) => update("capacity", e.target.value)}
              >
                <option value="">Any capacity</option>
                {capacityBands.map((b) => (
                  <option key={b.label}>{b.label}</option>
                ))}
              </select>
            </Filter>
            <button
              type="button"
              onClick={() => navigate({ to: "/venues", search: {} })}
              className="w-full rounded-md border border-border px-4 py-2.5 text-sm font-bold text-navy hover:bg-secondary"
            >
              Clear all filters
            </button>
          </div>
        </aside>

        <section>
          <p className="mb-4 text-sm text-muted-foreground">
            Showing <span className="font-bold text-navy">{results.length}</span> venue
            {results.length === 1 ? "" : "s"}
          </p>
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-display text-lg font-bold text-navy">No venues match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your budget or capacity — or call us on 9768676666 and we'll shortlist for you.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v) => (
                <VenueCard key={v.slug} venue={v} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
