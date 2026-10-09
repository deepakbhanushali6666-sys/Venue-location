import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clapperboard,
  Compass,
  IndianRupee,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import {
  budgetBands,
  capacityBands,
  categories as defaultCategories,
  cities as defaultCities,
  eventTypes,
} from "@/data/venues";
import { listCategories, listLocations, listPurposes, type CategoryRecord } from "@/lib/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const tabs = [
  { id: "book", label: "Book a Venue", icon: CalendarDays },
  { id: "film", label: "Film Shooting", icon: Clapperboard },
  { id: "all", label: "All Locations", icon: MapPin },
] as const;

type Field = {
  icon: typeof MapPin;
  placeholder: string;
  key: "city" | "date" | "category" | "subcategory" | "capacity" | "event" | "budget";
  options?: string[];
  type?: "date";
};

const fields: Field[] = [
  { icon: MapPin, placeholder: "Location / City", key: "city" },
  { icon: CalendarDays, placeholder: "Event / Shoot Date", key: "date", type: "date" },
  { icon: Building2, placeholder: "Venue Type / Category", key: "category" },
  { icon: Building2, placeholder: "Subcategory", key: "subcategory" },
  {
    icon: Users,
    placeholder: "Guest Capacity",
    key: "capacity",
    options: capacityBands.map((b) => b.label),
  },
  { icon: Compass, placeholder: "Purpose", key: "event" },
  {
    icon: IndianRupee,
    placeholder: "Budget",
    key: "budget",
    options: budgetBands.map((b) => b.label),
  },
];

export function SearchPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("book");
  const [values, setValues] = useState<Partial<Record<Field["key"], string>>>({});
  const [venueCategories, setVenueCategories] = useState<CategoryRecord[]>([]);
  const [filmCategories, setFilmCategories] = useState<CategoryRecord[]>([]);
  const [openPicker, setOpenPicker] = useState<"category" | "subcategory" | null>(null);
  const [locationCities, setLocationCities] = useState<string[]>(defaultCities);
  const [purposes, setPurposes] = useState<string[]>(eventTypes);

  useEffect(() => {
    listCategories()
      .then(({ categories: rows }) => setVenueCategories(rows))
      .catch(() =>
        setVenueCategories(
          defaultCategories.map((category, sort_order) => ({
            ...category,
            id: category.slug,
            sort_order,
            subcategories: [],
          })),
        ),
      );
    listCategories("film")
      .then(({ categories: rows }) => setFilmCategories(rows))
      .catch(() => setFilmCategories([]));
    listLocations()
      .then(({ locations }) =>
        setLocationCities(
          locations.filter((location) => location.kind === "city").map((location) => location.name),
        ),
      )
      .catch(() => setLocationCities(defaultCities));
    listPurposes()
      .then(({ purposes: rows }) => setPurposes(rows.map((purpose) => purpose.name)))
      .catch(() => setPurposes(eventTypes));
  }, []);

  const set = (key: Field["key"], value: string) =>
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "category" ? { subcategory: "" } : {}),
    }));
  const venueCategorySlugs = new Set(venueCategories.map((category) => category.slug));
  const categoryOptions =
    tab === "film"
      ? filmCategories.filter((category) => !venueCategorySlugs.has(category.slug))
      : venueCategories;
  const categorySelection = values.category ?? "";
  const selectedCategory = categoryOptions.find((category) => category.slug === categorySelection);
  const categoryLabel = selectedCategory
    ? selectedCategory.name
    : tab === "film"
      ? "Film Location Type"
      : "Venue Type / Category";

  const submit = () => {
    const category = values.category;
    const subcategory = values.subcategory;
    if (tab === "film") {
      navigate({
        to: "/film-locations",
        search: {
          ...(values["date"] ? { date: values["date"] } : {}),
          ...(category ? { category } : {}),
          ...(category && subcategory ? { subcategory } : {}),
          ...(values["city"] ? { city: values["city"] } : {}),
          ...(values["capacity"] ? { capacity: values["capacity"] } : {}),
          ...(values["event"] ? { event: values["event"] } : {}),
          ...(values["budget"] ? { budget: values["budget"] } : {}),
        },
      });
      return;
    }
    navigate({
      to: "/venues",
      search: {
        ...(tab === "all" ? { browse: "all" } : {}),
        ...(values["date"] ? { date: values["date"] } : {}),
        ...(category ? { category } : {}),
        ...(category && subcategory ? { subcategory } : {}),
        ...(values["city"] ? { city: values["city"] } : {}),
        ...(values["capacity"] ? { capacity: values["capacity"] } : {}),
        ...(values["event"] ? { event: values["event"] } : {}),
        ...(values["budget"] ? { budget: values["budget"] } : {}),
      },
    });
  };

  return (
    <div className="w-full rounded-xl bg-navy p-4 shadow-panel sm:p-5">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-navy-soft/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-label={t.label}
            aria-pressed={tab === t.id}
            title={t.label}
            onClick={() => {
              if (tab === t.id) return;
              setTab(t.id);
              set("category", "");
              setOpenPicker(null);
            }}
            className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-md px-1 py-2.5 text-xs font-bold transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
              tab === t.id
                ? "bg-gold text-gold-foreground"
                : "text-navy-foreground/80 hover:text-navy-foreground"
            }`}
          >
            <t.icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="text-center leading-tight">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const isSubcategory = f.key === "subcategory";
          const pickerKey = isSubcategory ? "subcategory" : "category";
          const pickerOptions = isSubcategory
            ? (selectedCategory?.subcategories ?? []).map((subcategory) => ({
                id: subcategory.id,
                name: subcategory.name,
                value: subcategory.name,
              }))
            : categoryOptions.map((category) => ({
                id: category.id,
                name: category.name,
                value: category.slug,
              }));
          const pickerValue = values[pickerKey] ?? "";
          const pickerLabel = isSubcategory
            ? values.subcategory ||
              (!selectedCategory
                ? "Choose a category first"
                : pickerOptions.length
                  ? "Subcategory (optional)"
                  : "No subcategories")
            : categoryLabel;
          return (
            <label
              key={f.key}
              className="flex min-w-0 items-center gap-2 rounded-md bg-background px-3 py-2.5"
            >
              <f.icon className="size-4 shrink-0 text-navy" />
              {f.key === "category" || isSubcategory ? (
                <Popover
                  open={openPicker === pickerKey}
                  onOpenChange={(open) => setOpenPicker(open ? pickerKey : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-label={
                        isSubcategory
                          ? "Subcategory"
                          : tab === "film"
                            ? "Film Location Type"
                            : f.placeholder
                      }
                      aria-expanded={openPicker === pickerKey}
                      disabled={isSubcategory && pickerOptions.length === 0}
                      className="flex min-w-0 w-full items-center justify-between gap-2 bg-transparent text-left text-sm text-foreground outline-none disabled:opacity-50"
                    >
                      <span className={`truncate ${pickerValue ? "" : "text-muted-foreground"}`}>
                        {pickerLabel}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                  >
                    <Command
                      filter={(value, search) =>
                        value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
                          ? 1
                          : 0
                      }
                    >
                      <CommandInput
                        placeholder={
                          isSubcategory ? "Search subcategories..." : "Search categories..."
                        }
                        aria-label={isSubcategory ? "Search subcategories" : "Search categories"}
                        className="text-base"
                      />
                      <CommandList className="max-h-[min(60dvh,24rem)]">
                        <CommandEmpty>
                          No matching {isSubcategory ? "subcategories" : "categories"}.
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value={isSubcategory ? "all subcategories" : "all categories"}
                            onSelect={() => {
                              set(pickerKey, "");
                              setOpenPicker(null);
                            }}
                          >
                            <Check
                              className={`size-4 ${pickerValue ? "opacity-0" : "opacity-100"}`}
                            />
                            {isSubcategory ? "All subcategories" : "All categories"}
                          </CommandItem>
                          {pickerOptions.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.name}
                              onSelect={() => {
                                set(pickerKey, option.value);
                                setOpenPicker(null);
                              }}
                            >
                              <Check
                                className={`size-4 ${pickerValue === option.value ? "opacity-100" : "opacity-0"}`}
                              />
                              <span className="min-w-0 wrap-break-word">{option.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : f.options || f.key === "city" || f.key === "event" ? (
                <select
                  aria-label={f.placeholder}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                >
                  <option value="">{f.placeholder}</option>
                  {f.key === "city" &&
                    locationCities.map((city) => <option key={city}>{city}</option>)}
                  {f.key === "event" &&
                    purposes.map((purpose) => <option key={purpose}>{purpose}</option>)}
                  {f.options?.map((option) => (
                    <option key={option}>{option}</option>
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
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 font-display text-base font-extrabold uppercase tracking-wide text-gold-foreground transition-opacity hover:opacity-90"
      >
        <Search className="size-5" />
        {tab === "film"
          ? "Search Film Locations"
          : tab === "all"
            ? "Search All Locations"
            : "Search Venues"}
      </button>
    </div>
  );
}
