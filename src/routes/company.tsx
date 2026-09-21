import { createFileRoute } from "@tanstack/react-router";

import { COMPANY } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/company")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Company Profile — ${COMPANY.product}` },
      {
        name: "description",
        content:
          "Nuru AI by Matola is an artificial intelligence platform supporting professional growth, innovation, productivity, and digital transformation.",
      },
      { property: "og:title", content: `Company Profile — ${COMPANY.product}` },
      {
        property: "og:description",
        content:
          "Nuru AI — Intelligence for Africa. Connected to the World. Provided by Matola.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompanyProfilePage,
});

function CompanyProfilePage() {
  return (
    <LegalPage
      title="Company Profile"
      intro={`${COMPANY.product} is an advanced artificial intelligence platform owned and operated by ${COMPANY.name}.`}
      showStatus={false}
    >
      <LegalSection title="What we build">
        <p>
          {COMPANY.product} brings together intelligent AI capabilities in a unified platform, helping
          users research, learn, create, solve problems, explore opportunities, and work more
          efficiently. It includes a conversational AI assistant, specialist departments, support for
          40+ African languages, a public Africa Opportunity Map, a business hub, and a personal
          workspace.
        </p>
      </LegalSection>

      <LegalSection title="Our mission">
        <p>
          Our mission is to expand access to powerful, secure, and localized AI technologies designed
          to serve businesses, developers, creators, professionals, students, and communities across
          Africa and beyond.
        </p>
      </LegalSection>

      <LegalSection title="How we build">
        <p>
          We are building {COMPANY.product} with a strong focus on security, accessibility, localization,
          and practical real-world impact, with the long-term goal of connecting African users and
          businesses with opportunities and technologies from around the world.
        </p>
      </LegalSection>

      <LegalSection title="Seller identity">
        <p>
          {COMPANY.name}, trading as {COMPANY.tradingName}, owns and operates {COMPANY.product} and
          is the seller and contracting party. Jurisdiction: {COMPANY.jurisdiction}. Target market:{" "}
          {COMPANY.market}.
        </p>
      </LegalSection>

      <LegalSection title="Vision">
        <p className="text-foreground">{COMPANY.product} — Intelligence for Africa. Connected to the World.</p>
      </LegalSection>
    </LegalPage>
  );
}
