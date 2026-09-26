import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMemoryStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("user_memory")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not read your memory.");
    return { count: count ?? 0 };
  });

export const clearMyMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("user_memory").delete().eq("user_id", context.userId);
    if (error) throw new Error("Could not clear your memory.");
    return { ok: true };
  });
