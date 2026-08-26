import { createFileRoute, Link } from "@tanstack/react-router";
import { FEATURE_STATUS, STATUS_LABEL } from "@/data/aom";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Africa Opportunity Intelligence Ecosystem" },
      {
        name: "description",
        content:
          "Africa Opportunity Map exists so African problems are not invisible. Mission, philosophy and what we are building in public.",
      },
      { property: "og:title", content: "About Africa Opportunity Map" },
      {
        property: "og:description",
        content: "Find the problems. Discover the opportunities. Connect the builders.",
      },
    ],
  }),
  component: AboutPage,
});

const CHAIN = [
  "Problem",
  "Evidence",
  "Understanding",
  "Opportunity",
  "Builders",
  "Solution",
  "Impact",
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
          About
        </div>
        <h1 className="mb-6 max-w-[16ch] text-4xl font-extrabold leading-[0.95] tracking-tight text-balance">
          African Problems Should Not Be Invisible.
        </h1>
        <p className="max-w-[54ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Africa Opportunity Map is a digital intelligence and collaboration ecosystem. It
          identifies the continent's most important challenges and connects them with data,
          technology, talent, research and partnerships.
        </p>
      </section>

      <section className="grid divide-y divide-border border-y border-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="p-6">
          <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Mission</div>
          <p className="text-sm leading-relaxed">
            To map Africa's most important challenges and connect them with the data, technology,
            talent and resources that accelerate African innovation.
          </p>
        </div>
        <div className="p-6">
          <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Vision</div>
          <p className="text-sm leading-relaxed">
            Africa's leading problem-solving intelligence ecosystem, where every major challenge can
            become an opportunity for innovation and impact.
          </p>
        </div>
      </section>

      <section className="bg-foreground px-4 py-12 text-background">
        <h2 className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background/50">
          01 / Core Philosophy
        </h2>
        <ol className="space-y-3">
          {CHAIN.map((step, i) => (
            <li key={step} className="flex items-baseline gap-4 border-l border-primary pl-4">
              <span className="font-mono text-[10px] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg font-extrabold uppercase tracking-tight">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          02 / What We Are Building
        </h2>
        <div className="space-y-2">
          {FEATURE_STATUS.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between gap-3 border border-border bg-surface p-4"
            >
              <span className="text-[11px] font-bold uppercase">{f.name}</span>
              <span
                className={`rounded-sm px-2 py-0.5 font-mono text-[9px] uppercase ${
                  f.status === "available"
                    ? "bg-signal-green text-background"
                    : f.status === "development"
                      ? "bg-signal-amber text-background"
                      : "border border-border text-muted-foreground"
                }`}
              >
                {STATUS_LABEL[f.status]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-[48ch] text-sm font-bold uppercase leading-snug tracking-tight">
          Find the problems. Discover the opportunities. Connect the builders. Build Africa's
          future.
        </p>
        <Link
          to="/submit"
          className="mt-6 block w-full rounded-sm border border-border py-4 text-center text-sm font-bold uppercase tracking-widest"
        >
          Submit a Problem
        </Link>
      </section>
    </div>
  );
}
