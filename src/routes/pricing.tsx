import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { startCheckout, confirmCheckout } from "@/lib/checkout.functions";
import { listPublicPlans } from "@/lib/plans.functions";

const searchSchema = z.object({
  tx_ref: z.string().optional(),
  status: z.string().optional(),
});

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Nuru AI — Plans" },
      {
        name: "description",
        content: "Compare Nuru AI Free, Pro, Pro Plus and Pro Max plans. Pay securely with Paychangu.",
      },
      { property: "og:title", content: "Nuru AI plans" },
      { property: "og:description", content: "Compare Nuru AI plans and daily usage allowances." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://africaopportunity.app/pricing" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://africaopportunity.app/pricing" }],
  }),
  loader: () => listPublicPlans(),
  component: PricingPage,
});

function PricingPage() {
  const plans = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<"idle" | "checking" | "success" | "notpaid">("idle");

  // Returning from Paychangu: verify the payment server-side before showing success.
  useEffect(() => {
    if (!search.tx_ref) return;
    if (search.status === "failed") {
      setConfirmState("notpaid");
      navigate({ to: "/pricing", search: {}, replace: true });
      return;
    }
    let cancelled = false;
    setConfirmState("checking");
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setConfirmState("notpaid");
        return;
      }
      try {
        const result = await confirmCheckout({ data: { txRef: search.tx_ref! } });
        if (cancelled) return;
        setConfirmState(result.status === "success" ? "success" : "notpaid");
        if (result.status === "success") navigate({ to: "/pricing", search: {}, replace: true });
      } catch {
        if (!cancelled) setConfirmState("notpaid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search.tx_ref, search.status, navigate]);

  const beginCheckout = async (slug: string) => {
    setBusyPlan(slug);
    setCheckoutError(null);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      const result = await startCheckout({ data: { planSlug: slug } });
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Checkout could not start. Please try again.",
      );
      setBusyPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Nuru AI plans</p>
          <h1 className="font-display mt-3 text-4xl">Choose the room you need to work</h1>
          <p className="mt-4 text-muted-foreground">
            Free access is available now. Paid plans are one-time 30-day passes, paid securely
            through Paychangu. All prices are in Malawi kwacha.
          </p>
        </div>
        {confirmState !== "idle" && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
          >
            {confirmState === "checking" && "Checking your payment with Paychangu…"}
            {confirmState === "success" && "Payment confirmed — your plan is active. Enjoy Nuru!"}
            {confirmState === "notpaid" &&
              "We could not confirm that payment. If you completed it, wait a moment and reopen this page; otherwise try again."}
          </div>
        )}
        {checkoutError && (
          <div role="alert" className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {checkoutError}
          </div>
        )}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.slug} className="company-card flex flex-col p-6">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-3 text-3xl font-semibold">
                {plan.price_cents === 0 ? "Free" : `${plan.currency === "MWK" ? "MK" : "$"}${(plan.price_cents / 100).toLocaleString("en-US")}`}
                <span className="text-sm font-normal text-muted-foreground">{plan.price_cents ? "/30 days" : ""}</span>
              </p>
              <ul className="my-6 space-y-3 text-sm">
                {[
                  `${plan.messages_per_day} messages daily`,
                  `${plan.voice_minutes_per_day} voice minutes daily`,
                  `${plan.searches_per_day} web searches daily`,
                  `${plan.files_per_day} files daily`,
                ].map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.price_cents === 0 ? (
                <Button asChild className="mt-auto">
                  <Link to="/chat">Try Nuru free</Link>
                </Button>
              ) : (
                <Button
                  className="mt-auto"
                  disabled={busyPlan !== null}
                  onClick={() => beginCheckout(plan.slug)}
                >
                  {busyPlan === plan.slug ? "Opening Paychangu…" : `Get ${plan.name}`}
                </Button>
              )}
            </article>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          Payments are processed securely by Paychangu — Airtel Money, TNM Mpamba, Changu, bank transfer and cards.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
