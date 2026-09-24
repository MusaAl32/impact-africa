/**
 * Nuru AI model utilities.
 *
 * This file intentionally contains no hosting-provider or payment-provider
 * integration. AI credentials are supplied through server-side environment
 * variables only.
 */

export const NURU_MODEL = "gemini-3.1-flash-lite";

export function requireGeminiApiKey() {
  const key = process.env["GEMINI_API_KEY"]?.trim();
  if (!key) throw new Error("Nuru AI is not configured: missing GEMINI_API_KEY.");
  return key;
}

export function describeGatewayFailure(error: unknown, subject: string) {
  let status: number | undefined;
  const details: string[] = [];
  let current: unknown = error;

  for (let depth = 0; current && depth < 6; depth += 1) {
    const node = current as {
      statusCode?: number;
      status?: number;
      message?: string;
      cause?: unknown;
    };
    status ??= node.statusCode ?? node.status;
    if (typeof node.message === "string") details.push(node.message);
    current = node.cause;
  }

  const detail = details.join(" | ");
  console.error(`Nuru ${subject} error`, status ?? "", detail);

  if (status === 429 || /rate limit|quota|high demand|overloaded/i.test(detail)) {
    return "Nuru is receiving many requests. Please wait a moment and try again.";
  }
  if (status === 401 || status === 403) {
    return `Nuru is not authorised to run ${subject} right now. Please check the AI configuration.`;
  }
  return `Nuru could not complete that ${subject}. Please try again.`;
}
