import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PROBLEMS } from "@/data/aom";

export const Route = createFileRoute("/problems/$slug")({
  loader: ({ params }) => {
    const problem = PROBLEMS.find((p) => p.slug === params.slug);
    if (!problem) throw notFound();
    return { problem };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Problem unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const { problem } = loaderData;
    return {
      meta: [
        { title: `${problem.title} — Africa Opportunity Map` },
        { name: "description", content: problem.summary },
        { property: "og:title", content: problem.title },
        { property: "og:description", content: problem.summary },
      ],
    };
  },
  component: ProblemDetail,
});

function ProblemDetail() {
  const { problem: p } = Route.useLoaderData();

  return (
    <article className="mx-auto max-w-5xl">
      <header className="px-4 pt-12 pb-8">
        <Link
          to="/problems"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          &larr; Problem database
        </Link>
        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <span className="rounded-full bg-border px-1.5 py-0.5 font-mono text-[9px] uppercase">
              {p.sector}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1] tracking-tight text-balance">
              {p.title}
            </h1>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-4xl font-black text-primary">{p.score}</span>
            <span className="font-mono text-[9px] uppercase tracking-tighter text-muted-foreground">
              Opportunity / 100
            </span>
          </div>
        </div>
        <p className="mt-5 max-w-[56ch] text-sm font-medium leading-relaxed text-muted-foreground">
          {p.summary}
        </p>
      </header>

      <section className="grid grid-cols-2 divide-x divide-border border-y border-border">
        <Stat label="Severity" value={p.severity} />
        <Stat label="Urgency" value={p.urgency} />
        <Stat label="People Affected" value={p.affected} border />
        <Stat label="Countries" value={`${p.countries.length} mapped`} border />
      </section>

      <section className="px-4 py-12">
        <SectionTitle index="01" title="Detailed Description" />
        <p className="max-w-[62ch] text-sm leading-relaxed">{p.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {p.countries.map((c) => (
            <span
              key={c}
              className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <SectionTitle index="02" title="Evidence & Research" />
        <ul className="mb-8 space-y-3">
          {p.evidence.map((e) => (
            <li key={e} className="flex gap-3 text-xs leading-relaxed">
              <span className="font-mono text-primary">·</span>
              {e}
            </li>
          ))}
        </ul>
        <div className="divide-y divide-border border-y border-border">
          {p.sources.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-xs font-bold uppercase tracking-tight">{s.label}</span>
              <span className="shrink-0 font-mono text-[9px] uppercase text-muted-foreground">
                {s.org}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12">
        <SectionTitle index="03" title="Landscape" />
        <div className="grid gap-6 md:grid-cols-3">
          <List title="Existing Solutions" items={p.existingSolutions} />
          <List title="Organizations" items={p.organizations} />
          <List title="Startups Working On It" items={p.startups} />
        </div>
      </section>

      <section className="bg-foreground px-4 py-12 text-background">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background/50">
          04 / Technology Opportunities
        </h2>
        <ul className="space-y-4">
          {p.techOpportunities.map((t) => (
            <li key={t} className="border-l border-primary pl-4 text-sm font-bold tracking-tight">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DarkList title="Available Data" items={p.data} />
          <DarkList title="Possible Partners" items={p.partners} />
          <DarkList title="Funding Opportunities" items={p.funding} />
        </div>
      </section>

      <section className="border-t border-border px-4 py-12">
        <SectionTitle index="05" title="Suggested Projects" />
        <div className="mb-10 space-y-2">
          {p.projects.map((pr) => (
            <div
              key={pr}
              className="flex items-center justify-between border border-border bg-surface p-4"
            >
              <span className="text-xs font-bold uppercase tracking-tight">{pr}</span>
              <span className="font-mono text-[9px] uppercase text-signal-green">
                Open for builders
              </span>
            </div>
          ))}
        </div>

        <SectionTitle index="06" title="Related Problems" />
        <div className="divide-y divide-border border-y border-border">
          {p.related.map((slug) => {
            const rel = PROBLEMS.find((x) => x.slug === slug);
            if (!rel) return null;
            return (
              <Link
                key={slug}
                to="/problems/$slug"
                params={{ slug }}
                className="flex items-center justify-between py-4"
              >
                <span className="text-sm font-extrabold tracking-tight">{rel.title}</span>
                <span className="text-lg font-black text-primary">{rel.score}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
      {index} / {title}
    </h2>
  );
}

function Stat({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`p-6 ${border ? "border-t border-border" : ""}`}>
      <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-lg font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[9px] uppercase tracking-widest text-primary">{title}</h3>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="text-xs leading-relaxed text-muted-foreground">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DarkList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[9px] uppercase tracking-widest text-signal-green">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="text-xs leading-relaxed text-background/70">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
