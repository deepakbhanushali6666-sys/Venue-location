export function VenuePhotoWatermark({ src }: { src: string | undefined }) {
  if (!src || /\/wm-[^/?]+\.jpg(?:\?|$)|%2fwm-[^/?]+\.jpg/i.test(src)) return null;

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 grid place-items-center overflow-hidden">
      <span className="max-w-[85%] select-none text-center font-display text-[clamp(10px,5cqw,72px)] font-extrabold uppercase leading-none text-white/40 [text-shadow:0_1px_5px_rgba(0,0,0,0.85)]">
        VENUES LOCATION
      </span>
    </span>
  );
}