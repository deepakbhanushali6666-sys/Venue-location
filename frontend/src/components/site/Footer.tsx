import { Link } from "@tanstack/react-router";
import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { CONTACT, categories } from "@/data/venues";
import { FounderPortrait } from "@/components/site/FounderPortrait";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 11.998 24c6.627 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026c.011 0 .022-.026.032-.026z" />
    </svg>
  );
}


export function Footer() {
  return (
    <footer id="contact" className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/70">
            India's premium platform for venues and film shooting locations. Trusted by production houses for over two
            decades.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <FounderPortrait
              alt="Deepak Bhanushali, founder of VENUES LOCATION"
              sizes="44px"
              width={44}
              height={44}
              className="size-11 rounded-full object-cover object-top"
            />

            <div className="text-sm">
              <div className="font-bold text-navy-foreground">Founded by Deepak Bhanushali</div>
              <div className="text-xs text-navy-foreground/60">25+ years in film locations</div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {[
              { Icon: Phone, href: `tel:${CONTACT.phone}`, label: "Call VENUES LOCATION" },
              { Icon: MessageCircle, href: `https://wa.me/${CONTACT.phoneIntl}`, label: "WhatsApp VENUES LOCATION" },
              { Icon: Mail, href: `mailto:${CONTACT.email}`, label: "Email VENUES LOCATION" },
              { Icon: Globe, href: `https://${CONTACT.site}`, label: "The Location Magazine" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="grid size-9 place-items-center rounded-md bg-navy-soft text-navy-foreground transition-colors hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-navy-foreground/50">Follow us</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { Icon: FacebookIcon, href: CONTACT.social.facebook, label: "Facebook" },
                { Icon: InstagramIcon, href: CONTACT.social.instagram, label: "Instagram" },
                { Icon: TwitterIcon, href: CONTACT.social.twitter, label: "X (Twitter)" },
                { Icon: LinkedInIcon, href: CONTACT.social.linkedin, label: "LinkedIn" },
                { Icon: YouTubeIcon, href: CONTACT.social.youtube, label: "YouTube" },
                { Icon: PinterestIcon, href: CONTACT.social.pinterest, label: "Pinterest" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Follow VENUES LOCATION on ${label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-9 place-items-center rounded-md bg-navy-soft text-navy-foreground transition-colors hover:text-gold"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

        </div>

        <div>
          <h3 className="section-title text-sm text-gold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/80">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to="/venues" search={{ category: c.slug }} className="hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="section-title text-sm text-gold">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/80">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/founder" className="hover:text-gold">About Founder</Link></li>
            <li><Link to="/film-locations" className="hover:text-gold">Film Shooting Locations</Link></li>
            <li><Link to="/list-your-venue" className="hover:text-gold">List Your Venue</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="section-title text-sm text-gold">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/80">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-gold" />
              <a href={`tel:${CONTACT.phone}`} className="hover:text-gold">{CONTACT.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-gold" />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-gold">{CONTACT.email}</a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="size-4 text-gold" />
              <a
                href={`https://${CONTACT.site}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                {CONTACT.site}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4 text-gold" />
              <a
                href={`https://wa.me/${CONTACT.phoneIntl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                WhatsApp enquiry
              </a>
            </li>

          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-foreground/60">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link to="/terms" className="hover:text-gold">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:text-gold">Refund & Cancellation</Link>
          <Link to="/faq" className="hover:text-gold">FAQ</Link>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} VENUES LOCATION. All rights reserved.</div>
      </div>

    </footer>
  );
}
