import fallbackImage from "@/assets/cat-villa.jpg";
import type { CategorySlug, Venue } from "@/data/venues";

export type VenueRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  city: string;
  state: string;
  area: string;
  capacity: number;
  starting_price: number;
  parking: string;
  description: string;
  amenities: string[];
  suitable_for: string[];
    booking_purposes?: string[];
  photos: string[];
  video_url: string;
  map_query: string;
  featured: boolean;
};

export function rowToVenue(row: VenueRow): Venue {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as CategorySlug,
    city: row.city,
    state: row.state,
    area: row.area,
    capacity: row.capacity,
    startingPrice: row.starting_price,
    parking: row.parking || "On request",
    rating: 4.5,
    featured: row.featured,
    suitableFor: row.suitable_for,
      ...(row.booking_purposes ? { bookingPurposes: row.booking_purposes } : {}),
    amenities: row.amenities,
    description: row.description,
    images: row.photos.length > 0 ? row.photos : [fallbackImage],
    videoId: extractYouTubeId(row.video_url),
    mapQuery: row.map_query || `${row.area} ${row.city}`,
    ...(row.subcategory ? { subcategory: row.subcategory } : {}),
  };
}

export function extractYouTubeId(url: string) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? url;
}

export const VENUE_SELECT =
  "id, slug, name, category, city, state, area, capacity, starting_price, parking, description, amenities, suitable_for, photos, video_url, map_query, featured";
