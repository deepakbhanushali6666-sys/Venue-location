import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "./Logo";
import { CONTACT } from "@/data/venues";

const nav = [
  { to: "/", label: "Home" },
  { to: "/venues", label: "Venues" },
  { to: "/film-locations", label: "Film Locations" },
  { to: "/list-your-venue", label: "List Your Venue" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-gold data-[status=active]:text-navy data-[status=active]:underline data-[status=active]:decoration-gold data-[status=active]:decoration-2 data-[status=active]:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/auth" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-gold">
            Owner Login
          </Link>
          <a
            href={`tel:${CONTACT.phone}`}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground transition-opacity hover:opacity-90"
          >
            <Phone className="size-4" /> {CONTACT.phone}
          </a>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-md border border-border lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-semibold last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="border-t border-border/60 py-3 text-sm font-bold text-gold"
            >
              Owner Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
