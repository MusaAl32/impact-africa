const FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1/search";

export type WebSource = {
  title: string;
  url: string;
  snippet: string;
  publishedDate: string | null;
  domain: string;
};

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function webSearchConfigured() {
  return Boolean(process.env["FIRECRAWL_API_KEY"]?.trim());
}

/** Live web search using the project's own Firecrawl API key. */
export async function searchWeb(query: string, limit = 5): Promise<WebSource[]> {
  const apiKey = process.env["FIRECRAWL_API_KEY"]?.trim();
  if (!apiKey) throw new Error("Web search is not configured");

  const response = await fetch(FIRECRAWL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: query.slice(0, 300),
      limit: Math.min(Math.max(limit, 1), 8),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`Firecrawl search failed [${response.status}]: ${detail}`);
    throw new Error(`Web search failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: unknown[];
  };
  const raw = Array.isArray(payload.data) ? payload.data : [];

  return raw
    .map((item) => {
      const r = item as Record<string, unknown>;
      const url = clean(r["url"], 500);
      return {
        title: clean(r["title"], 200) || url,
        url,
        snippet: clean(r["description"] ?? r["markdown"], 700),
        publishedDate: clean(r["publishedDate"] ?? r["date"], 40) || null,
        domain: domainOf(url),
      };
    })
    .filter((r) => r.url.startsWith("http"));
}
