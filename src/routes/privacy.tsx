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
      { property: "og:url", content: "https://africaopportunity.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://africaopportunity.app/privacy" }],
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
          <li>Projects, workspace content, saved memories, feedback, and support communications.</li>
          <li>
            Technical and usage information such as device and browser type, IP address, sign-in
            events, approximate location derived from IP, feature usage, error records, security
            events, and timestamps.
          </li>
        </ul>
        <p>
          We collect information you provide, information created when you use the service, and
          limited information received from authentication and infrastructure providers. Please do
          not submit identity documents, financial-account credentials, health records, or other
          highly sensitive information unless a feature expressly asks for it and explains how it
          will be handled.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <p>We may use collected information to:</p>
        <ul>
          <li>Create and manage your account.</li>
          <li>Provide personalized AI features and services.</li>
          <li>Generate responses, analyse files and images, search public sources, and maintain history.</li>
          <li>Remember preferences or details when you choose to use memory features.</li>
          <li>Improve reliability, security, and performance.</li>
          <li>Communicate with you about your account or our services.</li>
          <li>Detect and prevent fraud, abuse, and unauthorized access.</li>
        </ul>
        <p>We do not sell your personal information and we do not run advertising profiles.</p>
        <p>
          Our legal bases, where applicable, are: performing our contract with you; our legitimate
          interests in operating, securing, supporting, and improving the service; your consent where
          a feature or law requires it; and compliance with legal obligations. Where we rely on
          legitimate interests, we consider the impact on your rights and do not use that basis where
          your interests override ours.
        </p>
      </LegalSection>

      <LegalSection title="3. Data security and isolation">
        <p>
          We take reasonable technical and organizational measures to protect your information
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          {COMPANY.product} uses authentication, account-scoped database permissions, encryption in
          transit, access restrictions, and operational monitoring designed to prevent unauthorized
          access. Private records, contact details, and unpublished submissions are not intentionally
          made available through public or agent-facing endpoints.
        </p>
        <p>However, no online service can guarantee absolute security.</p>
      </LegalSection>

      <LegalSection title="4. AI processing and web browsing">
        <p>
          Prompts, recent conversation context, and attachments may be processed by AI infrastructure
          providers to generate a reply. When you use web-evidence mode, search terms are sent to a
          search or retrieval provider so public pages can be found and cited. We aim to send only the
          information reasonably needed to perform the request. Provider handling is also governed by
          our agreements with those providers.
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
          providers; professional legal or
          accounting advisers; and public authorities when the law requires disclosure.
        </p>
        <p>
          We may also disclose information in connection with a genuine merger, financing,
          reorganisation, or sale of all or part of the business, subject to confidentiality and
          applicable law. We do not disclose private account content to other users unless you choose
          to share or publish it.
        </p>
      </LegalSection>

      <LegalSection title="7. Payment information">
        <p>
          Nuru AI does not currently process paid subscriptions or accept payment through this
          version of the platform. Before paid services are enabled, we will identify the payment
          provider, explain what billing information is shared, and publish the applicable purchase
          and refund terms.
        </p>
      </LegalSection>

      <LegalSection title="8. Your choices and rights">
        <p>
          Depending on your location and applicable law, you may have rights concerning your
          personal information, including access, correction, deletion, restriction, portability,
          objection, and withdrawal of consent without affecting earlier lawful processing. You may
          also complain to the data-protection authority that applies where you live. We aim to answer
          verified requests within the period required by applicable law. We may need to confirm your
          identity and may lawfully refuse or limit a request where an exemption applies.
        </p>
        <ul>
          <li>Change available preferences and memory controls in Settings.</li>
          <li>Delete individual conversations or projects through their available controls.</li>
          <li>
            Ask us to correct or delete content you submitted by emailing{" "}
            <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
          </li>
          <li>Use the platform without web-evidence mode if you prefer no external lookups.</li>
        </ul>
        <p>
          To exercise a right, email <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
          You may also complain to a competent data-protection authority, including the authority in
          the country where you live or work, where that right applies.
        </p>
      </LegalSection>

      <LegalSection title="9. Retention and international transfers">
        <p>
          We keep account content while your account is active or until you delete it, unless a longer
          period is reasonably required for security, dispute resolution, fraud prevention, backups,
          or legal obligations. Operational logs and support records are retained only for an
          appropriate period for their purpose. We then delete or anonymise information. Deletion
          from backups may take additional time. Public contributions may remain visible until removed
          or until a valid deletion request is completed.
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
          The platform is not directed to children under 16. A person under 16 may use it only where
          a parent, legal guardian, or authorised school has provided any consent required by local
          law and supervises that use. If we learn that we collected a child&apos;s personal information
          without required permission, we will take reasonable steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="12. Automated processing">
        <p>
          Nuru uses automated systems to generate content and to apply safety, fraud, and abuse
          controls. Nuru does not make solely automated decisions that produce legal or similarly
          significant effects about your employment, credit, education, healthcare, insurance, or
          access to essential services. Do not use its output as the sole basis for such decisions.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. When significant changes are made, we
          will provide appropriate notice and update the effective date shown above.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          {COMPANY.product} is owned and operated by {COMPANY.name}. For privacy questions or
          requests, please contact us through the official {COMPANY.product} support channel, or email{" "}
          <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
