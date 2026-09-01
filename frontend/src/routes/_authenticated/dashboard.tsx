import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createVenue, getMySubscription, listLeads, listMyVenues, updateLeadStatus, updateVenue } from "@/lib/api";
import { useIsAdmin } from "@/hooks/useAuth";
import { categories } from "@/data/venues";
import { PhotoUploader } from "@/components/site/PhotoUploader";
import { SubscriptionPanel } from "@/components/site/SubscriptionPanel";
import { ReviewsPanel } from "@/components/site/ReviewsPanel";



export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | VENUES LOCATION" },
      { name: "description", content: "Manage your venue listing, enquiries and annual subscription." },
      { property: "og:title", content: "Owner Dashboard | VENUES LOCATION" },
      { property: "og:description", content: "Manage your venue listing, enquiries and subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerDashboard,
});

const LEAD_STATUSES = ["New", "Contacted", "Negotiation", "Site Visit", "Booked", "Closed"] as const;

type VenueRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  state: string;
  area: string;
  capacity: number;
  starting_price: number;
  parking: string;
  description: string;
  amenities: string[];
  photos: string[];
  video_url: string;
  map_query: string;
  status: string;
};

type LeadRow = {
  id: string;
  lead_code: string;
  customer_name: string;
  mobile: string;
  email: string;
  purpose: string;
  event_date: string | null;
  budget: string;
  message: string;
  status: string;
  venue_name: string;
  created_at: string;
};

type SubRow = {
  id: string;
  status: string;
  amount: number;
  started_on: string | null;
  expires_on: string | null;
  invoice_number: string;
};

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function OwnerDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const isAdmin = useIsAdmin(userId);
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [sub, setSub] = useState<SubRow | null>(null);
  const [editing, setEditing] = useState<VenueRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    setUserId(uid);
    if (!uid) return;

    const [{ venues: v }, { subscription: s }, { leads: l }] = await Promise.all([
      listMyVenues(),
      getMySubscription(),
      listLeads(),
    ]);
    setVenues(v as unknown as VenueRow[]);
    setSub(s as unknown as SubRow | null);
    setLeads(l as unknown as LeadRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(
    () => [
      { label: "My Venues", value: venues.length },
      { label: "Live Listings", value: venues.filter((v) => v.status === "approved").length },
      { label: "Total Enquiries", value: leads.length },
      { label: "Booked", value: leads.filter((l) => l.status === "Booked").length },
    ],
    [venues, leads],
  );

  const saveVenue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    if (!name) {
      toast.error("Venue name is required");
      return;
    }
    const payload = {
      owner_id: userId,
      name,
      category: String(f.get("category") ?? "resorts"),
      city: String(f.get("city") ?? "").trim(),
      state: String(f.get("state") ?? "").trim(),
      area: String(f.get("area") ?? "").trim(),
      capacity: Number(f.get("capacity") ?? 0) || 0,
      starting_price: Number(f.get("starting_price") ?? 0) || 0,
      parking: String(f.get("parking") ?? "").trim(),
      description: String(f.get("description") ?? "").trim(),
      amenities: String(f.get("amenities") ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      photos,

      video_url: String(f.get("video_url") ?? "").trim(),
      map_query: String(f.get("map_query") ?? "").trim(),
    };

    if (editing) {
      try {
        await updateVenue(editing.id, payload);
        toast.success("Venue updated");
      } catch (err) {
        return void toast.error(err instanceof Error ? err.message : "Could not update venue");
      }
    } else {
      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
      try {
        await createVenue({ ...payload, slug });
        toast.success("Venue submitted for admin approval");
      } catch (err) {
        return void toast.error(err instanceof Error ? err.message : "Could not submit venue");
      }
    }
    setShowForm(false);
    setEditing(null);
    setPhotos([]);

    void load();
  };

  const updateLead = async (id: string, status: (typeof LEAD_STATUSES)[number]) => {
    try {
      await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Lead status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update lead");
    }
  };


  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy">Owner Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage listings, enquiries and your subscription.</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-md border border-navy px-4 py-2 text-sm font-bold text-navy hover:bg-navy hover:text-navy-foreground"
              >
                Admin Panel
              </Link>
            )}
            <button onClick={signOut} className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy">
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-panel">
              <div className="font-display text-3xl font-extrabold text-gold">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subscription */}
        {userId && <SubscriptionPanel userId={userId} sub={sub} onChange={() => void load()} />}


        {/* Venues */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-navy">My Venues</h2>
            <button
              onClick={() => {
                setEditing(null);
                setPhotos([]);
                setShowForm((s) => !s);
              }}

              className="rounded-md bg-navy px-5 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground"
            >
              {showForm ? "Close" : "Add Venue"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={saveVenue} className="mt-5 grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="Venue name" defaultValue={editing?.name} className={input} />
              <select name="category" defaultValue={editing?.category ?? "resorts"} className={input}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input name="city" placeholder="City" defaultValue={editing?.city} className={input} />
              <input name="state" placeholder="State" defaultValue={editing?.state} className={input} />
              <input name="area" placeholder="Area / Locality" defaultValue={editing?.area} className={input} />
              <input name="parking" placeholder="Parking (e.g. 120 cars)" defaultValue={editing?.parking} className={input} />
              <input name="capacity" type="number" placeholder="Guest capacity" defaultValue={editing?.capacity} className={input} />
              <input
                name="starting_price"
                type="number"
                placeholder="Starting price (₹)"
                defaultValue={editing?.starting_price}
                className={input}
              />
              <input name="video_url" placeholder="YouTube video link" defaultValue={editing?.video_url} className={input} />
              <input name="map_query" placeholder="Google Maps location" defaultValue={editing?.map_query} className={input} />
              <input
                name="amenities"
                placeholder="Amenities (comma separated)"
                defaultValue={editing?.amenities?.join(", ")}
                className={`${input} sm:col-span-2`}
              />
              {userId && <PhotoUploader userId={userId} value={photos} onChange={setPhotos} />}

              <textarea
                name="description"
                rows={4}
                placeholder="Venue description"
                defaultValue={editing?.description}
                className={`${input} sm:col-span-2`}
              />
              <button
                type="submit"
                className="rounded-md bg-gold px-6 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-gold-foreground sm:col-span-2"
              >
                {editing ? "Save Changes" : "Submit for Approval"}
              </button>
            </form>
          )}

          <div className="mt-5 space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && venues.length === 0 && (
              <p className="text-sm text-muted-foreground">No venues yet. Add your first listing above.</p>
            )}
            {venues.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-bold text-navy">{v.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {v.area ? `${v.area}, ` : ""}
                    {v.city} · {v.capacity} guests · ₹{v.starting_price.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                    {v.status}
                  </span>
                  <button
                    onClick={() => {
                      setEditing(v);
                      setPhotos(v.photos ?? []);
                      setShowForm(true);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}

                    className="text-sm font-bold text-gold"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ReviewsPanel
          mode="owner"
          venueIds={venues.map((v) => v.id)}
          venueNames={Object.fromEntries(venues.map((v) => [v.id, v.name]))}
        />

        {/* Leads */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-xl font-extrabold text-navy">Enquiries / Leads</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-205 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Lead ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="py-3 font-bold text-navy">{l.lead_code}</td>
                    <td>{l.customer_name}</td>
                    <td>{l.mobile}</td>
                    <td>{l.purpose}</td>
                    <td>{l.event_date ?? "—"}</td>
                    <td>{l.budget || "—"}</td>
                    <td>
                      <select
                        value={l.status}
                        onChange={(e) => updateLead(l.id, e.target.value as (typeof LEAD_STATUSES)[number])}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-muted-foreground">
                      No enquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
