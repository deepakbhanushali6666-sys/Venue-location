import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Venue Owners | VENUES LOCATION" },
      {
        name: "description",
        content:
          "Frequently asked questions for venue owners listing on VenuesLocation.com — listings, enquiries, pricing, availability, bookings and support.",
      },
      { property: "og:title", content: "FAQ — Venue Owners | VENUES LOCATION" },
      {
        property: "og:description",
        content:
          "Everything venue owners need to know about listing, receiving enquiries and managing bookings on VenuesLocation.com.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FAQ,
});

type QA = {
  q: string;
  a: React.ReactNode;
};

const faqs: QA[] = [
  {
    q: "What is VenuesLocation.com?",
    a: (
      <>
        <p>
          VenuesLocation.com is an online platform that connects venue and property owners with filmmakers,
          production companies, photographers, advertising agencies, event organisers, content creators and other
          professionals looking for suitable locations.
        </p>
        <p>Venue owners can showcase their spaces and receive enquiries from potential clients.</p>
      </>
    ),
  },
  {
    q: "Who can list a venue on VenuesLocation.com?",
    a: (
      <>
        <p>
          Property owners, venue owners, businesses, studios and authorised representatives can list suitable
          locations on VenuesLocation.com.
        </p>
        <p>
          Examples include homes, apartments, offices, restaurants, hotels, studios, farms, warehouses, industrial
          spaces, gardens, outdoor locations, commercial properties, event venues and other unique spaces.
        </p>
      </>
    ),
  },
  {
    q: "Is it free to list my venue?",
    a: (
      <p>
        Venue owners can create and submit a venue listing on VenuesLocation.com. Any applicable listing fees,
        premium services or other charges will be displayed clearly on the website before they apply.
      </p>
    ),
  },
  {
    q: "How do I list my venue?",
    a: (
      <>
        <p>
          Create an account on VenuesLocation.com and submit your venue details, photographs, location
          information, facilities, availability and pricing.
        </p>
        <p>Your listing may be reviewed by our team before it becomes publicly visible.</p>
      </>
    ),
  },
  {
    q: "What information should I provide?",
    a: (
      <>
        <p>A good listing should include:</p>
        <ul>
          <li>Clear photographs of the venue</li>
          <li>Venue type and description</li>
          <li>Location or area</li>
          <li>Available facilities</li>
          <li>Parking information</li>
          <li>Accessibility information</li>
          <li>Approximate capacity, where relevant</li>
          <li>Available dates or availability information</li>
          <li>Preferred types of shoots or activities</li>
          <li>Your expected rental rate or pricing information</li>
          <li>Any important restrictions or conditions</li>
        </ul>
        <p>
          The more accurate information you provide, the easier it is for clients to determine whether your venue
          is suitable.
        </p>
      </>
    ),
  },
  {
    q: "Can I decide when my venue is available?",
    a: (
      <p>
        Yes. Venue owners remain in control of their venue's availability and can update their availability
        information according to their own requirements.
      </p>
    ),
  },
  {
    q: "Do I have to accept every enquiry?",
    a: (
      <>
        <p>No. An enquiry does not automatically mean that you are required to accept a booking.</p>
        <p>
          You can discuss the requirements with the prospective client and decide whether the proposed shoot,
          event or activity is suitable for your venue.
        </p>
      </>
    ),
  },
  {
    q: "How will I receive enquiries?",
    a: (
      <>
        <p>
          When a client is interested in your venue, they can submit an enquiry through VenuesLocation.com using
          the contact/enquiry facilities available on the platform.
        </p>
        <p>
          You should respond promptly and provide accurate information about availability, pricing and venue
          conditions.
        </p>
      </>
    ),
  },
  {
    q: "What happens after I receive an enquiry?",
    a: (
      <>
        <p>You and the prospective client can discuss the requirements, including:</p>
        <ul>
          <li>Date and time</li>
          <li>Type of production or activity</li>
          <li>Number of people</li>
          <li>Duration</li>
          <li>Equipment requirements</li>
          <li>Parking</li>
          <li>Venue access</li>
          <li>Special requirements</li>
          <li>Pricing</li>
          <li>Any additional conditions</li>
        </ul>
        <p>A booking should only be treated as confirmed once the required booking process has been completed.</p>
      </>
    ),
  },
  {
    q: "How much should I charge for my venue?",
    a: (
      <>
        <p>Venue owners set their own rates, subject to any applicable VenuesLocation policies.</p>
        <p>
          Pricing may depend on factors such as the type and size of the venue, location, duration of use, number
          of people, production requirements, equipment, parking, facilities and the nature of the shoot or event.
        </p>
        <p>
          VenuesLocation may provide general guidance to help venue owners understand market pricing, but the
          final price should be agreed between the relevant parties.
        </p>
      </>
    ),
  },
  {
    q: "Can I change my price later?",
    a: (
      <p>
        Yes. You should keep your pricing information up to date. Any price already agreed for a confirmed booking
        should be honoured according to the applicable booking terms.
      </p>
    ),
  },
  {
    q: "What types of productions can use my venue?",
    a: (
      <>
        <p>Depending on your venue and its suitability, enquiries may come from:</p>
        <ul>
          <li>Feature films</li>
          <li>Short films</li>
          <li>Television productions</li>
          <li>OTT/web series</li>
          <li>Advertisements</li>
          <li>Music videos</li>
          <li>Photo shoots</li>
          <li>Fashion shoots</li>
          <li>Corporate productions</li>
          <li>Interviews</li>
          <li>Content creation</li>
          <li>Brand campaigns</li>
          <li>Events and other approved activities</li>
        </ul>
        <p>You can specify the types of activities you are willing to allow at your venue.</p>
      </>
    ),
  },
  {
    q: "Can I refuse a particular type of shoot?",
    a: (
      <>
        <p>Yes. Venue owners should clearly mention any activities they do not permit.</p>
        <p>You should also discuss the intended use with the client before confirming a booking.</p>
      </>
    ),
  },
  {
    q: "Who is responsible for checking the venue requirements?",
    a: (
      <p>
        Both parties should make sure that the proposed use is suitable and that any necessary permissions,
        licences, insurance, local approvals or other requirements are obtained before the activity takes place.
      </p>
    ),
  },
  {
    q: "Will VenuesLocation guarantee that I will receive bookings?",
    a: (
      <>
        <p>No platform can guarantee a specific number of enquiries or bookings.</p>
        <p>
          The number of enquiries you receive can depend on factors such as your venue's location, photographs,
          description, pricing, availability, suitability and demand.
        </p>
      </>
    ),
  },
  {
    q: "Can I update my photographs and listing?",
    a: (
      <p>
        Yes. Venue owners should keep their listing information, photographs, pricing and availability accurate
        and up to date.
      </p>
    ),
  },
  {
    q: "What happens if a client wants to visit my venue before booking?",
    a: (
      <>
        <p>A client may request a site visit or recce where appropriate.</p>
        <p>
          The venue owner can decide whether to permit a visit and can agree the date, time and conditions
          directly with the prospective client.
        </p>
      </>
    ),
  },
  {
    q: "What if a client wants to cancel?",
    a: (
      <>
        <p>
          Cancellation terms should be agreed and handled according to the applicable VenuesLocation booking terms
          and any specific terms agreed between the venue owner and client.
        </p>
        <p>Venue owners should make cancellation conditions clear before confirming a booking.</p>
      </>
    ),
  },
  {
    q: "What happens if the client causes damage to my property?",
    a: (
      <>
        <p>
          The client/production company should be responsible for complying with the agreed booking conditions
          and for any obligations relating to damage, loss or additional costs.
        </p>
        <p>
          Venue owners should document the condition of the property and communicate any special requirements
          before the booking.
        </p>
        <p>
          The specific responsibilities and remedies are governed by the VenuesLocation Terms & Conditions and the
          applicable booking agreement.
        </p>
      </>
    ),
  },
  {
    q: "Does VenuesLocation inspect every venue?",
    a: (
      <>
        <p>
          A listing being available on VenuesLocation.com should not automatically be interpreted as a guarantee
          that every aspect of a venue has been independently inspected or certified.
        </p>
        <p>
          VenuesLocation may review listings and may take steps to maintain the quality and integrity of the
          platform.
        </p>
      </>
    ),
  },
  {
    q: "Can I remove my venue listing?",
    a: (
      <p>
        Yes, subject to any applicable booking commitments or platform requirements. You can request that your
        listing be removed or made unavailable.
      </p>
    ),
  },
  {
    q: "Can I list more than one venue?",
    a: (
      <p>
        Yes, provided you are authorised to list each property or venue and comply with the VenuesLocation Terms
        & Conditions.
      </p>
    ),
  },
  {
    q: "Can I list a venue that I do not own?",
    a: (
      <>
        <p>
          You must have the legal authority or permission required to advertise and offer the venue for the
          intended use.
        </p>
        <p>You should not submit another person's property without appropriate authorisation.</p>
      </>
    ),
  },
  {
    q: "How can I make my listing more attractive?",
    a: (
      <>
        <p>High-quality photographs and accurate information can help clients understand your venue.</p>
        <p>We recommend:</p>
        <ul>
          <li>Uploading clear, recent photographs</li>
          <li>Showing different rooms and important features</li>
          <li>Providing accurate dimensions where relevant</li>
          <li>Mentioning parking and access</li>
          <li>Clearly stating facilities</li>
          <li>Keeping availability updated</li>
          <li>Providing realistic pricing</li>
          <li>Responding promptly to enquiries</li>
        </ul>
      </>
    ),
  },
  {
    q: "Does VenuesLocation act as an agent for venue owners?",
    a: (
      <>
        <p>
          VenuesLocation is an online platform designed to facilitate connections between venue owners and
          potential clients. Unless specifically stated in the applicable agreement, VenuesLocation does not
          automatically act as the legal agent of a venue owner.
        </p>
        <p>The precise role and responsibilities of VenuesLocation are set out in the Terms & Conditions.</p>
      </>
    ),
  },
  {
    q: "How are payments handled?",
    a: (
      <>
        <p>
          Payment arrangements depend on the booking system and payment options offered by VenuesLocation at the
          time of booking.
        </p>
        <p>
          Where online payment is available, the applicable payment, platform, cancellation and refund terms will
          be displayed before payment is made.
        </p>
      </>
    ),
  },
  {
    q: "Does VenuesLocation charge a commission or platform fee?",
    a: (
      <>
        <p>
          Any applicable commission, service fee, payment processing fee or other charge will be communicated to
          the relevant user before it becomes payable.
        </p>
        <p>Please refer to the current pricing and booking information on VenuesLocation.com.</p>
      </>
    ),
  },
  {
    q: "Is my venue information safe?",
    a: (
      <>
        <p>
          VenuesLocation takes reasonable steps to protect information submitted through the platform. Information
          is handled in accordance with the VenuesLocation Privacy Policy.
        </p>
        <p>
          Venue owners should avoid submitting confidential information that is not necessary for creating or
          managing their listing.
        </p>
      </>
    ),
  },
  {
    q: "What should I do if I receive suspicious or inappropriate enquiries?",
    a: (
      <>
        <p>Do not provide sensitive information or agree to an activity that appears suspicious, unlawful or unsafe.</p>
        <p>
          Report suspicious activity to VenuesLocation as soon as possible and provide the relevant details so
          that the matter can be reviewed.
        </p>
      </>
    ),
  },
  {
    q: "How can I contact VenuesLocation?",
    a: (
      <p>
        If you need assistance with your listing, account, enquiry or booking, please use the contact/support
        options provided on VenuesLocation.com.
      </p>
    ),
  },
  {
    q: "Where can I read the full rules for venue owners?",
    a: (
      <p>
        Please read the VenuesLocation.com <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>{" "}
        before creating a listing or using the platform.
      </p>
    ),
  },
];

function FAQ() {
  return (
    <div>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">For Venue Owners</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-3 max-w-2xl text-sm text-navy-foreground/70">
            Everything you need to know about listing your venue, receiving enquiries and managing bookings on
            VenuesLocation.com.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-border bg-card px-6 shadow-card [&_p]:mt-2 [&_p:first-child]:mt-0 [&_ul]:mt-2 [&_ul]:space-y-1 [&_li]:ml-5 [&_li]:list-disc"
        >
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border last:border-b-0">
              <AccordionTrigger className="font-display text-base font-bold text-navy hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
