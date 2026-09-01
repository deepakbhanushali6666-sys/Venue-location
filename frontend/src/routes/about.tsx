import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-venue.jpg";
import { categories } from "@/data/venues";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VENUES LOCATION | Venues, Locations, Memories" },
      {
        name: "description",
        content:
          "VENUES LOCATION connects clients with 10,000+ verified venues and film shooting locations across India, backed by 25+ years of film and event industry experience.",
      },
      { property: "og:title", content: "About VENUES LOCATION | Venues, Locations, Memories" },
      {
        property: "og:description",
        content: "25+ years of location expertise, verified listings and genuine leads for venue owners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="relative bg-navy text-navy-foreground">
        <img
          src={heroImage}
          alt="Resort venue at dusk"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            About <span className="text-gold">VENUES LOCATION</span>
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/85">
            Venues • Locations • Memories. India's premium platform connecting people with the right place — whether
            it's a wedding for 1,500 guests or a night shoot in a 200-year-old haveli.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="section-title text-2xl text-navy">Who we are</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/85">
          <p>
            VENUES LOCATION grew out of 25+ years of on-ground work in India's film and event industry. What began as
            location scouting for feature films, television and ad campaigns became a full platform for anyone looking
            for a venue — families planning weddings, companies planning offsites, and production houses planning
            schedules.
          </p>
          <p>
            We work both sides of the table. Clients get a curated, verified shortlist instead of endless phone calls.
            Venue owners get genuine, qualified enquiries with clear budgets and dates — not tyre-kickers.
          </p>
        </div>

        <h2 className="section-title mt-12 text-2xl text-navy">What we do</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Location scouting for films, ads, TV and music videos",
            "Venue discovery for weddings, corporate events and celebrations",
            "Verified listings with real photos, capacity and pricing",
            "Site visits, negotiation support and booking coordination",
            "Lead management so no enquiry is ever lost",
            "Owner subscriptions with a dashboard and enquiry tracking",
          ].map((i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" /> {i}
            </li>
          ))}
        </ul>

        <h2 className="section-title mt-12 text-2xl text-navy">Categories we cover</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/venues"
              search={{ category: c.slug }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy hover:border-gold"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-navy p-8 text-navy-foreground">
          <h2 className="section-title text-xl text-gold">Founded by Deepak Bhanushali</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-foreground/85">
            A name trusted in the film and event industry for over two decades, with 7000+ location shoots, 150+ feature
            films and thousands of TV episodes facilitated.
          </p>
          <Link
            to="/founder"
            className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 text-sm font-bold text-gold-foreground"
          >
            Read his story
          </Link>
        </div>
      </section>
    </div>
  );
}
