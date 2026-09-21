import type { ReactNode } from "react";

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
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        {COMPANY.name}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{intro}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Effective date: {COMPANY.effectiveDate} · Last updated: {COMPANY.lastUpdated}
      </p>

      <div className="mt-10 space-y-10">{children}</div>

      {showStatus && (
        <div className="mt-12 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Seller and contact details</p>
          <p className="mt-2">
            {COMPANY.name}, trading as {COMPANY.tradingName}, provides {COMPANY.product} and is the
            party you contract with. Jurisdiction: {COMPANY.jurisdiction}. Market: {COMPANY.market}.
          </p>
          <p className="mt-3">
            General: <a href={`mailto:${COMPANY.generalEmail}`}>{COMPANY.generalEmail}</a> · Support:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> · Legal:{" "}
            <a href={`mailto:${COMPANY.legalEmail}`}>{COMPANY.legalEmail}</a>
          </p>
        </div>
      )}
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-2">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}
