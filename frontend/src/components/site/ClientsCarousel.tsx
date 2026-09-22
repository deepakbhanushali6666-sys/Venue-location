const logoNumbers = Array.from({ length: 57 }, (_, i) => i + 1).filter((n) => n !== 44);

const logos = logoNumbers.map((n) => {
  const name = String(n).padStart(2, "0");
  return { src: `/clients/${name}.jpg`, alt: `Client logo ${name}` };
});

export function ClientsCarousel() {
  // Duplicate the list so the marquee loops seamlessly.
  const track = [...logos, ...logos];

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="flex w-max animate-clients-marquee items-center gap-8 py-2 group-hover:paused"
      >
        {track.map((logo, i) => (
          <div
            key={`${logo.src}-${i}`}
            className="flex h-32 w-56 shrink-0 items-center justify-center rounded-md bg-card p-4 shadow-card"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              loading="lazy"
              width={224}
              height={128}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
