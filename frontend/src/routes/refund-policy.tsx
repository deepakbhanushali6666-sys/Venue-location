import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { BUSINESS, PLAN, formatINR } from "@/data/business";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy | VENUES LOCATION" },
      {
        name: "description",
        content:
          "VENUES LOCATION refund and cancellation policy for the annual venue listing subscription, including verification timelines and failed payments.",
      },
      { property: "og:title", content: "Refund & Cancellation Policy | VENUES LOCATION" },
      {
        property: "og:description",
        content: "How subscription cancellations, failed payments and refund requests are handled.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Refund,
});

function Refund() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="21 August 2026">
      <section>
        <h2>1. What you are paying for</h2>
        <p>
          The only charge on this platform is the {PLAN.name} — {formatINR(PLAN.amount)} for {PLAN.period} — which
          publishes and maintains your venue listing. Venue booking amounts are paid directly to venue owners and are
          outside our control.
        </p>
      </section>

      <section>
        <h2>2. Payment and activation</h2>
        <ul>
          <li>Payments are made offline by UPI, bank transfer or cheque and submitted with a reference number.</li>
          <li>Our team verifies the reference and activates the listing, normally within 24 working hours.</li>
          <li>An invoice is generated for every verified payment and is available in the owner dashboard.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cancellation</h2>
        <p>
          You may cancel your subscription at any time by writing to us. The listing stays live until the end of the
          paid period; the subscription simply does not renew. Renewal is never automatic — you choose to pay again.
        </p>
      </section>

      <section>
        <h2>4. Refunds</h2>
        <ul>
          <li>
            Full refund if a payment is verified in error, duplicated, or if we are unable to publish your listing.
          </li>
          <li>
            Full refund if you request cancellation within 7 days of activation and no enquiries have been delivered to
            you.
          </li>
          <li>
            No refund after 7 days, or once enquiries have been delivered, since the service has been consumed.
          </li>
          <li>No refund where a listing is suspended for false information or breach of our terms.</li>
        </ul>
      </section>

      <section>
        <h2>5. Rejected payments</h2>
        <p>
          If a submitted reference cannot be verified, the payment is marked rejected with a reason and no amount is
          collected by us. Any money actually debited to a wrong account must be raised with your bank; we will assist
          with the transaction details we hold.
        </p>
      </section>

      <section>
        <h2>6. How to request a refund</h2>
        <p>
          Email{" "}
          <a className="font-bold text-navy" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> with your invoice
          number and payment reference, or call{" "}
          <a className="font-bold text-navy" href={`tel:${BUSINESS.phone}`}>{BUSINESS.phone}</a>. Approved refunds are
          returned to the original payment source within 7–10 working days.
        </p>
      </section>
    </LegalPage>
  );
}
