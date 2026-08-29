import { createFileRoute, Link } from "@tanstack/react-router";

import { DeptIcon } from "@/components/dept-icon";
import { NuruChat } from "@/components/nuru-chat";
import { getDepartment, QUICK_ACTIONS } from "@/lib/departments";

export const Route = createFileRoute("/app/")({
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
        heading="What do you want to accomplish today?"
        placeholder="Ask Nuru anything — in English, Kiswahili, Hausa, Chichewa…"
        suggestions={dept.suggestions ?? []}
      />
    </div>
  );
}
