import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { ROLES } from "@/data/aom";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: "Join the Ecosystem — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "Join a pan-African network of developers, researchers, entrepreneurs, universities, investors and community leaders.",
      },
      { property: "og:title", content: "Join the Ecosystem" },
      {
        property: "og:description",
        content: "Builders, researchers and institutions solving African problems together.",
      },
    ],
  }),
  component: EcosystemPage,
});

function EcosystemPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl border-b border-border px-4 pt-12 pb-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Who joins
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {ROLES.map((r) => (
            <div
              key={r}
              className="border border-border bg-surface p-4 text-xs font-bold uppercase tracking-tight"
            >
              {r}
            </div>
          ))}
        </div>
      </section>
      <ComingSoon
        eyebrow="Ecosystem"
        title="Join The Ecosystem."
        description="Profiles, skills and interests connect people to the problems they care about. Registration opens as the builder layer ships; the waitlist is open now."
        status="development"
        bullets={[
          "Country and skills profiles",
          "Problems you follow",
          "Projects and availability",
          "Notifications on matching opportunities",
        ]}
      />
    </>
  );
}
