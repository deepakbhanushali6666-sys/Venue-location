import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, CalendarDays, Clapperboard, Compass, IndianRupee, MapPin, Search, Users } from "lucide-react";
import { budgetBands, capacityBands, categories, cities, eventTypes } from "@/data/venues";

const tabs = [
  { id: "book", label: "Book a Venue", icon: CalendarDays },
  { id: "film", label: "Film Shooting", icon: Clapperboard },
  { id: "all", label: "All Locations", icon: MapPin },
] as const;

type Field = {
  icon: typeof MapPin;
  placeholder: string;
  key: "city" | "date" | "category" | "capacity" | "event" | "budget";
  options?: string[];
  type?: "date";
};

const fields: Field[] = [
  { icon: MapPin, placeholder: "Location / City", key: "city", options: cities },
  { icon: CalendarDays, placeholder: "Event / Shoot Date", key: "date", type: "date" },
  { icon: Building2, placeholder: "Venue Type / Category", key: "category", options: categories.map((c) => c.name) },
  { icon: Users, placeholder: "Guest Capacity", key: "capacity", options: capacityBands.map((b) => b.label) },
  { icon: Compass, placeholder: "Purpose", key: "event", options: eventTypes },
  { icon: IndianRupee, placeholder: "Budget", key: "budget", options: budgetBands.map((b) => b.label) },
];

export function SearchPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("book");
  const [values, setValues] = useState<Partial<Record<Field["key"], string>>>({});

  const set = (key: Field["key"], value: string) => setValues((v) => ({ ...v, [key]: value }));

  const submit = () => {
    const category =
      tab === "film"
        ? "film-shooting-locations"
        : categories.find((c) => c.name === values["category"])?.slug;
    navigate({
      to: "/venues",
      search: {
        ...(category ? { category } : {}),
        ...(values["city"] ? { city: values["city"] } : {}),
        ...(values["capacity"] ? { capacity: values["capacity"] } : {}),
        ...(values["event"] ? { event: values["event"] } : {}),
        ...(values["budget"] ? { budget: values["budget"] } : {}),
      },
    });
  };

  return (
    <div className="w-full rounded-xl bg-navy p-4 shadow-panel sm:p-5">
      <div className="flex flex-wrap gap-1 rounded-lg bg-navy-soft/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold transition-colors ${
              tab === t.id ? "bg-gold text-gold-foreground" : "text-navy-foreground/80 hover:text-navy-foreground"
            }`}
          >
            <t.icon className="size-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="flex items-center gap-2 rounded-md bg-background px-3 py-2.5">
            <f.icon className="size-4 shrink-0 text-navy" />
            {f.options ? (
              <select
                aria-label={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none"
              >
                <option value="">{f.placeholder}</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                aria-label={f.placeholder}
                type="date"
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none"
              />
            )}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 font-display text-base font-extrabold uppercase tracking-wide text-gold-foreground transition-opacity hover:opacity-90"
      >
        <Search className="size-5" /> Search Venues
      </button>
    </div>
  );
}
