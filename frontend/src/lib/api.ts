import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:4000/api";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await authHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...auth,
      ...init?.headers,
    },
  });

  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body as { error?: string } | null)?.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

const get = <T>(path: string) => apiFetch<T>(path);
const post = <T>(path: string, body?: unknown) =>
  apiFetch<T>(
    path,
    body !== undefined ? { method: "POST", body: JSON.stringify(body) } : { method: "POST" },
  );
const patch = <T>(path: string, body?: unknown) =>
  apiFetch<T>(
    path,
    body !== undefined ? { method: "PATCH", body: JSON.stringify(body) } : { method: "PATCH" },
  );
const del = <T>(path: string) => apiFetch<T>(path, { method: "DELETE" });

// Venues
export const listVenues = (filters?: { category?: string; city?: string; search?: string }) => {
  const qs = new URLSearchParams(
    Object.entries(filters ?? {}).filter(([, v]) => Boolean(v)) as string[][],
  );
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return get<{ venues: Record<string, unknown>[] }>(`/venues${suffix}`);
};
export const getVenueBySlug = (slug: string) =>
  get<{ venue: Record<string, unknown> }>(`/venues/${slug}`);
export const listMyVenues = () => get<{ venues: Record<string, unknown>[] }>("/venues/mine");
export const createVenue = (payload: Record<string, unknown>) =>
  post<{ venue: Record<string, unknown> }>("/venues", payload);
export const updateVenue = (id: string, payload: Record<string, unknown>) =>
  patch<{ venue: Record<string, unknown> }>(`/venues/${id}`, payload);
export const setVenueStatus = (id: string, status: "approved" | "rejected" | "pending") =>
  patch<{ venue: Record<string, unknown> }>(`/venues/${id}/status`, { status });
export const setVenueFeatured = (id: string, featured: boolean) =>
  patch<{ venue: Record<string, unknown> }>(`/venues/${id}/featured`, { featured });
export const deleteVenue = (id: string) => del<void>(`/venues/${id}`);

// Leads
export const submitLead = (payload: Record<string, unknown>) =>
  post<{ leadCode: string }>("/leads", payload);
export const listLeads = () => get<{ leads: Record<string, unknown>[] }>("/leads");
export const updateLeadStatus = (id: string, status: string) =>
  patch<{ lead: Record<string, unknown> }>(`/leads/${id}`, { status });

// Subscriptions
export const getMySubscription = () =>
  get<{ subscription: Record<string, unknown> | null }>("/subscriptions/mine");
export const listSubscriptions = () =>
  get<{ subscriptions: Record<string, unknown>[] }>("/subscriptions");

// Payments
export const createPayment = (payload: Record<string, unknown>) =>
  post<{ payment: Record<string, unknown> }>("/payments", payload);
export const listMyPayments = () => get<{ payments: Record<string, unknown>[] }>("/payments/mine");
export const listPayments = () => get<{ payments: Record<string, unknown>[] }>("/payments");
export const getPayment = (id: string) =>
  get<{ payment: Record<string, unknown> }>(`/payments/${id}`);
export const verifyPayment = (id: string) =>
  post<{ invoiceNumber: string }>(`/payments/${id}/verify`);
export const rejectPayment = (id: string, reason: string) =>
  post<{ success: boolean }>(`/payments/${id}/reject`, { reason });

// Reviews
export const getVenueReviews = (venueId: string) =>
  get<{ reviews: Record<string, unknown>[]; mine: Record<string, unknown> | null }>(
    `/reviews/venue/${venueId}`,
  );
export const listReviewsForModeration = () =>
  get<{ reviews: Record<string, unknown>[] }>("/reviews");
export const upsertReview = (payload: Record<string, unknown>) =>
  post<{ review: Record<string, unknown> }>("/reviews", payload);
export const moderateReview = (id: string, status: "approved" | "rejected", admin_note = "") =>
  patch<{ review: Record<string, unknown> }>(`/reviews/${id}/moderate`, { status, admin_note });
export const replyToReview = (id: string, owner_reply: string) =>
  patch<{ review: Record<string, unknown> }>(`/reviews/${id}/reply`, { owner_reply });

// Profiles
export const getProfile = (id: string) =>
  get<{ profile: Record<string, unknown> | null }>(`/profiles/${id}`);

// Admin
export const getAdminOverview = () =>
  get<{
    venues: Record<string, unknown>[];
    leads: Record<string, unknown>[];
    subscriptions: Record<string, unknown>[];
    payments: Record<string, unknown>[];
    audit: Record<string, unknown>[];
  }>("/admin/overview");
export const getAuditLog = () => get<{ audit: Record<string, unknown>[] }>("/admin/audit-log");

// Venue categories & subcategories (admin-managed)
export type SubcategoryRecord = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
};
export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  subcategories: SubcategoryRecord[];
};

export const listCategories = () => get<{ categories: CategoryRecord[] }>("/categories");
export const createCategory = (payload: { name: string; sort_order?: number }) =>
  post<{ category: CategoryRecord }>("/categories", payload);
export const updateCategory = (id: string, payload: { name?: string; sort_order?: number }) =>
  patch<{ category: CategoryRecord }>(`/categories/${id}`, payload);
export const deleteCategory = (id: string) => del<void>(`/categories/${id}`);
export const createSubcategory = (
  categoryId: string,
  payload: { name: string; sort_order?: number },
) => post<{ subcategory: SubcategoryRecord }>(`/categories/${categoryId}/subcategories`, payload);
export const updateSubcategory = (id: string, payload: { name?: string; sort_order?: number }) =>
  patch<{ subcategory: SubcategoryRecord }>(`/categories/subcategories/${id}`, payload);
export const deleteSubcategory = (id: string) => del<void>(`/categories/subcategories/${id}`);

// Gallery (admin-managed photos & video links for the /gallery page)
export type GallerySection = "testimonial" | "celebrity";
export type GalleryItem = {
  id: string;
  section: GallerySection;
  media_type: "photo" | "video";
  url: string;
  sort_order: number;
};
export const listGalleryItems = () => get<{ items: GalleryItem[] }>("/gallery");
export const createGalleryItem = (payload: {
  section: GallerySection;
  media_type: "photo" | "video";
  url: string;
}) => post<{ item: GalleryItem }>("/gallery", payload);
export const deleteGalleryItem = (id: string) => del<void>(`/gallery/${id}`);

// Team members and advisors (admin-managed)
export type PeopleSection = "team" | "advisor";
export type PeopleProfile = {
  id: string;
  section: PeopleSection;
  name: string;
  title: string;
  description: string;
  photo_url: string;
  sort_order: number;
};
export const listPeopleProfiles = () => get<{ profiles: PeopleProfile[] }>("/people");
export const createPeopleProfile = (payload: Omit<PeopleProfile, "id">) =>
  post<{ profile: PeopleProfile }>("/people", payload);
export const updatePeopleProfile = (id: string, payload: Partial<Omit<PeopleProfile, "id">>) =>
  patch<{ profile: PeopleProfile }>(`/people/${id}`, payload);
export const deletePeopleProfile = (id: string) => del<void>(`/people/${id}`);

// Venue amenities (admin-managed options)
export type AmenityRecord = { id: string; name: string; sort_order: number };
export const listAmenities = () => get<{ amenities: AmenityRecord[] }>("/amenities");
export const createAmenity = (payload: { name: string; sort_order?: number }) =>
  post<{ amenity: AmenityRecord }>("/amenities", payload);
export const deleteAmenity = (id: string) => del<void>(`/amenities/${id}`);
