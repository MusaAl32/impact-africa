import { createFileRoute } from "@tanstack/react-router";

import { verifyTransaction } from "@/lib/paychangu.server";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

async function verifySignature(raw: string, header: string | null): Promise<boolean> {
  const secret = process.env["PAYCHANGU_SECRET_KEY"];
  if (!secret || !header) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = [...new Uint8Array(sig)].map((v) => v.toString(16).padStart(2, "0")).join("");
  const provided = header.trim().toLowerCase();
  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0;
}

type WebhookBody = {
  event_type?: string;
  status?: string;
  tx_ref?: string;
  reference?: string;
  amount?: number | string;
  currency?: string;
  charge_id?: string;
  mode?: string;
};

export const Route = createFileRoute("/api/public/paychangu/webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYCHANGU_SECRET_KEY"];
        if (!secret) return new Response("Service unavailable", { status: 503 });

        const raw = await request.text();
        const signature = request.headers.get("signature") ?? request.headers.get("Signature");
        if (!(await verifySignature(raw, signature))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let body: WebhookBody;
        try {
          body = JSON.parse(raw) as WebhookBody;
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        // Only payment-success events grant access, and every one of them is
        // re-verified against the Paychangu API before a plan is activated.
        const txRef = typeof body.tx_ref === "string" ? body.tx_ref : body.reference;
        if (!txRef || body.status !== "success") return Response.json({ ok: true });

        try {
          const result = await verifyTransaction(txRef);
          if (result.status !== "success") return Response.json({ ok: true });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: payment } = await supabaseAdmin
            .from("payments")
            .select("id, user_id, plan_slug, amount, currency, status")
            .eq("tx_ref", txRef)
            .maybeSingle();
          if (!payment) return Response.json({ ok: true });
          if (
            result.currency !== String(payment.currency).toUpperCase() ||
            result.amount < Number(payment.amount)
          ) {
            return new Response("Payment amount mismatch", { status: 400 });
          }

          if (payment.status !== "success") {
            const periodEnd = new Date(Date.now() + PERIOD_MS).toISOString();
            const { error: payError } = await supabaseAdmin
              .from("payments")
              .update({ status: "success", charge_id: result.chargeId ?? null })
              .eq("id", payment.id)
              .eq("status", "pending");
            if (payError) throw new Error(payError.message);
            const { error: subError } = await supabaseAdmin
              .from("subscriptions")
              .upsert(
                {
                  user_id: payment.user_id,
                  plan_slug: payment.plan_slug,
                  status: "active",
                  provider: "paychangu",
                  current_period_end: periodEnd,
                },
                { onConflict: "user_id" },
              );
            if (subError) throw new Error(subError.message);
          }
          return Response.json({ ok: true });
        } catch (error) {
          console.error("Paychangu webhook error", error);
          return new Response("Webhook processing failed", { status: 500 });
        }
      },
    },
  },
});
