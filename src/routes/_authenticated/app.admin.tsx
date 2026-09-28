import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { sendPushToAll } from "@/lib/push.functions";
import { Loader2, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminDeleteProblem,
  adminDeleteResearch,
  adminDeleteSubmission,
  adminListPeople,
  adminListProblems,
  adminListResearch,
  adminListSubmissions,
  adminOverview,
  adminPublishSubmission,
  adminSetAgentAccess,
  adminSetProblemStatus,
  adminSetRole,
  adminSetSubmissionStatus,
  isCurrentUserAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/app/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Admin control room — Nuru AI" },
      {
        name: "description",
        content:
          "Secure administration for the Africa Opportunity Hub: content review, submissions, accounts, roles and agent endpoint access.",
      },
      { property: "og:title", content: "Admin control room — Nuru AI" },
      {
        property: "og:description",
        content: "Manage problems, research, submissions, roles and agent access securely.",
      },
    ],
  }),
  component: AdminPage,
});

type Overview = Awaited<ReturnType<typeof adminOverview>>;
type Problem = Awaited<ReturnType<typeof adminListProblems>>["items"][number];
type Research = Awaited<ReturnType<typeof adminListResearch>>["items"][number];
type Submission = Awaited<ReturnType<typeof adminListSubmissions>>["items"][number];
type Person = Awaited<ReturnType<typeof adminListPeople>>["items"][number];

function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    isCurrentUserAdmin()
      .then((r) => setAllowed(r.admin))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShieldOff className="mx-auto mb-4 size-8 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Administrators only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted. Ask an administrator if you need access.
        </p>
      </div>
    );
  }

  return <AdminConsole />;
}

function AdminConsole() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const [o, p, r, s, u] = await Promise.all([
        adminOverview(),
        adminListProblems(),
        adminListResearch(),
        adminListSubmissions(),
        adminListPeople(),
      ]);
      setOverview(o);
      setProblems(p.items);
      setResearch(r.items);
      setSubmissions(s.items);
      setPeople(u.items);
    } catch {
      toast.error("Could not load the admin data.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (action: () => Promise<{ ok: boolean; error?: string | null }>, ok: string) => {
    try {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error || "That change could not be saved.");
        return;
      }
      toast.success(ok);
      await refresh();
    } catch {
      toast.error("That change could not be saved.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <ShieldCheck className="size-3.5" /> Secure area
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Admin control room</h1>
          <p className="text-sm text-muted-foreground">
            Manage the problem database, research, submissions, accounts and agent access.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Refresh"}
        </Button>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Problems", overview?.problems],
          ["Published", overview?.published],
          ["Research", overview?.research],
          ["Submissions", overview?.submissions],
          ["Pending review", overview?.pending],
          ["Accounts", overview?.accounts],
          ["Conversations", overview?.conversations],
          ["Agent seats", overview?.agentSeats],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value ?? "—"}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="submissions">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="people">People &amp; access</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4 space-y-3">
          {submissions.length === 0 && <Empty label="No submissions yet." />}
          {submissions.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.category} · {s.country} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.summary}</p>
                </div>
                <Badge variant={s.status === "pending" ? "default" : "secondary"}>{s.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => run(() => adminPublishSubmission({ data: { id: s.id } }), "Published to the problem database.")}
                >
                  Publish
                </Button>
                {(["reviewing", "accepted", "rejected"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      run(
                        () => adminSetSubmissionStatus({ data: { id: s.id, status } }),
                        `Marked ${status}.`,
                      )
                    }
                  >
                    {status}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => run(() => adminDeleteSubmission({ data: { id: s.id } }), "Deleted.")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="problems" className="mt-4 space-y-3">
          {problems.length === 0 && <Empty label="No problems yet." />}
          {problems.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {p.country} · severity {p.severity}/5 · score {p.opportunity_score}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
                {(["published", "draft", "archived"] as const)
                  .filter((status) => status !== p.status)
                  .map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(
                          () => adminSetProblemStatus({ data: { id: p.id, status } }),
                          `Moved to ${status}.`,
                        )
                      }
                    >
                      {status}
                    </Button>
                  ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => run(() => adminDeleteProblem({ data: { id: p.id } }), "Deleted.")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="research" className="mt-4 space-y-3">
          {research.length === 0 && <Empty label="No research entries yet." />}
          {research.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.category} · {r.country} · {r.source}
                  {r.year ? ` (${r.year})` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => run(() => adminDeleteResearch({ data: { id: r.id } }), "Deleted.")}
              >
                <Trash2 className="size-4" />
              </Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="people" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Agent access controls who may use the Nuru AI agent endpoint from outside apps. It is
            off for everyone by default.
          </p>
          {people.map((u) => (
            <Card key={u.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                  {u.lastSignInAt
                    ? ` · last seen ${new Date(u.lastSignInAt).toLocaleDateString()}`
                    : ""}
                </p>
                <div className="mt-1 flex gap-1">
                  {u.roles.length === 0 && <Badge variant="secondary">user</Badge>}
                  {u.roles.map((role) => (
                    <Badge key={role}>{role}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={u.roles.includes("admin")}
                    onCheckedChange={(checked) =>
                      run(
                        () =>
                          adminSetRole({
                            data: { userId: u.id, role: "admin", grant: checked },
                          }),
                        checked ? "Admin access granted." : "Admin access removed.",
                      )
                    }
                  />
                  Admin
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={u.agentAccess}
                    onCheckedChange={(checked) =>
                      run(
                        () => adminSetAgentAccess({ data: { userId: u.id, grant: checked } }),
                        checked ? "Agent access granted." : "Agent access revoked.",
                      )
                    }
                  />
                  Agent access
                </label>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      <SendNotification />
    </div>
  );
}

function SendNotification() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  async function send() {
    if (!title.trim() || !body.trim()) { toast.error("Add a title and a message."); return; }
    setSending(true);
    try {
      const r = await sendPushToAll({ data: { title, body } });
      toast.success(`Sent to ${r.sent} device${r.sent === 1 ? "" : "s"}${r.failed ? `, ${r.failed} failed` : ""}.`);
      setTitle(""); setBody("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not send."); }
    finally { setSending(false); }
  }
  return (
    <Card className="mt-8 space-y-3 p-5">
      <h2 className="text-sm font-semibold">Send a notification to all users</h2>
      <input className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" maxLength={80} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="min-h-20 w-full rounded-md border border-border bg-background p-3 text-sm" maxLength={240} placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} />
      <Button onClick={() => void send()} disabled={sending}>{sending && <Loader2 className="mr-1 size-4 animate-spin" />} Send</Button>
    </Card>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <Card className="p-8 text-center text-sm text-muted-foreground">{label}</Card>
  );
}
