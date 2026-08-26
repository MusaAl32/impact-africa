import { createFileRoute } from "@tanstack/react-router";
import { INSIGHTS } from "@/data/aom";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — African Technology & Opportunity Analysis" },
      {
        name: "description",
        content:
          "Analysis of African technology opportunities, problem structure, startup ecosystems, AI developments and builder stories.",
      },
      { property: "og:title", content: "Insights" },
      {
        property: "og:description",
        content: "Analysis on African problems, technology and opportunity.",
      },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
          Insights · Available Now
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight">Insights.</h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Analysis from inside the database: what the evidence says, where opportunity concentrates,
          and what builders keep getting wrong.
        </p>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <div className="divide-y divide-border border-y border-border">
          {INSIGHTS.map((a) => (
            <article key={a.title} className="py-5">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-border px-1.5 py-0.5 font-mono text-[9px] uppercase">
                  {a.category}
                </span>
                <span className="font-mono text-[9px] uppercase text-muted-foreground">
                  {a.read}
                </span>
              </div>
              <h2 className="mt-3 text-base font-extrabold leading-tight tracking-tight">
                {a.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{a.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
