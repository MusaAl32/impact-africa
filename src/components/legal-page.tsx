import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { COMPANY } from "@/lib/legal";

export function LegalPage({
  title,
  intro,
  showStatus = true,
  children,
}: {
  title: string;
  intro: string;
  showStatus?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {COMPANY.name} legal
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{intro}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Effective date: {COMPANY.effectiveDate} · Last updated: {COMPANY.lastUpdated}
        </p>

        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-4 text-sm" aria-label="Legal policies">
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
          <Link to="/refunds" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
          <Link to="/company" className="text-muted-foreground hover:text-foreground">Company Profile</Link>
        </nav>

        <div className="mt-12 space-y-12">{children}</div>

        {showStatus && (
          <div className="mt-14 border border-border bg-card p-5 text-sm leading-6 text-muted-foreground sm:p-6">
            <p className="font-medium text-foreground">Operator and contact details</p>
            <p className="mt-2">
              {COMPANY.name}, trading as {COMPANY.tradingName}, provides {COMPANY.product} and is the
              party you contract with. Jurisdiction: {COMPANY.jurisdiction}. Market: {COMPANY.market}.
            </p>
            <p className="mt-3 break-words">
              General: <a className="text-primary" href={`mailto:${COMPANY.generalEmail}`}>{COMPANY.generalEmail}</a><br />
              Support: <a className="text-primary" href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a><br />
              Legal and privacy: <a className="text-primary" href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 text-sm leading-7 text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2">
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      {children}
    </section>
  );
}
