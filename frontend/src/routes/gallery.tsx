import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Images } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-venue.jpg";
import { listGalleryItems, type GalleryItem } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// Any image dropped into these folders shows up automatically — no code changes needed.
// NOTE: import.meta.glob does not reliably resolve "@/..." aliases, so these must stay relative.
const testimonialModules = import.meta.glob<{ default: string }>(
  "../assets/gallery/testimonials/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);
const celebrityModules = import.meta.glob<{ default: string }>(
  "../assets/gallery/celebrities/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);

type MediaItem = { key: string; kind: "photo"; src: string } | { key: string; kind: "video"; embedSrc: string };

function toStaticPhotos(modules: Record<string, { default: string }>): MediaItem[] {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => ({ key: path, kind: "photo" as const, src: mod.default }));
}

// Supports youtube.com/watch?v=, youtu.be/ and already-embedded URLs.
function toYouTubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function toDbMediaItems(items: GalleryItem[]): MediaItem[] {
  return items
    .map((item): MediaItem | null => {
      if (item.media_type === "video") {
        const embedSrc = toYouTubeEmbed(item.url);
        return embedSrc ? { key: item.id, kind: "video", embedSrc } : null;
      }
      return { key: item.id, kind: "photo", src: item.url };
    })
    .filter((item): item is MediaItem => item !== null);
}

const staticTestimonialPhotos = toStaticPhotos(testimonialModules);
const staticCelebrityPhotos = toStaticPhotos(celebrityModules);
const staticTestimonialVideos: MediaItem[] = [
  {
    key: "testimonial-video-ysauei-el-nxa",
    kind: "video",
    embedSrc: "https://www.youtube.com/embed/YsaueiElNXA",
  },
];

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | VENUES LOCATION" },
      {
        name: "description",
        content: "Client testimonials and celebrity collaborations from VENUES LOCATION shoots and events.",
      },
      { property: "og:title", content: "Gallery | VENUES LOCATION" },
      { property: "og:description", content: "Client testimonials and celebrity collaborations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

function MediaCarousel({ items, emptyLabel }: { items: MediaItem[]; emptyLabel: string }) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 3000);
    return () => clearInterval(id);
  }, [api]);

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/70">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="px-2 sm:px-10">
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.key} className="basis-1/2 sm:basis-1/3 lg:basis-1/4">
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-card">
              {item.kind === "photo" ? (
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-top transition-transform hover:scale-105"
                />
              ) : (
                <iframe
                  src={item.embedSrc}
                  title="Celebrity or testimonial video"
                  className="size-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}

function Gallery() {
  const [dbItems, setDbItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    listGalleryItems()
      .then(({ items }) => setDbItems(items))
      .catch(() => toast.error("Could not load gallery items"));
  }, []);

  const testimonialItems = [
    ...staticTestimonialPhotos,
    ...staticTestimonialVideos,
    ...toDbMediaItems(dbItems.filter((i) => i.section === "testimonial")),
  ];
  const celebrityItems = [
    ...staticCelebrityPhotos,
    ...toDbMediaItems(dbItems.filter((i) => i.section === "celebrity")),
  ];

  return (
    <div className="bg-sand">
      <section className="relative bg-navy text-navy-foreground">
        <img
          src={heroImage}
          alt="Gallery of venues and shoots"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <p className="section-title text-sm text-gold">Showcase</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Gallery</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/85">
            Client testimonials and celebrity collaborations from our venues and film locations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-center gap-2">
          <Images className="size-6 text-gold" />
          <h2 className="section-title text-2xl text-navy">Client Testimonials</h2>
        </div>
        <div className="mt-6">
          <MediaCarousel items={testimonialItems} emptyLabel="Client testimonial photos coming soon." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center gap-2">
          <Images className="size-6 text-gold" />
          <h2 className="section-title text-2xl text-navy">Celebrity Collaborations</h2>
        </div>
        <div className="mt-6">
          <MediaCarousel items={celebrityItems} emptyLabel="Celebrity collaboration photos coming soon." />
        </div>
      </section>
    </div>
  );
}
