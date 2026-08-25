import { createFileRoute, Link } from "@tanstack/react-router";
import { OPPORTUNITIES, SCORE_DIMENSIONS } from "@/data/aom";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — What Can Be Built In Africa" },
      {
        name: "description",
        content:
          "Scored, buildable opportunities derived from Africa's priority problems, with technology, market and data signals.",
      },
      { property: "og:title", content: "What Can Be Built In Africa" },
      {
        property: "og:description",
        content: "Scored opportunities open for builders across twelve African sectors.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
          Opportunities · Available Now
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight">
          What Can Be Built?
        </h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Each problem in the database produces buildable opportunities. Every opportunity is scored
          across seven dimensions so builders can judge where effort compounds.
        </p>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          01 / Scoring Model
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {SCORE_DIMENSIONS.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-6 py-3">
              <span className="text-xs font-bold uppercase tracking-tight">{d.label}</span>
              <span className="text-right text-[11px] text-muted-foreground">{d.question}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          02 / Open Opportunities
        </h2>
        <div className="space-y-6">
          {OPPORTUNITIES.map((o) => (
            <div key={o.slug} className="border border-border bg-surface p-5">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-border px-1.5 py-0.5 font-mono text-[9px] uppercase">
                    {o.sector}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold leading-tight">{o.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{o.problem}</p>
                  <div className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">
                    {o.technology}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
                    {o.countries.join(" · ")}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-2xl font-black text-primary">{o.score}</span>
                  <span className="font-mono text-[9px] uppercase tracking-tighter text-muted-foreground">
                    Opportunity Score
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-signal-green" />
                  <span className="font-mono text-[10px] font-bold uppercase">{o.status}</span>
                </div>
                <Link
                  to="/opportunities/$slug"
                  params={{ slug: o.slug }}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  Explore Opportunity &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
