import type { LocationRecord } from "@/lib/api";
import { cities, states, MAHARASHTRA_CITIES } from "@/data/venues";

export const fallbackLocations: LocationRecord[] = [
  ...states.map((name) => ({
    id: name,
    name,
    kind: "state" as const,
    sort_order: 0,
    state_id: null,
  })),
  ...cities.map((name) => ({
    id: `city-${name}`,
    name,
    kind: "city" as const,
    sort_order: 0,
    state_id: MAHARASHTRA_CITIES.includes(name) ? "Maharashtra" : null,
  })),
];

export function citiesForState(locations: LocationRecord[], state: string) {
  const stateId = locations.find(
    (location) => location.kind === "state" && location.name === state,
  )?.id;
  return [
    ...new Set(
      locations
        .filter(
          (location) =>
            location.kind === "city" &&
            (!state || (stateId !== undefined && location.state_id === stateId)),
        )
        .map((location) => location.name),
    ),
  ].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}
