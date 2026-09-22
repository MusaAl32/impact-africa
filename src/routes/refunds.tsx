import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const Route = createFileRoute("/refunds")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Refund Policy — ${COMPANY.product}` },
      {
        name: "description",
        content: "How to request a refund for a Nuru AI purchase made through Paddle.",
      },
      { property: "og:title", content: `Refund Policy — ${COMPANY.product}` },
      {
        property: "og:description",
        content: "Nuru AI's 30-day refund policy and instructions for requesting a refund through Paddle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={`${COMPANY.name}, trading as ${COMPANY.tradingName}, wants you to be satisfied with your Nuru AI purchase.`}
    >
      <LegalSection title="1. 30-day money-back guarantee">
        <p>
          You may request a full refund within 30 days of the original order date if you are not
          satisfied with your purchase. This does not limit any additional refund or cancellation
          rights available under applicable consumer law.
        </p>
      </LegalSection>

      <LegalSection title="2. How to request a refund">
        <p>
          Email <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> with the email
          address used for the purchase and the PayPal transaction or subscription reference. We
          reply to every request and process approved refunds promptly.
        </p>
      </LegalSection>

      <LegalSection title="3. Processing">
        <p>
          Approved refunds are returned through PayPal to the original payment method. The time
          needed for funds to appear depends on PayPal and your bank or card issuer. Cancelling a
          subscription stops future renewals but does not automatically refund earlier charges;
          submit a refund request within the period above if you also want a qualifying charge
          refunded.
        </p>
      </LegalSection>

      <LegalSection title="4. Payment processing">
        <p>
          Payments are processed by PayPal. Payment, billing and dispute mechanics are also subject
          to PayPal&apos;s{" "}
          <a href="https://www.paypal.com/legalhub/home" target="_blank" rel="noreferrer">
            user agreement and policies
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}