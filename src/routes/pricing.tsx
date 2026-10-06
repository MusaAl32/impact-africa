import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { listPublicPlans } from "@/lib/plans.functions";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Nuru AI — Plans" },
      {
        name: "description",
        content: "Compare Nuru AI Free, Pro, Pro Plus and Pro Max planned usage allowances.",
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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-16">
        <div className="max-w-2xl"><p className="text-sm font-medium text-primary">Nuru AI plans</p><h1 className="font-display mt-3 text-4xl">Choose the room you need to work</h1><p className="mt-4 text-muted-foreground">Free access is available now. Paid tiers are planned and shown transparently; no checkout is enabled until production payments are ready.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => <article key={plan.slug} className="company-card flex flex-col p-6">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-3 text-3xl font-semibold">{plan.price_cents === 0 ? "Free" : `$${plan.price_cents / 100}`}<span className="text-sm font-normal text-muted-foreground">{plan.price_cents ? "/month" : ""}</span></p>
            <ul className="my-6 space-y-3 text-sm">{[
              `${plan.messages_per_day} messages daily`, `${plan.voice_minutes_per_day} voice minutes daily`, `${plan.searches_per_day} web searches daily`, `${plan.files_per_day} files daily`,
            ].map((feature) => <li key={feature} className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />{feature}</li>)}</ul>
            {plan.price_cents === 0 ? <Button asChild className="mt-auto"><Link to="/chat">Try Nuru free</Link></Button> : <Button disabled variant="outline" className="mt-auto">Planned</Button>}
          </article>)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
