import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Globe2, Layers, ShieldCheck, Zap } from "lucide-react";

import { DeptIcon } from "@/components/dept-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { AGENT_DEPARTMENTS, DEPARTMENTS } from "@/lib/departments";
import { AFRICAN_LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuru AI — One AI. Built for Africa. Connected to the world." },
      {
        name: "description",
        content:
          "Nuru AI unifies specialist AI departments, 40+ African languages, voice and vision, and an Africa business hub into one professional workspace.",
      },
      { property: "og:title", content: "Nuru AI — One AI. Built for Africa." },
      {
        property: "og:description",
        content:
          "Agriculture, business, education, research, documents and languages — coordinated by one African AI system.",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Layers,
    title: "One system, many specialists",
    body: "Ask once. Nuru routes your request across specialist departments and returns a single, coherent answer.",
  },
  {
    icon: Globe2,
    title: "African languages first",
    body: `Translate, detect and converse across ${AFRICAN_LANGUAGES.length}+ languages, with a registry built to keep scaling.`,
  },
  {
    icon: Zap,
    title: "Built for real work",
    body: "Plans, budgets, documents, research, code and campaigns — grounded in African markets and realities.",
  },
  {
    icon: ShieldCheck,
    title: "Honest by design",
    body: "Nuru flags uncertainty and tells you what to verify locally instead of inventing prices, laws or statistics.",
  },
];

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ backgroundImage: "var(--gradient-gold)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="animate-fade-up max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                African AI ecosystem
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl">
                One AI.{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-gold)" }}>
                  Built for Africa.
                </span>{" "}
                Connected to the world.
              </h1>
              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                Nuru is a single intelligent platform with specialist departments for agriculture,
                business, education, research, documents, code and creative work — fluent in
                African languages, voice and images.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/app">
                    Start with Nuru <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/app/languages">Try African translation</Link>
                </Button>
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  ["AI departments", `${AGENT_DEPARTMENTS.length}`],
                  ["African languages", `${AFRICAN_LANGUAGES.length}+`],
                  ["Countries served", "54"],
                  ["Workspace", "Unified"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dd className="font-mono text-2xl font-semibold text-primary">{value}</dd>
                    <dt className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="platform" className="border-b border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              A platform, not a chatbot
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((p) => (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
                  <p.icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="departments" className="border-b border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Specialist AI departments
                </h2>
                <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
                  Each department carries its own expertise and prompts — and they coordinate when a
                  problem spans more than one.
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link to="/app">
                  Open the dashboard <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEPARTMENTS.filter((d) => d.id !== "settings").map((d) => (
                <Link
                  key={d.id}
                  to={d.path}
                  className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <DeptIcon name={d.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold group-hover:text-primary">{d.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="languages" className="border-b border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {AFRICAN_LANGUAGES.length}+ African languages, and growing
            </h2>
            <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground">
              Kiswahili to Chichewa, Hausa to isiZulu, Amharic to Wolof — translation, detection and
              full conversation, with voice where the browser supports it.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {AFRICAN_LANGUAGES.slice(0, 26).map((l) => (
                <span
                  key={l.code}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs"
                >
                  {l.name} <span className="text-muted-foreground">· {l.nativeName}</span>
                </span>
              ))}
              <Link
                to="/app/languages"
                className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary"
              >
                See all {AFRICAN_LANGUAGES.length} →
              </Link>
            </div>
          </div>
        </section>

        <section id="hub" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Africa Business Hub
              </h2>
              <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
                Sector intelligence, trade corridors and market playbooks — with Nuru ready to turn
                any of it into a plan you can act on this week.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Sector snapshots across 8 growth industries",
                  "Regional trade corridors and market notes",
                  "Turn any listing into a business plan",
                  "Save outputs to your personal workspace",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link to="/app/hub">
                  Explore the hub <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
