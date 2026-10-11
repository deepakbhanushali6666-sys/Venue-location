import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { categoryBySlug } from "@/data/venues";
import {
  listVisitors,
  listVisitorActivity,
  type VisitorSearch,
  type VisitorActivity,
  type VisitorFilters,
} from "@/lib/api";
import { downloadCsv } from "@/lib/csv";

const TYPE_LABELS = {
  venue: "Venue Bookings",
  film: "Film Shooting Locations",
  all: "All Locations",
  property: "Property Details",
};
const REQUIREMENT_LABELS: Record<string, string> = {
  category: "Category",
  subcategory: "Subcategory",
  filmType: "Film category",
  filmSubcategory: "Film subcategory",
  city: "City",
  state: "State",
  event: "Purpose",
  date: "Event / shoot date",
  budget: "Budget",
  capacity: "Guest capacity",
  purpose: "Listing purpose",
};

function requirementValue(key: string, value: string) {
  if (key === "category" || key === "filmType") return categoryBySlug(value)?.name ?? value;
  if (key === "purpose") {
    if (value === "film") return "Film Shooting";
    if (value === "venue") return "Venue Bookings";
  }
  return value;
}

function spreadsheetText(value: string) {
  return /^\s*[=+\-@]/.test(value) || /^[\t\r\n]/.test(value) ? `'${value}` : value;
}

export function VisitorsPanel() {
  const [rows, setRows] = useState<VisitorSearch[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<VisitorFilters>({});
  const [draft, setDraft] = useState<VisitorFilters>({});
  const [view, setView] = useState<"records" | "frequent">("records");
  const [activity, setActivity] = useState<VisitorActivity[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);

  const exportVisitors = async () => {
    setExporting(true);
    try {
      const first = await listVisitors(0, filters);
      const records = [...first.visitors];
      for (let exportPage = 1; exportPage * 50 < first.total; exportPage += 1) {
        const next = await listVisitors(exportPage, filters);
        if (next.total !== first.total) {
          throw new Error("Visitor records changed during export. Please download again.");
        }
        records.push(...next.visitors);
      }
      if (
        records.length !== first.total ||
        new Set(records.map((record) => record.id)).size !== records.length
      ) {
        throw new Error("Could not retrieve all visitor records. Please download again.");
      }
      if (records.length === 0) {
        toast.info("No visitor records to download.");
        return;
      }
      const requirementKeys = Object.keys(REQUIREMENT_LABELS);
      downloadCsv(
        `visitors-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          "Record ID",
          "Date / Time (UTC)",
          "Name",
          "Phone",
          "Searched for",
          "Property",
          ...requirementKeys.map((key) => REQUIREMENT_LABELS[key] ?? key),
        ],
        records.map((record) =>
          [
            record.id,
            record.created_at,
            record.visitor_name,
            record.mobile,
            TYPE_LABELS[record.search_type],
            record.property_slug ?? "",
            ...requirementKeys.map((key) => requirementValue(key, record.requirements[key] ?? "")),
          ].map(spreadsheetText),
        ),
      );
      toast.success(`${records.length} visitor records downloaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download visitor records.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const load = async () => {
      if (view === "frequent") {
        const result = await listVisitorActivity(page, filters);
        if (active) {
          setActivity(result.visitors);
          setTotal(result.total);
          setActivityTotal(result.activityTotal);
        }
      } else {
        const { visitors, total: count } = await listVisitors(page, filters);
        if (active) {
          setRows(visitors);
          setTotal(count);
        }
      }
    };
    load()
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load visitors");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, refresh, filters, view]);

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-navy">Visitors</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={exporting}
            onClick={() => void exportVisitors()}
            className="rounded-md bg-gold px-3 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60"
          >
            {exporting ? "Downloading..." : "Download filtered activity CSV"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefresh((value) => value + 1)}
            className="rounded-md border border-border px-3 py-2 text-sm font-bold disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Recorded searches and property views, not every website visit. Counts use the selected
        filters. Phone numbers are grouped by digits (spaces and punctuation ignored); country codes
        are not inferred.
      </p>
      <form
        className="mt-4 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.from && draft.to && draft.from > draft.to) {
            toast.error("Start date must not be after end date");
            return;
          }
          setPage(0);
          setFilters({ ...draft });
        }}
      >
        <label className="text-sm">
          Name / Phone
          <input
            value={draft.search ?? ""}
            maxLength={80}
            onChange={(event) =>
              setDraft((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Search name or phone"
            className="mt-1 block rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Activity type
          <select
            aria-label="Activity type"
            value={draft.type ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                type: event.target.value as NonNullable<VisitorFilters["type"]>,
              }))
            }
            className="mt-1 block rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">All activity</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          From (UTC)
          <input
            type="date"
            value={draft.from ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))}
            className="mt-1 block rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="text-sm">
          To (UTC)
          <input
            type="date"
            value={draft.to ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
            className="mt-1 block rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-navy-foreground"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft({});
            setFilters({});
            setPage(0);
          }}
          className="rounded-md border border-border px-4 py-2 text-sm font-bold"
        >
          Clear filters
        </button>
      </form>
      {filters.mobile && (
        <p className="mt-3 text-sm font-semibold">
          Showing full recorded history for {filters.mobile}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["records", "frequent"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => {
              setView(option);
              setPage(0);
            }}
            className={`rounded-md border border-border px-4 py-2 text-sm font-bold ${view === option ? "bg-navy text-navy-foreground" : ""}`}
          >
            {option === "records" ? "Activity history" : "Frequent visitors"}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading visitors...</p>
      ) : view === "frequent" ? (
        <>
          <p className="mt-4 text-sm">
            {total} phone numbers · {activityTotal} recorded activities. Ranked by activity count.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground">
                  <th className="py-2">Rank</th>
                  <th>Name(s)</th>
                  <th>Phone</th>
                  <th>Total activity</th>
                  <th>Searches</th>
                  <th>Property views</th>
                  <th>Distinct properties</th>
                  <th>First activity</th>
                  <th>Last activity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((visitor, index) => (
                  <tr key={visitor.mobile} className="border-t border-border align-top">
                    <td className="py-3 pr-3">{page * 50 + index + 1}</td>
                    <td className="py-3 pr-3">{visitor.names.join(", ")}</td>
                    <td className="py-3 pr-3">{visitor.mobile}</td>
                    <td className="py-3 pr-3 font-bold">{visitor.activity_count}</td>
                    <td className="py-3 pr-3">{visitor.search_count}</td>
                    <td className="py-3 pr-3">{visitor.property_views}</td>
                    <td className="py-3 pr-3">{visitor.unique_properties}</td>
                    <td className="py-3 pr-3">
                      {new Date(visitor.first_activity).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3">
                      {new Date(visitor.last_activity).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="text-navy underline"
                        onClick={() => {
                          const next = { mobile: visitor.mobile };
                          setFilters(next);
                          setDraft(next);
                          setPage(0);
                          setView("records");
                        }}
                      >
                        View history
                      </button>
                    </td>
                  </tr>
                ))}
                {activity.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-4 text-muted-foreground">
                      No visitors match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Date / Time</th>
                <th className="pr-3">Name</th>
                <th className="pr-3">Phone</th>
                <th className="pr-3">Searched for</th>
                <th className="pr-3">Property</th>
                <th>Requirements</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="py-3 pr-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="py-3 pr-3 font-semibold">{row.visitor_name}</td>
                  <td className="whitespace-nowrap py-3 pr-3">{row.mobile}</td>
                  <td className="py-3 pr-3">{TYPE_LABELS[row.search_type]}</td>
                  <td className="py-3 pr-3">
                    {row.property_slug ? (
                      <Link
                        to="/venues/$slug"
                        params={{ slug: row.property_slug }}
                        className="text-navy underline"
                      >
                        {row.property_slug}
                      </Link>
                    ) : (
                      "Not selected"
                    )}
                  </td>
                  <td className="py-3">
                    {Object.entries(row.requirements).length === 0 ? (
                      "No filters selected"
                    ) : (
                      <ul className="space-y-1">
                        {Object.entries(row.requirements).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-semibold">{REQUIREMENT_LABELS[key] ?? key}:</span>{" "}
                            {requirementValue(key, value)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">
                    No visitor activity matches these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span>
          {total} {view === "frequent" ? "phone numbers" : "searches / property views"}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading || page === 0}
            onClick={() => setPage((value) => value - 1)}
            className="rounded border border-border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {Math.max(1, Math.ceil(total / 50))}
          </span>
          <button
            type="button"
            disabled={loading || (page + 1) * 50 >= total}
            onClick={() => setPage((value) => value + 1)}
            className="rounded border border-border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
