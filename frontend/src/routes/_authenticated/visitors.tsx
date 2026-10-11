import { createFileRoute, Link } from "@tanstack/react-router";
import { VisitorsPanel } from "@/components/site/VisitorsPanel";

export const Route = createFileRoute("/_authenticated/visitors")({
  head: () => ({
    meta: [
      { title: "Visitors | VENUES LOCATION Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VisitorsPage,
});

function VisitorsPage() {
  return (
    <div className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-navy">Visitors</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/property-codes"
              className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-navy-foreground"
            >
              Property Codes
            </Link>
            <Link
              to="/admin"
              className="rounded-md border border-border px-4 py-2 text-sm font-bold text-navy"
            >
              Back to Admin Panel
            </Link>
          </div>
        </div>
        <VisitorsPanel />
      </div>
    </div>
  );
}
