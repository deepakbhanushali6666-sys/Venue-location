import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAdminProperties, type AdminProperty } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/property-codes")({
  head: () => ({
    meta: [
      { title: "Property Codes | VENUES LOCATION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PropertyCodesPage,
});

// Mirrors the visibility rules used by the public venues and film-location pages.
function listingPurpose(property: AdminProperty) {
  const purposes = property.suitable_for ?? [];
  const venue = purposes.length === 0 || purposes.includes("Venue Bookings");
  const film =
    purposes.includes("Film Shooting Locations") ||
    purposes.includes("Film Shoot") ||
    (purposes.length === 0 && property.category === "film-shooting-locations");
  if (venue && film) return "Venue Booking & Film Shooting Location";
  if (film) return "Film Shooting Location";
  return venue ? "Venue Booking" : "Not set";
}

function PropertyCodesPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAdminProperties()
      .then(({ properties: rows }) => setProperties(rows))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load properties"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return properties;
    return properties.filter((p) =>
      [p.property_code, p.name, p.city].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [properties, query]);

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-navy">Property Codes</h1>
          <Link to="/admin" className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy">
            Back to Admin Panel
          </Link>
        </div>

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by code, property name or city"
            aria-label="Search properties"
            className="w-full max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          />

          {error ? (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-170 text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2">Property Code</th>
                    <th>Property Name</th>
                    <th>Location</th>
                    <th>Purpose of Use</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="py-3 font-bold text-navy">{p.property_code}</td>
                      <td>{p.name}</td>
                      <td>{[p.city, p.state].filter(Boolean).join(", ")}</td>
                      <td>{listingPurpose(p)}</td>
                      <td className="capitalize">{p.status}</td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-muted-foreground">
                        {properties.length === 0 ? "No properties yet." : "No properties match your search."}
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={5} className="py-4 text-muted-foreground">Loading…</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
