import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Entitlements } from "@/lib/billing.server";

export type PublicPlan = {
  slug: string;
  name: string;
  price_cents: number;
  messages_per_day: number;
  voice_minutes_per_day: number;
  files_per_day: number;
  searches_per_day: number;
  sort_order: number;
};

/** Public: the plan table powers the pricing page for signed-out visitors too. */
export const listPlans = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicPlan[]> => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data, error } = await client
      .from("plans")
      .select(
        "slug, name, price_cents, messages_per_day, voice_minutes_per_day, files_per_day, searches_per_day, sort_order",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as PublicPlan[];
  },
);

export const getMyEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Entitlements> => {
    const { readEntitlements } = await import("@/lib/billing.server");
    return readEntitlements(context.userId);
  });
