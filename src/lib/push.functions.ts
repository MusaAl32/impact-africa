import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const registerPushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ token: z.string().min(20).max(4096) }).parse(input))
  .handler(async ({ data, context }) => {
    // Remove any stale ownership of this token by the same user first, then insert.
    await context.supabase.from("push_subscriptions").delete().eq("token", data.token).eq("user_id", context.userId);
    const { error } = await context.supabase.from("push_subscriptions").insert({ token: data.token, user_id: context.userId, platform: "web" });
    if (error) throw new Error("Could not turn on notifications for this device.");
    return { ok: true };
  });

export const unregisterPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("push_subscriptions").delete().eq("user_id", context.userId);
    if (error) throw new Error("Could not turn off notifications.");
    return { ok: true };
  });

export const getPushStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", context.userId);
    return { devices: count ?? 0 };
  });

/** Admin only: send a notification to every registered device. */
export const sendPushToAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ title: z.string().trim().min(1).max(80), body: z.string().trim().min(1).max(240) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase.from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connKey = process.env["FIREBASE_MESSAGING_API_KEY"];
    if (!lovableKey || !connKey) throw new Error("Notifications aren't connected yet.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs, error } = await supabaseAdmin.from("push_subscriptions").select("id, token").limit(1000);
    if (error) throw new Error("Could not read devices.");
    let sent = 0; let failed = 0; const stale: string[] = [];
    for (const sub of subs ?? []) {
      const res = await fetch("https://connector-gateway.lovable.dev/firebase_messaging/v1/projects/_/messages:send", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connKey, "Content-Type": "application/json" },
        body: JSON.stringify({ message: { token: sub.token, notification: { title: data.title, body: data.body }, webpush: { fcm_options: { link: "/app" } } } }),
      });
      if (res.ok) { sent++; continue; }
      failed++;
      const text = await res.text().catch(() => "");
      if (res.status === 404 || (res.status === 400 && /UNREGISTERED|INVALID_ARGUMENT/.test(text))) stale.push(sub.id);
      else console.error("FCM send failed", res.status, text.slice(0, 200));
    }
    if (stale.length) await supabaseAdmin.from("push_subscriptions").delete().in("id", stale);
    return { sent, failed, removed: stale.length };
  });
