import { MapPin } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-10 place-items-center rounded-full bg-gold text-gold-foreground">
        <MapPin className="size-5" strokeWidth={2.5} />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-2xl font-extrabold tracking-tight ${light ? "text-navy-foreground" : "text-navy"}`}
        >
          VENUES<span className="text-gold"> LOCATION</span>
        </span>
        <span
          className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] ${
            light ? "text-navy-foreground/70" : "text-muted-foreground"
          }`}
        >
          Venues • Locations • Memories
        </span>
      </span>
    </div>
  );
}
