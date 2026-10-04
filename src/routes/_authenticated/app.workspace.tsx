import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Archive, FileText, Loader2, Plus, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { NuruChat } from "@/components/nuru-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { addProjectFileRecord, archiveProject, createProject, listProjects } from "@/lib/projects.functions";
import {
  DEFAULT_PREFERENCES,
  buildProjectContext,
  loadPreferences,
  type NuruPreferences,
  type WorkspaceItem,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/app/workspace")({
  staticData: { sitemap: false },
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
  type Project = Awaited<ReturnType<typeof listProjects>>[number];
  const [projects, setProjects] = useState<Project[]>([]);
  const [prefs, setPrefs] = useState<NuruPreferences>(DEFAULT_PREFERENCES);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fetchProjects = useServerFn(listProjects);
  const addProject = useServerFn(createProject);
  const removeProject = useServerFn(archiveProject);
  const saveFileRecord = useServerFn(addProjectFileRecord);

  useEffect(() => {
    setPrefs(loadPreferences());
    void reload();
  }, []); // The server functions are stable for the lifetime of this page.

  async function reload() {
    try {
      const result = await fetchProjects();
      setProjects(result);
      setSelectedId((current) => current && result.some((item) => item.id === current) ? current : result[0]?.id ?? null);
    } catch { toast.error("Projects could not be loaded."); }
    finally { setLoading(false); }
  }

  const selected = projects.find((project) => project.id === selectedId);
  const contextItems: WorkspaceItem[] = selected ? [{ id: selected.id, title: selected.name, body: `${selected.description}\n${selected.instructions}`.trim(), kind: "project", createdAt: selected.created_at }] : [];
  const context = useMemo(() => buildProjectContext(prefs, contextItems), [prefs, selectedId, projects]);

  async function add() {
    if (!name.trim()) {
      toast.error("Give the project a name first.");
      return;
    }
    try {
      await addProject({ data: { name, description, instructions } });
      setName(""); setDescription(""); setInstructions("");
      await reload(); toast.success("Project created securely.");
    } catch { toast.error("Project could not be created."); }
  }

  async function archive(id: string) {
    try { await removeProject({ data: { projectId: id } }); await reload(); toast.success("Project archived."); }
    catch { toast.error("Project could not be archived."); }
  }

  async function upload(file: File) {
    if (!selected) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/jpeg", "image/png", "image/webp"] as const;
    if (!allowed.includes(file.type as (typeof allowed)[number]) || file.size > 10 * 1024 * 1024) {
      toast.error("Use PDF, DOCX, TXT, JPG, PNG or WebP files up to 10 MB.");
      return;
    }
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) {
      toast.error("Please sign in again.");
      return;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${session.user.id}/${selected.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("nuru-files").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      toast.error("File upload failed.");
      return;
    }
    try {
      const extractedText = file.type === "text/plain" ? (await file.text()).slice(0, 100000) : "";
      await saveFileRecord({ data: { projectId: selected.id, storagePath: path, fileName: file.name, mimeType: file.type as (typeof allowed)[number], sizeBytes: file.size, extractedText } });
      await reload(); toast.success(extractedText ? "File ready for project context." : "File uploaded securely. Processing support is coming for this format.");
    } catch {
      await supabase.storage.from("nuru-files").remove([path]);
      toast.error("File details could not be saved.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">My Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep private project instructions and files with your account, then work with Nuru in one place.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          aria-label="Project name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What is this project about?"
          aria-label="Project description"
          className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/50"
        />
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Project instructions for Nuru (optional)" aria-label="Project instructions" className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
        <Button size="sm" onClick={() => void add()} className="mt-3"><Plus className="size-3.5" /> Create project</Button>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-primary" /></div> : projects.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {projects.map((item) => (
            <li key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 ${item.id === selectedId ? "border-primary" : "border-border"}`} onClick={() => setSelectedId(item.id)}>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><FileText className="size-3" /> {item.project_files.length} files</p>
              </div>
              <Button size="icon" variant="ghost" aria-label={`Archive ${item.name}`} onClick={(event) => { event.stopPropagation(); void archive(item.id); }}><Archive className="size-4" /></Button>
            </li>
          ))}
        </ul>
      )}

      {selected && <section className="mt-8 border-y border-border py-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{selected.name}</h2><p className="text-sm text-muted-foreground">Files are private to your account. TXT files are ready immediately; other formats are stored securely while processing support is prepared.</p></div><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Upload file</Button></div>
        <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
        {selected.project_files.length > 0 && <ul className="mt-4 divide-y divide-border rounded-lg border border-border">{selected.project_files.map((file) => <li key={file.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm"><span className="truncate">{file.file_name}</span><span className="shrink-0 text-xs capitalize text-muted-foreground">{file.status}</span></li>)}</ul>}
      </section>}

      <section className="mt-10 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Work on your projects
        </h2>
        <NuruChat
          department="workspace"
          {...(selected ? { projectContext: context } : {})}
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
