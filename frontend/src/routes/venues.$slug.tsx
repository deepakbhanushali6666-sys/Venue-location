import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Car, MapPin, Maximize2, MessageCircle, Phone, Star, Users } from "lucide-react";
import { CONTACT, categoryBySlug, formatINR, venueBySlug, venues, type Venue } from "@/data/venues";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { VenueCard } from "@/components/site/VenueCard";
import { VenueReviews } from "@/components/site/VenueReviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getVenueBySlug } from "@/lib/api";
import { rowToVenue, type VenueRow } from "@/lib/venue-mapping";

export const Route = createFileRoute("/venues/$slug")({
  loader: ({ params }) => {
    return { venue: venueBySlug(params.slug) ?? null };
  },
  head: ({ loaderData }) => {
    const v = loaderData?.venue;
    if (!v) {
      const title = "Venue Details | VENUES LOCATION";
      return {
        meta: [
          { title },
          { name: "description", content: "Venue photos, amenities, capacity and booking enquiry on VENUES LOCATION." },
          { property: "og:title", content: title },
          { property: "og:description", content: "Venue photos, amenities, capacity and booking enquiry." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ],
      };
    }
    const title = `${v.name}, ${v.city} | VENUES LOCATION`;
    const description = `${v.name} in ${v.area}, ${v.city} — up to ${v.capacity} guests, from ${formatINR(v.startingPrice)}. Enquire or request booking on VENUES LOCATION.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: VenueDetailRoute,
});

function VenueDetailRoute() {
  const { venue: staticVenue } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [dbVenue, setDbVenue] = useState<{ venue: Venue; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVenueBySlug(slug)
      .then(({ venue }) => {
        if (cancelled) return;
        if (venue) {
          const row = venue as unknown as VenueRow;
          setDbVenue({ venue: rowToVenue(row), id: (venue as { id: string }).id });
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center bg-sand text-muted-foreground">Loading venue…</div>;
  }

  if (dbVenue) return <VenueDetail venue={dbVenue.venue} venueId={dbVenue.id} />;

  // Fallback to static demo data only if no live database listing exists.
  if (staticVenue) return <VenueDetail venue={staticVenue} />;

  return (
    <div className="grid min-h-[60vh] place-items-center bg-sand px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">Venue not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This listing may have been removed or is pending approval.</p>
        <Link to="/venues" className="mt-4 inline-block font-bold text-gold">
          Browse all venues
        </Link>
      </div>
    </div>
  );
}

function VenueDetail({ venue, venueId }: { venue: Venue; venueId?: string }) {
  const similar = venues.filter((v) => v.category === venue.category && v.slug !== venue.slug).slice(0, 3);

  const waText = encodeURIComponent(
    `Hi VENUES LOCATION, I'm interested in ${venue.name} (${venue.city}). Please share availability and pricing.`,
  );

  return (
    <div className="bg-sand">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/venues" search={{}} className="hover:text-gold">
            Venues
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy">{venue.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <VenuePhotoCarousel venue={venue} />

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <span className="rounded bg-gold px-2 py-1 text-[11px] font-bold uppercase text-gold-foreground">
                {categoryBySlug(venue.category)?.name}
              </span>
              <h1 className="mt-3 font-display text-3xl font-extrabold text-navy">{venue.name}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-gold" /> {venue.area}, {venue.city}, {venue.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-gold" /> Up to {venue.capacity} guests
                </span>
                <span className="flex items-center gap-1.5">
                  <Car className="size-4 text-gold" /> {venue.parking}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-gold text-gold" /> {venue.rating}
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">{venue.description}</p>

              <h2 className="section-title mt-8 text-base text-navy">Amenities</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {venue.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-gold" /> {a}
                  </li>
                ))}
              </ul>

              <h2 className="section-title mt-8 text-base text-navy">Suitable for</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {venue.suitableFor.map((s) => (
                  <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-navy">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
              <h2 className="section-title border-b border-border p-5 text-base text-navy">Venue Video</h2>
              <iframe
                title={`${venue.name} video`}
                src={`https://www.youtube.com/embed/${venue.videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>

            {venueId && <VenueReviews venueId={venueId} venueName={venue.name} />}

            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
              <h2 className="section-title border-b border-border p-5 text-base text-navy">Location</h2>
              <iframe
                title={`${venue.name} map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(venue.mapQuery)}&output=embed`}
                loading="lazy"
                className="aspect-video w-full"
              />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="font-display text-3xl font-extrabold text-navy">{formatINR(venue.startingPrice)}</p>
              <p className="text-xs text-muted-foreground">per event / shoot day (indicative)</p>

              <div className="mt-5">
                <h2 className="section-title text-base text-navy">Request Booking</h2>
                <div className="mt-3">
                  <EnquiryForm venueName={venue.name} venueId={venueId} compact />
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <a
                  href={`https://wa.me/${CONTACT.phoneIntl}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-bold text-gold-foreground"
                >
                  <MessageCircle className="size-4" /> WhatsApp Enquiry
                </a>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-bold text-navy"
                >
                  <Phone className="size-4" /> Call {CONTACT.phone}
                </a>
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="section-title text-xl text-navy">Similar Venues</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((v) => (
                <VenueCard key={v.slug} venue={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function VenuePhotoCarousel({ venue }: { venue: Venue }) {
  const [api, setApi] = useState<CarouselApi>();
  const [previewApi, setPreviewApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!api) return;
    const updateActive = () => setActive(api.selectedScrollSnap());
    updateActive();
    api.on("select", updateActive);
    api.on("reInit", updateActive);
    return () => {
      api.off("select", updateActive);
      api.off("reInit", updateActive);
    };
  }, [api]);

  useEffect(() => {
    if (!previewApi) return;
    const updateActive = () => setActive(previewApi.selectedScrollSnap());
    updateActive();
    previewApi.on("select", updateActive);
    previewApi.on("reInit", updateActive);
    return () => {
      previewApi.off("select", updateActive);
      previewApi.off("reInit", updateActive);
    };
  }, [previewApi]);

  useEffect(() => {
    if (api && api.selectedScrollSnap() !== active) api.scrollTo(active);
    if (previewApi && previewApi.selectedScrollSnap() !== active) previewApi.scrollTo(active);
  }, [active, api, previewApi]);

  useEffect(() => {
    if (!api || previewOpen || venue.images.length < 2) return;
    const interval = window.setInterval(() => api.scrollNext(), 4000);
    return () => window.clearInterval(interval);
  }, [api, previewOpen, venue.images.length]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent className="ml-0">
            {venue.images.map((image, index) => (
              <CarouselItem key={`${image}-${index}`} className="pl-0">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  aria-label={`View larger photo ${index + 1} of ${venue.name}`}
                  className="group relative block w-full cursor-zoom-in overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${venue.name} photo ${index + 1}`}
                    width={1200}
                    height={800}
                    className="aspect-16/10 w-full object-cover"
                  />
                  <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-navy/75 text-white opacity-90 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="size-4" />
                  </span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          {venue.images.length > 1 && (
            <>
              <CarouselPrevious className="left-3 border-0 bg-navy/75 text-white hover:bg-navy" />
              <CarouselNext className="right-3 border-0 bg-navy/75 text-white hover:bg-navy" />
              <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-navy/80 px-2 py-1 text-xs font-semibold text-white">
                {active + 1} / {venue.images.length}
              </span>
            </>
          )}
        </Carousel>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="h-[94dvh] w-[96vw] max-w-none grid-rows-[auto_1fr_auto] gap-2 border-0 bg-navy p-3 text-white sm:p-6">
          <DialogTitle className="sr-only">{venue.name} photo {active + 1}</DialogTitle>
          <div className="min-h-0">
            <Carousel setApi={setPreviewApi} opts={{ loop: true }} className="h-full">
              <CarouselContent className="ml-0 h-full">
                {venue.images.map((image, index) => (
                  <CarouselItem key={`${image}-${index}`} className="grid h-full place-items-center pl-0">
                    <img
                      src={image}
                      alt={`${venue.name} photo ${index + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {venue.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 size-10 border-0 bg-white/15 text-white hover:bg-white/25 sm:left-4" />
                  <CarouselNext className="right-2 size-10 border-0 bg-white/15 text-white hover:bg-white/25 sm:right-4" />
                </>
              )}
            </Carousel>
          </div>
          {venue.images.length > 1 && (
            <p className="text-center text-xs font-semibold text-white/80">
              {active + 1} / {venue.images.length}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
