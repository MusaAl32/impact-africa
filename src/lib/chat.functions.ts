import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const conversationIdSchema = z.object({ conversationId: z.string().uuid() });
const messageSchema = z.object({
  conversationId: z.string().uuid(),
  clientMessageId: z.string().min(1).max(160),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.unknown()).max(80),
  department: z.string().min(1).max(64),
});
const renameSchema = conversationIdSchema.extend({ title: z.string().trim().min(1).max(80) });

async function verifyOwnedConversation(
  supabase: Parameters<Parameters<typeof requireSupabaseAuth.server>[0]>[0] extends never ? never : any,
  userId: string,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .eq("archived", false)
    .maybeSingle();
  if (error) throw new Error("Could not open this conversation.");
  if (!data) throw new Error("Conversation not found.");
  return data;
}

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, title, updated_at, created_at")
      .eq("user_id", context.userId)
      .eq("archived", false)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Could not load conversation history.");
    return { items: data ?? [] };
  });

export const createConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, title: "New conversation" })
      .select("id, title, updated_at, created_at")
      .single();
    if (error || !data) throw new Error("Could not start a new conversation.");
    return data;
  });

export const getLatestOrCreateConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: latest, error: findError } = await context.supabase
      .from("conversations")
      .select("id")
      .eq("user_id", context.userId)
      .eq("archived", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (findError) throw new Error("Could not load your latest conversation.");
    if (latest) return { conversationId: latest.id };

    const { data, error } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, title: "New conversation" })
      .select("id")
      .single();
    if (error || !data) throw new Error("Could not start a new conversation.");
    return { conversationId: data.id };
  });

export const getConversation = createServerFn({ method: "GET" })
  .inputValidator(conversationIdSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const conversation = await verifyOwnedConversation(
      context.supabase,
      context.userId,
      data.conversationId,
    );
    const { data: messages, error } = await context.supabase
      .from("messages")
      .select("client_message_id, role, parts, department, created_at")
      .eq("conversation_id", data.conversationId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(400);
    if (error) throw new Error("Could not load this conversation.");
    return { conversation, messages: messages ?? [] };
  });

export const renameConversation = createServerFn({ method: "POST" })
  .inputValidator(renameSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .update({ title: data.title, updated_at: new Date().toISOString() })
      .eq("id", data.conversationId)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not rename this conversation.");
    return { ok: true };
  });

export const archiveConversation = createServerFn({ method: "POST" })
  .inputValidator(conversationIdSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq("id", data.conversationId)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not archive this conversation.");
    return { ok: true };
  });

export const saveMessage = createServerFn({ method: "POST" })
  .inputValidator(messageSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await verifyOwnedConversation(context.supabase, context.userId, data.conversationId);
    const payload = {
      conversation_id: data.conversationId,
      user_id: context.userId,
      client_message_id: data.clientMessageId,
      role: data.role,
      parts: data.parts,
      department: data.department,
    };
    const { error } = await context.supabase
      .from("messages")
      .upsert(payload, { onConflict: "conversation_id,client_message_id" });
    if (error) throw new Error("This message could not be saved. Please try again.");

    let title: string | null = null;
    if (data.role === "user") {
      const text = data.parts
        .filter((part): part is { type: "text"; text: string } =>
          Boolean(part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part),
        )
        .map((part) => part.text)
        .join(" ")
        .trim();
      if (text) {
        const { data: conversation } = await context.supabase
          .from("conversations")
          .select("title")
          .eq("id", data.conversationId)
          .eq("user_id", context.userId)
          .single();
        if (conversation?.title === "New conversation") title = text.slice(0, 64);
      }
    }

    const { error: touchError } = await context.supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString(), ...(title ? { title } : {}) })
      .eq("id", data.conversationId)
      .eq("user_id", context.userId);
    if (touchError) throw new Error("This conversation could not be updated.");
    return { ok: true, title };
  });

/** Compatibility wrapper retained for older callers. */
export const startFreshConversation = createConversation;