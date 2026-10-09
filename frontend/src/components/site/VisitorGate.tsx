import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { toast } from "sonner";
import { recordVisitorSearch, type VisitorSearch } from "@/lib/api";

type VisitorDetails = { name: string; mobile: string };
const STORAGE_KEY = "venues-location-visitor";
let sessionVisitor: VisitorDetails | undefined;
const requirementKeys = [
  "category",
  "subcategory",
  "filmType",
  "filmSubcategory",
  "city",
  "state",
  "event",
  "date",
  "budget",
  "capacity",
  "purpose",
];

function readVisitor(): VisitorDetails | undefined {
  if (sessionVisitor) return sessionVisitor;
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (
      stored &&
      typeof stored === "object" &&
      "name" in stored &&
      "mobile" in stored &&
      typeof stored.name === "string" &&
      typeof stored.mobile === "string" &&
      validDetails(stored.name, stored.mobile)
    ) {
      sessionVisitor = { name: stored.name, mobile: stored.mobile };
    }
  } catch (error) {
    console.error("Could not restore visitor details", error);
  }
  return sessionVisitor;
}

function validDetails(name: string, mobile: string) {
  return (
    name.trim().length >= 2 &&
    name.trim().length <= 80 &&
    /^[0-9+ -]{8,15}$/.test(mobile.trim()) &&
    mobile.replace(/\D/g, "").length >= 8
  );
}

export function VisitorGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, "");
  if (path !== "/venues" && path !== "/film-locations" && !path.startsWith("/venues/")) {
    return children;
  }
  const params = new URLSearchParams(location.searchStr);
  const requirements: Record<string, string> = {};
  for (const key of requirementKeys) {
    const value = params.get(key);
    if (value) requirements[key] = value;
  }
  let searchType: VisitorSearch["search_type"] = "venue";
  const propertySlug = path.startsWith("/venues/")
    ? decodeURIComponent(path.slice("/venues/".length))
    : null;
  if (
    path === "/film-locations" ||
    params.get("category") === "film-shooting-locations" ||
    params.get("purpose") === "film"
  ) {
    searchType = "film";
  } else if (params.get("browse") === "all") {
    searchType = "all";
  } else if (propertySlug && params.get("purpose") !== "venue") {
    searchType = "property";
  }
  return (
    <VisitorAccess
      key={`${path}${location.searchStr}`}
      searchType={searchType}
      propertySlug={propertySlug}
      requirements={requirements}
    >
      {children}
    </VisitorAccess>
  );
}

function VisitorAccess({
  children,
  searchType,
  propertySlug,
  requirements,
}: {
  children: ReactNode;
  searchType: VisitorSearch["search_type"];
  propertySlug: string | null;
  requirements: Record<string, string>;
}) {
  const [details] = useState(readVisitor);
  const [name, setName] = useState(details?.name ?? "");
  const [mobile, setMobile] = useState(details?.mobile ?? "");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(Boolean(details));
  const [error, setError] = useState("");
  const [eventId] = useState(() => crypto.randomUUID());
  const pending = useRef<Promise<void> | null>(null);
  const initialContext = useRef({ searchType, propertySlug, requirements });

  const save = (visitor: VisitorDetails): Promise<void> => {
    if (!pending.current) {
      pending.current = recordVisitorSearch({
        id: eventId,
        visitor_name: visitor.name,
        mobile: visitor.mobile,
        search_type: initialContext.current.searchType,
        property_slug: initialContext.current.propertySlug,
        requirements: initialContext.current.requirements,
      }).then(() => {
        sessionVisitor = visitor;
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visitor));
        } catch (storageError) {
          console.error("Could not remember visitor details", storageError);
          toast.warning("Your details cannot be remembered after a refresh in this browser.");
        }
      });
    }
    return pending.current;
  };

  useEffect(() => {
    if (!details) return;
    let active = true;
    void save(details)
      .then(() => {
        if (active) setAccepted(true);
      })
      .catch((err: unknown) => {
        pending.current = null;
        if (active)
          setError(
            err instanceof Error ? err.message : "Could not save your search. Please try again.",
          );
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
    // The visit context is fixed for this keyed page instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details]);

  if (accepted) return children;
  return (
    <div className="grid min-h-[60vh] place-items-center bg-sand px-4 py-10">
      <form
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-panel"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          if (!validDetails(name, mobile)) {
            setError("Enter your name (2-80 characters) and a valid phone number (8-15 digits).");
            return;
          }
          setBusy(true);
          setError("");
          try {
            await save({ name: name.trim(), mobile: mobile.trim() });
            setAccepted(true);
          } catch (err) {
            pending.current = null;
            setError(
              err instanceof Error ? err.message : "Could not save your search. Please try again.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="font-display text-2xl font-bold text-navy">Before you explore</h1>
        <p className="text-sm text-muted-foreground">
          Share your name and phone number to view properties. We record your search requirements so
          our team can help you find a suitable venue or film location.
        </p>
        <label className="block text-sm font-semibold text-navy">
          Your name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            disabled={busy}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Phone number
          <input
            type="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            required
            maxLength={15}
            autoComplete="tel"
            disabled={busy}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to share these details and searches with our team.{" "}
          <Link to="/privacy" className="underline">
            Privacy policy
          </Link>
          . Your details are remembered for this browser session.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gold px-4 py-3 text-sm font-bold text-gold-foreground disabled:opacity-60"
        >
          {busy
            ? "Saving your search..."
            : error
              ? "Retry and view properties"
              : "Continue to properties"}
        </button>
        <Link to="/" className="block text-center text-sm font-semibold text-navy">
          Back to home
        </Link>
      </form>
    </div>
  );
}
