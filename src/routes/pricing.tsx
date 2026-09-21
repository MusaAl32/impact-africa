import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { supabase } from "@/integrations/supabase/client";
import { getMyEntitlements, listPlans, type PublicPlan } from "@/lib/billing.functions";
import type { Entitlements } from "@/lib/billing.server";
import { paymentsConfigured } from "@/lib/paddle";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  loader: async () => ({ plans: await listPlans() }),
  head: () => ({
    meta: [
      { title: "Pricing — Nuru AI plans and daily allowances" },
      {
        name: "description",
        content:
          "Compare Nuru AI plans: Free, Pro, Pro Plus and Pro Max. Daily messages, voice minutes, file uploads and web searches for every budget.",
      },
      { property: "og:title", content: "Pricing — Nuru AI" },
      {
        property: "og:description",
        content: "Free, Pro ($10), Pro Plus ($15) and Pro Max ($20) — daily allowances for African teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-sm text-muted-foreground">We could not load the plans right now.</p>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        Back to home
      </Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center text-sm">Page not found.</div>,
  component: PricingPage,
});

const PRICE_IDS: Record<string, string> = {
  pro: "nuru_pro_monthly",
  pro_plus: "nuru_pro_plus_monthly",
  pro_max: "nuru_pro_max_monthly",
};

function useCountdown(resetsAt?: string) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!resetsAt) return;
    const target = new Date(`${resetsAt}T00:00:00Z`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setLabel("resetting now");
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setLabel(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);
  return label;
}

function planFeatures(plan: PublicPlan) {
  return [
    `${plan.messages_per_day} messages a day`,
    `${plan.voice_minutes_per_day} voice minutes a day`,
    `${plan.files_per_day} file uploads a day`,
    `${plan.searches_per_day} web searches a day`,
  ];
}

function PricingPage() {
  const { plans } = Route.useLoaderData();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { openCheckout } = usePaddleCheckout();
  const countdown = useCountdown(entitlements?.resets_at);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUser({ id: data.user.id, email: data.user.email ?? "" });
      getMyEntitlements()
        .then(setEntitlements)
        .catch(() => undefined);
    });
  }, []);

  const currentSlug = entitlements?.plan_slug ?? "free";
  const currentPlan = plans.find((p) => p.slug === currentSlug);

  async function handleUpgrade(plan: PublicPlan) {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    const priceId = PRICE_IDS[plan.slug];
    if (!priceId || !paymentsConfigured()) {
      toast.error("Card payments are not available yet. Please try again shortly.");
      return;
    }
    setBusy(plan.slug);
    try {
      await openCheckout({ priceId, userId: user.id, customerEmail: user.email });
    } catch {
      toast.error("We could not open the payment window. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Plans for every level of work
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] text-sm text-muted-foreground">
            Start free. Upgrade when you need more messages, voice time, files and live web
            searches each day. Allowances reset every day at midnight UTC.
          </p>
        </header>

        {user && entitlements && (
          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">
                Your plan: <span className="text-primary">{entitlements.plan_name}</span>
              </h2>
              <p className="text-xs text-muted-foreground">Resets in {countdown}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["message", "Messages"],
                  ["voice_minute", "Voice minutes"],
                  ["file", "Files"],
                  ["search", "Searches"],
                ] as const
              ).map(([kind, label]) => {
                const limit = entitlements.limits[kind] ?? 0;
                const used = entitlements.used[kind] ?? 0;
                return (
                  <div key={kind} className="rounded-xl border border-border/70 p-3">
                    <dt className="text-xs text-muted-foreground">{label} left today</dt>
                    <dd className="mt-1 text-lg font-semibold">{Math.max(limit - used, 0)}</dd>
                    <p className="text-[11px] text-muted-foreground">of {limit}</p>
                  </div>
                );
              })}
            </dl>
          </section>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = plan.slug === currentSlug;
            const isFree = plan.price_cents === 0;
            const isLower =
              currentPlan !== undefined && plan.price_cents < currentPlan.price_cents;
            return (
              <div
                key={plan.slug}
                className={`flex flex-col rounded-2xl border bg-card p-5 ${
                  isCurrent ? "border-primary" : "border-border"
                }`}
              >
                <h2 className="text-base font-semibold tracking-tight">{plan.name}</h2>
                <p className="mt-2">
                  <span className="text-3xl font-semibold">
                    ${(plan.price_cents / 100).toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {planFeatures(plan).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <Button className="w-full" disabled>
                      Your plan
                    </Button>
                  ) : isFree ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={user ? "/app" : "/auth"}>{user ? "Open Nuru" : "Start free"}</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isLower ? "outline" : "default"}
                      disabled={busy === plan.slug}
                      onClick={() => void handleUpgrade(plan)}
                    >
                      {busy === plan.slug && <Loader2 className="mr-2 size-4 animate-spin" />}
                      {isLower ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-[60ch] text-center text-xs text-muted-foreground">
          Prices are in US dollars and billed monthly. You can cancel at any time; your plan stays
          active until the end of the period you paid for.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
