import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, PROBLEMS } from "@/data/aom";

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "Top African Problems — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "The central intelligence database of Africa's priority problems, organised across twelve opportunity sectors.",
      },
      { property: "og:title", content: "Top African Problems" },
      {
        property: "og:description",
        content: "Priority African problems, evidence, sectors and opportunity scores.",
      },
    ],
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
          Problem Database · Available Now
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight">
          Top African Problems.
        </h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Every major challenge is profiled with evidence, affected populations, existing solutions
          and the technology opportunities it creates. The database expands continuously toward 100
          priority problems.
        </p>
      </section>

      <section className="border-t border-border px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          01 / Twelve Categories
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.slug} className="border border-border bg-surface p-4">
              <span className="text-2xl">{c.emoji}</span>
              <div className="mt-3 text-xs font-bold uppercase tracking-tight">{c.name}</div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          02 / Profiled Problems
        </h2>
        <div className="space-y-4">
          {PROBLEMS.map((p) => (
            <Link
              key={p.slug}
              to="/problems/$slug"
              params={{ slug: p.slug }}
              className="block border border-border bg-background p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-border px-1.5 py-0.5 font-mono text-[9px] uppercase">
                    {p.sector}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold leading-tight">{p.title}</h3>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-2xl font-black text-primary">{p.score}</span>
                  <span className="font-mono text-[9px] uppercase tracking-tighter text-muted-foreground">
                    Opportunity
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 font-mono text-[9px] uppercase text-muted-foreground">
                <span>Severity: {p.severity}</span>
                <span>·</span>
                <span>Urgency: {p.urgency}</span>
                <span>·</span>
                <span>{p.affected}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
