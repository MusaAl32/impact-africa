import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Nuru AI — Plans" },
      {
        name: "description",
        content: "Nuru AI plans and usage options. Paid services will be introduced on the Nuru platform.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <section className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-medium text-primary">Nuru AI</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Plans are coming soon</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Nuru AI is currently focused on building the core platform. Subscription and payment
            services will be added later through Nuru AI's own production platform.
          </p>
          <Link
            to="/app"
            className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Open Nuru AI
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
