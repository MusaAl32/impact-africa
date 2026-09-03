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

const researchSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  topic: z.string(),
  country: z.string(),
  source: z.string().nullable(),
  year: z.number().nullable(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  publicUrl: z.string(),
});

export default defineTool({
  name: "list_research",
  title: "Search the public research library",
  description:
    "Search the Africa Opportunity Hub's public research library (titles, summaries, sources, publication years). Read-only; only entries published in the public library are returned.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional()
      .describe("Free-text match on title or summary."),
    country: z.string().trim().min(2).max(60).optional().describe("Country or regional scope."),
    category: z.string().trim().min(2).max(60).optional().describe("Topic/category filter."),
    limit: limitSchema,
    offset: offsetSchema,
  },
  outputSchema: {
    research: z.array(researchSchema),
    pagination: paginationSchema,
    error: errorSchema,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, country, category, limit, offset }) => {
    const take = limit ?? 10;
    const skip = offset ?? 0;

    const limited = checkRateLimit("list_research", RATE_LIMITS.read);
    if (limited) return limited;

    const emptyPagination = { limit: take, offset: skip, returned: 0, hasMore: false };

    try {
      let request = supabaseAnon()
        .from("aom_research")
        .select(
          "id, title, abstract, category, country, source, source_url, year, created_at, updated_at",
        )
        .order("year", { ascending: false, nullsFirst: false })
        .order("id", { ascending: true })
        .range(skip, skip + take);

      const countryFilter = safeFilter(country);
      const categoryFilter = safeFilter(category);
      const queryFilter = safeFilter(query);
      if (countryFilter) request = request.ilike("country", `%${countryFilter}%`);
      if (categoryFilter) request = request.ilike("category", `%${categoryFilter}%`);
      if (queryFilter)
        request = request.or(`title.ilike.%${queryFilter}%,abstract.ilike.%${queryFilter}%`);

      const { data, error } = await request;
      if (error) return safeFailure("list_research", error);

      const rows = data ?? [];
      const hasMore = rows.length > take;
      const research = rows.slice(0, take).map((row) => ({
        id: row.id,
        title: sanitizeText(row.title, 300),
        summary: sanitizeText(row.abstract, 4000),
        topic: sanitizeText(row.category, 80),
        country: sanitizeText(row.country, 80),
        source: sanitizeText(row.source, 200) || null,
        year: typeof row.year === "number" ? row.year : null,
        publishedAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
        sourceUrl: safeUrl(row.source_url),
        publicUrl: publicUrl("research", row.id),
      }));

      if (!research.length) {
        return toolError("no_results", "No public research entries matched those filters.", {
          research: [],
          pagination: emptyPagination,
        });
      }

      return toolOk({
        research,
        pagination: { limit: take, offset: skip, returned: research.length, hasMore },
      });
    } catch (cause) {
      return safeFailure("list_research", cause);
    }
  },
});
