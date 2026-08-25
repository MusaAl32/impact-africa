import { useState } from "react";
import { COUNTRIES, ROLES, STATUS_LABEL, type Status } from "@/data/aom";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  status: Status;
  bullets?: string[];
};

export function ComingSoon({ eyebrow, title, description, status, bullets = [] }: Props) {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-10">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {eyebrow} · {STATUS_LABEL[status]}
          </span>
        </div>
        <h1 className="mb-6 max-w-[18ch] text-4xl font-extrabold leading-[0.95] tracking-tight text-balance">
          {title}
        </h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          {description}
        </p>

        {bullets.length ? (
          <ul className="mt-8 space-y-2 border-t border-border pt-6">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-xs font-bold uppercase tracking-tight">
                <span className="font-mono text-primary">·</span>
                {b}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Join the waitlist
        </h2>
        {sent ? (
          <p className="border border-signal-green/40 bg-signal-green/5 p-5 text-xs font-bold uppercase tracking-tight text-signal-green">
            You are on the list. We will contact you when this opens.
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <Field label="Name">
              <input required name="name" className={inputClass} placeholder="Full name" />
            </Field>
            <Field label="Email">
              <input required type="email" name="email" className={inputClass} placeholder="you@example.com" />
            </Field>
            <Field label="Country">
              <select required name="country" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select a country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Role">
              <select required name="role" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select a role
                </option>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <button
              type="submit"
              className="w-full rounded-sm bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground"
            >
              Join the Waitlist
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export const inputClass =
  "w-full rounded-sm border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
