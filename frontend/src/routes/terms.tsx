import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | VENUES LOCATION" },
      {
        name: "description",
        content:
          "Terms and conditions for using VenuesLocation.com — venue listings, enquiries, bookings, subscriptions and platform responsibilities.",
      },
      { property: "og:title", content: "Terms & Conditions | VENUES LOCATION" },
      {
        property: "og:description",
        content:
          "Rules for venue owners, clients and enquiries on the VenuesLocation.com platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms & Conditions" updated="22 September 2026">
      <section>
        <h2>1. About VenuesLocation.com</h2>
        <p>
          Welcome to VenuesLocation.com ("VenuesLocation", "we", "us" or "our").
        </p>
        <p>
          VenuesLocation.com is an online platform owned and operated by <strong>Deepak Bhanushali</strong> that
          connects venue and property owners with filmmakers, production companies, photographers, advertising
          agencies, event organisers, content creators, businesses and other individuals or organisations looking
          for suitable locations.
        </p>
        <p>The Platform may be used for purposes including:</p>
        <ul>
          <li>Films and short films</li>
          <li>Television productions</li>
          <li>OTT and web series</li>
          <li>Advertisements and brand campaigns</li>
          <li>Photography and fashion shoots</li>
          <li>Music videos</li>
          <li>Corporate productions</li>
          <li>Interviews and content creation</li>
          <li>Events</li>
          <li>Other legitimate commercial or creative activities</li>
        </ul>
        <p>
          VenuesLocation provides an online platform for discovering and connecting with venues. Unless expressly
          stated otherwise, VenuesLocation does not own, operate, manage or control the venues listed on the
          Platform.
        </p>
      </section>

      <section>
        <h2>2. Acceptance of These Terms</h2>
        <p>
          By accessing or using VenuesLocation.com, creating an account, submitting a venue, contacting a venue
          owner, making an enquiry or otherwise using our services, you agree to these Terms & Conditions.
        </p>
        <p>If you do not agree with these Terms, please do not use VenuesLocation.com.</p>
        <p>
          If you use VenuesLocation on behalf of a company, production house, agency or other organisation, you
          confirm that you have authority to accept these Terms on its behalf.
        </p>
      </section>

      <section>
        <h2>3. Definitions</h2>
        <ul>
          <li>
            <strong>"Platform"</strong> means VenuesLocation.com and its related online services.
          </li>
          <li>
            <strong>"Venue"</strong> or <strong>"Location"</strong> means a property, premises, space or location
            listed on the Platform.
          </li>
          <li>
            <strong>"Venue Owner"</strong> means the owner, authorised representative, manager or other person
            legally authorised to list a Venue.
          </li>
          <li>
            <strong>"Client"</strong> means a person, company, production house, agency, photographer, filmmaker,
            event organiser, business or other user looking to use a Venue.
          </li>
          <li>
            <strong>"Listing"</strong> means the information, photographs, videos, descriptions, pricing,
            availability and other content submitted for a Venue.
          </li>
          <li>
            <strong>"Booking"</strong> means an arrangement between a Venue Owner and Client for the use of a
            Venue.
          </li>
          <li>
            <strong>"User"</strong> means any person or organisation using the Platform.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Eligibility and User Accounts</h2>
        <p>Certain features of VenuesLocation may require users to create an account.</p>
        <p>Users are responsible for:</p>
        <ul>
          <li>Providing accurate information;</li>
          <li>Keeping account information updated;</li>
          <li>Keeping login credentials confidential;</li>
          <li>Preventing unauthorised use of their account; and</li>
          <li>Informing VenuesLocation of suspected unauthorised access.</li>
        </ul>
        <p>Users must not create accounts using false identities or misleading information.</p>
        <p>
          VenuesLocation may suspend or terminate accounts that violate these Terms or are used for fraudulent,
          unlawful or abusive purposes.
        </p>
      </section>

      <section>
        <h2>5. Free Venue Listing</h2>
        <p>
          VenuesLocation currently allows eligible Venue Owners to list their venues free of listing charges.
        </p>
        <p>Free listing does not guarantee:</p>
        <ul>
          <li>Enquiries;</li>
          <li>Bookings;</li>
          <li>Revenue;</li>
          <li>A specific search position;</li>
          <li>A particular number of visitors; or</li>
          <li>A minimum number of Clients.</li>
        </ul>
        <p>
          VenuesLocation may introduce different listing options, premium features or paid services in the future.
        </p>
      </section>

      <section>
        <h2>6. Paid Subscription Services</h2>
        <p>
          VenuesLocation may offer optional paid subscription plans to Venue Owners, Clients, agencies, businesses
          or other Users.
        </p>
        <p>
          Subscription plans may provide additional features, visibility, tools or services as described on the
          applicable subscription page.
        </p>
        <p>
          Before purchasing a subscription, the applicable price, duration, features and payment terms will be
          displayed to the User.
        </p>
        <p>A subscription is separate from any venue booking.</p>
        <p>
          Payment for a subscription does not guarantee bookings, enquiries, revenue or business opportunities.
        </p>
        <p>
          VenuesLocation may change, introduce, upgrade, downgrade or discontinue subscription plans in accordance
          with applicable terms and applicable law.
        </p>
      </section>

      <section>
        <h2>7. Venue Listings</h2>
        <p>Venue Owners may submit Venues for publication on VenuesLocation.com.</p>
        <p>A Venue Owner must ensure that all information submitted is accurate, current and not misleading.</p>
        <p>Listings may contain:</p>
        <ul>
          <li>Venue photographs;</li>
          <li>Videos;</li>
          <li>Venue descriptions;</li>
          <li>Location information;</li>
          <li>Facilities;</li>
          <li>Parking information;</li>
          <li>Capacity;</li>
          <li>Accessibility information;</li>
          <li>Availability;</li>
          <li>Pricing;</li>
          <li>Permitted activities;</li>
          <li>Venue rules; and</li>
          <li>Other relevant information.</li>
        </ul>
        <p>VenuesLocation may review a Listing before publication.</p>
        <p>We may approve, reject, edit, suspend or remove a Listing where reasonably necessary.</p>
      </section>

      <section>
        <h2>8. Venue Owner Authority</h2>
        <p>
          By submitting a Venue, the Venue Owner confirms that they have the necessary ownership, permission,
          authority or legal right to advertise the Venue.
        </p>
        <p>Venue Owners must not list a property without appropriate authority.</p>
        <p>
          The Venue Owner is responsible for obtaining any permissions required from landlords, property owners,
          management associations, authorities or other relevant parties.
        </p>
      </section>

      <section>
        <h2>9. Listing Photographs, Videos and Content</h2>
        <p>Venue Owners may upload photographs, videos and other material relating to their Venues.</p>
        <p>
          The Venue Owner is responsible for ensuring that they have the necessary rights and permissions to
          provide such material.
        </p>
        <p>
          By uploading content to VenuesLocation, the Venue Owner grants VenuesLocation a non-exclusive,
          royalty-free licence to display, reproduce, publish and use the content for operating, promoting and
          marketing the Platform.
        </p>
        <p>This may include displaying the content on VenuesLocation.com and associated promotional channels.</p>
        <p>VenuesLocation may resize, crop or technically modify uploaded material for presentation purposes.</p>
        <p>The Venue Owner remains responsible for the ownership and legality of the content they upload.</p>
      </section>

      <section>
        <h2>10. Accuracy of Venue Information</h2>
        <p>Venue Owners must keep their Listings reasonably accurate and up to date.</p>
        <p>This includes:</p>
        <ul>
          <li>Photographs;</li>
          <li>Description;</li>
          <li>Availability;</li>
          <li>Pricing;</li>
          <li>Facilities;</li>
          <li>Access information;</li>
          <li>Capacity;</li>
          <li>Restrictions; and</li>
          <li>Other important information.</li>
        </ul>
        <p>VenuesLocation is not responsible for inaccurate information supplied by a Venue Owner.</p>
      </section>

      <section>
        <h2>11. Enquiries</h2>
        <p>Clients may contact Venue Owners through the enquiry facilities available on the Platform.</p>
        <p>An enquiry does not automatically constitute a Booking.</p>
        <p>Venue Owners may decide whether they wish to proceed with an enquiry.</p>
        <p>The parties may discuss:</p>
        <ul>
          <li>Date and time;</li>
          <li>Duration;</li>
          <li>Type of production or activity;</li>
          <li>Number of people;</li>
          <li>Equipment;</li>
          <li>Vehicles;</li>
          <li>Parking;</li>
          <li>Access;</li>
          <li>Pricing;</li>
          <li>Security;</li>
          <li>Cleaning;</li>
          <li>Damage deposit;</li>
          <li>Insurance;</li>
          <li>Special requirements; and</li>
          <li>Other conditions.</li>
        </ul>
      </section>

      <section>
        <h2>12. Bookings</h2>
        <p>VenuesLocation does not confirm bookings on behalf of Venue Owners.</p>
        <p>
          A Booking is confirmed directly between the Venue Owner and Client when both parties agree to the
          applicable booking terms.
        </p>
        <p>The parties should clearly agree, where applicable:</p>
        <ul>
          <li>Date;</li>
          <li>Time;</li>
          <li>Duration;</li>
          <li>Venue charges;</li>
          <li>Purpose of use;</li>
          <li>Number of people;</li>
          <li>Payment terms;</li>
          <li>Cancellation conditions;</li>
          <li>Damage responsibilities;</li>
          <li>Access arrangements; and</li>
          <li>Any special conditions.</li>
        </ul>
        <p>VenuesLocation is not a party to the Booking unless expressly stated otherwise.</p>
      </section>

      <section>
        <h2>13. Venue Payments</h2>
        <p>At the current launch stage of VenuesLocation:</p>
        <p>
          <strong>Clients pay Venue Owners directly.</strong>
        </p>
        <p>
          VenuesLocation does not currently collect or hold venue-hire payments on behalf of Venue Owners.
        </p>
        <p>The Venue Owner and Client are responsible for agreeing:</p>
        <ul>
          <li>Venue hire charges;</li>
          <li>Payment method;</li>
          <li>Payment schedule;</li>
          <li>Deposits;</li>
          <li>Cancellation charges;</li>
          <li>Refund arrangements; and</li>
          <li>Any applicable taxes or other statutory obligations.</li>
        </ul>
      </section>

      <section>
        <h2>14. No Booking Commission at Launch</h2>
        <p>
          At the current launch stage, VenuesLocation does not charge a commission on venue booking amounts.
        </p>
        <p>The amount agreed between a Venue Owner and Client is paid directly between those parties.</p>
        <p>VenuesLocation may generate revenue through optional subscription plans and other services.</p>
        <p>
          VenuesLocation reserves the right to introduce booking commissions, service fees or other charges in the
          future.
        </p>
        <p>Any new charge applicable to a User will be communicated before the charge becomes applicable.</p>
      </section>

      <section>
        <h2>15. Responsibilities of Venue Owners</h2>
        <p>Venue Owners are responsible for:</p>
        <ul>
          <li>Providing accurate Listing information;</li>
          <li>Having authority to offer the Venue;</li>
          <li>Maintaining reasonable safety standards;</li>
          <li>Clearly communicating Venue rules;</li>
          <li>Providing accurate availability;</li>
          <li>Communicating pricing accurately;</li>
          <li>Responding appropriately to enquiries;</li>
          <li>Honouring confirmed bookings;</li>
          <li>Informing Clients of material restrictions; and</li>
          <li>Complying with applicable laws and regulations.</li>
        </ul>
        <p>Venue Owners should not accept a Booking that they know they cannot fulfil.</p>
      </section>

      <section>
        <h2>16. Responsibilities of Clients</h2>
        <p>Clients are responsible for:</p>
        <ul>
          <li>Providing accurate information about their proposed activity;</li>
          <li>Using the Venue only for the agreed purpose;</li>
          <li>Following Venue rules;</li>
          <li>Taking reasonable care of the Venue;</li>
          <li>Ensuring that their crew, employees, contractors and guests follow the agreed rules;</li>
          <li>Obtaining required permits and approvals;</li>
          <li>Complying with applicable laws;</li>
          <li>Leaving the Venue in the agreed condition; and</li>
          <li>Paying the Venue Owner according to the agreed terms.</li>
        </ul>
      </section>

      <section>
        <h2>17. Damage to Property</h2>
        <p>Clients are responsible for taking reasonable care of the Venue during their use.</p>
        <p>
          Where damage, loss, excessive cleaning or restoration is caused by a Client, its employees, contractors,
          crew, guests or other persons under its responsibility, the Client may be responsible for the resulting
          costs.
        </p>
        <p>
          Venue Owners and Clients should agree any security deposit or damage-related conditions before
          confirming a Booking.
        </p>
        <p>
          VenuesLocation is not responsible for disputes concerning property damage between a Venue Owner and
          Client.
        </p>
      </section>

      <section>
        <h2>18. Safety and Insurance</h2>
        <p>
          Venue Owners and Clients are responsible for determining what safety measures, insurance, licences,
          permissions and approvals are required for their particular activity.
        </p>
        <p>Depending on the nature of a production or event, appropriate insurance may be advisable or required.</p>
        <p>
          VenuesLocation does not automatically provide insurance coverage to Venue Owners, Clients, productions,
          events, equipment or property.
        </p>
      </section>

      <section>
        <h2>19. Cancellation</h2>
        <p>Cancellation terms should be agreed between the Venue Owner and Client before the Booking is confirmed.</p>
        <p>
          Where VenuesLocation introduces a specific cancellation policy for a particular service or Booking,
          that policy will apply where applicable.
        </p>
        <p>
          Because bookings are confirmed directly between Venue Owners and Clients, the parties should clearly
          establish cancellation and refund conditions before confirming a Booking.
        </p>
      </section>

      <section>
        <h2>20. Refunds</h2>
        <p>
          Any refund relating to a venue Booking is primarily a matter between the Venue Owner and Client,
          subject to their agreed Booking terms and applicable law.
        </p>
        <p>
          VenuesLocation does not hold venue-hire payments at the current launch stage and therefore does not
          automatically process venue-hire refunds.
        </p>
        <p>
          Subscription refunds, where applicable, will be governed by the subscription terms displayed at the time
          of purchase.
        </p>
      </section>

      <section>
        <h2>21. VenuesLocation's Role</h2>
        <p>VenuesLocation operates as an online platform connecting Venue Owners and Clients.</p>
        <p>VenuesLocation does not generally:</p>
        <ul>
          <li>Own listed Venues;</li>
          <li>Operate listed Venues;</li>
          <li>Manage listed Venues;</li>
          <li>Set Venue Owner prices;</li>
          <li>Confirm bookings;</li>
          <li>Collect venue-hire payments;</li>
          <li>Charge booking commission at the current launch stage;</li>
          <li>Guarantee Venue availability;</li>
          <li>Guarantee the accuracy of User information;</li>
          <li>Guarantee that an enquiry will become a Booking; or</li>
          <li>Guarantee the quality or suitability of any Venue.</li>
        </ul>
        <p>
          Users should independently evaluate whether a Venue or proposed Booking is appropriate for their
          requirements.
        </p>
      </section>

      <section>
        <h2>22. Direct Relationship Between Venue Owner and Client</h2>
        <p>The commercial relationship relating to a Venue Booking is directly between the Venue Owner and Client.</p>
        <p>The parties are responsible for agreeing all relevant terms before proceeding.</p>
        <p>VenuesLocation encourages both parties to maintain written records of their Booking arrangements.</p>
      </section>

      <section>
        <h2>23. Disputes Between Users</h2>
        <p>Venue Owners and Clients should first attempt to resolve disputes directly.</p>
        <p>Disputes may relate to:</p>
        <ul>
          <li>Payment;</li>
          <li>Cancellation;</li>
          <li>Refunds;</li>
          <li>Damage;</li>
          <li>Venue condition;</li>
          <li>Availability;</li>
          <li>Access;</li>
          <li>Overtime;</li>
          <li>Misrepresentation; or</li>
          <li>Other Booking matters.</li>
        </ul>
        <p>
          VenuesLocation may, at its discretion, assist with communication or provide relevant Platform
          information.
        </p>
        <p>
          However, unless expressly agreed otherwise, VenuesLocation is not a party to the Booking and does not
          guarantee resolution of disputes between Users.
        </p>
      </section>

      <section>
        <h2>24. Prohibited Activities</h2>
        <p>Users must not use VenuesLocation to:</p>
        <ul>
          <li>Commit or facilitate unlawful activity;</li>
          <li>Provide false information;</li>
          <li>Create fraudulent Listings;</li>
          <li>Impersonate another person or organisation;</li>
          <li>Harass or threaten other Users;</li>
          <li>Upload malicious software;</li>
          <li>Attempt unauthorised access to the Platform;</li>
          <li>Interfere with Platform operations;</li>
          <li>Violate another person's intellectual property rights;</li>
          <li>Send spam or unwanted communications;</li>
          <li>Collect personal information improperly;</li>
          <li>Circumvent Platform security measures; or</li>
          <li>Use the Platform for purposes that violate applicable laws.</li>
        </ul>
      </section>

      <section>
        <h2>25. Avoiding Platform Fees</h2>
        <p>
          Where VenuesLocation introduces applicable subscription, service or other Platform charges, Users must
          not intentionally misuse the Platform to avoid charges that would otherwise apply.
        </p>
        <p>
          This does not prevent Venue Owners and Clients from communicating directly where such communication is
          permitted.
        </p>
      </section>

      <section>
        <h2>26. Intellectual Property</h2>
        <p>
          The VenuesLocation name, logo, website design, software, graphics, text, databases, trademarks and other
          Platform materials are owned by or licensed to VenuesLocation unless otherwise stated.
        </p>
        <p>
          Users may not reproduce, copy, distribute, modify or commercially exploit VenuesLocation intellectual
          property without appropriate permission.
        </p>
        <p>
          User-uploaded photographs, videos and other content remain subject to the rights of their respective
          owners.
        </p>
      </section>

      <section>
        <h2>27. User Content</h2>
        <p>Users are responsible for all content they submit to VenuesLocation.</p>
        <p>Content must not:</p>
        <ul>
          <li>Be unlawful;</li>
          <li>Be fraudulent;</li>
          <li>Be misleading;</li>
          <li>Infringe copyright;</li>
          <li>Infringe another person's rights;</li>
          <li>Contain malware;</li>
          <li>Contain unnecessary confidential information;</li>
          <li>Be threatening or abusive; or</li>
          <li>Violate applicable laws.</li>
        </ul>
        <p>VenuesLocation may remove content that we reasonably believe violates these Terms.</p>
      </section>

      <section>
        <h2>28. Privacy</h2>
        <p>
          Personal information collected through VenuesLocation is handled in accordance with the VenuesLocation
          Privacy Policy.
        </p>
        <p>Users should read the Privacy Policy before using the Platform.</p>
        <p>
          VenuesLocation will handle personal information in accordance with applicable data-protection
          requirements.
        </p>
      </section>

      <section>
        <h2>29. Third-Party Services</h2>
        <p>VenuesLocation may use third-party services for functions such as:</p>
        <ul>
          <li>Website hosting;</li>
          <li>Email;</li>
          <li>Analytics;</li>
          <li>Maps;</li>
          <li>Authentication;</li>
          <li>Payment processing for subscriptions; and</li>
          <li>Other technical services.</li>
        </ul>
        <p>Third-party services may have their own terms and privacy policies.</p>
      </section>

      <section>
        <h2>30. Platform Availability</h2>
        <p>We aim to keep VenuesLocation.com available and functioning reliably.</p>
        <p>However, we do not guarantee uninterrupted access.</p>
        <p>
          The Platform may occasionally be unavailable due to maintenance, technical problems, hosting issues,
          security incidents, network failures, third-party service failures or circumstances outside our
          reasonable control.
        </p>
      </section>

      <section>
        <h2>31. Suspension or Removal of Listings</h2>
        <p>VenuesLocation may suspend, restrict or remove an account or Listing if:</p>
        <ul>
          <li>Information is false or misleading;</li>
          <li>These Terms are breached;</li>
          <li>Fraudulent activity is suspected;</li>
          <li>The Listing creates a safety concern;</li>
          <li>The Platform is misused;</li>
          <li>Applicable law requires action; or</li>
          <li>We reasonably believe action is necessary to protect Users or the Platform.</li>
        </ul>
        <p>Where appropriate, VenuesLocation may provide the User with an opportunity to address the issue.</p>
      </section>

      <section>
        <h2>32. Account Termination</h2>
        <p>Users may stop using VenuesLocation at any time.</p>
        <p>
          VenuesLocation may suspend or terminate access where necessary because of a breach of these Terms,
          fraudulent activity, security concerns, legal requirements or other legitimate reasons.
        </p>
        <p>Termination does not remove obligations that arose before termination.</p>
      </section>

      <section>
        <h2>33. Disclaimer</h2>
        <p>VenuesLocation provides the Platform on an "as available" basis.</p>
        <p>We do not guarantee:</p>
        <ul>
          <li>The accuracy of every Listing;</li>
          <li>The availability of every Venue;</li>
          <li>The conduct of every User;</li>
          <li>That a Client will complete a Booking;</li>
          <li>That a Venue Owner will accept an enquiry;</li>
          <li>That a Venue will meet a Client's expectations;</li>
          <li>That a Booking will proceed as planned; or</li>
          <li>That the Platform will always be error-free or uninterrupted.</li>
        </ul>
        <p>Users are responsible for making their own decisions regarding Venues and Bookings.</p>
      </section>

      <section>
        <h2>34. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, VenuesLocation shall not be responsible for losses
          arising from matters outside our direct control, including disputes, actions or omissions of Venue Owners
          or Clients.
        </p>
        <p>This may include, where legally permitted:</p>
        <ul>
          <li>Property damage;</li>
          <li>Personal injury;</li>
          <li>Cancellation;</li>
          <li>Loss of production;</li>
          <li>Loss of profits;</li>
          <li>Loss of business;</li>
          <li>Loss of opportunity;</li>
          <li>Inaccurate Listing information;</li>
          <li>Venue availability issues; or</li>
          <li>Disputes between Users.</li>
        </ul>
        <p>Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.</p>
      </section>

      <section>
        <h2>35. Indemnity</h2>
        <p>
          To the extent permitted by applicable law, Users agree to indemnify and hold VenuesLocation harmless
          against reasonable claims, losses, liabilities, costs and expenses arising from:
        </p>
        <ul>
          <li>Their breach of these Terms;</li>
          <li>Their unlawful use of the Platform;</li>
          <li>Their User Content;</li>
          <li>Their infringement of another person's rights;</li>
          <li>Their activities at a Venue; or</li>
          <li>Their breach of an agreement with another User.</li>
        </ul>
      </section>

      <section>
        <h2>36. Force Majeure</h2>
        <p>
          VenuesLocation will not be responsible for failure or delay caused by circumstances beyond our reasonable
          control.
        </p>
        <p>
          These may include natural disasters, fire, flood, epidemics, government restrictions, war, civil
          disturbance, telecommunications failures, power failures, cyber incidents, strikes or other circumstances
          beyond reasonable control.
        </p>
      </section>

      <section>
        <h2>37. Changes to These Terms</h2>
        <p>VenuesLocation may update these Terms from time to time.</p>
        <p>
          The latest version will be published on VenuesLocation.com with the applicable "Last Updated" date.
        </p>
        <p>Users should periodically review these Terms.</p>
        <p>
          Continued use of the Platform after changes become effective may constitute acceptance of the updated
          Terms, subject to applicable law.
        </p>
      </section>

      <section>
        <h2>38. Governing Law and Jurisdiction</h2>
        <p>These Terms shall be governed by the laws applicable in India.</p>
        <p>
          Subject to applicable law, disputes relating to these Terms or use of VenuesLocation.com shall be subject
          to the jurisdiction of the appropriate courts in Mumbai, Maharashtra, India.
        </p>
      </section>

      <section>
        <h2>39. Severability</h2>
        <p>
          If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will
          continue to apply to the extent permitted by law.
        </p>
      </section>

      <section>
        <h2>40. No Waiver</h2>
        <p>
          Failure by VenuesLocation to enforce any provision of these Terms immediately does not mean that
          VenuesLocation has waived its right to enforce that provision in the future.
        </p>
      </section>

      <section>
        <h2>41. Entire Agreement</h2>
        <p>
          These Terms, together with the VenuesLocation Privacy Policy, applicable Subscription Terms, Booking
          Terms and other policies published on VenuesLocation.com, constitute the applicable terms governing use
          of the Platform.
        </p>
        <p>
          Where specific terms apply to a particular service, those specific terms will apply to that service.
        </p>
      </section>

      <section>
        <h2>42. Contact</h2>
        <p>
          <strong>VenuesLocation.com</strong>
        </p>
        <p>Owned and operated by: Deepak Bhanushali</p>
        <p>
          Website:{" "}
          <a className="font-bold text-navy" href="https://www.venueslocation.com">
            www.venueslocation.com
          </a>
        </p>
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
          Business Address: Wing B/113, Park Plaza Bldg, off Yari Road, Versova, Punch Marg, next to Punch Vati
          Tower, opp Fishery Education College, Andheri West, Mumbai 400 061
        </p>
      </section>

      <section>
        <h2>Important</h2>
        <p>
          VenuesLocation reserves the right to update these Terms as the Platform develops and new features or
          services are introduced.
        </p>
        <p>The commercial model currently described in these Terms is:</p>
        <p>
          Free venue listing + optional paid subscriptions + no booking commission at launch + direct payment
          between Client and Venue Owner + direct booking confirmation between Client and Venue Owner.
        </p>
      </section>
    </LegalPage>
  );
}
