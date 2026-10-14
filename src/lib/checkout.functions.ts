import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { initiateCheckout, paychanguConfigured, paychanguMode, verifyTransaction } from "./paychangu.server";

const SITE = "https://africaopportunity.app";
const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const StartInput = z.object({ planSlug: z.string().min(1).max(40) });

/** Starts a Paychangu checkout for a paid plan. Requires a signed-in session. */
export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StartInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!paychanguConfigured()) {
      throw new Error("Payments are not configured yet. Please try again soon.");
    }

    const { data: plan, error: planError } = await context.supabase
      .from("plans")
      .select("slug, name, price_cents, active")
      .eq("slug", data.planSlug)
      .maybeSingle();
    if (planError) throw new Error(planError.message);
    if (!plan || !plan.active || plan.price_cents <= 0) {
      throw new Error("That plan is not available for purchase.");
    }

    // Reuse a still-pending checkout for the same plan started recently.
    const { data: existing, error: pendingError } = await context.supabase
      .from("payments")
      .select("tx_ref, checkout_url, created_at")
      .eq("plan_slug", plan.slug)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pendingError) throw new Error(pendingError.message);
    if (
      existing?.checkout_url &&
      Date.now() - new Date(existing.created_at).getTime() < 12 * 60 * 60 * 1000
    ) {
      return { checkoutUrl: existing.checkout_url };
    }

    const email = typeof context.claims.email === "string" ? context.claims.email : undefined;
    const firstName = typeof context.claims["given_name"] === "string" ? context.claims["given_name"] : undefined;
    const txRef = `nuru-${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const amount = plan.price_cents / 100;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("payments").insert({
      user_id: context.userId,
      plan_slug: plan.slug,
      tx_ref: txRef,
      amount,
      currency: "USD",
      mode: paychanguMode(),
      status: "pending",
    });
    if (insertError) throw new Error(insertError.message);

    try {
      const { checkoutUrl } = await initiateCheckout({
        amount,
        currency: "USD",
        txRef,
        email,
        firstName,
        callbackUrl: `${SITE}/api/public/paychangu/webhook`,
        returnUrl: `${SITE}/pricing`,
        title: `Nuru AI ${plan.name}`,
        description: "30 days of Nuru AI access",
        meta: { user_id: context.userId, plan_slug: plan.slug },
      });
      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({ checkout_url: checkoutUrl })
        .eq("tx_ref", txRef);
      if (updateError) console.error("Paychangu checkout_url update failed", updateError.message);
      return { checkoutUrl };
    } catch (error) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("tx_ref", txRef)
        .eq("status", "pending");
      throw error;
    }
  });

const ConfirmInput = z.object({ txRef: z.string().min(4).max(120) });

export type ConfirmResult = { status: "success" | "pending" | "failed" };

/**
 * Verifies a returning checkout with Paychangu and activates the plan when
 * the payment really succeeded. The webhook endpoint applies the same rules.
 */
export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ConfirmInput.parse(input))
  .handler(async ({ data, context }): Promise<ConfirmResult> => {
    const { data: payment, error } = await context.supabase
      .from("payments")
      .select("id, user_id, plan_slug, tx_ref, amount, currency, status")
      .eq("tx_ref", data.txRef)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!payment || payment.user_id !== context.userId) {
      throw new Error("We could not find that payment.");
    }
    if (payment.status === "success") return { status: "success" };

    let result;
    try {
      result = await verifyTransaction(payment.tx_ref);
    } catch {
      return { status: "pending" };
    }

    const paidEnough =
      result.status === "success" &&
      result.currency === String(payment.currency).toUpperCase() &&
      result.amount >= Number(payment.amount);
    if (!paidEnough) {
      const fallback = result.status === "failed" ? "failed" : "pending";
      return { status: fallback };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
          user_id: context.userId,
          plan_slug: payment.plan_slug,
          status: "active",
          provider: "paychangu",
          current_period_end: periodEnd,
        },
        { onConflict: "user_id" },
      );
    if (subError) throw new Error(subError.message);
    return { status: "success" };
  });
