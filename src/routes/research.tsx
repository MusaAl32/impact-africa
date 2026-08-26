import { createFileRoute } from "@tanstack/react-router";
import { RESEARCH } from "@/data/aom";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Library — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "Continental strategies, development finance research and academic work linked to Africa's priority problems and sectors.",
      },
      { property: "og:title", content: "Research Library" },
      {
        property: "og:description",
        content: "Evidence sources linked to African problems, countries and opportunities.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
          Research · Available Now
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight">
          Research Library.
        </h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Every source is linked to the problems, countries, sectors and opportunities it informs.
          Evidence is what separates an opinion from an opportunity.
        </p>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <div className="divide-y divide-border border-y border-border">
          {RESEARCH.map((r) => (
            <div key={r.title} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-extrabold tracking-tight">{r.title}</h2>
                <span className="shrink-0 font-mono text-[9px] uppercase text-muted-foreground">
                  {r.type}
                </span>
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase text-primary">{r.org}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.topics.map((t) => (
                  <span
                    key={t}
                    className="border border-border px-2 py-1 font-mono text-[9px] uppercase text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
