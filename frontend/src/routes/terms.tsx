import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { BUSINESS, PLAN, formatINR } from "@/data/business";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | VENUES LOCATION" },
      {
        name: "description",
        content:
          "Terms and conditions for using VENUES LOCATION — venue listings, enquiries, owner subscriptions and platform responsibilities.",
      },
      { property: "og:title", content: "Terms of Service | VENUES LOCATION" },
      {
        property: "og:description",
        content: "Rules for venue owners, clients and enquiries on the VENUES LOCATION platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="21 August 2026">
      <section>
        <h2>1. About this agreement</h2>
        <p>
          These terms govern your use of the VENUES LOCATION website and owner portal, operated by {BUSINESS.legalName},{" "}
          {BUSINESS.address}. By browsing the site, submitting an enquiry or listing a venue, you accept these terms.
        </p>
      </section>

      <section>
        <h2>2. What VENUES LOCATION does</h2>
        <p>
          VENUES LOCATION is a discovery and lead platform for venues and film shooting locations. We publish listings and
          pass enquiries to venue owners. We are not the owner, operator or agent of the venues listed, and we are not a
          party to any booking contract between a client and a venue.
        </p>
      </section>

      <section>
        <h2>3. Enquiries and bookings</h2>
        <ul>
          <li>Enquiry submission does not confirm or reserve any venue.</li>
          <li>Availability, pricing, taxes and final terms are agreed directly with the venue owner.</li>
          <li>Payments for the venue itself are made to the venue owner, not to VENUES LOCATION.</li>
          <li>You must provide accurate contact details so owners can respond.</li>
        </ul>
      </section>

      <section>
        <h2>4. Venue owner obligations</h2>
        <ul>
          <li>Listing content, photos, capacity, pricing and permissions must be accurate and owned by you.</li>
          <li>You must hold all licences and approvals required to host events or shoots at the property.</li>
          <li>Listings are published only after admin review and may be rejected or removed at our discretion.</li>
          <li>You must respond to enquiries in good faith and keep lead statuses updated.</li>
        </ul>
      </section>

      <section>
        <h2>5. Subscription</h2>
        <p>
          Venue listings run on a single plan: {PLAN.name} at {formatINR(PLAN.amount)} for {PLAN.period}. Payment is
          collected offline via UPI or bank transfer; your listing is activated after our team verifies the payment
          reference. An invoice is issued for every verified payment.
        </p>
      </section>

      <section>
        <h2>6. Prohibited use</h2>
        <ul>
          <li>No false listings, scraping, spam enquiries or misuse of owner contact details.</li>
          <li>No unlawful, misleading or infringing content.</li>
          <li>We may suspend accounts that breach these terms without refund.</li>
        </ul>
      </section>

      <section>
        <h2>7. Liability</h2>
        <p>
          To the extent permitted by law, VENUES LOCATION is not liable for disputes, cancellations, damages, losses or
          service failures arising between clients and venue owners. Our total liability in any matter is limited to the
          subscription amount paid to us in the preceding twelve months.
        </p>
      </section>

      <section>
        <h2>8. Governing law</h2>
        <p>
          These terms are governed by the laws of India, with exclusive jurisdiction in the courts of Mumbai,
          Maharashtra.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Questions: <a className="font-bold text-navy" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> ·{" "}
          <a className="font-bold text-navy" href={`tel:${BUSINESS.phone}`}>{BUSINESS.phone}</a>
        </p>
      </section>
    </LegalPage>
  );
}
