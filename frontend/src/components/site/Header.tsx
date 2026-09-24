import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Logo } from "./Logo";
import { CONTACT } from "@/data/venues";

const nav = [
  { to: "/", label: "Home" },
  { to: "/venues", label: "Venues" },
  { to: "/film-locations", label: "Film Locations" },
  { to: "/list-your-venue", label: "List Your Venue" },
  { to: "/contact", label: "Contact" },
] as const;

const aboutLinks = [
  { to: "/team", label: "Our Team" },
  { to: "/advisors", label: "Advisors" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.slice(0, 4).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-gold data-[status=active]:text-navy data-[status=active]:underline data-[status=active]:decoration-gold data-[status=active]:decoration-2 data-[status=active]:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button
              type="button"
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              className="flex items-center gap-1 text-sm font-semibold text-foreground/80 transition-colors hover:text-gold"
            >
              About Us <ChevronDown className="size-3.5" />
            </button>
            {aboutOpen && (
              <div className="absolute left-0 top-full min-w-40 rounded-md border border-border bg-background py-1.5 shadow-panel">
                {aboutLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setAboutOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {nav.slice(4).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-gold data-[status=active]:text-navy data-[status=active]:underline data-[status=active]:decoration-gold data-[status=active]:decoration-2 data-[status=active]:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-gold"
          >
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
            {nav.slice(0, 4).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-semibold last:border-0"
              >
                {item.label}
              </Link>
            ))}

            <div className="border-b border-border/60">
              <button
                type="button"
                onClick={() => setMobileAboutOpen((v) => !v)}
                aria-expanded={mobileAboutOpen}
                className="flex w-full items-center justify-between py-3 text-sm font-semibold"
              >
                About Us
                <ChevronDown
                  className={`size-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileAboutOpen && (
                <div className="pb-2 pl-3">
                  {aboutLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        setOpen(false);
                        setMobileAboutOpen(false);
                      }}
                      className="block py-2 text-sm font-semibold text-foreground/80"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {nav.slice(4).map((item) => (
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
