import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { COMPANY } from "@/lib/legal";

export const Route = createFileRoute("/refunds")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Refund Policy — ${COMPANY.product}` },
      { name: "description", content: "Current payment and refund information for Nuru AI." },
      { property: "og:title", content: `Refund Policy — ${COMPANY.product}` },
      { property: "og:description", content: "Current payment and refund information for Nuru AI." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://africaopportunity.app/refunds" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://africaopportunity.app/refunds" }],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{COMPANY.name}</p>
        <h1 className="font-display mt-3 text-4xl">Refund Policy</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          {COMPANY.product} does not currently offer paid subscriptions or payment processing through this
          version of the platform. A complete refund policy will be published before paid services
          are launched, and checkout will show the price, billing period, cancellation terms, and
          refund conditions before you pay.
        </p>
        <p className="mt-5 leading-7 text-muted-foreground">
          Because no payment can currently be made through the platform, there is no active Nuru AI
          purchase to refund. For a billing question, contact{" "}
          <a className="text-primary hover:underline" href={`mailto:${COMPANY.supportEmail}`}>
            {COMPANY.supportEmail}
          </a>.
        </p>
        <Link to="/" className="mt-8 inline-block text-sm underline">Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
