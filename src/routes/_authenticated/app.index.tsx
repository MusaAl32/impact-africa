import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DeptIcon } from "@/components/dept-icon";
import { NuruChat } from "@/components/nuru-chat";
import { getProfile } from "@/lib/account.functions";
import { getDepartment, QUICK_ACTIONS } from "@/lib/departments";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Nuru AI Platform — your African AI workspace" },
      {
        name: "description",
        content:
          "Ask Nuru anything. One assistant coordinating agriculture, business, education, research, documents and language specialists across Africa.",
      },
      { property: "og:title", content: "Nuru AI Platform" },
      {
        property: "og:description",
        content: "One universal African AI assistant with specialist departments behind it.",
      },
    ],
  }),
  component: PlatformPage,
});

function PlatformPage() {
  const dept = getDepartment("platform");
  const { t } = useI18n();
  const [name, setName] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setName(profile.display_name);
        if (profile.language && profile.language !== "en") setLanguage(profile.language);
      })
      .catch(() => {
        /* the chat still works without the profile */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.path}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <DeptIcon name={a.icon} className="size-3.5" />
            {a.label}
          </Link>
        ))}
      </div>

      <NuruChat
        department="platform"
        persist
        {...(language ? { language } : {})}
        heading={name ? `${t("dash.greeting")} ${name}. ${t("dash.question")}` : t("dash.question")}
        placeholder="Ask Nuru anything — in English, Kiswahili, Hausa, Chichewa…"
        suggestions={dept.suggestions ?? []}
      />
    </div>
  );
}
