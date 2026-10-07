import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const Route = createFileRoute("/refunds")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Refund Policy — ${COMPANY.product}` },
      { name: "description", content: "Payment, cancellation, duplicate-charge, and refund terms for Nuru AI services." },
      { property: "og:title", content: `Refund Policy — ${COMPANY.product}` },
      { property: "og:description", content: "Payment, cancellation, duplicate-charge, and refund terms for Nuru AI services." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://africaopportunity.app/refunds" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://africaopportunity.app/refunds" }],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={`This policy explains cancellations, refunds, billing corrections, and statutory rights for ${COMPANY.product}. Paid checkout is not currently available, so no active ${COMPANY.product} purchase can presently be made through the platform.`}
    >
      <LegalSection title="1. Current payment status">
        <p>
          {COMPANY.product} currently provides free access and does not accept subscription payments
          through this version of the service. Prices and allowances shown for planned tiers are
          previews only and are not an offer, invoice, or active subscription. You cannot currently
          be charged by {COMPANY.name} through {COMPANY.product}.
        </p>
      </LegalSection>

      <LegalSection title="2. Before paid services begin">
        <p>Before we enable any paid service, the checkout screen and applicable purchase terms will state:</p>
        <ul>
          <li>The seller&apos;s identity and contact details.</li>
          <li>The plan, included allowances, total price, currency, and applicable taxes.</li>
          <li>Whether the purchase is one-time or recurring and the renewal interval.</li>
          <li>How to cancel, when cancellation takes effect, and any refund eligibility.</li>
          <li>The payment provider and any additional terms that apply to payment processing.</li>
        </ul>
        <p>
          Those checkout disclosures will control if they offer rights more favourable than this
          policy. We will update this policy before accepting payment.
        </p>
      </LegalSection>

      <LegalSection title="3. Cancelling a future subscription">
        <p>
          When subscriptions become available, you will be able to cancel through the method shown
          in your account or purchase confirmation, or by contacting support. Unless checkout states
          otherwise, cancellation will stop future renewal and access will continue until the end of
          the paid billing period. Cancelling does not by itself refund time already used.
        </p>
        <p>
          Submit a cancellation before the renewal date. Processing times outside our control may
          apply, so contact us promptly if an expected cancellation does not appear in your account.
        </p>
      </LegalSection>

      <LegalSection title="4. Refund eligibility after paid launch">
        <p>
          Once paid services are launched, refund requests will be assessed under the terms displayed
          at purchase and applicable law. Unless the checkout terms or mandatory law provide a broader
          right, a refund may be appropriate where:
        </p>
        <ul>
          <li>You were charged more than once for the same subscription period.</li>
          <li>You were charged after a cancellation that had already taken effect.</li>
          <li>A paid service was materially unavailable because of a fault within our control and we could not restore it within a reasonable time.</li>
          <li>The service was materially different from the description presented at checkout.</li>
          <li>Applicable consumer law requires a refund, cooling-off period, repair, replacement, or other remedy.</li>
        </ul>
        <p>
          Refunds will not ordinarily be given for unused time after a valid renewal, failure to cancel
          before renewal, a change of mind after substantial use, exhaustion of an included allowance,
          dissatisfaction with an AI answer, or loss caused by violating the Terms of Service—except
          where applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="5. Duplicate, incorrect, or unrecognised charges">
        <p>
          If a future statement shows a duplicate, incorrect, or unrecognised charge, contact us
          promptly at <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>. Include
          the account email, transaction date, amount, currency, payment reference, and a description
          of the issue. Do not send a full card number, security code, password, or banking credentials.
        </p>
        <p>
          We will investigate with the payment provider and correct confirmed billing errors. If you
          believe a payment method was used without permission, also contact the payment provider or
          financial institution immediately to secure the account.
        </p>
      </LegalSection>

      <LegalSection title="6. How to request a refund">
        <p>
          After paid services launch, email <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>
          with the account email, payment reference, date and amount, plan name, reason for the request,
          and relevant evidence. We may ask for limited additional information to verify account
          ownership and prevent fraud.
        </p>
        <p>
          We will acknowledge the request and provide a decision within a reasonable period. An
          approved refund will normally be returned to the original payment method. The payment
          provider or financial institution controls the final posting time and currency conversion.
        </p>
      </LegalSection>

      <LegalSection title="7. Plan changes and avoiding double billing">
        <p>
          Before paid plan changes are enabled, the service will disclose when the new plan starts,
          how unused value is treated, and whether any immediate charge applies. We will design plan
          changes to replace the existing subscription rather than create an unintended second active
          subscription. Report any overlapping charge so it can be investigated and corrected.
        </p>
      </LegalSection>

      <LegalSection title="8. Promotions, credits, and non-cash benefits">
        <p>
          Promotional credits, free trials, complimentary access, and other non-cash benefits are not
          redeemable for cash unless their specific terms or applicable law say otherwise. Expiry,
          eligibility, and conversion rules will be stated when the promotion is offered.
        </p>
      </LegalSection>

      <LegalSection title="9. Mandatory consumer rights">
        <p>
          Nothing in this policy limits a right or remedy that cannot legally be excluded. Depending
          on where you live, digital-service or distance-selling laws may give you additional rights,
          including a cooling-off right or remedies when a service does not conform to its description.
          Where mandatory law conflicts with this policy, that law prevails.
        </p>
      </LegalSection>

      <LegalSection title="10. Chargebacks">
        <p>
          Please contact support first so we can investigate a billing issue quickly. This does not
          remove any lawful right to dispute a transaction with your payment provider. We may suspend
          access associated with a reversed payment while the dispute is reviewed, but we will not
          retaliate against a good-faith exercise of consumer rights.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes and contact">
        <p>
          We may update this policy before or after paid services launch. Material changes will apply
          prospectively and will be communicated as required by law. Billing and refund questions can
          be sent to <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>; legal
          questions can be sent to <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
