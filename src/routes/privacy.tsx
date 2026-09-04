import { createFileRoute } from "@tanstack/react-router";

import { COMPANY } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Africa Opportunity Hub" },
      {
        name: "description",
        content:
          "How Africa Opportunity Hub and Nuru AI collect, use and protect your information, written in plain language for an early-stage African technology company.",
      },
      { property: "og:title", content: "Privacy Policy — Africa Opportunity Hub" },
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
      intro={`How ${COMPANY.name} handles information when you use ${COMPANY.product} and the Africa Opportunity Map.`}
    >
      <LegalSection title="Who we are">
        <p>
          {COMPANY.name} builds {COMPANY.product}, an AI platform that maps African problems and
          turns them into opportunities. {COMPANY.status} Our planned company jurisdiction is{" "}
          {COMPANY.plannedJurisdiction} and our target market is {COMPANY.market}. We do not claim
          any current company registration, licence or certification.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <ul>
          <li>
            <strong>What you type.</strong> Questions you send to {COMPANY.product}, and problems,
            research or submissions you contribute to the Opportunity Map.
          </li>
          <li>
            <strong>Preferences stored on your device.</strong> Country, language, answer style,
            workspace projects and notes are kept in your browser&apos;s local storage, not on our
            servers, unless you explicitly submit them.
          </li>
          <li>
            <strong>Basic technical data.</strong> Standard request information such as approximate
            timing and error logs, used to keep the service running.
          </li>
        </ul>
        <p>
          We do not ask for identity documents, financial account details or sensitive personal
          categories, and you should not paste them into the assistant.
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <ul>
          <li>To generate answers, analysis and cited web evidence you request.</li>
          <li>To publish entries you deliberately submit to the public Opportunity Map.</li>
          <li>To detect abuse, apply rate limits and keep the platform available.</li>
          <li>To improve the product in aggregate.</li>
        </ul>
        <p>We do not sell your information and we do not run advertising profiles.</p>
      </LegalSection>

      <LegalSection title="AI processing and web browsing">
        <p>
          Prompts are processed by third-party AI model providers through our AI gateway so that a
          reply can be generated. When you use web-evidence mode, your search terms are sent to a
          web search and retrieval provider so that public pages can be fetched and cited. Only the
          text needed for the request is sent.
        </p>
        <p>
          AI output can be wrong or incomplete. It is not professional, legal, medical, agronomic or
          financial advice, and every figure should be verified locally before you act on it.
        </p>
      </LegalSection>

      <LegalSection title="Public content">
        <p>
          Content you publish to the Opportunity Map — problems, research entries and approved
          submissions — is public by design and is also readable through our public, read-only
          agent (MCP) endpoint. Private records, contact details and unpublished submissions are
          never exposed there. Do not put anything in a public submission that you would not want
          shared worldwide.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          Public entries stay published until you ask us to remove them. Device preferences remain
          until you clear your browser storage. Operational logs are kept only as long as they are
          useful for reliability and abuse prevention.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul>
          <li>Clear your browser storage to remove locally saved preferences and workspace notes.</li>
          <li>
            Ask us to correct or delete content you submitted by emailing{" "}
            <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>.
          </li>
          <li>Use the platform without web-evidence mode if you prefer no external lookups.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The platform is intended for people aged 16 and over, or younger users with the consent of
          a parent, guardian or school.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          As we grow and formalise the company, this policy will change. We will update the date
          below when it does. Questions about privacy go to{" "}
          <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>; general enquiries go to{" "}
          <a href={`mailto:${COMPANY.generalEmail}`}>{COMPANY.generalEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
