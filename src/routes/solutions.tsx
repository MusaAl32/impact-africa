import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solution Lab — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "The Solution Lab is where scored opportunities become funded, staffed and piloted African solutions.",
      },
      { property: "og:title", content: "Solution Lab" },
      {
        property: "og:description",
        content: "Where African opportunities become teams, pilots and working solutions.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Solution Lab"
      title="From Opportunity To Working Solution."
      description="The Solution Lab is the build surface of the ecosystem: teams form around scored opportunities, move through research and prototype, and run pilots with partners."
      status="soon"
      bullets={[
        "Solution briefs per opportunity",
        "Team formation and roles",
        "Pilot partners and deployment sites",
        "Impact reporting back into the problem database",
      ]}
    />
  ),
});
