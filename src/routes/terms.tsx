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
      { property: "og:url", content: "https://africaopportunity.app/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://africaopportunity.app/terms" }],
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
        <p>
          If you use the service for an organisation, you confirm that you have authority to bind
          that organisation, and “you” includes that organisation. The Privacy Policy explains how
          personal information is handled and forms part of your relationship with us.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and user accounts">
        <p>
          You must be at least 16 years old, or use the service with the legally valid consent and
          supervision of a parent, guardian, or authorised school. You must be legally capable of
          entering this agreement under the laws that apply to you.
        </p>
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
        <p>
          Accounts are personal unless we expressly provide an organisational account. You may not
          sell, transfer, share, or lend access credentials. We may require reasonable verification
          before restoring access or acting on an account request.
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
          Free access is currently available, subject to fair-use, technical, and usage limits. Any
          planned paid tiers shown on the pricing page are informational only; paid services and
          checkout are not currently enabled and do not constitute an offer to sell.
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
          <li>Submit unlawful, threatening, hateful, defamatory, exploitative, or harmful content.</li>
          <li>Create deceptive deepfakes, facilitate fraud or spam, infringe intellectual-property rights, generate malware, or attempt to jailbreak safety controls.</li>
          <li>Use the service in ways that violate applicable laws.</li>
        </ul>
        <p>
          We may restrict or terminate access where there is a reasonable basis to believe that an
          account is being used in violation of these Terms or to compromise the security of the
          service.
        </p>
        <p>
          You may not use automated means to extract content or data except through an interface we
          expressly provide and subject to its published limits. Security research must be lawful and
          must not access, alter, retain, or disclose another person&apos;s information.
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
          We use safety systems and may review reported or flagged activity. We may remove or restrict content, refuse or filter
          outputs, and suspend or terminate accounts that generate or attempt to generate unlawful,
          harmful, deceptive or infringing material — including child sexual abuse material,
          non-consensual intimate imagery, deepfakes intended to deceive, hate speech, incitement to
          violence, fraud, spam or malware. We do not permit use of the service to build competing AI
          models where doing so would violate our or a provider&apos;s rights or terms, or to circumvent safety controls.
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
        <p>
          To operate the service, you grant us a non-exclusive, worldwide, royalty-free licence to
          host, copy, transmit, process, and display your inputs and outputs only as reasonably needed
          to provide, secure, maintain, and improve the service, comply with law, and enforce these
          Terms. This licence ends when the content is deleted, except for lawful retention, backups,
          and content you made public.
        </p>
      </LegalSection>

      <LegalSection title="6. Our service and intellectual property">
        <p>
          The software, interface, branding, designs, documentation, and other materials supplied by
          us are owned by or licensed to {COMPANY.name} and are protected by applicable intellectual-
          property laws. Subject to these Terms, we grant you a limited, revocable, non-exclusive,
          non-transferable right to use the service for its intended purpose. No ownership in the
          service or our branding is transferred to you.
        </p>
        <p>
          AI outputs may not be unique, and another user may receive similar output. We do not promise
          that an output is eligible for copyright or other protection, or that it will not resemble
          third-party material. You are responsible for checking output before publishing or using it.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          {COMPANY.product} uses authentication, account-scoped data access controls, and other
          reasonable safeguards designed to protect user accounts and data.
        </p>
        <p>No internet-connected service can guarantee complete protection against every possible security threat.</p>
      </LegalSection>

      <LegalSection title="8. Third-party services and links">
        <p>
          {COMPANY.product} may integrate with third-party services, including payment, AI, hosting,
          authentication, search, analytics, and other technology providers. Your use of third-party
          services may also be subject to their own terms and policies.
        </p>
        <p>
          Search results, citations, and links may lead to third-party material. We do not control or
          endorse that material and are not responsible for its availability, accuracy, security, or
          practices. You should assess third-party terms before relying on or purchasing from them.
        </p>
      </LegalSection>

      <LegalSection title="9. Payments and subscriptions">
        <p>
          Paid services are not currently enabled. Before accepting payment, we will display the
          seller, total price, currency, taxes where applicable, billing period, renewal terms,
          included allowances, cancellation method, and applicable refund terms. You will not be
          charged unless you take an express purchase action. See our <a href="/refunds">Refund Policy</a>.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to the service">
        <p>
          {COMPANY.product} may add, modify, suspend, or discontinue features as the platform develops.
          We will make reasonable efforts to communicate significant changes where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="11. Availability and disclaimers">
        <p>
          We do not promise that the service or any AI output will be uninterrupted, error-free,
          accurate, complete, secure, or suitable for a particular purpose. To the fullest extent
          permitted by law, the service is provided “as is” and “as available,” and implied warranties
          of merchantability, fitness for purpose, and non-infringement are excluded. You remain
          responsible for professional review, backups, and decisions made using the service.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of liability">
        <p>
          To the fullest extent permitted by law, {COMPANY.name} and its suppliers will not be liable
          for indirect, incidental, special, exemplary, or consequential loss; lost profits, revenue,
          opportunity, goodwill, or anticipated savings; or loss or corruption of data arising from
          the service. Our total aggregate liability arising from the service will not exceed the
          greater of the fees you paid us for the service during the 12 months before the event giving
          rise to the claim or USD 50 (or its local-currency equivalent).
        </p>
        <p>
          Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or
          limited, including liability for fraud or fraudulent misrepresentation, or any mandatory
          consumer right. These limitations apply only to the maximum extent allowed where you live.
        </p>
      </LegalSection>

      <LegalSection title="13. Indemnity for business misuse">
        <p>
          If you use the service for a business or organisation, that organisation will indemnify
          {COMPANY.name} against third-party claims, damages, and reasonable costs arising from its
          unlawful use of the service, its content, or its material breach of these Terms. This does
          not apply to individual consumers acting for personal purposes where prohibited by law.
        </p>
      </LegalSection>

      <LegalSection title="14. Governing law and disputes">
        <p>
          These Terms are governed by the laws of {COMPANY.jurisdiction}, subject to any mandatory
          consumer protections that apply where you live. We will first try to resolve disputes in good
          faith through direct discussion. Please email {COMPANY.legalEmail} with the nature of the
          dispute and the result you seek. Unresolved disputes may be brought before the competent
          courts of {COMPANY.jurisdiction}, unless mandatory law gives you the right to use another court.
        </p>
      </LegalSection>

      <LegalSection title="15. Suspension and termination">
        <p>
          We may suspend or terminate access for a material breach, non-payment, security or fraud
          risk, or repeated or serious policy violations. You may stop using the service or cancel a
          paid plan at any time. When access ends, we may delete account content after a reasonable
          period, subject to legal retention duties, backup cycles, and any available export options.
          Provisions that by their nature should survive termination—including intellectual property,
          disclaimers, liability limits, and dispute terms—will continue to apply.
        </p>
      </LegalSection>

      <LegalSection title="16. Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of {COMPANY.product} after
          will provide reasonable notice of material changes. Continued use after the effective date
          constitutes acceptance where permitted by law. If you do not agree, you must stop using the
          service before the updated Terms take effect.
        </p>
      </LegalSection>

      <LegalSection title="17. General provisions">
        <p>
          If any provision is found unenforceable, the remaining provisions remain in effect. A delay
          in enforcing a right is not a waiver. You may not assign these Terms without our written
          consent; we may assign them as part of a lawful reorganisation or transfer of the service.
          These Terms, the Privacy Policy, and any purchase terms shown at checkout form the entire
          agreement about the service and replace earlier discussions on the same subject.
        </p>
      </LegalSection>

      <LegalSection title="18. Contact">
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
