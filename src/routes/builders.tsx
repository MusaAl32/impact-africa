import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/builders")({
  head: () => ({
    meta: [
      { title: "Builder Network — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "A network where African innovators discover problems, projects and collaborators. Join the waitlist.",
      },
      { property: "og:title", content: "Builder Network" },
      {
        property: "og:description",
        content: "Find African problems, projects and collaborators worth your time.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Builder Network"
      title="Find Problems Worth Building On."
      description="We are building a place where African innovators can find problems, projects and collaborators — matched by skills, sector and country."
      status="soon"
      bullets={[
        "Builder profiles and skills",
        "Project openings with required roles",
        "Sector and country matching",
      ]}
    />
  ),
});
