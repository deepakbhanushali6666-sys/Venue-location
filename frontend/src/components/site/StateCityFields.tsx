import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { listLocations, type LocationRecord } from "@/lib/api";
import { citiesForState } from "@/lib/locations";

export function StateCityFields({
  initialState = "",
  initialCity = "",
  className,
}: {
  initialState?: string;
  initialCity?: string;
  className: string;
}) {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const form = stateRef.current?.form;
    const reset = () => {
      setState(initialState);
      setCity(initialCity);
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [initialState, initialCity]);
  useEffect(() => {
    let cancelled = false;
    listLocations()
      .then(({ locations: rows }) => {
        if (!cancelled) setLocations(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          toast.error(err instanceof Error ? err.message : "Could not load states and cities");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const stateNames = locations
    .filter((location) => location.kind === "state")
    .map((location) => location.name);
  const cityNames = state ? citiesForState(locations, state) : [];
  return (
    <>
      <select
        ref={stateRef}
        name="state"
        aria-label="State"
        required
        value={state}
        className={className}
        onChange={(event) => {
          setState(event.target.value);
          setCity("");
        }}
      >
        <option value="">{loading ? "Loading states..." : "State*"}</option>
        {initialState && !stateNames.includes(initialState) && <option>{initialState}</option>}
        {stateNames.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <select
        name="city"
        aria-label="City"
        required
        value={city}
        className={className}
        onChange={(event) => setCity(event.target.value)}
      >
        <option value="">
          {loading
            ? "Loading cities..."
            : !state
              ? "Select a state first"
              : cityNames.length
                ? "City*"
                : "No cities added for this state"}
        </option>
        {state === initialState &&
          city === initialCity &&
          initialCity &&
          !cityNames.includes(initialCity) && <option>{initialCity}</option>}
        {cityNames.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
    </>
  );
}
