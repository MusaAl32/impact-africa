import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/refunds")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Nuru AI — Refund Policy" },
      { name: "description", content: "Nuru AI refund policy information." },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Refund Policy</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Nuru AI does not currently offer paid subscriptions or payment processing through this
          version of the platform. A complete refund policy will be published before paid services
          are launched.
        </p>
        <Link to="/" className="mt-8 inline-block text-sm underline">Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
