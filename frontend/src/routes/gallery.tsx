import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Images } from "lucide-react";
import heroImage from "@/assets/hero-venue.jpg";
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

function toImages(modules: Record<string, { default: string }>) {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => ({ src: mod.default, path }));
}

const testimonialImages = toImages(testimonialModules);
const celebrityImages = toImages(celebrityModules);

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

function PhotoCarousel({ images, emptyLabel }: { images: { src: string; path: string }[]; emptyLabel: string }) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 3000);
    return () => clearInterval(id);
  }, [api]);

  if (images.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/70">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="px-2 sm:px-10">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.path} className="basis-1/2 sm:basis-1/3 lg:basis-1/4">
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-card">
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform hover:scale-105"
              />
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
          <PhotoCarousel images={testimonialImages} emptyLabel="Client testimonial photos coming soon." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center gap-2">
          <Images className="size-6 text-gold" />
          <h2 className="section-title text-2xl text-navy">Celebrity Collaborations</h2>
        </div>
        <div className="mt-6">
          <PhotoCarousel images={celebrityImages} emptyLabel="Celebrity collaboration photos coming soon." />
        </div>
      </section>
    </div>
  );
}
