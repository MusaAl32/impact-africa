import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

import type { Database } from "@/integrations/supabase/types";
import { checkRateLimit, toolError, type ToolResult } from "./shared";

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
}

function envValue(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

/**
 * Supabase client bound to the caller's verified OAuth token.
 * Row-level security therefore applies as that signed-in person.
 */
function supabaseForCaller(token: string) {
  const url = envValue(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const key = envValue([
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  ]);
  if (!url || !key) throw new Error("Supabase is not configured");

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const DENIED = toolError(
  "invalid_request",
  "This agent endpoint is restricted. Sign in to Nuru AI and ask an administrator to approve your account for agent access.",
);

/**
 * Every MCP tool call must pass this gate:
 *  1. a verified Nuru AI OAuth token (no anonymous callers),
 *  2. an active, admin-granted agent-access record for that exact user,
 *  3. a per-user rate limit (never a shared global bucket).
 *
 * Returns a structured error result to return as-is, or `null` when allowed.
 */
export async function guardToolCall(tool: string, ctx: ToolContext): Promise<ToolResult | null> {
  if (!ctx.isAuthenticated()) return DENIED;

  const userId = ctx.getUserId();
  const token = ctx.getToken();
  if (!userId || !token) return DENIED;

  const limited = checkRateLimit(`${tool}:${userId}`, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { data, error } = await supabaseForCaller(token)
      .from("mcp_access")
      .select("user_id")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .maybeSingle();
    if (error || !data) return DENIED;
  } catch (cause) {
    console.error("[mcp:guard]", cause);
    return toolError("internal_error", "Access could not be verified. Please retry shortly.");
  }

  return null;
}
