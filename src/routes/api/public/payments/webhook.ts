import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";
import type { Database } from "@/integrations/supabase/types";

const PRICE_TO_PLAN: Record<string, string> = {
  nuru_pro_monthly: "pro",
  nuru_pro_plus_monthly: "pro_plus",
  nuru_pro_max_monthly: "pro_max",
};

let cached: ReturnType<typeof createClient<Database>> | null = null;
function admin() {
  if (!cached) {
    cached = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return cached;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function upsertSubscription(data: any) {
  const userId = data?.customData?.userId as string | undefined;
  if (!userId) {
    console.error("Payments webhook: no userId in customData");
    return;
  }
  const externalPriceId = data?.items?.[0]?.price?.importMeta?.externalId as string | undefined;
  const planSlug = externalPriceId ? PRICE_TO_PLAN[externalPriceId] : undefined;
  if (!planSlug) {
    console.warn("Payments webhook: unknown price", externalPriceId);
    return;
  }

  const { error } = await admin()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan_slug: planSlug,
        status: data.status ?? "active",
        provider: "paddle",
        provider_customer_id: data.customerId ?? null,
        provider_subscription_id: data.id ?? null,
        current_period_end: data.currentBillingPeriod?.endsAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) console.error("Payments webhook: subscription upsert failed", error.message);
}

async function updateSubscription(data: any) {
  const externalPriceId = data?.items?.[0]?.price?.importMeta?.externalId as string | undefined;
  const planSlug = externalPriceId ? PRICE_TO_PLAN[externalPriceId] : undefined;

  const patch = {
    status: (data.status ?? "active") as string,
    current_period_end: (data.currentBillingPeriod?.endsAt ?? null) as string | null,
    updated_at: new Date().toISOString(),
    ...(planSlug ? { plan_slug: planSlug } : {}),
  };

  const { error } = await admin()
    .from("subscriptions")
    .update(patch)
    .eq("provider_subscription_id", data.id);
  if (error) console.error("Payments webhook: subscription update failed", error.message);
}

async function cancelSubscription(data: any) {
  const { error } = await admin()
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: data.currentBillingPeriod?.endsAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", data.id);
  if (error) console.error("Payments webhook: cancel failed", error.message);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const Route = createFileRoute("/api/public/payments/webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.eventType) {
            case EventName.SubscriptionCreated:
              await upsertSubscription(event.data);
              break;
            case EventName.SubscriptionUpdated:
              await updateSubscription(event.data);
              break;
            case EventName.SubscriptionCanceled:
              await cancelSubscription(event.data);
              break;
            default:
              break;
          }
          return Response.json({ received: true });
        } catch (error) {
          console.error("Payments webhook error", error);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
