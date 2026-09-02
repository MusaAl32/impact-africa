import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

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

export default defineTool({
  name: "analyze_entry",
  title: "Analyse an entry with Nuru AI",
  description:
    "Run a Nuru AI specialist analysis on a problem or research entry: context, root drivers, opportunity, who should build it, and a first-90-days plan.",
  inputSchema: {
    itemType: z.enum(["problem", "research"]).describe("Which table the entry lives in."),
    itemId: z.string().uuid().describe("The entry id from list_problems or list_research."),
    department: z
      .enum(DEPARTMENTS)
      .default("business")
      .describe("Which Nuru AI department should analyse the entry."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ itemType, itemId, department }) => {
    const db = supabaseAnon();
    let title = "";
    let body = "";
    let meta = "";

    if (itemType === "problem") {
      const { data: row, error } = await db
        .from("aom_problems")
        .select("title, summary, category, country, region, severity, evidence, opportunity_score")
        .eq("id", itemId)
        .eq("status", "published")
        .maybeSingle();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      if (!row) return { content: [{ type: "text", text: "That problem could not be found." }], isError: true };
      title = row.title;
      body = `${row.summary}\n\nEvidence noted: ${row.evidence}`;
      meta = `Category: ${row.category}\nCountry: ${row.country} (${row.region})\nSeverity: ${row.severity}/5\nOpportunity score: ${row.opportunity_score}/100`;
    } else {
      const { data: row, error } = await db
        .from("aom_research")
        .select("title, abstract, category, country, source, year")
        .eq("id", itemId)
        .maybeSingle();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      if (!row) return { content: [{ type: "text", text: "That research entry could not be found." }], isError: true };
      title = row.title;
      body = row.abstract;
      meta = `Category: ${row.category}\nScope: ${row.country}\nSource: ${row.source}${row.year ? ` (${row.year})` : ""}`;
    }

    const { runItemAnalysis } = await import("@/lib/aom.server");
    try {
      const { analysis } = await runItemAnalysis({
        department: department ?? "business",
        itemType,
        title,
        body,
        meta,
      });
      return {
        content: [{ type: "text", text: analysis }],
        structuredContent: { title, department: department ?? "business", analysis },
      };
    } catch (error) {
      const message = (error as Error)?.message ?? "";
      return {
        content: [
          {
            type: "text",
            text: message.includes("402")
              ? "Nuru AI credits are exhausted. Add credits to continue analysing."
              : "Nuru AI could not analyse this entry right now.",
          },
        ],
        isError: true,
      };
    }
  },
});
