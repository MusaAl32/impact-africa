import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIES, COUNTRIES } from "@/data/aom";
import { Field, inputClass } from "@/components/coming-soon";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Problem — Africa Opportunity Map" },
      {
        name: "description",
        content:
          "Report an African problem you experience. Submissions enter a review queue before verification and publication.",
      },
      { property: "og:title", content: "Submit a Problem" },
      {
        property: "og:description",
        content: "Make an African problem visible. Review, verify, publish.",
      },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-12 pb-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
          Submissions · Available Now
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tight">
          Submit a Problem.
        </h1>
        <p className="max-w-[52ch] text-sm font-medium leading-relaxed text-muted-foreground">
          Nothing is published automatically. Every submission passes through review, verification
          and only then publication into the intelligence database.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Review</span>
          <span className="text-primary">&rarr;</span>
          <span>Verify</span>
          <span className="text-primary">&rarr;</span>
          <span>Publish</span>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12">
        {sent ? (
          <div className="border border-signal-green/40 bg-signal-green/5 p-6">
            <h2 className="text-lg font-extrabold tracking-tight text-signal-green">
              Submission received
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your problem has entered the review queue. Verified submissions are published with
              evidence and an opportunity score.
            </p>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <Field label="What problem are you experiencing?">
              <textarea
                required
                rows={6}
                className={inputClass}
                placeholder="Describe the problem, who it affects and what makes it hard to solve."
              />
            </Field>
            <Field label="Country">
              <select required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select a country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Region or city (optional)">
              <input className={inputClass} placeholder="e.g. Kano" />
            </Field>
            <Field label="Category">
              <select required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Who is affected?">
              <select required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select scope
                </option>
                {["Individual", "Community", "Business", "Industry", "Country", "Multiple countries"].map(
                  (o) => (
                    <option key={o}>{o}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="How serious is the problem?">
              <select required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select severity
                </option>
                {["Low", "Medium", "High", "Critical"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="How often does it happen?">
              <select required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select frequency
                </option>
                {["Rarely", "Sometimes", "Frequently", "Every day"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Do you know existing solutions? (optional)">
              <textarea rows={3} className={inputClass} placeholder="Organisations, tools or programmes already working on it." />
            </Field>
            <Field label="Would you like to participate in solving this problem?">
              <select required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select an answer
                </option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </Field>
            <button
              type="submit"
              className="w-full rounded-sm bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground"
            >
              Send to Review Queue
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
