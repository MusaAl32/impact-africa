/**
 * Paychangu server client — Standard Checkout.
 * Secret key is read inside handlers only; never shipped to the browser.
 */
const PAYCHANGU_API = "https://api.paychangu.com";

export function paychanguConfigured(): boolean {
  return Boolean(process.env["PAYCHANGU_SECRET_KEY"]);
}

export function paychanguMode(): "test" | "live" {
  return process.env["PAYCHANGU_MODE"] === "test" ? "test" : "live";
}

async function paychanguFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const secret = process.env["PAYCHANGU_SECRET_KEY"];
  if (!secret) throw new Error("Payments are not configured yet. Please try again soon.");
  const response = await fetch(`${PAYCHANGU_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Paychangu request failed [${response.status}]: ${body.slice(0, 400)}`);
    throw new Error(`Paychangu request failed [${response.status}].`);
  }
  return response;
}

export type InitiateInput = {
  amount: number;
  currency: string;
  txRef: string;
  email?: string | undefined;
  firstName?: string | undefined;
  callbackUrl: string;
  returnUrl: string;
  title: string;
  description: string;
  meta?: Record<string, unknown> | undefined;
};

/** Creates a hosted checkout link for the customer to pay on Paychangu. */
export async function initiateCheckout(input: InitiateInput): Promise<{ checkoutUrl: string }> {
  const response = await paychanguFetch("/payment", {
    method: "POST",
    body: JSON.stringify({
      amount: String(input.amount),
      currency: input.currency,
      tx_ref: input.txRef,
      ...(input.email ? { email: input.email } : {}),
      ...(input.firstName ? { first_name: input.firstName } : {}),
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      customization: { title: input.title, description: input.description },
      meta: input.meta ?? {},
    }),
  });
  const payload = (await response.json()) as {
    status?: string;
    message?: string;
    data?: { checkout_url?: string; link?: string; redirect_url?: string };
  };
  const checkoutUrl = payload.data?.checkout_url ?? payload.data?.link ?? payload.data?.redirect_url;
  if (!checkoutUrl) {
    throw new Error(`Paychangu did not return a checkout link: ${payload.message ?? "unknown response"}`);
  }
  return { checkoutUrl };
}

export type VerifyResult = {
  status: string;
  txRef: string;
  currency: string;
  amount: number;
  mode?: string | undefined;
  chargeId?: string | undefined;
};

/** Verifies a transaction with Paychangu before any plan is granted. */
export async function verifyTransaction(txRef: string): Promise<VerifyResult> {
  const response = await paychanguFetch(`/verify-payment/${encodeURIComponent(txRef)}`);
  const payload = (await response.json()) as {
    status?: string;
    message?: string;
    data?: {
      tx_ref?: string;
      status?: string;
      currency?: string;
      amount?: number | string;
      mode?: string;
      charge_id?: string;
    };
  };
  const data = payload.data;
  if (!data) throw new Error(`Paychangu verification failed: ${payload.message ?? "no data"}`);
  return {
    status: String(data.status ?? "").toLowerCase(),
    txRef: String(data.tx_ref ?? txRef),
    currency: String(data.currency ?? "").toUpperCase(),
    amount: Number(data.amount ?? 0),
    mode: data.mode ? String(data.mode).toLowerCase() : undefined,
    chargeId: data.charge_id ?? undefined,
  };
}
