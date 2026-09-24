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

/**
 * Nuru's current free-tier limits. Paid plans are intentionally not part of
 * this migration and can be introduced later on the Nuru production platform.
 */
export const FREE_LIMITS: Record<UsageKind, number> = {
  message: 20,
  voice_minute: 10,
  file: 3,
  search: 5,
};

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

export function limitMessage(result: QuotaResult): string {
  const labels: Record<UsageKind, string> = {
    message: "messages",
    voice_minute: "voice minutes",
    file: "file uploads",
    search: "web searches",
  };
  return `You've used all ${result.limit} ${labels[result.kind]} for today. Your allowance resets at midnight UTC.`;
}
