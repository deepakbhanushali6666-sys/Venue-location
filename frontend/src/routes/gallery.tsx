import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Images, Play, X } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-venue.jpg";
import { listGalleryItems, type GalleryItem } from "@/lib/api";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
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

type MediaItem =
  | { key: string; kind: "photo"; src: string }
  | { key: string; kind: "video"; embedSrc: string; thumbnail: string };

function toStaticPhotos(modules: Record<string, { default: string }>): MediaItem[] {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => ({ key: path, kind: "photo" as const, src: mod.default }));
}

function toDbMediaItems(items: GalleryItem[]): MediaItem[] {
  return items
    .map((item): MediaItem | null => {
      if (item.media_type === "video") {
        const embedSrc = getYouTubeEmbedUrl(item.url);
        const videoId = embedSrc?.split("/").pop();
        return embedSrc && videoId
          ? { key: item.id, kind: "video", embedSrc, thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }
          : null;
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
    thumbnail: "https://img.youtube.com/vi/YsaueiElNXA/hqdefault.jpg",
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

function PhotoCarousel({ items, paused, onSelect }: { items: MediaItem[]; paused: boolean; onSelect: (src: string) => void }) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || paused || items.length < 2) return;
    const id = setInterval(() => api.scrollNext(), 3000);
    return () => clearInterval(id);
  }, [api, items.length, paused]);

  if (items.length === 0) return <p className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-foreground/70">Photos coming soon.</p>;

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="px-2 sm:px-10">
      <CarouselContent>
        {items.map((item) => (
          item.kind === "photo" && <CarouselItem key={item.key} className="basis-4/5 sm:basis-1/2 lg:basis-1/3">
            <button type="button" onClick={() => onSelect(item.src)} className="block aspect-video w-full overflow-hidden rounded-lg border border-border bg-card" aria-label="View larger photo">
              <img src={item.src} alt="Gallery photo" loading="lazy" decoding="async" className="size-full object-cover object-top transition-transform hover:scale-105" />
            </button>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}

function VideoCarousel({ items, activeVideo, onPlay }: { items: MediaItem[]; activeVideo: string | null; onPlay: (key: string | null) => void }) {
  const videoItems = items.filter((item): item is Extract<MediaItem, { kind: "video" }> => item.kind === "video");
  if (videoItems.length === 0) return <p className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-foreground/70">Videos coming soon.</p>;

  return (
    <Carousel opts={{ align: "start", loop: true }} className="px-2 sm:px-10">
      <CarouselContent>
        {videoItems.map((video) => (
          <CarouselItem key={video.key} className="basis-full md:basis-4/5 lg:basis-2/3">
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-card shadow-card">
              {activeVideo === video.key ? (
                <div className="relative size-full">
                  <iframe src={`${video.embedSrc}?autoplay=1`} title="Client or celebrity testimonial video" className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  <button type="button" onClick={() => onPlay(null)} className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white" aria-label="Close video"><X className="size-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => onPlay(video.key)} className="group relative size-full" aria-label="Play video">
                  <img src={video.thumbnail} alt="Video preview" loading="lazy" className="size-full object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/40"><span className="grid size-14 place-items-center rounded-full bg-red-600 text-white"><Play className="ml-1 size-6 fill-current" /></span></span>
                </button>
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      listGalleryItems()
        .then(({ items }) => {
          if (active) setDbItems(items);
        })
        .catch(() => {
          if (active) toast.error("Could not load gallery items");
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
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
        <div className="mt-6 space-y-10">
          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-navy">Photos</h3>
            <PhotoCarousel items={testimonialItems.filter((item) => item.kind === "photo")} paused={activeVideo !== null} onSelect={setPhotoPreview} />
          </div>
          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-navy">Videos</h3>
            <VideoCarousel items={testimonialItems} activeVideo={activeVideo} onPlay={setActiveVideo} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center gap-2">
          <Images className="size-6 text-gold" />
          <h2 className="section-title text-2xl text-navy">Celebrity Collaborations</h2>
        </div>
        <div className="mt-6 space-y-10">
          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-navy">Photos</h3>
            <PhotoCarousel items={celebrityItems.filter((item) => item.kind === "photo")} paused={activeVideo !== null} onSelect={setPhotoPreview} />
          </div>
          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-navy">Videos</h3>
            <VideoCarousel items={celebrityItems} activeVideo={activeVideo} onPlay={setActiveVideo} />
          </div>
        </div>
      </section>
      {photoPreview && (
        <div className="fixed inset-0 z-100 grid place-items-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Expanded gallery photo" onClick={() => setPhotoPreview(null)}>
          <button type="button" onClick={() => setPhotoPreview(null)} className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white" aria-label="Close expanded photo"><X className="size-5" /></button>
          <img src={photoPreview} alt="Expanded gallery" className="max-h-[90vh] max-w-[95vw] object-contain" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
