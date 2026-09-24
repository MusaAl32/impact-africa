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
          regulations. If you do not agree with these Terms, please do not use the service. Your
          contract for the service is with {COMPANY.name}, trading as {COMPANY.tradingName}.
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
          Free and paid plans are available. Features and allowances vary by plan and may change as
          described on the pricing page.
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
          <li>Create deceptive deepfakes, facilitate fraud or spam, infringe intellectual-property rights, generate malware, or attempt to jailbreak safety controls.</li>
          <li>Use the service in ways that violate applicable laws.</li>
        </ul>
        <p>
          We may restrict or terminate access where there is a reasonable basis to believe that an
          account is being used in violation of these Terms or to compromise the security of the
          service.
        </p>
      </LegalSection>

      <LegalSection title="4A. AI-generated content and moderation">
        <p>
          {COMPANY.product} uses artificial intelligence to generate text, translations, plans and
          other outputs. You are responsible for your prompts, for how you use the outputs, for
          verifying their accuracy before relying on them, and for having the rights to any content
          you submit. AI outputs are not professional, financial, legal, medical or other regulated
          advice.
        </p>
        <p>
          We actively moderate the service. We may remove or restrict content, refuse or filter
          outputs, and suspend or terminate accounts that generate or attempt to generate unlawful,
          harmful, deceptive or infringing material — including child sexual abuse material,
          non-consensual intimate imagery, deepfakes intended to deceive, hate speech, incitement to
          violence, fraud, spam or malware. We do not permit use of the service to build competing AI
          models or to circumvent safety controls.
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
        <p>
          You retain your rights in prompts, files and other inputs, and any rights you may have in
          outputs, subject to applicable law and third-party rights. You confirm that you have the
          rights needed for every input. We may remove or restrict content, refuse outputs, or suspend
          repeat infringers. Rights holders may send a takedown request to{" "}
          <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a> with identification of the
          work, the disputed material and their contact details.
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
          Paid plans renew at the billing interval and price shown at checkout until cancelled.
          Matola is the seller of record for all orders and provides customer service, billing
          support and refunds. Paid services are not currently enabled in this version of Nuru AI.
          </a>{" "}
          and our <a href="/refunds">Refund Policy</a>.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to the service">
        <p>
          {COMPANY.product} may add, modify, suspend, or discontinue features as the platform develops.
          We will make reasonable efforts to communicate significant changes where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="10. Availability, warranties and liability">
        <p>
          We do not promise uninterrupted or error-free service. The service is provided as available,
          without implied warranties of merchantability or fitness for a particular purpose to the
          fullest extent the law permits. To that extent, we are not liable for indirect, consequential
          or special loss, lost profits, lost data or lost goodwill. Our aggregate liability is limited
          to fees you paid for the service in the 12 months before the claim. Nothing excludes liability
          that cannot lawfully be excluded, including liability for fraud, death or personal injury
          caused by negligence where applicable.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law">
        <p>
          These Terms are governed by the laws of {COMPANY.jurisdiction}, subject to any mandatory
          consumer protections that apply where you live. We will first try to resolve disputes in good
          faith through direct discussion; unresolved disputes may be brought before the competent
          courts of {COMPANY.jurisdiction}.
        </p>
      </LegalSection>

      <LegalSection title="12. Suspension and termination">
        <p>
          We may suspend or terminate access for a material breach, non-payment, security or fraud
          risk, or repeated or serious policy violations. You may stop using the service or cancel a
          paid plan at any time. When access ends, we may delete account content after a reasonable
          period, subject to legal retention duties and any available export options.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of {COMPANY.product} after
          updated Terms become effective constitutes acceptance of the updated Terms, where permitted
          by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
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
