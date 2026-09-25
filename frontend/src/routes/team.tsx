import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import heroImage from "@/assets/hero-venue.jpg";
import { listPeopleProfiles, type PeopleProfile } from "@/lib/api";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team | VENUES LOCATION" },
      {
        name: "description",
        content:
          "Meet the team behind VENUES LOCATION — the people verifying listings, moderating enquiries and supporting venue owners across India.",
      },
      { property: "og:title", content: "Our Team | VENUES LOCATION" },
      {
        property: "og:description",
        content: "The people behind VENUES LOCATION's verified venue and film location network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Team,
});

function Team() {
  const [profiles, setProfiles] = useState<PeopleProfile[]>([]);

  useEffect(() => {
    listPeopleProfiles().then(({ profiles: rows }) => setProfiles(rows.filter((profile) => profile.section === "team"))).catch(() => undefined);
  }, []);

  return (
    <div className="bg-sand">
      <section className="relative bg-navy text-navy-foreground">
        <img
          src={heroImage}
          alt="Team at a venue"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <p className="section-title text-sm text-gold">About Us</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Our Team</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/85">
            The people who verify every listing, follow up on every enquiry and keep VENUES LOCATION
            running day to day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        {profiles.length > 0 && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2">
            {profiles.map((profile) => (
              <article key={profile.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                {profile.photo_url && <img src={profile.photo_url} alt={profile.name} className="aspect-4/3 w-full object-cover object-top" />}
                <div className="p-6">
                  <h2 className="font-display text-xl font-extrabold text-navy">{profile.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-gold">{profile.title}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/85">{profile.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="rounded-xl border border-border bg-card p-8">
          <Users2 className="size-8 text-gold" />
          <h2 className="mt-3 section-title text-2xl text-navy">
            Built on 25+ years of on-ground experience
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
            VENUES LOCATION is led by founder Deepak Bhanushali, backed by a small, hands-on team
            handling venue verification, client enquiries, owner onboarding and platform operations.
            As the team grows, individual profiles will be added here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/founder"
              className="rounded-md bg-navy px-6 py-3 text-sm font-bold text-navy-foreground hover:opacity-90"
            >
              Meet the founder
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
