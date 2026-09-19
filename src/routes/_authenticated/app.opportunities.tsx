import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { analyzeItem, listProblems, listResearch, submitProblem } from "@/lib/aom.functions";

export const Route = createFileRoute("/_authenticated/app/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Map — African problems analysed by Nuru AI" },
      {
        name: "description",
        content:
          "Browse Africa's mapped problems and research, submit new ones, and have Nuru AI departments turn each into an actionable opportunity.",
      },
      { property: "og:title", content: "Opportunity Map — Nuru AI" },
      {
        property: "og:description",
        content: "Problems, research and submissions analysed by Nuru's specialist AI departments.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

const ANALYSIS_DEPARTMENTS = [
  { id: "business", name: "Business AI" },
  { id: "agriculture", name: "Agriculture AI" },
  { id: "research", name: "Research AI" },
  { id: "education", name: "Education AI" },
  { id: "developer", name: "Developer AI" },
  { id: "creative", name: "Creative AI" },
] as const;

type Tab = "problems" | "research" | "submit";

function OpportunitiesPage() {
  const [tab, setTab] = useState<Tab>("problems");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Opportunity Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Africa&apos;s mapped problems, evidence and community submissions — analysed on demand by
          Nuru&apos;s specialist AI departments.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["problems", "Problems"],
            ["research", "Research"],
            ["submit", "Submit a problem"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={tab === id ? "default" : "outline"}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "problems" && <Problems />}
      {tab === "research" && <Research />}
      {tab === "submit" && <SubmitForm />}
    </div>
  );
}

function AnalysisPanel({
  itemId,
  itemType,
}: {
  itemId: string;
  itemType: "problem" | "research";
}) {
  const run = useServerFn(analyzeItem);
  const [department, setDepartment] = useState<string>("business");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await run({
        data: { itemId, itemType, department: department as (typeof ANALYSIS_DEPARTMENTS)[number]["id"] },
      });
      if (result.error) toast.error(result.error);
      setAnalysis(result.analysis);
    } catch {
      toast.error("Nuru AI could not analyse this entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`dept-${itemId}`}>
          Analysing department
        </label>
        <select
          id={`dept-${itemId}`}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
        >
          {ANALYSIS_DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={analyze} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 size-4" />
          )}
          Analyse with Nuru
        </Button>
      </div>

      {analysis && (
        <div className="prose prose-invert mt-4 max-w-none text-sm prose-headings:text-base">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function Problems() {
  const fetchProblems = useServerFn(listProblems);
  const { data, isLoading } = useQuery({
    queryKey: ["aom", "problems"],
    queryFn: () => fetchProblems(),
  });

  if (isLoading) return <Loading />;
  if (data?.error) return <p className="text-sm text-destructive">{data.error}</p>;

  return (
    <div className="grid gap-4">
      {data?.items.map((p) => (
        <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/12 px-2 py-0.5 font-medium text-primary">
              {p.category}
            </span>
            <span>
              {p.country} · {p.region}
            </span>
            <span>Severity {p.severity}/5</span>
            <span className="font-mono text-primary">Opportunity {p.opportunity_score}/100</span>
          </div>
          <h2 className="mt-3 font-semibold">{p.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
          {p.evidence && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
              Evidence: {p.evidence}
            </p>
          )}
          <AnalysisPanel itemId={p.id} itemType="problem" />
        </article>
      ))}
    </div>
  );
}

function Research() {
  const fetchResearch = useServerFn(listResearch);
  const { data, isLoading } = useQuery({
    queryKey: ["aom", "research"],
    queryFn: () => fetchResearch(),
  });

  if (isLoading) return <Loading />;
  if (data?.error) return <p className="text-sm text-destructive">{data.error}</p>;

  return (
    <div className="grid gap-4">
      {data?.items.map((r) => (
        <article key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/12 px-2 py-0.5 font-medium text-primary">
              {r.category}
            </span>
            <span>{r.country}</span>
            {r.year && <span>{r.year}</span>}
          </div>
          <h2 className="mt-3 font-semibold">{r.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.abstract}</p>
          <AnalysisPanel itemId={r.id} itemType="research" />
        </article>
      ))}
    </div>
  );
}

function SubmitForm() {
  const submit = useServerFn(submitProblem);
  const [pending, setPending] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setAnalysis(null);
    try {
      const result = await submit({
        data: {
          title: String(form.get("title") ?? ""),
          summary: String(form.get("summary") ?? ""),
          category: String(form.get("category") ?? ""),
          country: String(form.get("country") ?? ""),
          evidenceUrl: String(form.get("evidenceUrl") ?? ""),
          contactEmail: String(form.get("contactEmail") ?? ""),
        },
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Problem submitted. Nuru has drafted a first analysis.");
        event.currentTarget.reset();
      }
      setAnalysis(result.analysis);
    } catch {
      toast.error("Please check the form — a field looks invalid.");
    } finally {
      setPending(false);
    }
  }

  const field = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <form className="grid gap-3" onSubmit={onSubmit}>
        <input name="title" className={field} placeholder="Problem title" required />
        <textarea
          name="summary"
          className="min-h-32 w-full rounded-lg border border-border bg-background p-3 text-sm"
          placeholder="Describe the problem, who it affects and what you have observed"
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="category" className={field} placeholder="Category (e.g. Health)" required />
          <input name="country" className={field} placeholder="Country" required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="evidenceUrl" className={field} placeholder="Evidence link (optional)" />
          <input name="contactEmail" className={field} placeholder="Your email (optional)" />
        </div>
        <Button type="submit" disabled={pending} className="justify-self-start">
          {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
          Submit for Nuru analysis
        </Button>
      </form>

      {analysis && (
        <div className="prose prose-invert mt-6 max-w-none border-t border-border pt-4 text-sm prose-headings:text-base">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );
}
