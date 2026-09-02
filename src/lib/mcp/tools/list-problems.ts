import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_problems",
  title: "List mapped problems",
  description:
    "Search the Africa Opportunity Map problem database. Returns published problems with country, category, severity and opportunity score.",
  inputSchema: {
    query: z.string().trim().min(1).max(120).optional().describe("Free-text match on title or summary."),
    country: z.string().trim().min(2).max(60).optional().describe("Filter by country name, e.g. Kenya."),
    category: z.string().trim().min(2).max(60).optional().describe("Filter by category, e.g. Agriculture."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of problems to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, country, category, limit }) => {
    let request = supabaseAnon()
      .from("aom_problems")
      .select("id, title, summary, category, country, region, severity, opportunity_score, source_url")
      .eq("status", "published")
      .order("opportunity_score", { ascending: false })
      .limit(limit ?? 10);

    if (country) request = request.ilike("country", `%${country}%`);
    if (category) request = request.ilike("category", `%${category}%`);
    if (query) request = request.or(`title.ilike.%${query}%,summary.ilike.%${query}%`);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { problems: data ?? [] },
    };
  },
});
