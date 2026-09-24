import type { SupabaseClient } from "@supabase/supabase-js";

type MemoryRow = { category: string; content: string; updated_at: string };
type MessageRow = { conversation_id: string; role: string; parts: unknown; created_at: string };

function textFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((part): part is { type?: unknown; text?: unknown } => Boolean(part && typeof part === "object"))
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text as string)
    .join("\n")
    .trim();
}

function keywords(query: string) {
  return [...new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3))].slice(0, 20);
}

function score(text: string, words: string[]) {
  const value = text.toLowerCase();
  return words.reduce((sum, word) => sum + (value.includes(word) ? 1 : 0), 0);
}

export async function buildLongTermContext(
  db: SupabaseClient,
  userId: string,
  query: string,
): Promise<string> {
  const memoryDb = db as SupabaseClient<any>;
  const [{ data: memories }, { data: messages }] = await Promise.all([
    memoryDb.from("user_memory").select("category, content, updated_at").eq("user_id", userId).eq("enabled", true).order("updated_at", { ascending: false }).limit(500),
    memoryDb.from("messages").select("conversation_id, role, parts, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1000),
  ]);

  const words = keywords(query);
  const memoryRows = ((memories ?? []) as MemoryRow[])
    .map((row) => ({ row, score: score(row.content, words) }))
    .sort((a, b) => b.score - a.score || b.row.updated_at.localeCompare(a.row.updated_at))
    .slice(0, 18)
    .map(({ row }) => `- [${row.category}] ${row.content}`);

  const historyRows = ((messages ?? []) as MessageRow[])
    .map((row) => ({ row, text: textFromParts(row.parts) }))
    .filter(({ text }) => text)
    .map(({ row, text }) => ({ row, text, score: score(text, words) }))
    .sort((a, b) => b.score - a.score || b.row.created_at.localeCompare(a.row.created_at))
    .slice(0, 16)
    .map(({ row, text }) => `- [${row.role}] ${text.slice(0, 900)}`);

  if (memoryRows.length === 0 && historyRows.length === 0) return "";
  return [
    "Long-term user context retrieved from previous Nuru sessions. Use it only when relevant; do not claim a memory that is not present.",
    memoryRows.length ? `Stored memories:\n${memoryRows.join("\n")}` : "",
    historyRows.length ? `Relevant historical conversation:\n${historyRows.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
}

export async function rememberUserTurn(
  db: SupabaseClient,
  userId: string,
  conversationId: string | undefined,
  text: string,
) {
  const clean = text.trim();
  if (!clean) return;
  // Keep a durable, user-owned memory trail. Retrieval later selects only relevant items.
  const memoryDb = db as SupabaseClient<any>;
  await memoryDb.from("user_memory").insert({
    user_id: userId,
    category: "conversation_turn",
    content: clean.slice(0, 6000),
    ...(conversationId ? { conversation_id: conversationId } : {}),
  });
}
