import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, Film, Music, Tv } from "lucide-react";
import type { Venue } from "@/data/venues";
import { VenueCard } from "@/components/site/VenueCard";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import filmImage from "@/assets/cat-film.jpg";
import { listCategories, listVenues, type CategoryRecord } from "@/lib/api";
import { rowToVenue, type VenueRow } from "@/lib/venue-mapping";

export const Route = createFileRoute("/film-locations")({
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
  const [shootVenues, setShootVenues] = useState<Venue[]>([]);
  const [filmCategories, setFilmCategories] = useState<CategoryRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

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
  }, []);

  const subcategories = filmCategories.find((category) => category.slug === selectedCategory)?.subcategories ?? [];
  const visibleVenues = shootVenues.filter((venue) =>
    (!selectedCategory || venue.category === selectedCategory) &&
    (!selectedSubcategory || venue.subcategory === selectedSubcategory),
  );

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
          <div className="mt-5 flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(event) => { setSelectedCategory(event.target.value); setSelectedSubcategory(""); }}
              aria-label="Film location category"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All film categories</option>
              {filmCategories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </select>
            <select
              value={selectedSubcategory}
              onChange={(event) => setSelectedSubcategory(event.target.value)}
              aria-label="Film location subcategory"
              disabled={!selectedCategory}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">All subcategories</option>
              {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>)}
            </select>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVenues.map((v) => (
              <VenueCard key={v.slug} venue={v} />
            ))}
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
