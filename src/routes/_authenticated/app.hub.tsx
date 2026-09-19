import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { NuruChat } from "@/components/nuru-chat";
import { Button } from "@/components/ui/button";
import { CORRIDORS, SECTORS } from "@/lib/hub";

export const Route = createFileRoute("/_authenticated/app/hub")({
  head: () => ({
    meta: [
      { title: "Africa Business Hub — sector intelligence with Nuru AI" },
      {
        name: "description",
        content:
          "Sector snapshots, trade corridors and market signals across African economies — turn any of them into an actionable plan with Nuru AI.",
      },
      { property: "og:title", content: "Africa Business Hub — Nuru AI" },
      {
        property: "og:description",
        content: "Sector intelligence and trade corridors, ready to turn into a business plan.",
      },
    ],
  }),
  component: HubPage,
});

function HubPage() {
  const [prompt, setPrompt] = useState<string | undefined>();
  const [chatKey, setChatKey] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Africa Business Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sector intelligence and trade corridors across the continent. Pick a sector and Nuru turns
          it into a plan for your market.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SECTORS.map((s) => (
          <article key={s.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {s.signals.map((sig) => (
                <span key={sig} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">
                  {sig}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Active markets: {s.markets.join(", ")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setPrompt(`${s.prompt} Sector: ${s.name}.`);
                setChatKey((k) => k + 1);
                document.getElementById("hub-chat")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Plan this with Nuru
            </Button>
          </article>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trade corridors
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CORRIDORS.map((c) => (
            <li key={c.route} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">{c.route}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="hub-chat" className="mt-10 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Work it through with Nuru
        </h2>
        <NuruChat
          key={chatKey}
          department="business"
          {...(prompt ? { initialPrompt: prompt } : {})}
          placeholder="Ask about a market, sector, licence or corridor…"
          suggestions={[
            "Which sector fits a $5,000 starting budget in my country?",
            "Compare exporting to Kenya vs Ghana for processed food",
            "What licences do I need to start trading across a border?",
          ]}
        />
      </section>
    </div>
  );
}
