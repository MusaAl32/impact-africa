import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";

const conversationIdSchema = z.object({ conversationId: z.string().uuid() });
const messageSchema = z.object({
  conversationId: z.string().uuid(),
  clientMessageId: z.string().min(1).max(160),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.unknown()).max(80),
  department: z.string().min(1).max(64),
});
const renameSchema = conversationIdSchema.extend({ title: z.string().trim().min(1).max(80) });
const branchSchema = z.object({
  conversationId: z.string().uuid(),
  // May be empty when the reply has no saved id yet — we then branch from everything saved.
  throughClientMessageId: z.string().max(160).optional().default(""),
});
const replaceFromMessageSchema = z.object({
  conversationId: z.string().uuid(),
  clientMessageId: z.string().min(1).max(160),
});
const guestTranscriptSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    text: z.string().trim().min(1).max(12000),
  })).min(1).max(30),
});

async function verifyOwnedConversation(
  supabase: SupabaseClient<Database>,
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
    // Returns a plain "not found" result instead of throwing: a conversation the
    // caller does not own is an expected outcome, not a server error.
    const { data: conversation, error: lookupError } = await context.supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("id", data.conversationId)
      .eq("user_id", context.userId)
      .eq("archived", false)
      .maybeSingle();
    if (lookupError) throw new Error("Could not open this conversation.");
    if (!conversation) return { conversation: null, messages: [] };

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

export const deleteConversation = createServerFn({ method: "POST" })
  .inputValidator(conversationIdSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("conversations").delete()
      .eq("id", data.conversationId).eq("user_id", context.userId);
    if (error) throw new Error("Could not delete this conversation.");
    return { ok: true };
  });

export const importGuestConversation = createServerFn({ method: "POST" })
  .inputValidator(guestTranscriptSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const first = data.messages.find((message) => message.role === "user")?.text ?? "Guest conversation";
    const { data: conversation, error } = await context.supabase.from("conversations")
      .insert({ user_id: context.userId, title: first.slice(0, 64) }).select("id").single();
    if (error || !conversation) throw new Error("Guest conversation could not be saved.");
    const base = Date.now();
    const rows = data.messages.map((message, index) => ({
      conversation_id: conversation.id, user_id: context.userId,
      client_message_id: `guest-${base}-${index}`, role: message.role,
      parts: [{ type: "text", text: message.text }] as unknown as Json,
      department: "platform", created_at: new Date(base + index).toISOString(),
    }));
    const { error: messageError } = await context.supabase.from("messages").insert(rows);
    if (messageError) {
      await context.supabase.from("conversations").delete().eq("id", conversation.id).eq("user_id", context.userId);
      throw new Error("Guest conversation could not be saved.");
    }
    return { conversationId: conversation.id };
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
      parts: data.parts as Json,
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

/** Removes one owned user turn and every later turn before an edited resend. */
export const replaceFromMessage = createServerFn({ method: "POST" })
  .inputValidator(replaceFromMessageSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await verifyOwnedConversation(context.supabase, context.userId, data.conversationId);
    const { data: rows, error: loadError } = await context.supabase
      .from("messages")
      .select("id, client_message_id, role")
      .eq("conversation_id", data.conversationId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (loadError) throw new Error("This message could not be edited.");
    const index = (rows ?? []).findIndex((row) => row.client_message_id === data.clientMessageId && row.role === "user");
    if (index < 0) throw new Error("This message could not be found.");
    const ids = (rows ?? []).slice(index).map((row) => row.id);
    if (ids.length > 0) {
      const { error: deleteError } = await context.supabase
        .from("messages")
        .delete()
        .eq("conversation_id", data.conversationId)
        .eq("user_id", context.userId)
        .in("id", ids);
      if (deleteError) throw new Error("This message could not be edited.");
    }
    return { ok: true };
  });

export const branchConversation = createServerFn({ method: "POST" })
  .inputValidator(branchSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const source = await verifyOwnedConversation(context.supabase, context.userId, data.conversationId);
    const { data: messages, error: loadError } = await context.supabase
      .from("messages")
      .select("client_message_id, role, parts, department, created_at")
      .eq("conversation_id", data.conversationId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(400);
    if (loadError) throw new Error("Could not branch this conversation.");
    const all = messages ?? [];
    // The message may not be persisted yet (e.g. still streaming). Branching then
    // copies everything saved so far instead of failing.
    const found = data.throughClientMessageId
      ? all.findIndex((message) => message.client_message_id === data.throughClientMessageId)
      : -1;
    const index = found < 0 ? all.length - 1 : found;
    if (index < 0) throw new Error("There is nothing to branch yet.");

    const { data: branch, error: createError } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, title: `${source.title} — branch`.slice(0, 80) })
      .select("id")
      .single();
    if (createError || !branch) throw new Error("Could not create the branch.");

    const rows = (messages ?? []).slice(0, index + 1).map((message) => ({
      conversation_id: branch.id,
      user_id: context.userId,
      client_message_id: message.client_message_id ?? crypto.randomUUID(),
      role: message.role,
      parts: message.parts,
      department: message.department,
    }));
    if (rows.length > 0) {
      const { error: copyError } = await context.supabase.from("messages").insert(rows);
      if (copyError) {
        await context.supabase.from("conversations").delete().eq("id", branch.id).eq("user_id", context.userId);
        throw new Error("Could not copy the conversation into a branch.");
      }
    }
    return { conversationId: branch.id };
  });

const liveTranscriptSchema = z.object({
  turns: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().trim().min(1).max(8000) }))
    .min(1)
    .max(300),
});

/** Saves a finished live voice conversation as a normal Nuru conversation (text only). */
export const saveLiveTranscript = createServerFn({ method: "POST" })
  .inputValidator(liveTranscriptSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const firstUser = data.turns.find((turn) => turn.role === "user")?.text ?? "Live voice conversation";
    const { data: conversation, error: createError } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, title: firstUser.slice(0, 64) })
      .select("id")
      .single();
    if (createError || !conversation) throw new Error("Could not save this voice conversation.");

    const base = Date.now();
    const rows = data.turns.map((turn, index) => ({
      conversation_id: conversation.id,
      user_id: context.userId,
      client_message_id: `live-${base}-${index}`,
      role: turn.role,
      parts: [{ type: "text", text: turn.text }] as unknown as Json,
      department: "voice",
      created_at: new Date(base + index).toISOString(),
    }));
    const { error: insertError } = await context.supabase.from("messages").insert(rows);
    if (insertError) {
      await context.supabase.from("conversations").delete().eq("id", conversation.id).eq("user_id", context.userId);
      throw new Error("Could not save this voice conversation.");
    }
    return { conversationId: conversation.id };
  });

/** Compatibility wrapper retained for older callers. */
export const startFreshConversation = createConversation;