import { createFileRoute } from "@tanstack/react-router";

import { COMPANY } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Terms of Service — ${COMPANY.product}` },
      {
        name: "description",
        content:
          "The rules for using Nuru AI: acceptable use, AI accuracy limits, contributions, and liability.",
      },
      { property: "og:title", content: `Terms of Service — ${COMPANY.product}` },
      {
        property: "og:description",
        content: "Acceptable use, AI accuracy limits and contribution rules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`Welcome to ${COMPANY.product}. By creating an account, accessing, or using ${COMPANY.product}, you agree to these Terms of Service.`}
    >
      <LegalSection title="1. Acceptance of terms">
        <p>
          By using {COMPANY.product} you agree to comply with these Terms and all applicable laws and
          regulations. If you do not agree with these Terms, please do not use the service.{" "}
          {COMPANY.status} These terms will be updated as the company formalises.
        </p>
      </LegalSection>

      <LegalSection title="2. User accounts">
        <p>You are responsible for:</p>
        <ul>
          <li>Providing accurate account information.</li>
          <li>Maintaining the confidentiality of your login credentials.</li>
          <li>Keeping your account secure.</li>
          <li>All activity occurring through your account.</li>
        </ul>
        <p>
          If you believe your account has been compromised, you should contact {COMPANY.product}{" "}
          promptly through <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="3. Use of Nuru AI">
        <p>
          {COMPANY.product} is an artificial intelligence platform designed to support professional
          growth, innovation, research, productivity, and digital transformation. It includes a
          conversational assistant, specialist AI departments, multilingual support, a public Africa
          Opportunity Map, a business hub and personal workspace tools.
        </p>
        <p>
          AI-generated information may contain errors or inaccuracies. Users should independently
          verify important information before relying on it, particularly where decisions may have
          significant financial, legal, medical, educational, or professional consequences.
        </p>
        <p>
          The service is offered as-is, free of charge at this stage, and may change or be
          interrupted while we build.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to use {COMPANY.product} to:</p>
        <ul>
          <li>Conduct illegal activities.</li>
          <li>Attempt unauthorized access to accounts, systems, databases, or infrastructure.</li>
          <li>Circumvent security or authentication controls.</li>
          <li>Introduce malware or other harmful code.</li>
          <li>Abuse, disrupt, or overload the service, including by scraping or bypassing rate limits.</li>
          <li>Attempt to reverse-engineer or compromise protected portions of the platform.</li>
          <li>Submit unlawful, hateful, defamatory, deliberately false or harmful content.</li>
          <li>Use the service in ways that violate applicable laws.</li>
        </ul>
        <p>
          We may restrict or terminate access where there is a reasonable basis to believe that an
          account is being used in violation of these Terms or to compromise the security of the
          service.
        </p>
      </LegalSection>

      <LegalSection title="5. User content">
        <p>
          You retain responsibility for the content, prompts, files, and other information that you
          submit to {COMPANY.product}. You should not submit confidential, highly sensitive, or
          regulated information unless the service is specifically designed and authorized to handle
          that information.
        </p>
        <p>
          By submitting a problem, research entry or other contribution for publication on the Africa
          Opportunity Map, you grant {COMPANY.name} a non-exclusive, worldwide licence to publish,
          display and distribute it as part of the public Opportunity Map, including through our
          public, read-only agent endpoint. You confirm you have the right to share it. Do not submit
          anyone else&apos;s private or personal information.
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          {COMPANY.product} uses authentication, database access controls — including Row-Level
          Security (RLS) — and other security measures designed to protect user accounts and data.
        </p>
        <p>No internet-connected service can guarantee complete protection against every possible security threat.</p>
      </LegalSection>

      <LegalSection title="7. Third-party services">
        <p>
          {COMPANY.product} may integrate with third-party services, including payment, AI, hosting,
          authentication, search, analytics, and other technology providers. Your use of third-party
          services may also be subject to their own terms and policies.
        </p>
      </LegalSection>

      <LegalSection title="8. Payments and subscriptions">
        <p>
          Where paid features or subscriptions are offered, applicable prices, billing periods, renewal
          terms, cancellation procedures, and refund conditions will be presented before purchase.
          Payments may be processed by third-party payment providers.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to the service">
        <p>
          {COMPANY.product} may add, modify, suspend, or discontinue features as the platform develops.
          We will make reasonable efforts to communicate significant changes where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="10. Availability and liability">
        <p>
          We do not promise uninterrupted service. To the maximum extent permitted by applicable
          law, we are not liable for indirect or consequential loss, lost profits, or decisions made
          in reliance on AI output or third-party sources.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law">
        <p>
          Until the company is formally incorporated, disputes will be handled in good faith through
          direct discussion. Our planned jurisdiction is {COMPANY.plannedJurisdiction}; we will publish a
          governing-law clause once incorporation is complete.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of {COMPANY.product} after
          updated Terms become effective constitutes acceptance of the updated Terms, where permitted
          by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          {COMPANY.product} is proudly owned and operated by {COMPANY.name}. For questions regarding
          these Terms, please contact us through the official {COMPANY.product} contact channel, or
          email <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>. Help using the
          platform: <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
