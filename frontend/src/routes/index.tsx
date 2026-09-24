import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Clapperboard,
  Film,
  Headphones,
  MapPin,
  Music,
  Quote,
  ShieldCheck,
  Star,
  Tv,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero-venue.jpg";
import { ClientsCarousel } from "@/components/site/ClientsCarousel";
import { FounderPortrait } from "@/components/site/FounderPortrait";
import { SearchPanel } from "@/components/site/SearchPanel";
import { VenueCard } from "@/components/site/VenueCard";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { CONTACT, categories, testimonials, venues } from "@/data/venues";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VENUES LOCATION | Venues & Film Shooting Locations in India" },
      {
        name: "description",
        content:
          "India's premium platform for venues and film shooting locations. Book resorts, banquet halls, farmhouses, villas, lawns and studios. 25+ years of industry experience.",
      },
      { property: "og:title", content: "VENUES LOCATION | Venues & Film Shooting Locations in India" },
      {
        property: "og:description",
        content:
          "Find. Book. Shoot. Celebrate. 10,000+ verified venues and film locations across India, trusted by leading production houses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const stats = [
  { icon: Building2, value: "10,000+", label: "Venues & Locations" },
  { icon: Clapperboard, value: "25+ Years", label: "Industry Experience" },
  { icon: Users, value: "Trusted by", label: "Top Production Houses" },
  { icon: ShieldCheck, value: "Verified", label: "Venues & Owners" },
  { icon: Headphones, value: "Dedicated", label: "Support" },
];

const achievements = [
  { icon: Film, value: "150+", label: "Feature Films" },
  { icon: Tv, value: "Thousands", label: "of TV Episodes" },
  { icon: Music, value: "400+", label: "Music Videos" },
  { icon: MapPin, value: "7000+", label: "Location Shoots" },
  { icon: Star, value: "25+", label: "Years of Legacy" },
];

const why = [
  "Vast collection of venues for every occasion",
  "Ideal for weddings, events, corporate meets, film shoots & music videos",
  "Easy search, compare & direct enquiry",
  "Genuine leads & verified listings",
  "Save time, effort & money",
];

function Home() {
  const featured = venues.filter((v) => v.featured);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative">
        <img
          src={heroImage}
          alt="Luxury resort venue at dusk with infinity pool"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/10 md:to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-navy sm:text-5xl">
              India's Premium Platform for
              <span className="mt-1 block text-gold">Venues & Film Shooting Locations</span>
            </h1>
            <p className="mt-5 font-display text-lg font-bold text-navy">Find. Book. Shoot. Celebrate.</p>
            <p className="mt-1 text-foreground/80">Your perfect location is just a search away.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/venues"
                search={{}}
                className="rounded-md bg-navy px-6 py-3 text-sm font-bold text-navy-foreground hover:opacity-90"
              >
                Book a Venue
              </Link>
              <Link
                to="/film-locations"
                className="rounded-md bg-gold px-6 py-3 text-sm font-bold text-gold-foreground hover:opacity-90"
              >
                Film Shooting Locations
              </Link>
              <Link
                to="/list-your-venue"
                className="rounded-md border border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-secondary"
              >
                List Your Venue
              </Link>
            </div>
          </div>
          <SearchPanel />
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-6 max-w-7xl px-4">
        <div className="grid divide-y divide-border rounded-xl border border-border bg-card shadow-panel sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-5 py-5">
              <s.icon className="size-8 shrink-0 text-gold" />
              <div>
                <p className="font-display text-base font-extrabold text-navy">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Clients */}
      <section className="bg-sand py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title="Our Clients" />
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-foreground/70">
            Trusted by leading brands, production houses and studios across India.
          </p>
          <div className="mt-8">
            <ClientsCarousel />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading title="Explore Venues" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/venues"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-xl"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={800}
                height={600}
                className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-navy/85 px-3 py-2.5">
                <Building2 className="size-4 shrink-0 text-gold" />
                <span className="text-xs font-bold uppercase tracking-wide text-navy-foreground">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why + Achievements */}
      <section className="bg-sand py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_1.6fr]">
          <div className="rounded-xl border border-border bg-card p-7">
            <h2 className="section-title text-xl text-navy">Why choose VENUES LOCATION?</h2>
            <ul className="mt-5 space-y-3">
              {why.map((w) => (
                <li key={w} className="flex gap-2.5 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-7">
            <h2 className="section-title text-center text-xl text-navy">Our Achievements</h2>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-5">
              {achievements.map((a) => (
                <div key={a.label} className="text-center">
                  <a.icon className="mx-auto size-8 text-navy" />
                  <p className="mt-2 font-display text-lg font-extrabold text-navy">{a.value}</p>
                  <p className="text-xs text-muted-foreground">{a.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 rounded-md bg-navy px-4 py-3 text-sm font-semibold text-navy-foreground">
              <Star className="size-4 shrink-0 fill-gold text-gold" />
              From finding locations to creating experiences — we've been part of India's biggest stories.
            </p>
          </div>
        </div>
      </section>

      {/* Founder band */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid overflow-hidden rounded-xl bg-navy text-navy-foreground lg:grid-cols-3">
          <div className="p-8">
            <h2 className="section-title text-xl text-gold">Built on experience. Driven by trust.</h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-foreground/80">
              Founded by <strong className="text-navy-foreground">Deepak Bhanushali</strong>, a name trusted in the film
              and event industry for over two decades.
            </p>
            <Link
              to="/founder"
              className="mt-6 inline-block rounded-md bg-gold px-5 py-2.5 text-sm font-bold text-gold-foreground"
            >
              About the Founder
            </Link>
          </div>
          <FounderPortrait
            alt="Deepak Bhanushali, founder of VENUES LOCATION, standing beside a helicopter on a film location shoot"
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="h-full min-h-56 w-full object-cover object-top"
          />

          <div className="p-8">
            <h3 className="section-title text-base text-gold">25+ Years of Journey</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/85">
              {[
                "7000+ location shoots facilitated",
                "150+ feature films",
                "400+ music videos",
                "Thousands of TV episodes & ad films",
                "Trusted by leading production houses, directors & creatives across India",
              ].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured venues */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionHeading title="Featured Venues" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((v) => (
            <VenueCard key={v.slug} venue={v} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/venues"
            search={{}}
            className="inline-block rounded-md border border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-secondary"
          >
            View all venues
          </Link>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gold py-10">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 md:grid-cols-3">
          <div className="flex gap-3">
            <Building2 className="size-9 shrink-0 text-gold-foreground" />
            <div>
              <h3 className="section-title text-base text-gold-foreground">Are you a venue owner?</h3>
              <p className="mt-1 text-sm text-gold-foreground/80">
                List your venue with VENUES LOCATION and get genuine enquiries from verified users.
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/list-your-venue"
              className="inline-block rounded-md bg-navy px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground"
            >
              List Your Venue
            </Link>
            <p className="mt-2 text-xs font-semibold text-gold-foreground/80">
              It's simple. It's effective. It's VENUES LOCATION.
            </p>
          </div>
          <div className="flex gap-3">
            <Users className="size-9 shrink-0 text-gold-foreground" />
            <div>
              <h3 className="section-title text-base text-gold-foreground">Looking for the perfect venue?</h3>
              <p className="mt-1 text-sm text-gold-foreground/80">
                Tell us your requirement and we'll help you find the best match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading title="Client Testimonials" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/YsaueiElNXA"
                title="Client testimonial video"
                className="size-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <Quote className="size-7 text-gold" />
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">"{t.quote}"</blockquote>
                <figcaption className="mt-4 border-t border-border pt-3">
                  <p className="font-display text-sm font-bold text-navy">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-sand py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <SectionHeading title="Tell us your requirement" align="left" />
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/80">
              Share your dates, budget and purpose — our team shortlists verified options and arranges site visits.
              Every enquiry gets a Lead ID and a dedicated coordinator.
            </p>
            <div className="mt-6 space-y-2 text-sm font-semibold text-navy">
              <p>Call: {CONTACT.phone}</p>
              <p>Email: {CONTACT.email}</p>
              <p>{CONTACT.site}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}

export function SectionHeading({ title, align = "center" }: { title: string; align?: "center" | "left" }) {
  return (
    <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}>
      <span className="h-0.5 w-12 bg-gold" />
      <h2 className="section-title text-2xl text-navy">{title}</h2>
      <span className="h-0.5 w-12 bg-gold" />
    </div>
  );
}
