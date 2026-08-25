import { createFileRoute, Link } from "@tanstack/react-router";
import mapImage from "@/assets/nigeria-signal-map.jpg";
import { CATEGORIES, OPPORTUNITIES, PROBLEMS, BUILD_LOG } from "@/data/aom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Africa Opportunity Map — Problems Into Opportunities" },
      {
        name: "description",
        content:
          "Africa Opportunity Map identifies the continent's biggest challenges and connects them with data, technology, researchers and builders.",
      },
      { property: "og:title", content: "Africa Opportunity Map" },
      {
        property: "og:description",
        content:
          "Discover problems. Identify opportunities. Connect builders. Create African solutions.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="overflow-hidden px-4 pt-12 pb-8">
        <div className="animate-fade-up">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Live Signal Feed
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight text-balance">
            Africa's Problems <br />
            Are <span className="italic text-primary">Greatest</span> Opportunities.
          </h1>
          <p className="mb-8 max-w-[42ch] text-sm font-medium leading-relaxed text-muted-foreground">
            Connecting continental challenges with the data, technology, and builders required to
            solve them.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/problem-map"
              className="w-full rounded-sm bg-primary py-4 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground"
            >
              Explore the Map
            </Link>
            <Link
              to="/submit"
              className="w-full rounded-sm border border-border py-4 text-center text-sm font-bold uppercase tracking-widest"
            >
              Submit a Problem
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 divide-x divide-border border-y border-border">
        <div className="p-6">
          <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Countries</div>
          <div className="text-3xl font-extrabold tracking-tighter">54</div>
        </div>
        <div className="p-6">
          <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">
            Priority Problems
          </div>
          <div className="text-3xl font-extrabold tracking-tighter text-primary">100+</div>
        </div>
        <div className="border-t border-border p-6">
          <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">
            Active Sectors
          </div>
          <div className="text-3xl font-extrabold tracking-tighter">12</div>
        </div>
        <div className="border-t border-border p-6">
          <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Community</div>
          <div className="pt-2 text-sm font-bold uppercase leading-none tracking-tight">
            Growing Rapidly
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            01 / Problem Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {CATEGORIES.slice(0, 4).map((c) => (
            <div
              key={c.slug}
              className="flex aspect-square flex-col justify-between border border-border bg-surface p-4"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-bold uppercase tracking-tight">{c.name}</span>
            </div>
          ))}
        </div>
        <Link
          to="/problems"
          className="mt-4 block w-full text-center font-mono text-[11px] uppercase text-muted-foreground"
        >
          View All 12 Categories &rarr;
        </Link>
      </section>

      <section className="overflow-hidden bg-foreground px-4 py-12 text-background">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded border border-background/20 px-1.5 py-0.5 font-mono text-[9px]">
              EXPANDING CONTINUOUSLY
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter">Nigeria Platform State</h2>
        </div>

        <div className="mb-8">
          <img
            src={mapImage}
            alt="Tactical intelligence map showing problem and builder nodes across Nigeria"
            width={1024}
            height={576}
            className="mb-6 aspect-video w-full rounded-sm object-cover outline-1 -outline-offset-1 outline-background/10"
          />

          <div className="space-y-4">
            <div className="border-l border-primary pl-4">
              <div className="mb-1 font-mono text-[10px] uppercase text-primary">
                Priority Problems
              </div>
              <p className="text-xs font-medium text-background/80">
                Energy Reliability, Digital Skills, Market Access
              </p>
            </div>
            <div className="border-l border-signal-green pl-4">
              <div className="mb-1 font-mono text-[10px] uppercase text-signal-green">
                Opportunity Vectors
              </div>
              <p className="text-xs font-medium text-background/80">
                AI Skills Platforms, Energy Analytics
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/problem-map"
          className="block w-full border border-background/20 py-3 text-center font-mono text-[10px] uppercase tracking-widest"
        >
          Open the Problem Map
        </Link>
      </section>

      <section className="bg-surface px-4 py-12">
        <h2 className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          02 / Scored Opportunities
        </h2>

        <div className="space-y-6">
          {OPPORTUNITIES.slice(0, 2).map((o) => (
            <div key={o.slug} className="border border-border p-5">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-border px-1.5 py-0.5 font-mono text-[9px] uppercase">
                    {o.sector}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold leading-tight">{o.title}</h3>
                </div>
                <div className="flex flex-col items-end">
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
                  Explore &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-4 py-12">
        <h2 className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          03 / Top Problems
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {PROBLEMS.map((p, i) => (
            <Link
              key={p.slug}
              to="/problems/$slug"
              params={{ slug: p.slug }}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-sm font-extrabold tracking-tight">{p.title}</div>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">
                    {p.sector}
                  </div>
                </div>
              </div>
              <span className="text-lg font-black text-primary">{p.score}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          04 / Building in Public
        </h2>
        <div className="space-y-2">
          {BUILD_LOG.thisWeek.map((item) => (
            <Row key={item} name={item} tone="available" label="Available" />
          ))}
          {BUILD_LOG.building.map((item) => (
            <Row key={item} name={item} tone="development" label="In Development" />
          ))}
          {BUILD_LOG.next.map((item) => (
            <Row key={item} name={item} tone="soon" label="Coming Soon" />
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({
  name,
  tone,
  label,
}: {
  name: string;
  tone: "available" | "development" | "soon";
  label: string;
}) {
  const badge =
    tone === "available"
      ? "bg-signal-green text-background"
      : tone === "development"
        ? "bg-signal-amber text-background"
        : "border border-border text-muted-foreground";

  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background p-3">
      <span className="text-[11px] font-bold uppercase">{name}</span>
      <span className={`rounded-sm px-2 py-0.5 font-mono text-[9px] uppercase ${badge}`}>
        {label}
      </span>
    </div>
  );
}
