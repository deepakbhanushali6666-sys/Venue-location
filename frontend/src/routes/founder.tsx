import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Film, MapPin, Music, Star, Tv } from "lucide-react";
import { FounderPortrait } from "@/components/site/FounderPortrait";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "Deepak Bhanushali — Founder, VENUES LOCATION" },
      {
        name: "description",
        content:
          "Deepak Bhanushali, founder of VENUES LOCATION: 25+ years as a film location expert, with 7000+ shoots, 150+ feature films and thousands of TV episodes facilitated across India.",
      },
      { property: "og:title", content: "Deepak Bhanushali — Founder, VENUES LOCATION" },
      {
        property: "og:description",
        content: "25+ years of film location expertise and the vision behind VENUES LOCATION.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Founder,
});

const milestones = [
  { icon: MapPin, value: "7000+", label: "Location shoots facilitated" },
  { icon: Film, value: "150+", label: "Feature films" },
  { icon: Music, value: "400+", label: "Music videos" },
  { icon: Tv, value: "Thousands", label: "TV episodes & ad films" },
  { icon: Star, value: "25+", label: "Years in the industry" },
];

function Founder() {
  return (
    <div className="bg-sand">
      <section className="bg-navy py-14 text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="section-title text-sm text-gold">About the Founder</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Deepak Bhanushali</h1>
            <p className="mt-4 max-w-2xl text-navy-foreground/85">
              Film location expert. Twenty-five years spent finding the right frame — from palace courtyards in
              Rajasthan to soundstages in Mumbai — and making sure the unit could actually shoot there.
            </p>
          </div>
          <FounderPortrait
            priority
            alt="Portrait of Deepak Bhanushali, film location expert and founder of VENUES LOCATION, with 25+ years of experience"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-4/3 w-full rounded-xl object-cover object-[center_30%]"
          />

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {milestones.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-5 text-center">
              <m.icon className="mx-auto size-7 text-gold" />
              <p className="mt-2 font-display text-xl font-extrabold text-navy">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="section-title text-2xl text-navy">The journey</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/85">
            <p>
              Deepak Bhanushali started out scouting locations for feature films at a time when the job meant a camera,
              a notebook and a lot of driving. Over two decades he built relationships with venue owners, local
              authorities and production teams across India — the kind of network that turns an impossible schedule into
              a shoot that happens on time.
            </p>
            <p>
              Directors came to him because he understood the frame. Line producers came back because he understood
              logistics: unit parking, generator space, permissions, night-shoot clearances and the realities of moving
              a 200-person crew.
            </p>
          </div>

          <h2 className="section-title mt-10 text-2xl text-navy">The vision behind VENUES LOCATION</h2>
          <ul className="mt-4 space-y-3">
            {[
              "Make every good venue in India discoverable, verified and comparable in one place.",
              "Give venue owners genuine, qualified enquiries instead of random calls.",
              "Bring film-industry rigour — recces, logistics, permissions — to weddings and corporate events too.",
              "Ensure no enquiry is ever lost: every lead is tracked from first contact to booking.",
            ].map((i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" /> {i}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/venues"
              search={{}}
              className="rounded-md bg-navy px-6 py-3 text-sm font-bold text-navy-foreground hover:opacity-90"
            >
              Explore venues
            </Link>
            <Link
              to="/contact"
              className="rounded-md border border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-secondary"
            >
              Talk to the team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
