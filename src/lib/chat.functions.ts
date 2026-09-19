import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  parts: unknown[];
  department: string | null;
};

async function activeConversationId(
  supabase: { from: (t: string) => any },
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data?.id) return data.id as string;

  const { data: created, error: insertError } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);
  return created.id as string;
}

/** The signed-in person's saved conversation with Nuru. */
export const getConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const conversationId = await activeConversationId(context.supabase as never, context.userId);

    const { data, error } = await context.supabase
      .from("messages")
      .select("id, client_message_id, role, parts, department")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(400);

    if (error) throw new Error(error.message);

    const messages: StoredMessage[] = (data ?? []).map((row) => ({
      id: (row.client_message_id as string | null) ?? (row.id as string),
      role: row.role === "assistant" ? "assistant" : "user",
      parts: Array.isArray(row.parts) ? (row.parts as unknown[]) : [],
      department: (row.department as string | null) ?? null,
    }));

    return { conversationId, messages };
  });

const SaveInput = z.object({
  clientMessageId: z.string().min(1).max(120),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.unknown()).max(200),
  department: z.string().max(60).optional(),
});

export const saveMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }) => {
    const conversationId = await activeConversationId(context.supabase as never, context.userId);

    const { error } = await context.supabase.from("messages").upsert(
      {
        conversation_id: conversationId,
        user_id: context.userId,
        client_message_id: data.clientMessageId,
        role: data.role,
        parts: data.parts as never,
        department: data.department ?? null,
      },
      { onConflict: "conversation_id,client_message_id" },
    );

    if (error) throw new Error(error.message);

    await context.supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { ok: true, conversationId };
  });

/** Archive the current conversation and start an empty one. */
export const startFreshConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .update({ archived: true })
      .eq("user_id", context.userId)
      .eq("archived", false);
    if (error) throw new Error(error.message);

    const conversationId = await activeConversationId(context.supabase as never, context.userId);
    return { conversationId };
  });
