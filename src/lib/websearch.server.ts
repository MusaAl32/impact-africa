const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";

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
  return Boolean(process.env["LOVABLE_API_KEY"] && process.env["FIRECRAWL_API_KEY"]);
}

/** Live web search used to ground Nuru answers in citable public sources. */
export async function searchWeb(query: string, limit = 5): Promise<WebSource[]> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !connectionKey) throw new Error("Web search is not configured");

  const response = await fetch(`${GATEWAY}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
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
    data?: { web?: unknown[] } | unknown[];
  };
  const raw = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray((payload.data as { web?: unknown[] })?.web)
      ? ((payload.data as { web?: unknown[] }).web as unknown[])
      : [];

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
