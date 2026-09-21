import { useState } from "react";

import { getPaddlePriceId, initializePaddle } from "@/lib/paddle";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  async function openCheckout(options: {
    priceId: string;
    customerEmail?: string;
    userId: string;
    successUrl?: string;
  }) {
    setLoading(true);
    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(options.priceId);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        ...(options.customerEmail ? { customer: { email: options.customerEmail } } : {}),
        customData: { userId: options.userId },
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/pricing?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return { openCheckout, loading };
}
