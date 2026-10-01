import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  decideLeadContactRequest,
  getPropertyLeads,
  listLeadContactRequests,
  type LeadContactRequest,
  type PropertyDetail,
  type PropertyLead,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/lead-page")({
  head: () => ({
    meta: [
      { title: "Lead Page | VENUES LOCATION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadPage,
});

const list = (values: string[] | null) => (values?.length ? values.join(", ") : "—");

function LeadPage() {
  const [properties, setProperties] = useState<PropertyDetail[]>([]);
  const [leads, setLeads] = useState<PropertyLead[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactRequests, setContactRequests] = useState<LeadContactRequest[]>([]);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    getPropertyLeads()
      .then(({ properties: p, leads: l }) => {
        setProperties(p);
        setLeads(l);
        setSelected(p[0]?.id ?? "");
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load property leads"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    listLeadContactRequests()
      .then(({ requests }) => setContactRequests(requests))
      .catch(() => undefined);
  }, []);

  const decideRequest = async (
    request: LeadContactRequest,
    status: "approved" | "rejected",
  ) => {
    setDecidingId(request.id);
    try {
      await decideLeadContactRequest(request.id, status);
      setContactRequests((rows) =>
        rows.map((row) => (row.id === request.id ? { ...row, status } : row)),
      );
      toast.success(status === "approved" ? "Contact access approved" : "Request rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update request");
    } finally {
      setDecidingId(null);
    }
  };

  const leadsByProperty = useMemo(() => {
    const map = new Map<string, PropertyLead[]>();
    properties.forEach((p) => {
      map.set(
        p.id,
        leads.filter(
          (l) => l.venue_id === p.id || (!!p.property_code && l.property_code === p.property_code),
        ),
      );
    });
    return map;
  }, [properties, leads]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return properties;
    return properties.filter((p) =>
      [p.property_code, p.name, p.city].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [properties, query]);

  const property = properties.find((p) => p.id === selected) ?? null;
  const propertyLeads = property ? (leadsByProperty.get(property.id) ?? []) : [];

  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy">Lead Page</h1>
            <p className="text-sm text-muted-foreground">
              Pick a property code to see its full listing details and every enquiry received for it.
            </p>
          </div>
          <Link
            to="/admin"
            className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
          >
            Back to Admin Panel
          </Link>
        </div>

        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}
        {loading && <p className="mt-6 text-sm text-muted-foreground">Loading properties...</p>}

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-xl font-extrabold text-navy">
            Contact Access Requests (
            {contactRequests.filter((r) => r.status === "pending").length} pending)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve to let the owner see the phone number and email of every enquiry for that
            property.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-215 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Code</th>
                  <th>Property</th>
                  <th>Requested by</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contactRequests.map((request) => (
                  <tr key={request.id} className="border-t border-border">
                    <td className="py-3 font-bold text-navy">{request.property_code || "—"}</td>
                    <td>{request.venue_name || "—"}</td>
                    <td>{request.requester_name || "—"}</td>
                    <td>{request.requester_mobile || "—"}</td>
                    <td>{request.requester_email || "—"}</td>
                    <td className="whitespace-nowrap">
                      {new Date(request.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="font-semibold capitalize text-navy">{request.status}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {request.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => void decideRequest(request, "approved")}
                            disabled={decidingId === request.id}
                            className="rounded-md bg-gold px-3 py-1 text-xs font-bold text-gold-foreground disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {request.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => void decideRequest(request, "rejected")}
                            disabled={decidingId === request.id}
                            className="rounded-md border border-border px-3 py-1 text-xs font-bold text-navy disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {contactRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-muted-foreground">
                      No contact access requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {!loading && !error && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-xl border border-border bg-card p-4 shadow-panel">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search code, name or city"
                aria-label="Search properties"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <ul className="mt-3 max-h-150 space-y-1 overflow-auto">
                {filtered.map((p) => {
                  const count = leadsByProperty.get(p.id)?.length ?? 0;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(p.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm ${
                          selected === p.id
                            ? "border-gold bg-secondary"
                            : "border-transparent hover:bg-secondary/60"
                        }`}
                      >
                        <span>
                          <span className="block font-bold text-navy">{p.property_code || "—"}</span>
                          <span className="block text-xs text-muted-foreground">{p.name}</span>
                        </span>
                        <span className="rounded-full bg-navy px-2 py-0.5 text-xs font-bold text-navy-foreground">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted-foreground">No properties found.</li>
                )}
              </ul>
            </aside>

            <div className="space-y-6">
              {!property ? (
                <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-panel">
                  Select a property code to view its details.
                </section>
              ) : (
                <>
                  <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-2xl font-extrabold text-navy">
                          {property.property_code || "—"} · {property.name}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {[property.area, property.city, property.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                        {property.status}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ["Category", property.category || "—"],
                        ["Subcategory", property.subcategory || "—"],
                        ["Listed for", list(property.suitable_for)],
                        ["Capacity", property.capacity ? String(property.capacity) : "—"],
                        [
                          "Starting price",
                          property.starting_price
                            ? `₹${property.starting_price.toLocaleString("en-IN")}`
                            : "—",
                        ],
                        ["Parking", property.parking || "—"],
                        ["Address", property.address || "—"],
                        ["Booking purposes", list(property.booking_purposes)],
                        ["Restrictions", list(property.booking_restrictions)],
                        ["Amenities", list(property.amenities)],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-border bg-sand/60 p-3">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="mt-1 text-sm text-navy">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    {property.description && (
                      <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                        {property.description}
                      </p>
                    )}

                    {property.photos?.length ? (
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {property.photos.map((photo) => (
                          <a
                            key={photo}
                            href={photo}
                            target="_blank"
                            rel="noreferrer"
                            className="aspect-video overflow-hidden rounded-lg border border-border"
                          >
                            <img
                              src={photo}
                              alt={`${property.name} photo`}
                              loading="lazy"
                              className="size-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-muted-foreground">No photos uploaded.</p>
                    )}
                  </section>

                  <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
                    <h2 className="font-display text-xl font-extrabold text-navy">
                      Enquiries for {property.property_code || property.name} ({propertyLeads.length})
                    </h2>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-215 text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="py-2">Lead ID</th>
                            <th>Received</th>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Purpose</th>
                            <th>Event date</th>
                            <th>Guests</th>
                            <th>Budget</th>
                            <th>Message</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyLeads.map((lead) => (
                            <tr key={lead.id} className="border-t border-border align-top">
                              <td className="py-3 font-bold text-navy">{lead.lead_code}</td>
                              <td className="whitespace-nowrap">
                                {new Date(lead.created_at).toLocaleDateString("en-IN")}
                              </td>
                              <td>{lead.customer_name}</td>
                              <td>
                                <a href={`tel:${lead.mobile}`} className="font-semibold text-navy">
                                  {lead.mobile}
                                </a>
                              </td>
                              <td>
                                {lead.email ? (
                                  <a href={`mailto:${lead.email}`} className="text-navy underline">
                                    {lead.email}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>{lead.purpose || "—"}</td>
                              <td className="whitespace-nowrap">
                                {lead.event_date
                                  ? new Date(lead.event_date).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td>{lead.guest_count ?? "—"}</td>
                              <td>{lead.budget || "—"}</td>
                              <td className="max-w-70 whitespace-pre-line text-xs text-muted-foreground">
                                {lead.message || "—"}
                              </td>
                              <td className="font-semibold text-navy">{lead.status}</td>
                            </tr>
                          ))}
                          {propertyLeads.length === 0 && (
                            <tr>
                              <td colSpan={11} className="py-4 text-muted-foreground">
                                No enquiries for this property yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
