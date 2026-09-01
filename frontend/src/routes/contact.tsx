import { createFileRoute } from "@tanstack/react-router";
import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import { CONTACT } from "@/data/venues";
import { EnquiryForm } from "@/components/site/EnquiryForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact VENUES LOCATION | Venue & Location Enquiries" },
      {
        name: "description",
        content:
          "Talk to the VENUES LOCATION team about venues, film shooting locations or listing your property. Call 9768676666 or email info@venueslocation.com.",
      },
      { property: "og:title", content: "Contact VENUES LOCATION" },
      {
        property: "og:description",
        content: "Send your requirement and get a verified shortlist within 24 hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="bg-sand">
      <section className="bg-navy py-14 text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Contact Us</h1>
          <p className="mt-3 max-w-2xl text-navy-foreground/80">
            Tell us what you're planning — a wedding, a corporate offsite or a 20-day shoot schedule — and we'll come
            back with options that fit.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <a
            href={`tel:${CONTACT.phone}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-gold"
          >
            <Phone className="size-6 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Call us</p>
              <p className="font-display text-lg font-bold text-navy">{CONTACT.phone}</p>
            </div>
          </a>
          <a
            href={`https://wa.me/${CONTACT.phoneIntl}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-gold"
          >
            <MessageCircle className="size-6 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp</p>
              <p className="font-display text-lg font-bold text-navy">Chat with our team</p>
            </div>
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-gold"
          >
            <Mail className="size-6 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="font-display text-lg font-bold text-navy">{CONTACT.email}</p>
            </div>
          </a>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <Globe className="size-6 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Website</p>
              <p className="font-display text-lg font-bold text-navy">{CONTACT.site}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="section-title text-lg text-navy">Send an enquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every enquiry is logged with a Lead ID and answered within 24 hours.
          </p>
          <div className="mt-5">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
