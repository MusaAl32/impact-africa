import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import mapImage from "@/assets/nigeria-signal-map.jpg";
import { MAP_COUNTRIES } from "@/data/aom";

export const Route = createFileRoute("/problem-map")({
  head: () => ({
    meta: [
      { title: "The Africa Problem Map — Country Intelligence" },
      {
        name: "description",
        content:
          "Select an African country to view its priority problems and the opportunity vectors they create.",
      },
      { property: "og:title", content: "The Africa Problem Map" },
      {
        property: "og:description",
        content: "Country-level problem and opportunity intelligence across Africa.",
      },
    ],
  }),
  component: ProblemMapPage,
});

function ProblemMapPage() {
  const [selected, setSelected] = useState(MAP_COUNTRIES[0]?.name ?? "");
  const country = MAP_COUNTRIES.find((c) => c.name === selected) ?? MAP_COUNTRIES[0];

  if (!country) return null;


  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Expanding Continuously · In Development
          </span>
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight">
          The Africa Problem Map.
        </h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Select a country to view its priority problems and the opportunity vectors they create.
          Coverage begins with six countries and expands as evidence is verified.
        </p>
      </section>

      <section className="bg-foreground px-4 py-12 text-background">
        <div className="mb-6 flex flex-wrap gap-2">
          {MAP_COUNTRIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelected(c.name)}
              className={`rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${
                c.name === selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-background/20 text-background/70"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <img
          src={mapImage}
          alt="Tactical data visualisation of African problem and builder signal nodes"
          width={1024}
          height={576}
          loading="lazy"
          className="mb-8 aspect-video w-full rounded-sm object-cover outline-1 -outline-offset-1 outline-background/10"
        />

        <h2 className="mb-6 text-3xl font-extrabold tracking-tighter">{country.name}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="border-l border-primary pl-4">
            <div className="mb-3 font-mono text-[10px] uppercase text-primary">
              Priority Problems
            </div>
            <ul className="space-y-2">
              {country.problems.map((p) => (
                <li key={p} className="text-xs font-medium text-background/80">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-l border-signal-green pl-4">
            <div className="mb-3 font-mono text-[10px] uppercase text-signal-green">
              Opportunity Vectors
            </div>
            <ul className="space-y-2">
              {country.opportunities.map((o) => (
                <li key={o} className="text-xs font-medium text-background/80">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Next in the map
        </h2>
        <div className="space-y-2">
          {["Projects per country", "Researchers and builders", "Available datasets"].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-border bg-surface p-4"
            >
              <span className="text-[11px] font-bold uppercase">{i}</span>
              <span className="font-mono text-[9px] uppercase text-muted-foreground">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
        <Link
          to="/problems"
          className="mt-8 block w-full rounded-sm border border-border py-4 text-center text-sm font-bold uppercase tracking-widest"
        >
          Browse the Problem Database
        </Link>
      </section>
    </div>
  );
}
