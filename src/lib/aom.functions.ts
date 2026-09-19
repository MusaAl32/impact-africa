import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEPARTMENTS = [
  "platform",
  "business",
  "agriculture",
  "research",
  "education",
  "developer",
  "creative",
  "documents",
] as const;

export const listProblems = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./aom.server");
  const { data, error } = await publicDb()
    .from("aom_problems")
    .select("id, title, summary, category, country, region, severity, evidence, opportunity_score")
    .eq("status", "published")
    .order("opportunity_score", { ascending: false });
  if (error) return { items: [], error: "Could not load problems right now." };
  return { items: data ?? [], error: null as string | null };
});

export const listResearch = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./aom.server");
  const { data, error } = await publicDb()
    .from("aom_research")
    .select("id, title, abstract, category, country, source, source_url, year")
    .order("year", { ascending: false });
  if (error) return { items: [], error: "Could not load research right now." };
  return { items: data ?? [], error: null as string | null };
});

const SubmissionInput = z.object({
  title: z.string().min(4).max(160),
  summary: z.string().min(20).max(4000),
  category: z.string().min(2).max(60),
  country: z.string().min(2).max(60),
  evidenceUrl: z.string().url().max(500).optional().or(z.literal("")),
  contactEmail: z.string().email().max(160).optional().or(z.literal("")),
});

export const submitProblem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmissionInput.parse(input))
  .handler(async ({ data }) => {
    const { publicDb, runItemAnalysis } = await import("./aom.server");

    let aiSummary: string | null = null;
    try {
      const { analysis } = await runItemAnalysis({
        department: "research",
        itemType: "submission",
        title: data.title,
        body: data.summary,
        meta: `Category: ${data.category}\nCountry: ${data.country}`,
      });
      aiSummary = analysis;
    } catch {
      aiSummary = null;
    }

    // Server-side insert so the generated summary is stored by the system, not
    // accepted from the browser (the database rejects client-supplied summaries).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("aom_submissions")
      .insert({
        title: data.title,
        summary: data.summary,
        category: data.category,
        country: data.country,
        evidence_url: data.evidenceUrl || null,
        contact_email: data.contactEmail || null,
        ai_summary: aiSummary,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) return { id: null, analysis: aiSummary, error: "Could not save your submission." };
    return { id: row?.id ?? null, analysis: aiSummary, error: null as string | null };
  });

const AnalyzeInput = z.object({
  itemType: z.enum(["problem", "research", "submission"]),
  itemId: z.string().uuid(),
  department: z.enum(DEPARTMENTS),
});

export const analyzeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { publicDb, runItemAnalysis } = await import("./aom.server");
    const db = publicDb();

    let title = "";
    let body = "";
    let meta = "";

    if (data.itemType === "problem") {
      const { data: row } = await db
        .from("aom_problems")
        .select("title, summary, category, country, region, severity, evidence, opportunity_score")
        .eq("id", data.itemId)
        .maybeSingle();
      if (!row) return { analysis: null, error: "That problem could not be found." };
      title = row.title;
      body = `${row.summary}\n\nEvidence noted: ${row.evidence}`;
      meta = `Category: ${row.category}\nCountry: ${row.country} (${row.region})\nSeverity: ${row.severity}/5\nOpportunity score: ${row.opportunity_score}/100`;
    } else if (data.itemType === "research") {
      const { data: row } = await db
        .from("aom_research")
        .select("title, abstract, category, country, source, year")
        .eq("id", data.itemId)
        .maybeSingle();
      if (!row) return { analysis: null, error: "That research entry could not be found." };
      title = row.title;
      body = row.abstract;
      meta = `Category: ${row.category}\nScope: ${row.country}\nSource: ${row.source}${row.year ? ` (${row.year})` : ""}`;
    } else {
      return { analysis: null, error: "Submissions are analysed when they are created." };
    }

    try {
      const { analysis, model } = await runItemAnalysis({
        department: data.department,
        itemType: data.itemType,
        title,
        body,
        meta,
      });

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("aom_analyses").insert({
        item_type: data.itemType,
        item_id: data.itemId,
        item_title: title,
        department: data.department,
        analysis,
        model,
      });

      return { analysis, error: null as string | null };
    } catch (error) {
      const message = (error as Error)?.message ?? "";
      return {
        analysis: null,
        error: message.includes("402")
          ? "Nuru AI credits are exhausted. Add credits to continue analysing."
          : "Nuru AI could not analyse this entry right now. Please try again.",
      };
    }
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ itemId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./aom.server");
    const { data: rows } = await publicDb()
      .from("aom_analyses")
      .select("id, department, analysis, created_at")
      .eq("item_id", data.itemId)
      .order("created_at", { ascending: false })
      .limit(5);
    return { items: rows ?? [] };
  });
