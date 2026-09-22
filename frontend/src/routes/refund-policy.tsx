import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Subscription & Refund Policy | VENUES LOCATION" },
      {
        name: "description",
        content:
          "VenuesLocation.com subscription and refund policy — free listings, paid plans, cancellation, refunds and payment failures.",
      },
      { property: "og:title", content: "Subscription & Refund Policy | VENUES LOCATION" },
      {
        property: "og:description",
        content: "How VenuesLocation subscriptions, cancellations, refunds and disputes are handled.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Refund,
});

function Refund() {
  return (
    <LegalPage title="Subscription & Refund Policy" updated="22 September 2026">
      <section>
        <h2>1. About This Policy</h2>
        <p>
          This Subscription & Refund Policy explains the terms applicable to paid subscription plans offered
          through VenuesLocation.com ("VenuesLocation", "we", "us" or "our").
        </p>
        <p>VenuesLocation.com is owned and operated by Deepak Bhanushali.</p>
        <p>This Policy should be read together with the VenuesLocation Terms & Conditions and Privacy Policy.</p>
        <p>
          By purchasing or using a VenuesLocation subscription, you agree to this Policy and the applicable Terms
          & Conditions.
        </p>
      </section>

      <section>
        <h2>2. Free Venue Listings</h2>
        <p>
          VenuesLocation may allow eligible Venue Owners to create and maintain a basic venue listing without
          paying a listing fee.
        </p>
        <p>A free listing does not require a subscription.</p>
        <p>A free listing does not guarantee:</p>
        <ul>
          <li>Enquiries;</li>
          <li>Bookings;</li>
          <li>Revenue;</li>
          <li>Search ranking;</li>
          <li>Visibility;</li>
          <li>Leads; or</li>
          <li>Any minimum number of Clients.</li>
        </ul>
        <p>
          VenuesLocation may offer optional paid subscription plans that provide additional features or services.
        </p>
      </section>

      <section>
        <h2>3. Paid Subscription Plans</h2>
        <p>
          VenuesLocation may offer paid subscription plans to Venue Owners, Clients, agencies, production
          companies, businesses or other eligible Users.
        </p>
        <p>Depending on the plan, subscription benefits may include features such as:</p>
        <ul>
          <li>Enhanced listing visibility;</li>
          <li>Additional listing features;</li>
          <li>Promotional opportunities;</li>
          <li>Additional photos, videos or information;</li>
          <li>Priority or enhanced exposure;</li>
          <li>Additional enquiry or communication features;</li>
          <li>Business tools;</li>
          <li>Profile enhancements; or</li>
          <li>Other features specifically described on the applicable subscription page.</li>
        </ul>
        <p>The exact benefits of each subscription will be displayed before purchase.</p>
        <p>VenuesLocation reserves the right to introduce new subscription plans or modify existing plans.</p>
      </section>

      <section>
        <h2>4. Subscription Price</h2>
        <p>The applicable subscription price will be displayed on the VenuesLocation website before payment.</p>
        <p>Prices may vary depending on:</p>
        <ul>
          <li>Subscription plan;</li>
          <li>Subscription duration;</li>
          <li>Promotional offers;</li>
          <li>Features included; and</li>
          <li>Applicable taxes or charges.</li>
        </ul>
        <p>
          The amount payable at checkout will be the amount applicable to the selected subscription, subject to
          the information displayed before purchase.
        </p>
      </section>

      <section>
        <h2>5. Taxes</h2>
        <p>
          Applicable taxes, including Goods and Services Tax (GST) where required, may be added to the
          subscription price or otherwise reflected at checkout.
        </p>
        <p>Users are responsible for providing accurate billing information where required.</p>
      </section>

      <section>
        <h2>6. Subscription Period</h2>
        <p>A subscription will remain active for the period specified at the time of purchase.</p>
        <p>Subscription periods may be offered as:</p>
        <ul>
          <li>Monthly;</li>
          <li>Quarterly;</li>
          <li>Half-yearly;</li>
          <li>Annual; or</li>
          <li>Other periods specified on the website.</li>
        </ul>
        <p>The applicable subscription duration will be clearly displayed before purchase.</p>
      </section>

      <section>
        <h2>7. Activation</h2>
        <p>A subscription generally becomes active after successful payment confirmation.</p>
        <p>VenuesLocation may require reasonable verification before activating certain subscription benefits.</p>
        <p>
          If payment is successful but the subscription is not activated due to a technical issue attributable to
          VenuesLocation, the User should contact us using the contact details provided below.
        </p>
      </section>

      <section>
        <h2>8. Subscription Renewal</h2>
        <p>
          Unless the checkout page expressly states that a subscription automatically renews, subscriptions will
          not automatically renew.
        </p>
        <p>
          Where automatic renewal is introduced for a particular plan, the renewal terms, renewal amount,
          frequency and cancellation procedure will be clearly disclosed before or at the time of purchase,
          subject to applicable law.
        </p>
      </section>

      <section>
        <h2>9. Cancellation by the User</h2>
        <p>
          A User may request cancellation of a subscription by contacting VenuesLocation through the available
          support or account facilities.
        </p>
        <p>
          Cancellation of a subscription means that the User will not receive future subscription benefits after
          the applicable subscription period ends, subject to the specific subscription terms.
        </p>
        <p>
          Cancellation does not automatically create a right to a refund for the unused portion of a subscription.
        </p>
        <p>Refund eligibility is determined under this Policy and applicable law.</p>
      </section>

      <section>
        <h2>10. Refund Policy</h2>
        <p>
          Because subscription services may provide immediate access to digital features, enhanced visibility or
          other services, subscription payments are generally non-refundable once the subscription has been
          activated or the subscription benefits have been made available to the User, except where:
        </p>
        <ul>
          <li>A refund is required by applicable law;</li>
          <li>VenuesLocation agrees to a refund in accordance with this Policy;</li>
          <li>The subscription was charged incorrectly;</li>
          <li>A duplicate payment was made;</li>
          <li>
            VenuesLocation is unable to provide the purchased subscription service for a material reason
            attributable to VenuesLocation; or
          </li>
          <li>Another refund entitlement is expressly stated at the time of purchase.</li>
        </ul>
      </section>

      <section>
        <h2>11. Refunds for Duplicate or Incorrect Charges</h2>
        <p>If a User believes that they have been charged:</p>
        <ul>
          <li>More than once for the same subscription;</li>
          <li>An incorrect amount; or</li>
          <li>For a subscription they did not successfully purchase,</li>
        </ul>
        <p>the User should contact VenuesLocation as soon as reasonably possible.</p>
        <p>
          VenuesLocation may review the transaction and, where appropriate, refund an incorrectly charged or
          duplicate amount.
        </p>
      </section>

      <section>
        <h2>12. Technical Failure</h2>
        <p>
          If a User successfully pays for a subscription but is unable to access the paid subscription features
          because of a technical problem attributable to VenuesLocation, the User should contact us.
        </p>
        <p>VenuesLocation may, depending on the circumstances:</p>
        <ul>
          <li>Restore the subscription;</li>
          <li>Extend the subscription period;</li>
          <li>Correct the technical issue; or</li>
          <li>Provide an appropriate refund where warranted.</li>
        </ul>
      </section>

      <section>
        <h2>13. Refund Request Procedure</h2>
        <p>To request a refund, the User should contact:</p>
        <p>
          Email:{" "}
          <a className="font-bold text-navy" href="mailto:info@venueslocation.com">
            info@venueslocation.com
          </a>
        </p>
        <p>The request should include, where available:</p>
        <ul>
          <li>Name;</li>
          <li>Registered email address;</li>
          <li>Subscription plan;</li>
          <li>Date of purchase;</li>
          <li>Transaction or payment reference;</li>
          <li>Amount paid; and</li>
          <li>Reason for the refund request.</li>
        </ul>
        <p>
          Users should not send passwords, card numbers, CVV numbers, OTPs or other sensitive payment credentials
          by email.
        </p>
      </section>

      <section>
        <h2>14. Refund Review</h2>
        <p>Refund requests will be reviewed based on:</p>
        <ul>
          <li>The subscription purchased;</li>
          <li>The date of purchase;</li>
          <li>Whether subscription benefits were activated or used;</li>
          <li>The reason for the request;</li>
          <li>Payment records;</li>
          <li>Technical circumstances;</li>
          <li>Applicable law; and</li>
          <li>The terms displayed at the time of purchase.</li>
        </ul>
        <p>VenuesLocation may request reasonable information necessary to verify a transaction.</p>
      </section>

      <section>
        <h2>15. Refund Processing</h2>
        <p>
          Where a refund is approved, VenuesLocation will generally process the refund through the original
          payment method or another appropriate method permitted by the payment provider and applicable law.
        </p>
        <p>
          The time required for the refunded amount to appear in the User's account may depend on the User's
          bank, card issuer, payment gateway or other payment service provider.
        </p>
        <p>VenuesLocation does not control the processing time of third-party financial institutions.</p>
      </section>

      <section>
        <h2>16. Subscription Cancellation by VenuesLocation</h2>
        <p>VenuesLocation may suspend or terminate a subscription where reasonably necessary, including where:</p>
        <ul>
          <li>The User breaches the Terms & Conditions;</li>
          <li>Fraudulent or suspicious activity is identified;</li>
          <li>False information has been provided;</li>
          <li>The Platform is being misused;</li>
          <li>Payment is reversed, disputed or fraudulent;</li>
          <li>The subscription is obtained through abuse of a promotional offer;</li>
          <li>Applicable law requires suspension; or</li>
          <li>The User creates a security or operational risk.</li>
        </ul>
        <p>
          Where a subscription is terminated by VenuesLocation for reasons not attributable to the User,
          VenuesLocation may, where appropriate, provide a refund or proportionate remedy for the unused portion
          of the affected subscription, subject to applicable law.
        </p>
      </section>

      <section>
        <h2>17. Subscription Does Not Guarantee Business</h2>
        <p>Purchasing a VenuesLocation subscription does not guarantee:</p>
        <ul>
          <li>Venue bookings;</li>
          <li>Client enquiries;</li>
          <li>Leads;</li>
          <li>Revenue;</li>
          <li>Sales;</li>
          <li>Production opportunities;</li>
          <li>Event opportunities;</li>
          <li>Search ranking;</li>
          <li>Website traffic;</li>
          <li>A particular number of views; or</li>
          <li>A particular number of customers.</li>
        </ul>
        <p>
          Subscription fees are paid for the features and services expressly included in the selected
          subscription plan.
        </p>
      </section>

      <section>
        <h2>18. Subscription Does Not Include Venue Booking Payments</h2>
        <p>A VenuesLocation subscription is separate from any venue Booking.</p>
        <p>At the current launch stage:</p>
        <p>
          <strong>Clients pay Venue Owners directly for venue use.</strong>
        </p>
        <p>
          VenuesLocation does not currently collect or hold venue-hire payments on behalf of Venue Owners.
        </p>
        <p>A subscription payment therefore does not include:</p>
        <ul>
          <li>Venue hire charges;</li>
          <li>Venue deposits;</li>
          <li>Production charges;</li>
          <li>Event charges;</li>
          <li>Damage deposits; or</li>
          <li>Other amounts agreed between a Client and Venue Owner.</li>
        </ul>
      </section>

      <section>
        <h2>19. No Booking Commission at Launch</h2>
        <p>At the current launch stage, VenuesLocation does not charge commission on venue booking amounts.</p>
        <p>Subscription revenue is separate from venue booking payments.</p>
        <p>
          VenuesLocation may introduce booking commissions, service fees or other charges in the future, subject
          to applicable terms and applicable law.
        </p>
      </section>

      <section>
        <h2>20. Promotional Offers and Discounts</h2>
        <p>VenuesLocation may occasionally offer:</p>
        <ul>
          <li>Discounts;</li>
          <li>Promotional subscription prices;</li>
          <li>Trial periods;</li>
          <li>Coupon codes;</li>
          <li>Special offers; or</li>
          <li>Limited-time subscription plans.</li>
        </ul>
        <p>Unless otherwise stated, promotional offers:</p>
        <ul>
          <li>May be available for a limited period;</li>
          <li>May be limited to eligible Users;</li>
          <li>May not be combined with other offers; and</li>
          <li>May be subject to additional conditions.</li>
        </ul>
        <p>A promotional offer does not create a permanent right to the discounted price.</p>
      </section>

      <section>
        <h2>21. Free Trials</h2>
        <p>
          If VenuesLocation offers a free trial, the applicable trial conditions will be displayed before
          activation.
        </p>
        <p>A free trial may be limited by:</p>
        <ul>
          <li>User;</li>
          <li>Account;</li>
          <li>Venue;</li>
          <li>Device;</li>
          <li>Business;</li>
          <li>Subscription plan; or</li>
          <li>Other eligibility criteria.</li>
        </ul>
        <p>VenuesLocation may restrict repeated or abusive use of free trials.</p>
      </section>

      <section>
        <h2>22. Changes to Subscription Plans</h2>
        <p>VenuesLocation may modify, replace, suspend or discontinue subscription plans.</p>
        <p>
          If a material change affects an already-paid subscription, VenuesLocation will seek to provide
          reasonable notice where appropriate and subject to applicable law.
        </p>
        <p>Changes will not affect rights that cannot legally be changed or removed.</p>
      </section>

      <section>
        <h2>23. Payment Failures</h2>
        <p>A subscription may not be activated if payment:</p>
        <ul>
          <li>Fails;</li>
          <li>Is declined;</li>
          <li>Is reversed;</li>
          <li>Is cancelled;</li>
          <li>Is disputed;</li>
          <li>Is identified as potentially fraudulent; or</li>
          <li>Is not successfully received.</li>
        </ul>
        <p>
          Users should contact their payment provider if a payment has been deducted but the subscription has not
          been activated.
        </p>
        <p>They may also contact VenuesLocation for assistance.</p>
      </section>

      <section>
        <h2>24. Chargebacks and Payment Disputes</h2>
        <p>
          Users should contact VenuesLocation first regarding legitimate billing problems so that we can
          investigate and attempt to resolve the issue.
        </p>
        <p>
          Nothing in this Policy limits any rights a User may have under applicable law or through their payment
          provider.
        </p>
        <p>
          VenuesLocation reserves the right to suspend an account where a payment dispute appears fraudulent or
          abusive.
        </p>
      </section>

      <section>
        <h2>25. Subscription Transfer</h2>
        <p>
          Unless expressly permitted by VenuesLocation, subscriptions are intended for the User or business
          account for which they were purchased.
        </p>
        <p>
          A subscription may not normally be sold, transferred, assigned or shared with another person or
          business without our prior approval.
        </p>
      </section>

      <section>
        <h2>26. Account Closure</h2>
        <p>
          If a User closes their VenuesLocation account while a paid subscription remains active, the User should
          understand that account closure may result in loss of access to subscription features.
        </p>
        <p>Account closure does not automatically create a right to a refund.</p>
        <p>Any refund will be considered according to this Policy and applicable law.</p>
      </section>

      <section>
        <h2>27. Venue Listings and Subscription Benefits</h2>
        <p>
          Where a subscription relates to a Venue Listing, the Venue Owner remains responsible for ensuring that
          the Listing information is accurate and that the Venue is legally available for the advertised
          purposes.
        </p>
        <p>A paid subscription does not make VenuesLocation the owner, operator or manager of the Venue.</p>
      </section>

      <section>
        <h2>28. Abuse of Subscription Benefits</h2>
        <p>Users must not:</p>
        <ul>
          <li>Create multiple accounts to obtain promotional benefits improperly;</li>
          <li>Manipulate listings to obtain unfair visibility;</li>
          <li>Provide false information;</li>
          <li>Use subscription features for unlawful purposes;</li>
          <li>Attempt to bypass technical restrictions;</li>
          <li>Share subscription access improperly; or</li>
          <li>Abuse promotional offers.</li>
        </ul>
        <p>VenuesLocation may suspend or terminate access where such activity is identified.</p>
      </section>

      <section>
        <h2>29. Relationship With Terms & Conditions</h2>
        <p>This Policy forms part of the VenuesLocation Terms & Conditions.</p>
        <p>
          If there is a conflict between this Policy and a specific subscription offer or checkout term, the
          specific subscription term displayed to the User at the time of purchase will apply to that
          subscription, subject to applicable law.
        </p>
      </section>

      <section>
        <h2>30. Consumer Rights</h2>
        <p>
          Nothing in this Policy is intended to exclude, restrict or override any mandatory rights or remedies
          available to Users under applicable Indian law.
        </p>
        <p>VenuesLocation will comply with applicable consumer-protection requirements relating to its services.</p>
      </section>

      <section>
        <h2>31. Privacy</h2>
        <p>
          Information relating to subscription purchases and payments may be processed in accordance with the
          VenuesLocation Privacy Policy.
        </p>
        <p>
          Payment information may be processed by third-party payment providers. VenuesLocation will not request
          Users to provide passwords, OTPs, CVV numbers or full payment-card credentials by email.
        </p>
      </section>

      <section>
        <h2>32. Changes to This Policy</h2>
        <p>VenuesLocation may update this Subscription & Refund Policy from time to time.</p>
        <p>
          The updated version will be published on VenuesLocation.com with a revised "Last Updated" date.
        </p>
        <p>Users should review this Policy before purchasing a subscription.</p>
      </section>

      <section>
        <h2>33. Contact</h2>
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
          Business Address: Wing B/113, Park Plaza Building, Off Yari Road, Versova, Panch Marg, Next to Panch
          Vati Tower, Opp. Fishery Education College, Andheri West, Mumbai – 400061, Maharashtra, India.
        </p>
      </section>

      <section>
        <h2>Important</h2>
        <p>VenuesLocation's current commercial model is:</p>
        <p>
          Free venue listings + optional paid subscriptions + no booking commission at launch + direct payment
          between Client and Venue Owner + direct Booking confirmation between Client and Venue Owner.
        </p>
        <p>
          This Policy applies specifically to VenuesLocation subscription payments and does not govern payments
          made directly between Venue Owners and Clients for venue bookings.
        </p>
      </section>
    </LegalPage>
  );
}
