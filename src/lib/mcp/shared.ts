import { z } from "zod";

/** ---------------------------------------------------------------
 * Shared helpers for the public, read-only Africa Opportunity Hub MCP.
 * Nothing here ever touches private tables, secrets or user data.
 * ---------------------------------------------------------------- */

export const ERROR_CODES = [
  "invalid_request",
  "not_found",
  "no_results",
  "rate_limited",
  "internal_error",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const errorSchema = z
  .object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
  })
  .nullable();

export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

/** Clean, structured failure. Never carries internal details. */
export function toolError(
  code: ErrorCode,
  message: string,
  extra: Record<string, unknown> = {},
): ToolResult {
  const payload = { ...extra, error: { code, message } };
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
    isError: true,
  };
}

export function toolOk(payload: Record<string, unknown>): ToolResult {
  const body = { ...payload, error: null };
  return {
    content: [{ type: "text", text: JSON.stringify(body, null, 2) }],
    structuredContent: body,
  };
}

/**
 * Turn an unexpected throw into a safe, generic error.
 * The real cause is logged server-side only.
 */
export function safeFailure(scope: string, cause: unknown): ToolResult {
  console.error(`[mcp:${scope}]`, cause);
  return toolError(
    "internal_error",
    "The Africa Opportunity Hub could not complete this request. Please retry shortly.",
  );
}

/* ----------------------------- pagination ----------------------------- */

export const MAX_LIMIT = 50;
export const DEFAULT_LIMIT = 10;
export const MAX_OFFSET = 5000;

export const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(MAX_LIMIT)
  .default(DEFAULT_LIMIT)
  .describe(`Maximum rows to return (1-${MAX_LIMIT}, default ${DEFAULT_LIMIT}).`);

export const offsetSchema = z
  .number()
  .int()
  .min(0)
  .max(MAX_OFFSET)
  .default(0)
  .describe(`Rows to skip for pagination (0-${MAX_OFFSET}, default 0).`);

export const paginationSchema = z.object({
  limit: z.number().int(),
  offset: z.number().int(),
  returned: z.number().int(),
  hasMore: z.boolean(),
});

/* ------------------------------ filters ------------------------------- */

/** PostgREST-safe filter fragment: strips wildcards, commas, quotes, parens. */
export function safeFilter(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .replace(/[%_,()"'\\*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length ? cleaned.slice(0, 120) : undefined;
}

/* --------------------------- untrusted text --------------------------- */

const INJECTION_PATTERNS: Array<[RegExp, string]> = [
  [/```/g, "'''"],
  [/<\/?(system|assistant|user|tool)[^>]*>/gi, "[tag]"],
  [
    /\b(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/gi,
    "[redacted instruction]",
  ],
  [/\byou\s+are\s+now\b/gi, "[redacted instruction]"],
  [/\bsystem\s*prompt\b/gi, "[redacted instruction]"],
];

/**
 * Database rows are untrusted input. Neutralise obvious prompt-injection
 * payloads and cap length before the text reaches a model or a client.
 */
export function sanitizeText(value: unknown, maxLength = 4000): string {
  if (typeof value !== "string") return "";
  let text = value.replace(/\u0000/g, "").trim();
  for (const [pattern, replacement] of INJECTION_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  if (text.length > maxLength) text = `${text.slice(0, maxLength)}…`;
  return text;
}

/** Only http(s) links from the database are ever surfaced. */
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const HUB_PATH = "/app/opportunities";

/** Canonical public page for an entry (the Opportunity Hub view). */
export function publicUrl(kind: "problem" | "research", id: string): string {
  return `${HUB_PATH}?type=${kind}&id=${encodeURIComponent(id)}`;
}

/* ---------------------------- rate limiting ---------------------------- */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitConfig = { limit: number; windowMs: number };

/**
 * Per-worker-instance fixed-window limiter. Best-effort abuse protection for
 * an unauthenticated endpoint; not a distributed guarantee.
 */
export function checkRateLimit(key: string, { limit, windowMs }: RateLimitConfig): ToolResult | null {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 500) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return toolError(
      "rate_limited",
      `Too many requests. Retry in about ${retryAfterSeconds} seconds.`,
      { retryAfterSeconds },
    );
  }
  return null;
}

export const RATE_LIMITS = {
  read: { limit: 60, windowMs: 60_000 },
  analysis: { limit: 6, windowMs: 60_000 },
} satisfies Record<string, RateLimitConfig>;

export const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
