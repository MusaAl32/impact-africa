import { createFileRoute } from "@tanstack/react-router";

/**
 * PayPal subscription webhook. The payload itself is never trusted: we take only
 * the subscription id from it and re-read the authoritative state from PayPal.
 */
export const Route = createFileRoute("/api/public/payments/webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const event = (await request.json()) as {
            event_type?: string;
            resource?: { id?: string; billing_agreement_id?: string };
          };
          const subscriptionId =
            event.resource?.billing_agreement_id ?? event.resource?.id ?? null;

          if (subscriptionId && /^I-[A-Z0-9]+$/i.test(subscriptionId)) {
            const { syncPaypalSubscription } = await import("@/lib/paypal.server");
            await syncPaypalSubscription(subscriptionId);
          }
          return Response.json({ received: true });
        } catch (error) {
          console.error("PayPal webhook error", error);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
