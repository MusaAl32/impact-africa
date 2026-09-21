export type UsageKind = "message" | "voice_minute" | "file" | "search";

export type QuotaResult = {
  allowed: boolean;
  kind: UsageKind;
  limit: number;
  used: number;
  remaining: number;
  plan_slug: string;
  plan_name: string;
  resets_at: string;
};

export type Entitlements = {
  plan_slug: string;
  plan_name: string;
  price_cents: number;
  resets_at: string;
  limits: Record<UsageKind, number>;
  used: Partial<Record<UsageKind, number>>;
};

/** Checks and records one unit of usage for the signed-in user. Server-only. */
export async function consumeQuota(
  userId: string,
  kind: UsageKind,
  quantity = 1,
): Promise<QuotaResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_quota", {
    _user_id: userId,
    _kind: kind,
    _quantity: quantity,
  });
  if (error) throw new Error(error.message);
  return data as unknown as QuotaResult;
}

export async function readEntitlements(userId: string): Promise<Entitlements> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("get_entitlements", { _user_id: userId });
  if (error) throw new Error(error.message);
  return data as unknown as Entitlements;
}

export function limitMessage(result: QuotaResult): string {
  const labels: Record<UsageKind, string> = {
    message: "messages",
    voice_minute: "voice minutes",
    file: "file uploads",
    search: "web searches",
  };
  return `You've used all ${result.limit} ${labels[result.kind]} on your ${result.plan_name} plan today. Your allowance resets at midnight UTC — or upgrade at /pricing for more.`;
}
