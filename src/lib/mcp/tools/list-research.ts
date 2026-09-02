import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_research",
  title: "List research entries",
  description:
    "Search the Africa Opportunity Map research library of abstracts, sources and publication years.",
  inputSchema: {
    query: z.string().trim().min(1).max(120).optional().describe("Free-text match on title or abstract."),
    country: z.string().trim().min(2).max(60).optional().describe("Filter by country or scope."),
    category: z.string().trim().min(2).max(60).optional().describe("Filter by category."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of entries to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, country, category, limit }) => {
    let request = supabaseAnon()
      .from("aom_research")
      .select("id, title, abstract, category, country, source, source_url, year")
      .order("year", { ascending: false })
      .limit(limit ?? 10);

    if (country) request = request.ilike("country", `%${country}%`);
    if (category) request = request.ilike("category", `%${category}%`);
    if (query) request = request.or(`title.ilike.%${query}%,abstract.ilike.%${query}%`);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { research: data ?? [] },
    };
  },
});
