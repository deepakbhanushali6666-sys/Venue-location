import { Link } from "@tanstack/react-router";
import { MapPin, Star, Users } from "lucide-react";
import { categoryBySlug, formatINR, type Venue } from "@/data/venues";

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      to="/venues/$slug"
      params={{ slug: venue.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={venue.images[0]}
          alt={venue.name}
          loading="lazy"
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded bg-gold px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-foreground">
          {categoryBySlug(venue.category)?.name}
        </span>
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-navy/90 px-2 py-1 text-[11px] font-bold text-navy-foreground">
          <Star className="size-3 fill-gold text-gold" /> {venue.rating}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold text-navy">{venue.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 text-gold" /> {venue.area}, {venue.city}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-3.5 text-gold" /> Up to {venue.capacity} guests
        </p>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">
            From <span className="font-display text-base font-bold text-navy">{formatINR(venue.startingPrice)}</span>
          </span>
          <span className="text-sm font-bold text-gold">View details →</span>
        </div>
      </div>
    </Link>
  );
}
