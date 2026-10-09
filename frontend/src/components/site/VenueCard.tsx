import { Link } from "@tanstack/react-router";
import { Building2, Clapperboard, MapPin, Star, Users } from "lucide-react";
import { categoryBySlug, formatINR, type Venue } from "@/data/venues";
import { WatermarkedVenueImage } from "@/components/site/WatermarkedVenueImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function VenueCard({
  venue,
  choosePurpose = false,
}: {
  venue: Venue;
  choosePurpose?: boolean;
}) {
  const cardClassName =
    "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1";
  const content = (
    <>
      <div className="relative aspect-4/3 overflow-hidden @container">
        <WatermarkedVenueImage
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
        {venue.featured && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-gold px-2 py-1 text-[11px] font-extrabold uppercase text-gold-foreground">
            <Star className="size-3 fill-current" /> Featured
          </span>
        )}
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
            From{" "}
            <span className="font-display text-base font-bold text-navy">
              {formatINR(venue.startingPrice)}
            </span>
          </span>
          <span className="text-sm font-bold text-gold">View details →</span>
        </div>
      </div>
    </>
  );

  if (!choosePurpose) {
    return (
      <Link to="/venues/$slug" params={{ slug: venue.slug }} className={cardClassName}>
        {content}
      </Link>
    );
  }

  const purposes = venue.suitableFor ?? [];
  const canBook = purposes.length === 0 || purposes.includes("Venue Bookings");
  const canShoot =
    purposes.includes("Film Shooting Locations") ||
    purposes.includes("Film Shoot") ||
    (purposes.length === 0 && venue.category === "film-shooting-locations");
  const choiceClassName =
    "flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`${cardClassName} w-full text-left`}
          aria-label={`View ${venue.name}`}
        >
          {content}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="pr-6 font-display text-xl font-bold text-navy">
          {venue.name}
        </DialogTitle>
        <DialogDescription>
          Would you like to explore this property for venue bookings or film shooting?
        </DialogDescription>
        <div className="grid gap-3 sm:grid-cols-2">
          {canBook ? (
            <Link
              to="/venues/$slug"
              params={{ slug: venue.slug }}
              search={{ purpose: "venue" }}
              className={`${choiceClassName} bg-navy text-navy-foreground hover:opacity-90`}
            >
              <Building2 className="size-5" /> Venue Bookings
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={`${choiceClassName} bg-navy text-navy-foreground opacity-40`}
            >
              <Building2 className="size-5" /> Venue Bookings
            </button>
          )}
          {canShoot ? (
            <Link
              to="/venues/$slug"
              params={{ slug: venue.slug }}
              search={{ purpose: "film" }}
              className={`${choiceClassName} bg-gold text-gold-foreground hover:opacity-90`}
            >
              <Clapperboard className="size-5" /> Film Shooting
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={`${choiceClassName} bg-gold text-gold-foreground opacity-40`}
            >
              <Clapperboard className="size-5" /> Film Shooting
            </button>
          )}
        </div>
        {(!canBook || !canShoot) && (
          <p className="text-xs text-muted-foreground">
            Only the purposes offered by this property are available.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
