import { createFileRoute, notFound } from "@tanstack/react-router";

import { DeptIcon } from "@/components/dept-icon";
import { NuruChat } from "@/components/nuru-chat";
import { AGENT_DEPARTMENTS, type DepartmentId } from "@/lib/departments";

const CHAT_DEPARTMENTS = AGENT_DEPARTMENTS.filter((d) => d.id !== "platform");

export const Route = createFileRoute("/_authenticated/app/$department")({
  loader: ({ params }) => {
    const dept = CHAT_DEPARTMENTS.find((d) => d.id === params.department);
    if (!dept) throw notFound();
    return { dept };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Department unavailable — Nuru AI" }, { name: "robots", content: "noindex" }],
      };
    }
    const { dept } = loaderData;
    return {
      meta: [
        { title: `${dept.name} — Nuru AI` },
        { name: "description", content: dept.tagline },
        { property: "og:title", content: `${dept.name} — Nuru AI` },
        { property: "og:description", content: dept.tagline },
      ],
    };
  },
  component: DepartmentPage,
  notFoundComponent: DepartmentNotFound,
});

function DepartmentPage() {
  const { dept } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DeptIcon name={dept.icon} className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{dept.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dept.tagline}</p>
        </div>
      </header>

      <NuruChat
        key={dept.id}
        department={dept.id as DepartmentId}
        placeholder={`Ask ${dept.name} anything…`}
        suggestions={dept.suggestions ?? []}
        accept={
          dept.id === "vision"
            ? "image/*"
            : dept.id === "documents"
              ? "application/pdf,.txt,.md,.csv,image/*"
              : "image/*,application/pdf,.txt,.md,.csv"
        }
      />
    </div>
  );
}

function DepartmentNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Department not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a department from the sidebar to start working with Nuru.
      </p>
    </div>
  );
}
