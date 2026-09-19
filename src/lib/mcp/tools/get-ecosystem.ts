import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";
import { guardToolCall } from "../guard";
import {
  errorSchema,
  publicUrl,
  safeFailure,
  sanitizeText,
  toolOk,
} from "../shared";
import { DEPARTMENTS } from "@/lib/departments";
import { AFRICAN_LANGUAGES } from "@/lib/languages";
import { SECTORS, CORRIDORS } from "@/lib/hub";

const SECTIONS = ["overview", "departments", "languages", "sectors", "stats"] as const;

const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  tagline: z.string(),
});

const languageSchema = z.object({
  code: z.string(),
  name: z.string(),
  nativeName: z.string(),
  region: z.string(),
  status: z.string(),
  capabilities: z.array(z.string()),
});

const sectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  markets: z.array(z.string()),
  signals: z.array(z.string()),
});

export default defineTool({
  name: "get_ecosystem",
  title: "Nuru AI ecosystem status (real time)",
  description:
    "Describe the live Nuru AI / Africa Opportunity Hub ecosystem: the AI departments and what each does, supported African languages and their capabilities, the Business Hub sectors and trade corridors, and real-time public counts of mapped problems and research (with top countries, categories and the newest published entries). Read-only and public data only.",
  inputSchema: {
    section: z
      .enum(SECTIONS)
      .default("overview")
      .describe(
        "Which slice to return: 'overview' (everything, summarised), 'departments', 'languages', 'sectors' or 'stats' (live counts only).",
      ),
  },
  outputSchema: {
    platform: z.object({
      name: z.string(),
      tagline: z.string(),
      description: z.string(),
      publicHubUrl: z.string(),
      generatedAt: z.string(),
    }),
    departments: z.array(departmentSchema),
    languages: z.object({
      total: z.number().int(),
      regions: z.array(z.string()),
      items: z.array(languageSchema),
    }),
    hub: z.object({
      sectors: z.array(sectorSchema),
      corridors: z.array(z.object({ route: z.string(), note: z.string() })),
    }),
    stats: z
      .object({
        publishedProblems: z.number().int(),
        publicResearch: z.number().int(),
        topCountries: z.array(z.object({ country: z.string(), count: z.number().int() })),
        topCategories: z.array(z.object({ category: z.string(), count: z.number().int() })),
        latestProblems: z.array(
          z.object({ id: z.string(), title: z.string(), country: z.string(), publicUrl: z.string() }),
        ),
      })
      .nullable(),
    error: errorSchema,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ section }, ctx) => {
    const slice = section ?? "overview";

    const limited = await guardToolCall("get_ecosystem", ctx);
    if (limited) return limited;

    const wants = (name: (typeof SECTIONS)[number]) => slice === "overview" || slice === name;

    try {
      const platform = {
        name: "Nuru AI — Africa Opportunity Hub",
        tagline: "One AI. Built for Africa. Connected to the world.",
        description:
          "Nuru AI coordinates specialist AI departments over a public map of African problems, research and opportunities. This MCP server exposes the public, read-only slice of that ecosystem.",
        publicHubUrl: "/app/opportunities",
        generatedAt: new Date().toISOString(),
      };

      const departments = wants("departments")
        ? DEPARTMENTS.map((d) => ({
            id: d.id,
            name: d.name,
            path: d.path,
            tagline: d.tagline,
          }))
        : [];

      const languages = wants("languages")
        ? {
            total: AFRICAN_LANGUAGES.length,
            regions: Array.from(new Set(AFRICAN_LANGUAGES.map((l) => l.region))).sort(),
            items: AFRICAN_LANGUAGES.map((l) => ({
              code: l.code,
              name: l.name,
              nativeName: l.nativeName,
              region: l.region,
              status: l.status,
              capabilities: [...l.capabilities] as string[],
            })),
          }
        : { total: AFRICAN_LANGUAGES.length, regions: [], items: [] };

      const hub = wants("sectors")
        ? {
            sectors: SECTORS.map((s) => ({
              id: s.id,
              name: s.name,
              summary: s.summary,
              markets: [...s.markets],
              signals: [...s.signals],
            })),
            corridors: CORRIDORS.map((c) => ({
              route: c.route,
              note: sanitizeText(c.note, 600),
            })),
          }
        : { sectors: [], corridors: [] };

      let stats: {
        publishedProblems: number;
        publicResearch: number;
        topCountries: Array<{ country: string; count: number }>;
        topCategories: Array<{ category: string; count: number }>;
        latestProblems: Array<{ id: string; title: string; country: string; publicUrl: string }>;
      } | null = null;

      if (wants("stats")) {
        const db = supabaseAnon();
        const [problems, research] = await Promise.all([
          db
            .from("aom_problems")
            .select("id, title, country, category, created_at", { count: "exact" })
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(500),
          db.from("aom_research").select("id", { count: "exact", head: true }),
        ]);

        if (problems.error) return safeFailure("get_ecosystem", problems.error);
        if (research.error) return safeFailure("get_ecosystem", research.error);

        const rows = problems.data ?? [];
        const tally = (key: "country" | "category") => {
          const counts = new Map<string, number>();
          for (const row of rows) {
            const value = sanitizeText(row[key], 80);
            if (!value) continue;
            counts.set(value, (counts.get(value) ?? 0) + 1);
          }
          return Array.from(counts, ([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        };

        stats = {
          publishedProblems: problems.count ?? rows.length,
          publicResearch: research.count ?? 0,
          topCountries: tally("country").map(({ name, count }) => ({ country: name, count })),
          topCategories: tally("category").map(({ name, count }) => ({ category: name, count })),
          latestProblems: rows.slice(0, 5).map((row) => ({
            id: row.id,
            title: sanitizeText(row.title, 200),
            country: sanitizeText(row.country, 80),
            publicUrl: publicUrl("problem", row.id),
          })),
        };
      }

      return toolOk({ platform, departments, languages, hub, stats });
    } catch (cause) {
      return safeFailure("get_ecosystem", cause);
    }
  },
});
