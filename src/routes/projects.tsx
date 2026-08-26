import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "Projects turning African problems into working solutions, with teams, stages and the support they need.",
      },
      { property: "og:title", content: "Projects" },
      {
        property: "og:description",
        content: "Teams, stages and support needs for African solution projects.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Projects"
      title="Projects In Motion."
      description="Every project links a problem, a proposed solution, a country and a team. Stages run from idea and research through prototype, pilot and active deployment."
      status="soon"
      bullets={[
        "Problem and proposed solution",
        "Team and skills needed",
        "Stage: idea, research, prototype, pilot, active",
        "Support needed: funding, developers, research, design, partners",
      ]}
    />
  ),
});
