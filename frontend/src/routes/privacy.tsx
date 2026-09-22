import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | VENUES LOCATION" },
      {
        name: "description",
        content:
          "How VenuesLocation.com collects, uses, stores, protects and shares information about venue owners, clients and other users.",
      },
      { property: "og:title", content: "Privacy Policy | VENUES LOCATION" },
      {
        property: "og:description",
        content:
          "Privacy practices for VenuesLocation.com — account, venue, enquiry, subscription and technical information.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="22 September 2026">
      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to VenuesLocation.com ("VenuesLocation", "we", "us" or "our").
        </p>
        <p>VenuesLocation.com is owned and operated by Deepak Bhanushali.</p>
        <p>
          This Privacy Policy explains how VenuesLocation collects, uses, stores, protects and shares information
          when you visit or use our website, create an account, list a venue, submit an enquiry, communicate with
          another User, purchase a subscription or otherwise use our services.
        </p>
        <p>By using VenuesLocation.com, you acknowledge that you have read and understood this Privacy Policy.</p>
      </section>

      <section>
        <h2>2. Who We Are</h2>
        <p>
          <strong>Website:</strong> VenuesLocation.com
        </p>
        <p>
          <strong>Owned and operated by:</strong> Deepak Bhanushali
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a className="font-bold text-navy" href="mailto:info@venueslocation.com">
            info@venueslocation.com
          </a>
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          <a className="font-bold text-navy" href="tel:+919768676666">
            9768676666
          </a>
        </p>
        <p>
          <strong>Address:</strong> Wing B/113, Park Plaza Building, Off Yari Road, Versova, Panch Marg, Next to
          Panch Vati Tower, Opp. Fisheries Education College, Andheri West, Mumbai – 400061, Maharashtra, India.
        </p>
        <p>For privacy-related questions or requests, you may contact us using the details above.</p>
      </section>

      <section>
        <h2>3. Information We May Collect</h2>
        <p>Depending on how you use VenuesLocation, we may collect information such as:</p>

        <h3 className="mt-4 font-display text-base font-bold text-navy">Account Information</h3>
        <p>When you create an account, we may collect:</p>
        <ul>
          <li>Name;</li>
          <li>Email address;</li>
          <li>Mobile/telephone number;</li>
          <li>Password or authentication information;</li>
          <li>User type or account type;</li>
          <li>Profile information; and</li>
          <li>Other information required to operate your account.</li>
        </ul>

        <h3 className="mt-4 font-display text-base font-bold text-navy">Venue Information</h3>
        <p>If you list a venue, we may collect:</p>
        <ul>
          <li>Venue name;</li>
          <li>Venue description;</li>
          <li>Property/location information;</li>
          <li>Photographs;</li>
          <li>Videos;</li>
          <li>Facilities;</li>
          <li>Parking information;</li>
          <li>Capacity;</li>
          <li>Availability;</li>
          <li>Pricing;</li>
          <li>Venue rules;</li>
          <li>Contact information; and</li>
          <li>Other information you choose to provide.</li>
        </ul>
        <p>Some venue information may be displayed publicly on the Platform.</p>

        <h3 className="mt-4 font-display text-base font-bold text-navy">Enquiry and Communication Information</h3>
        <p>When you contact a Venue Owner or Client through VenuesLocation, we may collect information relating to:</p>
        <ul>
          <li>Enquiry details;</li>
          <li>Messages;</li>
          <li>Contact information;</li>
          <li>Date and time of enquiry;</li>
          <li>Venue requested;</li>
          <li>Production or activity information; and</li>
          <li>Other information voluntarily provided by you.</li>
        </ul>

        <h3 className="mt-4 font-display text-base font-bold text-navy">Subscription Information</h3>
        <p>
          If you purchase a VenuesLocation subscription, we may collect information necessary to manage the
          subscription, such as:
        </p>
        <ul>
          <li>Subscription plan;</li>
          <li>Transaction reference;</li>
          <li>Payment status;</li>
          <li>Subscription start and expiry dates;</li>
          <li>Billing information; and</li>
          <li>Other information provided during the subscription process.</li>
        </ul>
        <p>
          Where payments are processed by a third-party payment provider, that provider may separately process
          payment information under its own privacy policy and terms.
        </p>
        <p>
          VenuesLocation does not need to store your full card, banking or payment credentials where payment
          processing is handled by a third-party payment provider.
        </p>

        <h3 className="mt-4 font-display text-base font-bold text-navy">Technical Information</h3>
        <p>When you use our website, certain technical information may automatically be collected, such as:</p>
        <ul>
          <li>IP address;</li>
          <li>Browser type;</li>
          <li>Device type;</li>
          <li>Operating system;</li>
          <li>Date and time of access;</li>
          <li>Pages visited;</li>
          <li>Referring website;</li>
          <li>General usage information; and</li>
          <li>Technical logs.</li>
        </ul>
        <p>
          This information may help us maintain security, improve performance and understand how the Platform is
          being used.
        </p>
      </section>

      <section>
        <h2>4. How We Use Your Information</h2>
        <p>We may use information collected through VenuesLocation for purposes including:</p>
        <ul>
          <li>Creating and managing User accounts;</li>
          <li>Publishing and managing Venue Listings;</li>
          <li>Connecting Clients with Venue Owners;</li>
          <li>Processing enquiries;</li>
          <li>Facilitating communication;</li>
          <li>Providing Platform services;</li>
          <li>Managing subscriptions;</li>
          <li>Processing or supporting subscription payments;</li>
          <li>Providing customer support;</li>
          <li>Verifying or reviewing Listings;</li>
          <li>Preventing fraud and misuse;</li>
          <li>Maintaining Platform security;</li>
          <li>Improving the website;</li>
          <li>Analysing Platform usage;</li>
          <li>Sending important service communications;</li>
          <li>Sending marketing communications where permitted;</li>
          <li>Complying with applicable legal obligations; and</li>
          <li>Protecting the rights, property and safety of VenuesLocation and its Users.</li>
        </ul>
        <p>
          We will not use personal information for purposes that are materially incompatible with the purposes
          described in this Privacy Policy unless permitted or required by applicable law.
        </p>
      </section>

      <section>
        <h2>5. Venue Information That May Be Public</h2>
        <p>
          When a Venue Owner creates a Listing, certain information may be displayed publicly on
          VenuesLocation.com.
        </p>
        <p>This may include:</p>
        <ul>
          <li>Venue name;</li>
          <li>Venue photographs;</li>
          <li>Venue videos;</li>
          <li>General location information;</li>
          <li>Description;</li>
          <li>Facilities;</li>
          <li>Availability;</li>
          <li>Pricing;</li>
          <li>Venue category; and</li>
          <li>Other information intentionally provided for publication.</li>
        </ul>
        <p>
          Venue Owners should not upload private, confidential or unnecessary personal information in a public
          Listing.
        </p>
      </section>

      <section>
        <h2>6. Sharing Information With Other Users</h2>
        <p>The purpose of VenuesLocation is to connect Venue Owners and Clients.</p>
        <p>
          When you submit an enquiry or otherwise choose to communicate with another User, certain information may
          be shared with the relevant User to enable communication.
        </p>
        <p>For example, depending on the Platform functionality, this may include:</p>
        <ul>
          <li>Your name;</li>
          <li>Contact information;</li>
          <li>Enquiry details;</li>
          <li>Production or activity details; and</li>
          <li>Other information you voluntarily provide.</li>
        </ul>
        <p>
          Users should understand that information shared directly with another User may be subject to that User's
          own handling of the information.
        </p>
        <p>
          VenuesLocation is not responsible for how another User uses information after it has been lawfully shared
          with that User.
        </p>
      </section>

      <section>
        <h2>7. Service Providers and Third Parties</h2>
        <p>We may use trusted third-party service providers to help operate VenuesLocation.</p>
        <p>These may include providers of:</p>
        <ul>
          <li>Website hosting;</li>
          <li>Cloud storage;</li>
          <li>Email services;</li>
          <li>Analytics;</li>
          <li>Security services;</li>
          <li>Maps and location services;</li>
          <li>Authentication;</li>
          <li>Customer support;</li>
          <li>Payment processing;</li>
          <li>Subscription management; and</li>
          <li>Other technical services.</li>
        </ul>
        <p>These providers may process information on our behalf where necessary to provide their services.</p>
        <p>
          We expect service providers handling personal information on our behalf to apply appropriate safeguards
          and use information only for permitted purposes.
        </p>
      </section>

      <section>
        <h2>8. Payment Information</h2>
        <p>VenuesLocation currently does not collect or hold venue booking payments.</p>
        <p>Clients pay Venue Owners directly according to the booking arrangements made between them.</p>
        <p>VenuesLocation may process or facilitate payment for VenuesLocation subscription services.</p>
        <p>
          Where a third-party payment provider is used, payment information may be processed directly by that
          provider.
        </p>
        <p>Users should review the applicable payment provider's terms and privacy policy.</p>
      </section>

      <section>
        <h2>9. Cookies and Similar Technologies</h2>
        <p>VenuesLocation may use cookies and similar technologies.</p>
        <p>Cookies may be used for purposes such as:</p>
        <ul>
          <li>Keeping Users signed in;</li>
          <li>Remembering preferences;</li>
          <li>Website functionality;</li>
          <li>Security;</li>
          <li>Analytics;</li>
          <li>Improving website performance; and</li>
          <li>Understanding how visitors use the Platform.</li>
        </ul>
        <p>You may be able to control or disable cookies through your browser settings.</p>
        <p>Disabling certain cookies may affect some website functionality.</p>
      </section>

      <section>
        <h2>10. Analytics</h2>
        <p>We may use analytics tools to understand how visitors use VenuesLocation.</p>
        <p>Analytics information may include:</p>
        <ul>
          <li>Pages visited;</li>
          <li>Time spent on pages;</li>
          <li>Device information;</li>
          <li>Browser information;</li>
          <li>General geographic information;</li>
          <li>Traffic sources; and</li>
          <li>Website interaction information.</li>
        </ul>
        <p>Analytics helps us improve the Platform and understand which features are useful to Users.</p>
      </section>

      <section>
        <h2>11. Marketing Communications</h2>
        <p>Where permitted by applicable law, we may send Users information about:</p>
        <ul>
          <li>New VenuesLocation features;</li>
          <li>Subscription plans;</li>
          <li>Platform updates;</li>
          <li>Promotions;</li>
          <li>Services;</li>
          <li>Venue-related opportunities; and</li>
          <li>Other information that may be relevant to the User.</li>
        </ul>
        <p>
          Users may opt out of promotional communications by using the unsubscribe facility provided in the
          communication or by contacting us.
        </p>
        <p>
          We may still send essential service-related communications, such as account, security, subscription or
          transaction-related messages.
        </p>
      </section>

      <section>
        <h2>12. Data Security</h2>
        <p>We take reasonable technical and organisational measures to protect personal information against:</p>
        <ul>
          <li>Unauthorised access;</li>
          <li>Unauthorised disclosure;</li>
          <li>Loss;</li>
          <li>Misuse;</li>
          <li>Alteration; and</li>
          <li>Destruction.</li>
        </ul>
        <p>However, no internet transmission or electronic storage system can be guaranteed to be completely secure.</p>
        <p>Users are responsible for protecting their account passwords and login credentials.</p>
      </section>

      <section>
        <h2>13. How Long We Keep Information</h2>
        <p>
          We retain information for as long as reasonably necessary for the purposes for which it was collected,
          including:
        </p>
        <ul>
          <li>Providing our services;</li>
          <li>Maintaining accounts;</li>
          <li>Managing Listings;</li>
          <li>Managing subscriptions;</li>
          <li>Resolving disputes;</li>
          <li>Preventing fraud;</li>
          <li>Maintaining business records;</li>
          <li>Complying with legal obligations; and</li>
          <li>Protecting our legal rights.</li>
        </ul>
        <p>
          When information is no longer reasonably required, we may delete, anonymise or securely dispose of it,
          subject to applicable legal and operational requirements.
        </p>
      </section>

      <section>
        <h2>14. Your Choices and Rights</h2>
        <p>
          Depending on applicable law and the circumstances, you may have rights concerning your personal
          information.
        </p>
        <p>These may include the ability to:</p>
        <ul>
          <li>Request information about personal data we process;</li>
          <li>Request correction of inaccurate information;</li>
          <li>Request deletion of information where legally applicable;</li>
          <li>Withdraw consent where processing is based on consent;</li>
          <li>Request information regarding how your data is processed;</li>
          <li>Request assistance with privacy-related concerns; and</li>
          <li>Make a complaint regarding the handling of your personal information.</li>
        </ul>
        <p>Requests can be made by contacting:</p>
        <p>
          Email:{" "}
          <a className="font-bold text-navy" href="mailto:info@venueslocation.com">
            info@venueslocation.com
          </a>
        </p>
        <p>We may need to verify your identity or account ownership before acting on certain requests.</p>
      </section>

      <section>
        <h2>15. Withdrawal of Consent</h2>
        <p>
          Where we process personal information based on your consent, you may withdraw that consent where
          applicable.
        </p>
        <p>Withdrawal of consent does not affect processing that was lawfully carried out before withdrawal.</p>
        <p>
          If you withdraw consent that is necessary for a particular Platform feature, we may not be able to
          continue providing that feature.
        </p>
      </section>

      <section>
        <h2>16. Children's Privacy</h2>
        <p>
          VenuesLocation is intended primarily for adults and businesses involved in venue, production,
          photography, events and related activities.
        </p>
        <p>
          We do not knowingly request or intentionally collect personal information from children where such
          collection is not permitted by applicable law.
        </p>
        <p>
          If you believe that a child has provided personal information to us improperly, please contact us so
          that we can review the matter.
        </p>
      </section>

      <section>
        <h2>17. Third-Party Websites</h2>
        <p>VenuesLocation may contain links to third-party websites, services or platforms.</p>
        <p>We are not responsible for the privacy practices, content or security of third-party websites.</p>
        <p>
          Users should review the privacy policies of third-party services before providing personal information
          to them.
        </p>
      </section>

      <section>
        <h2>18. Publicly Available Venue Information</h2>
        <p>
          Venue Owners should understand that information intentionally published as part of a public Venue
          Listing may be accessible to visitors to VenuesLocation.com.
        </p>
        <p>Venue Owners should not publish:</p>
        <ul>
          <li>Passwords;</li>
          <li>Banking credentials;</li>
          <li>Government identification numbers;</li>
          <li>Private correspondence;</li>
          <li>Sensitive personal information; or</li>
          <li>Other information they do not want publicly available.</li>
        </ul>
      </section>

      <section>
        <h2>19. International Processing</h2>
        <p>Some of our technology, hosting or service providers may process information in locations outside India.</p>
        <p>
          Where personal information is processed outside India, we will take steps required by applicable law and
          our contractual arrangements with relevant service providers.
        </p>
      </section>

      <section>
        <h2>20. Fraud, Security and Legal Requirements</h2>
        <p>We may collect, use, retain or disclose information where reasonably necessary to:</p>
        <ul>
          <li>Detect or prevent fraud;</li>
          <li>Investigate misuse of the Platform;</li>
          <li>Protect Users;</li>
          <li>Protect VenuesLocation;</li>
          <li>Investigate security incidents;</li>
          <li>Enforce our Terms & Conditions;</li>
          <li>Respond to lawful requests; or</li>
          <li>Comply with applicable laws, regulations or legal processes.</li>
        </ul>
      </section>

      <section>
        <h2>21. Business Transfers</h2>
        <p>
          If VenuesLocation or its assets are involved in a merger, acquisition, restructuring, sale or other
          business transaction, information held by us may be transferred as part of that transaction, subject to
          applicable law and appropriate safeguards.
        </p>
      </section>

      <section>
        <h2>22. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time.</p>
        <p>When we make changes, we will update the "Last Updated" date at the beginning of this Policy.</p>
        <p>
          Where required by applicable law, we may provide additional notice or obtain consent for material
          changes.
        </p>
        <p>Users should periodically review this Privacy Policy.</p>
      </section>

      <section>
        <h2>23. Applicable Data Protection Law</h2>
        <p>
          VenuesLocation intends to handle personal information in accordance with applicable Indian
          data-protection and privacy requirements.
        </p>
        <p>
          India's Digital Personal Data Protection Act, 2023 establishes a framework governing the processing of
          digital personal data, including obligations concerning notice, consent and rights of individuals. The
          Government of India notified the Digital Personal Data Protection Rules, 2025 on 13 November 2025, with
          provisions coming into force in phases according to the notified commencement schedule.
        </p>
        <p>
          As the legal and regulatory framework develops, VenuesLocation may update its privacy practices and this
          Privacy Policy accordingly.
        </p>
      </section>

      <section>
        <h2>24. Contact Us</h2>
        <p>
          If you have questions, concerns or requests regarding this Privacy Policy or your personal information,
          please contact:
        </p>
        <p>
          <strong>VenuesLocation.com</strong>
        </p>
        <p>Owned and operated by: Deepak Bhanushali</p>
        <p>
          Email:{" "}
          <a className="font-bold text-navy" href="mailto:info@venueslocation.com">
            info@venueslocation.com
          </a>
        </p>
        <p>
          Phone:{" "}
          <a className="font-bold text-navy" href="tel:+919768676666">
            9768676666
          </a>
        </p>
        <p>
          Address: Wing B/113, Park Plaza Building, Off Yari Road, Versova, Panch Marg, Next to Panch Vati Tower,
          Opp. Fisheries Education College, Andheri West, Mumbai – 400061, Maharashtra, India.
        </p>
        <p>
          Website:{" "}
          <a className="font-bold text-navy" href="https://www.venueslocation.com">
            www.venueslocation.com
          </a>
        </p>
      </section>

      <section>
        <h2>Privacy Commitment</h2>
        <p>
          VenuesLocation aims to collect only information reasonably necessary to operate and improve the
          Platform, connect Venue Owners with Clients, provide subscription services, maintain security and comply
          with applicable requirements.
        </p>
        <p>We do not sell personal information simply as a source of revenue.</p>
      </section>
    </LegalPage>
  );
}
