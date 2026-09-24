import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import heroImage from "@/assets/hero-venue.jpg";

export const Route = createFileRoute("/advisors")({
  head: () => ({
    meta: [
      { title: "Advisors | VENUES LOCATION" },
      {
        name: "description",
        content: "The advisory network guiding VENUES LOCATION's growth across venues, film locations and event industry partnerships.",
      },
      { property: "og:title", content: "Advisors | VENUES LOCATION" },
      { property: "og:description", content: "The advisory network guiding VENUES LOCATION's growth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Advisors,
});

function Advisors() {
  return (
    <div className="bg-sand">
      <section className="relative bg-navy text-navy-foreground">
        <img
          src={heroImage}
          alt="Advisory meeting at a venue"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <p className="section-title text-sm text-gold">About Us</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Advisors</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/85">
            Industry veterans in film production, hospitality and events who guide VENUES LOCATION's direction.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="rounded-xl border border-border bg-card p-8">
          <Compass className="size-8 text-gold" />
          <h2 className="mt-3 section-title text-2xl text-navy">Advisory board</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
            VENUES LOCATION draws on advisors from film production, hospitality and event management to shape
            verification standards and platform features. Advisor profiles will be published here as the board is
            finalised.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-md bg-navy px-6 py-3 text-sm font-bold text-navy-foreground hover:opacity-90"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
