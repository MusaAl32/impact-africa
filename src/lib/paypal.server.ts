const PAYPAL_API = "https://api-m.paypal.com";

function credentials() {
  const id = process.env["PAYPAL_CLIENT_ID"];
  const secret = process.env["PAYPAL_SECRET_KEY"];
  if (!id || !secret) throw new Error("PayPal is not configured");
  return { id, secret };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function paypalToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  const { id, secret } = credentials();
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = (await response.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description || "Could not reach PayPal");
  }
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3000) * 1000 };
  return cachedToken.value;
}

export async function paypalFetch<T>(
  path: string,
  init?: RequestInit & { body?: string },
): Promise<T> {
  const token = await paypalToken();
  const response = await fetch(`${PAYPAL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message =
      (json as { message?: string }).message || `PayPal request failed (${response.status})`;
    throw new Error(message);
  }
  return json as T;
}

type PlanRow = {
  slug: string;
  name: string;
  price_cents: number;
  provider_price_id: string | null;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

let cachedProductId: string | null = null;

async function ensureProduct(): Promise<string> {
  if (cachedProductId) return cachedProductId;
  const created = await paypalFetch<{ id: string }>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: "Nuru AI",
      description: "Nuru AI subscription",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });
  cachedProductId = created.id;
  return created.id;
}

/** Returns the PayPal billing plan id for a plan slug, creating it on first use. */
export async function ensurePaypalPlan(slug: string): Promise<string> {
  const db = await admin();
  const { data, error } = await db
    .from("plans")
    .select("slug, name, price_cents, provider_price_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const plan = data as PlanRow | null;
  if (!plan) throw new Error("Unknown plan");
  if (plan.price_cents <= 0) throw new Error("This plan is free");
  if (plan.provider_price_id?.startsWith("P-")) return plan.provider_price_id;

  const productId = await ensureProduct();
  const created = await paypalFetch<{ id: string }>("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      name: plan.name,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: (plan.price_cents / 100).toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 1,
      },
    }),
  });

  await db.from("plans").update({ provider_price_id: created.id }).eq("slug", slug);
  return created.id;
}

export type PaypalSubscription = {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  subscriber?: { payer_id?: string };
  billing_info?: { next_billing_time?: string };
};

export async function readPaypalSubscription(id: string): Promise<PaypalSubscription> {
  return paypalFetch<PaypalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`);
}

const ACTIVE_STATUSES = new Set(["ACTIVE", "APPROVED"]);

/** Reads authoritative state from PayPal and mirrors it into the subscriptions table. */
export async function cancelPaypalSubscriptionAtPaypal(id: string, reason: string): Promise<void> {
  await paypalFetch(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function syncPaypalSubscription(subscriptionId: string): Promise<void> {
  const subscription = await readPaypalSubscription(subscriptionId);
  const userId = subscription.custom_id;
  if (!userId) {
    console.error("PayPal sync: subscription has no custom_id", subscriptionId);
    return;
  }

  const db = await admin();
  const { data } = await db
    .from("plans")
    .select("slug")
    .eq("provider_price_id", subscription.plan_id)
    .maybeSingle();
  const planSlug = (data as { slug: string } | null)?.slug;
  if (!planSlug) {
    console.error("PayPal sync: unknown plan", subscription.plan_id);
    return;
  }

  const active = ACTIVE_STATUSES.has(subscription.status);

  const { data: existingRow } = await db
    .from("subscriptions")
    .select("provider, provider_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();
  const previousId =
    existingRow?.provider === "paypal" ? existingRow.provider_subscription_id : null;

  if (previousId && previousId !== subscription.id) {
    // Events for an older, replaced subscription must not overwrite the current one.
    if (!active) return;
    // Plan switch: stop billing the old subscription so the customer never pays twice.
    try {
      const old = await readPaypalSubscription(previousId);
      if (ACTIVE_STATUSES.has(old.status) || old.status === "SUSPENDED") {
        await cancelPaypalSubscriptionAtPaypal(previousId, "Switched to a different Nuru AI plan");
      }
    } catch (err) {
      console.error("PayPal sync: failed to cancel previous subscription", previousId, err);
    }
  }
  const { error } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_slug: active ? planSlug : "free",
      status: subscription.status.toLowerCase(),
      provider: "paypal",
      provider_customer_id: subscription.subscriber?.payer_id ?? null,
      provider_subscription_id: subscription.id,
      current_period_end: subscription.billing_info?.next_billing_time ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) console.error("PayPal sync: upsert failed", error.message);
}
