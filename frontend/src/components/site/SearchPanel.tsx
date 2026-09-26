import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, CalendarDays, Clapperboard, Compass, IndianRupee, MapPin, Search, Users } from "lucide-react";
import { budgetBands, capacityBands, categories as defaultCategories, cities as defaultCities, eventTypes } from "@/data/venues";
import { listCategories, listLocations, listPurposes, type CategoryRecord } from "@/lib/api";

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
  { icon: MapPin, placeholder: "Location / City", key: "city" },
  { icon: CalendarDays, placeholder: "Event / Shoot Date", key: "date", type: "date" },
  { icon: Building2, placeholder: "Venue Type / Category", key: "category" },
  { icon: Users, placeholder: "Guest Capacity", key: "capacity", options: capacityBands.map((b) => b.label) },
  { icon: Compass, placeholder: "Purpose", key: "event" },
  { icon: IndianRupee, placeholder: "Budget", key: "budget", options: budgetBands.map((b) => b.label) },
];

export function SearchPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("book");
  const [values, setValues] = useState<Partial<Record<Field["key"], string>>>({});
  const [venueCategories, setVenueCategories] = useState<CategoryRecord[]>([]);
  const [locationCities, setLocationCities] = useState<string[]>(defaultCities);
  const [purposes, setPurposes] = useState<string[]>(eventTypes);

  useEffect(() => {
    listCategories()
      .then(({ categories: rows }) => setVenueCategories(rows))
      .catch(() => setVenueCategories(defaultCategories.map((category, sort_order) => ({ ...category, id: category.slug, sort_order, subcategories: [] }))));
    listLocations()
      .then(({ locations }) => setLocationCities(locations.filter((location) => location.kind === "city").map((location) => location.name)))
      .catch(() => setLocationCities(defaultCities));
    listPurposes()
      .then(({ purposes: rows }) => setPurposes(rows.map((purpose) => purpose.name)))
      .catch(() => setPurposes(eventTypes));
  }, []);

  const set = (key: Field["key"], value: string) => setValues((v) => ({ ...v, [key]: value }));

  const submit = () => {
    const categorySelection = values["category"] ?? "";
    const [selectionType, selectedCategory, selectedSubcategory] = categorySelection.split(":");
    const category = tab === "film" ? "film-shooting-locations" : selectedCategory;
    navigate({
      to: "/venues",
      search: {
        ...(category ? { category } : {}),
        ...(tab !== "film" && selectionType === "subcategory" && selectedSubcategory
          ? { subcategory: selectedSubcategory }
          : {}),
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
            {f.options || f.key === "city" || f.key === "event" || f.key === "category" ? (
              <select
                aria-label={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none"
              >
                <option value="">{f.placeholder}</option>
                {f.key === "city" && locationCities.map((city) => <option key={city}>{city}</option>)}
                {f.key === "event" && purposes.map((purpose) => <option key={purpose}>{purpose}</option>)}
                {f.key === "category" && venueCategories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    <option value={`category:${category.slug}`}>{category.name}</option>
                    {category.subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={`subcategory:${category.slug}:${subcategory.name}`}>
                        {subcategory.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {f.options?.map((option) => <option key={option}>{option}</option>)}
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
