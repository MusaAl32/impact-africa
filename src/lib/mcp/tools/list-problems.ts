import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";
import {
  RATE_LIMITS,
  checkRateLimit,
  errorSchema,
  limitSchema,
  offsetSchema,
  paginationSchema,
  publicUrl,
  safeFailure,
  safeFilter,
  safeUrl,
  sanitizeText,
  toolError,
  toolOk,
} from "../shared";

const problemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  country: z.string(),
  region: z.string().nullable(),
  status: z.string(),
  severity: z.number().nullable(),
  opportunityScore: z.number().nullable(),
  evidence: z.string().nullable(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  publicUrl: z.string(),
});

export default defineTool({
  name: "list_problems",
  title: "List public problems and opportunities",
  description:
    "Search the Africa Opportunity Hub's published problem/opportunity records. Read-only and public data only: no submissions, contact details or unpublished records. Supports country, category, keyword, status and pagination filters.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional()
      .describe("Free-text match on title or description."),
    country: z.string().trim().min(2).max(60).optional().describe("Country name, e.g. Kenya."),
    category: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .optional()
      .describe("Sector/category, e.g. Agriculture."),
    status: z
      .literal("published")
      .default("published")
      .describe("Only 'published' records are exposed publicly."),
    limit: limitSchema,
    offset: offsetSchema,
  },
  outputSchema: {
    problems: z.array(problemSchema),
    pagination: paginationSchema,
    error: errorSchema,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, country, category, limit, offset }) => {
    const take = limit ?? 10;
    const skip = offset ?? 0;

    const limited = checkRateLimit("list_problems", RATE_LIMITS.read);
    if (limited) return limited;

    const emptyPagination = { limit: take, offset: skip, returned: 0, hasMore: false };

    try {
      let request = supabaseAnon()
        .from("aom_problems")
        .select(
          "id, title, summary, category, country, region, severity, evidence, opportunity_score, status, created_at, updated_at",
        )
        .eq("status", "published")
        .order("opportunity_score", { ascending: false })
        .order("id", { ascending: true })
        .range(skip, skip + take); // one extra row to detect hasMore

      const countryFilter = safeFilter(country);
      const categoryFilter = safeFilter(category);
      const queryFilter = safeFilter(query);
      if (countryFilter) request = request.ilike("country", `%${countryFilter}%`);
      if (categoryFilter) request = request.ilike("category", `%${categoryFilter}%`);
      if (queryFilter)
        request = request.or(`title.ilike.%${queryFilter}%,summary.ilike.%${queryFilter}%`);

      const { data, error } = await request;
      if (error) return safeFailure("list_problems", error);

      const rows = data ?? [];
      const hasMore = rows.length > take;
      const problems = rows.slice(0, take).map((row) => ({
        id: row.id,
        title: sanitizeText(row.title, 300),
        description: sanitizeText(row.summary, 4000),
        category: sanitizeText(row.category, 80),
        country: sanitizeText(row.country, 80),
        region: sanitizeText(row.region, 80) || null,
        status: row.status,
        severity: typeof row.severity === "number" ? row.severity : null,
        opportunityScore:
          typeof row.opportunity_score === "number" ? row.opportunity_score : null,
        evidence: sanitizeText(row.evidence, 2000) || null,
        publishedAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
        sourceUrl: safeUrl(row.source_url),
        publicUrl: publicUrl("problem", row.id),
      }));

      if (!problems.length) {
        return toolError("no_results", "No published problems matched those filters.", {
          problems: [],
          pagination: emptyPagination,
        });
      }

      return toolOk({
        problems,
        pagination: { limit: take, offset: skip, returned: problems.length, hasMore },
      });
    } catch (cause) {
      return safeFailure("list_problems", cause);
    }
  },
});
