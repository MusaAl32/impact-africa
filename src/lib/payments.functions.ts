import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Starts a PayPal subscription and returns the page the buyer must be sent to. */
export const startPaypalSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { planSlug: string; returnUrl: string; cancelUrl: string }) => data)
  .handler(async ({ data, context }): Promise<{ approveUrl: string }> => {
    const { ensurePaypalPlan, paypalFetch } = await import("@/lib/paypal.server");
    const planId = await ensurePaypalPlan(data.planSlug);

    const created = await paypalFetch<{ links?: Array<{ rel: string; href: string }> }>(
      "/v1/billing/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          plan_id: planId,
          custom_id: context.userId,
          application_context: {
            brand_name: "Nuru AI",
            user_action: "SUBSCRIBE_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: data.returnUrl,
            cancel_url: data.cancelUrl,
          },
        }),
      },
    );

    const approveUrl = created.links?.find((link) => link.rel === "approve")?.href;
    if (!approveUrl) throw new Error("PayPal did not return a checkout link");
    return { approveUrl };
  });

/** Called when the buyer returns from PayPal so the new plan applies immediately. */
export const confirmPaypalSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { subscriptionId: string }) => data)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { syncPaypalSubscription } = await import("@/lib/paypal.server");
    await syncPaypalSubscription(data.subscriptionId);
    return { ok: true };
  });
