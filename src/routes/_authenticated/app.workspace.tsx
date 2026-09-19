import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { NuruChat } from "@/components/nuru-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_PREFERENCES,
  buildProjectContext,
  loadItems,
  loadPreferences,
  saveItems,
  type NuruPreferences,
  type WorkspaceItem,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/app/workspace")({
  head: () => ({
    meta: [
      { title: "My Workspace — projects and context in Nuru AI" },
      {
        name: "description",
        content:
          "Keep your projects, notes and saved outputs in one place, and let Nuru AI use them as context in every conversation.",
      },
      { property: "og:title", content: "My Workspace — Nuru AI" },
      {
        property: "og:description",
        content: "Projects, notes and saved outputs that Nuru AI uses as working context.",
      },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [prefs, setPrefs] = useState<NuruPreferences>(DEFAULT_PREFERENCES);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setItems(loadItems());
    setPrefs(loadPreferences());
  }, []);

  const context = useMemo(() => buildProjectContext(prefs, items), [prefs, items]);

  function persist(next: WorkspaceItem[]) {
    setItems(next);
    saveItems(next);
  }

  function add(kind: WorkspaceItem["kind"]) {
    if (!title.trim()) {
      toast.error("Give it a title first.");
      return;
    }
    persist([
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        body: body.trim(),
        kind,
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);
    setTitle("");
    setBody("");
    toast.success(kind === "project" ? "Project added" : "Note saved");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">My Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projects and notes stay on this device and are passed to Nuru as working context.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project or note title"
          aria-label="Title"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="What is it about? Nuru uses this as background."
          aria-label="Details"
          className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/50"
        />
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => add("project")}>
            <Plus className="mr-1.5 size-3.5" /> Add project
          </Button>
          <Button size="sm" variant="outline" onClick={() => add("note")}>
            Save note
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  {item.title}
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {item.kind}
                  </span>
                </p>
                {item.body && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Delete ${item.title}`}
                onClick={() => persist(items.filter((i) => i.id !== item.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Work on your projects
        </h2>
        <NuruChat
          department="workspace"
          projectContext={context}
          placeholder="Ask Nuru about your saved projects…"
          suggestions={[
            "Summarise my active projects and what to do next",
            "Turn my project notes into a one-page plan",
            "What risks am I ignoring?",
          ]}
        />
      </section>
    </div>
  );
}
