import { createFileRoute } from "@tanstack/react-router";

import { COMPANY } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${COMPANY.product}` },
      {
        name: "description",
        content:
          "How Matola and Nuru AI collect, use and protect your personal information.",
      },
      { property: "og:title", content: `Privacy Policy — ${COMPANY.product}` },
      {
        property: "og:description",
        content: "What data Nuru AI collects, why, and the choices you have.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`${COMPANY.product} is built by ${COMPANY.name}. This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use ${COMPANY.product}.`}
    >
      <LegalSection title="Who we are">
        <p>
          {COMPANY.name}, trading as {COMPANY.tradingName}, provides {COMPANY.product}, an AI platform
          that brings together specialist agents, multilingual support, a public Africa Opportunity
          Map, and a business hub. {COMPANY.name} is the data controller responsible for the personal
          information described in this notice.
        </p>
      </LegalSection>

      <LegalSection title="1. Information we collect">
        <p>
          Depending on how you use {COMPANY.product}, we may collect information such as:
        </p>
        <ul>
          <li>Your email address and account information.</li>
          <li>Your preferred language, country, voice settings and other application preferences.</li>
          <li>
            Conversations, prompts, searches, file attachments and other content you choose to
            submit to {COMPANY.product}.
          </li>
          <li>
            Problems, research, submissions and other contributions you choose to add to the public
            Africa Opportunity Map.
          </li>
          <li>Information necessary to provide, maintain, secure, and improve our services.</li>
        </ul>
        <p>
          We only collect information that is reasonably necessary for providing and improving the{" "}
          {COMPANY.product} experience. We do not ask for identity documents, financial account
          details or sensitive personal categories, and you should not paste them into the assistant
          or public submissions.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <p>We may use collected information to:</p>
        <ul>
          <li>Create and manage your account.</li>
          <li>Provide personalized AI features and services.</li>
          <li>Maintain conversation and application history.</li>
          <li>Improve reliability, security, and performance.</li>
          <li>Communicate with you about your account or our services.</li>
          <li>Detect and prevent fraud, abuse, and unauthorized access.</li>
        </ul>
        <p>We do not sell your personal information and we do not run advertising profiles.</p>
        <p>
          We process account and service data to perform our contract with you; security, reliability,
          analytics and product-improvement data for our legitimate interests; consent-based features
          where you have made a choice; and records we must keep to meet legal obligations.
        </p>
      </LegalSection>

      <LegalSection title="3. Data security and isolation">
        <p>
          We take reasonable technical and organizational measures to protect your information
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          Where applicable, {COMPANY.product} uses authentication controls and database access
          controls, including Row-Level Security (RLS), to help ensure that users can access only the
          data they are authorized to access. Private records, contact details and unpublished
          submissions are never exposed through public or agent-facing endpoints.
        </p>
        <p>However, no online service can guarantee absolute security.</p>
      </LegalSection>

      <LegalSection title="4. AI processing and web browsing">
        <p>
          Prompts are processed by third-party AI model providers through our AI gateway so that a
          reply can be generated. When you use web-evidence mode, your search terms are sent to a web
          search and retrieval provider so that public pages can be fetched and cited. Only the text
          needed for the request is sent.
        </p>
        <p>
          AI output can be wrong or incomplete. It is not professional, legal, medical, agronomic,
          financial or investment advice, and every figure should be verified locally before you act
          on it.
        </p>
      </LegalSection>

      <LegalSection title="5. Public content">
        <p>
          Content you publish to the Africa Opportunity Map — problems, research entries and
          approved submissions — is public by design and is also readable through our public,
          read-only agent (MCP) endpoint. Do not put anything in a public submission that you would
          not want shared worldwide.
        </p>
      </LegalSection>

      <LegalSection title="6. Data sharing">
        <p>We do not sell your personal information.</p>
        <p>
          We may share limited information with trusted service providers when necessary to operate{" "}
          {COMPANY.product}, such as authentication, hosting, AI infrastructure, analytics, web
          search, or payment providers. These providers are expected to process information only as
          necessary to provide their services and subject to applicable agreements and safeguards.
        </p>
        <p>
          Recipient categories include hosting, authentication, AI, analytics, search and support
          providers; PayPal for payment and subscription processing; professional legal or
          accounting advisers; and public authorities when the law requires disclosure.
        </p>
      </LegalSection>

      <LegalSection title="7. Payment information">
        <p>
          Payments and subscriptions are processed by PayPal. Matola does not collect or store your
          full payment-card or banking credentials; PayPal processes payment information under its
          own privacy notice and security practices. We keep only the subscription reference and
          plan status needed to give you access to the plan you paid for.
        </p>
      </LegalSection>

      <LegalSection title="8. Your choices and rights">
        <p>
          Depending on your location and applicable law, you may have rights concerning your
          personal information, including access, correction, deletion, restriction, portability,
          objection, and withdrawal of consent without affecting earlier lawful processing. You may
          also complain to the data-protection authority that applies where you live. We aim to answer
          verified requests within one month where applicable law requires it.
        </p>
        <ul>
          <li>Clear your browser storage to remove locally saved preferences and workspace notes.</li>
          <li>
            Ask us to correct or delete content you submitted by emailing{" "}
            <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
          </li>
          <li>Use the platform without web-evidence mode if you prefer no external lookups.</li>
        </ul>
        <p>To make a privacy request, contact us through the official {COMPANY.product} support channel.</p>
      </LegalSection>

      <LegalSection title="9. Retention and international transfers">
        <p>
          We keep account and service records while your account is active and only as long afterward
          as reasonably needed for security, disputes, legal obligations and legitimate business
          records. We then delete or anonymise them. Public contributions may remain public until they
          are removed or a valid deletion request is accepted.
        </p>
        <p>
          Our providers may process information outside your country. Where UK or EEA information is
          transferred internationally, we rely on recognised safeguards such as adequacy decisions or
          standard contractual clauses where required.
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies and local storage">
        <p>
          We use essential cookies or local storage for sign-in, security, preferences and core service
          operation. If analytics or marketing technologies requiring consent are introduced, we will
          ask for that consent and provide controls to change it. Browser settings can also block or
          delete cookies, although essential features may then stop working.
        </p>
      </LegalSection>

      <LegalSection title="11. Children">
        <p>
          The platform is intended for people aged 16 and over, or younger users with the consent
          of a parent, guardian or school.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. When significant changes are made, we
          will provide appropriate notice and update the effective date shown above.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          {COMPANY.product} is owned and operated by {COMPANY.name}. For privacy questions or
          requests, please contact us through the official {COMPANY.product} support channel, or email{" "}
          <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
