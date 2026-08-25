import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { OPPORTUNITIES, PROBLEMS, SCORE_DIMENSIONS } from "@/data/aom";

export const Route = createFileRoute("/opportunities/$slug")({
  loader: ({ params }) => {
    const opportunity = OPPORTUNITIES.find((o) => o.slug === params.slug);
    if (!opportunity) throw notFound();
    return { opportunity };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Opportunity unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const { opportunity } = loaderData;
    return {
      meta: [
        { title: `${opportunity.title} — Africa Opportunity Map` },
        { name: "description", content: opportunity.problem },
        { property: "og:title", content: opportunity.title },
        { property: "og:description", content: opportunity.problem },
      ],
    };
  },
  component: OpportunityDetail,
});

function OpportunityDetail() {
  const { opportunity: o } = Route.useLoaderData();
  const problem = PROBLEMS.find((p) => p.slug === o.problemSlug);

  return (
    <article className="mx-auto max-w-5xl">
      <header className="px-4 pt-12 pb-8">
        <Link
          to="/opportunities"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          &larr; Opportunities
        </Link>
        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <span className="rounded-full bg-border px-1.5 py-0.5 font-mono text-[9px] uppercase">
              {o.sector}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1] tracking-tight text-balance">
              {o.title}
            </h1>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-4xl font-black text-primary">{o.score}</span>
            <span className="font-mono text-[9px] uppercase tracking-tighter text-muted-foreground">
              High Opportunity
            </span>
          </div>
        </div>
        <p className="mt-5 max-w-[56ch] text-sm font-medium leading-relaxed text-muted-foreground">
          {o.problem}
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span className="size-2 rounded-full bg-signal-green" />
          <span className="font-mono text-[10px] font-bold uppercase">{o.status}</span>
        </div>
      </header>

      <section className="grid grid-cols-2 divide-x divide-border border-y border-border">
        <Cell label="Technology" value={o.technology} />
        <Cell label="Impact Potential" value={o.impact} />
        <Cell label="Countries" value={o.countries.join(", ")} border />
        <Cell label="Sector" value={o.sector} border />
      </section>

      <section className="px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          01 / Opportunity Score Breakdown
        </h2>
        <div className="space-y-4">
          {SCORE_DIMENSIONS.map((d) => {
            const value = o.scores[d.key];
            return (
              <div key={d.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-tight">{d.label}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{value}</span>
                </div>
                <div className="h-1.5 w-full bg-border">
                  <div className="h-full bg-primary" style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {problem ? (
        <section className="border-t border-border bg-surface px-4 py-12">
          <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            02 / Source Problem
          </h2>
          <Link
            to="/problems/$slug"
            params={{ slug: problem.slug }}
            className="block border border-border bg-background p-5"
          >
            <h3 className="text-lg font-extrabold leading-tight">{problem.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{problem.summary}</p>
            <span className="mt-4 block text-[10px] font-bold uppercase tracking-widest">
              Read the intelligence profile &rarr;
            </span>
          </Link>
        </section>
      ) : null}

      <section className="border-t border-border px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          03 / Build It
        </h2>
        <p className="mb-6 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          This opportunity is open. Join the ecosystem to register interest, or submit evidence that
          sharpens the problem definition.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/ecosystem"
            className="w-full rounded-sm bg-primary py-4 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground"
          >
            Join the Ecosystem
          </Link>
          <Link
            to="/submit"
            className="w-full rounded-sm border border-border py-4 text-center text-sm font-bold uppercase tracking-widest"
          >
            Submit a Problem
          </Link>
        </div>
      </section>
    </article>
  );
}

function Cell({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`p-6 ${border ? "border-t border-border" : ""}`}>
      <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-extrabold tracking-tight">{value}</div>
    </div>
  );
}
