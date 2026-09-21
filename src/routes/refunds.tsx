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
          Paddle is our online reseller and Merchant of Record and handles returns. To request a
          refund, visit{" "}
          <a href="https://paddle.net" target="_blank" rel="noreferrer">
            paddle.net
          </a>{" "}
          and provide the email address and transaction details associated with your order. You may
          also contact <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> for help.
        </p>
      </LegalSection>

      <LegalSection title="3. Processing">
        <p>
          Approved refunds are returned by Paddle to the original payment method. The time needed for
          funds to appear depends on your payment provider. Subscription cancellation stops future
          renewals but does not automatically refund earlier charges; submit a refund request within
          the period above if you also want a qualifying charge refunded.
        </p>
      </LegalSection>

      <LegalSection title="4. Paddle terms">
        <p>
          Payment, billing, tax, cancellation and refund processing is also subject to Paddle&apos;s{" "}
          <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noreferrer">
            Buyer Terms
          </a>{" "}
          and <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer">Refund Policy</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}