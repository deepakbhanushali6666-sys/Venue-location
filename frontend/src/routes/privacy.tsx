import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { BUSINESS } from "@/data/business";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | VENUES LOCATION" },
      {
        name: "description",
        content:
          "How VENUES LOCATION collects, uses, stores and protects your personal data when you enquire about a venue or list a property.",
      },
      { property: "og:title", content: "Privacy Policy | VENUES LOCATION" },
      {
        property: "og:description",
        content: "Data we collect, why we collect it, how long we keep it and your rights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="21 August 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          {BUSINESS.legalName}, {BUSINESS.address}, is the data controller for personal information collected through
          this website and owner portal.
        </p>
      </section>

      <section>
        <h2>2. Data we collect</h2>
        <ul>
          <li>Enquiry data: name, mobile number, email, event purpose, date, budget, guest count and message.</li>
          <li>Owner account data: name, mobile, email and login credentials handled by our authentication provider.</li>
          <li>Listing data: venue details, address, photos and video links you upload.</li>
          <li>Payment records: amount, method, transaction reference and invoice number. We never store card details.</li>
          <li>Technical data: basic logs required to operate and secure the service.</li>
        </ul>
      </section>

      <section>
        <h2>3. Why we use it</h2>
        <ul>
          <li>To pass your enquiry to the relevant venue owner so they can respond.</li>
          <li>To publish approved venue listings and operate the owner dashboard.</li>
          <li>To verify subscription payments and issue invoices.</li>
          <li>To prevent fraud, misuse and spam, and to meet legal and tax obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Who we share it with</h2>
        <p>
          Enquiry details are shared with the venue owner you enquired about, and with our administrators. We also use
          service providers for hosting, database, storage and authentication. We do not sell your personal data.
        </p>
      </section>

      <section>
        <h2>5. Storage and security</h2>
        <p>
          Data is stored on managed cloud infrastructure with row-level access controls, so owners can only see leads
          for their own venues. Venue photos are held in private storage and served through expiring signed links.
        </p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          Leads and listings are retained while the account is active and for as long as needed for legitimate business
          or statutory record-keeping. Invoices and payment records are retained as required by Indian tax law.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          You may request access, correction or deletion of your personal data, or withdraw consent to marketing
          contact, by writing to{" "}
          <a className="font-bold text-navy" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. We respond within
          30 days.
        </p>
      </section>

      <section>
        <h2>8. Cookies and local storage</h2>
        <p>
          We use essential cookies and browser storage to keep you signed in and to enable offline app features. We do
          not use advertising trackers.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Privacy queries:{" "}
          <a className="font-bold text-navy" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> ·{" "}
          <a className="font-bold text-navy" href={`tel:${BUSINESS.phone}`}>{BUSINESS.phone}</a>
        </p>
      </section>
    </LegalPage>
  );
}
