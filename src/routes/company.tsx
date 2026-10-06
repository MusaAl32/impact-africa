import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  Languages,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { NuruWordmark } from "@/components/nuru-logo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/legal";

export const Route = createFileRoute("/company")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `About ${COMPANY.product} — Company Profile` },
      {
        name: "description",
        content:
          "Learn who operates Nuru AI, how the platform works, what it offers, how pricing is presented, and the policies that protect its users.",
      },
      { property: "og:title", content: `About ${COMPANY.product} — Company Profile` },
      {
        property: "og:description",
        content: "Meet Nuru AI by Matola: one AI built for Africa and connected to the world.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://africaopportunity.app/company" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://africaopportunity.app/company" }],
  }),
  component: CompanyProfilePage,
});

const capabilities = [
  {
    icon: Bot,
    title: "One intelligent assistant",
    description:
      "A single conversation can draw on specialist capabilities for research, writing, planning, images, files, and practical problem-solving.",
  },
  {
    icon: Languages,
    title: "Built for African languages",
    description:
      "Multilingual tools help people work in more than 40 African languages while staying connected to global knowledge.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Business and opportunity tools",
    description:
      "The Business Hub and Opportunity Map help users explore sectors, markets, trade corridors, and actionable business questions.",
  },
  {
    icon: LockKeyhole,
    title: "Private personal workspace",
    description:
      "Signed-in users can organize conversations, projects, files, and preferences in an account-owned workspace.",
  },
];

const steps = [
  ["Ask", "Describe the question, goal, document, or image you want help with."],
  ["Coordinate", "Nuru selects the relevant capability inside one conversation without sending you between separate assistants."],
  ["Review", "You receive a direct response and can continue, refine, verify sources, or organize the work in a project."],
];

const policies = [
  {
    to: "/privacy" as const,
    title: "Privacy Policy",
    description: "What information is collected, why it is used, and the choices available to you.",
  },
  {
    to: "/terms" as const,
    title: "Terms of Service",
    description: "The rules for accounts, AI use, submitted content, safety, and service availability.",
  },
  {
    to: "/refunds" as const,
    title: "Refund Policy",
    description: "The current payment status and the policy that will govern paid services before launch.",
  },
  {
    to: "/pricing" as const,
    title: "Plans and pricing",
    description: "Free access available now, with planned paid tiers clearly labelled before checkout launches.",
  },
];

function CompanyProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Company profile</p>
              <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.02] sm:text-6xl">
                Intelligence for Africa. Connected to the world.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {COMPANY.product} is an AI platform owned and operated by {COMPANY.name}. We are
                building one practical workspace for people to research, learn, create, plan, and
                explore opportunities with greater clarity.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/chat">Try Nuru free <ArrowRight className="size-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/pricing">View plans</Link>
                </Button>
              </div>
            </div>

            <aside className="border-l border-primary/50 pl-6 lg:pl-8" aria-label="Company details">
              <NuruWordmark />
              <dl className="mt-8 grid gap-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Owner and operator</dt>
                  <dd className="mt-1 font-medium">{COMPANY.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Trading name</dt>
                  <dd className="mt-1 font-medium">{COMPANY.tradingName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Jurisdiction</dt>
                  <dd className="mt-1 font-medium">{COMPANY.jurisdiction}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Market</dt>
                  <dd className="mt-1 font-medium">{COMPANY.market}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">What we build</p>
              <h2 className="font-display mt-3 text-4xl">One platform, many kinds of work</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Nuru brings specialist tools into one clear experience instead of making users choose
                between disconnected systems.
              </p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
              {capabilities.map(({ icon: Icon, title, description }) => (
                <article key={title} className="bg-background p-6 sm:p-8">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:py-20 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
              <h2 className="font-display mt-3 text-4xl">From question to useful work</h2>
            </div>
            <ol className="space-y-8">
              {steps.map(([title, description], index) => (
                <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-border pb-8 last:border-0 last:pb-0">
                  <span className="font-display text-2xl text-primary">0{index + 1}</span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-border bg-card/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-20 lg:grid-cols-2">
            <div>
              <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
              <h2 className="font-display mt-5 text-4xl">Responsible by design</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Account data is protected with authentication and access controls. Private projects,
                conversations, and files belong to their account owner. Nuru does not sell personal
                information or build advertising profiles.
              </p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                AI can still make mistakes. Important legal, medical, financial, educational, or
                professional decisions should always be checked with qualified local sources.
              </p>
            </div>
            <div className="space-y-4">
              {["Private records are account-owned", "Public contributions are clearly identified", "Web evidence can include sources for verification", "Safety controls apply to generated content"].map((item) => (
                <div key={item} className="flex gap-3 border-b border-border pb-4 text-sm">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <Sparkles className="size-7 text-primary" aria-hidden="true" />
                <h2 className="font-display mt-5 text-4xl">Plans and cost</h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Nuru currently provides free access. Paid plans and their intended allowances are
                  displayed transparently on the pricing page, but payment and checkout are not yet
                  enabled. No one can be charged through this version of the platform.
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link to="/pricing">See plans and allowances <ArrowRight className="size-4" /></Link>
                </Button>
              </div>
              <div>
                <Globe2 className="size-7 text-primary" aria-hidden="true" />
                <h2 className="font-display mt-5 text-4xl">Our direction</h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Our mission is to expand access to useful, secure, and locally relevant AI for
                  businesses, professionals, creators, developers, students, and communities across
                  Africa—while keeping them connected to knowledge and opportunities worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Trust centre</p>
            <h2 className="font-display mt-3 text-4xl">Policies and important information</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {policies.map((policy) => (
                <Link key={policy.to} to={policy.to} className="group border border-border bg-background p-6 transition-colors hover:border-primary/60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{policy.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{policy.description}</p>
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <Mail className="size-7 text-primary" aria-hidden="true" />
              <h2 className="font-display mt-5 text-4xl">Contact Matola</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {COMPANY.name}, trading as {COMPANY.tradingName}, is the owner, operator, service
                provider, data controller, and contracting party for {COMPANY.product}.
              </p>
              <div className="mt-7 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-6">
                <a className="text-primary hover:underline" href={`mailto:${COMPANY.generalEmail}`}>General: {COMPANY.generalEmail}</a>
                <a className="text-primary hover:underline" href={`mailto:${COMPANY.supportEmail}`}>Support: {COMPANY.supportEmail}</a>
                <a className="text-primary hover:underline" href={`mailto:${COMPANY.legalEmail}`}>Legal: {COMPANY.legalEmail}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}