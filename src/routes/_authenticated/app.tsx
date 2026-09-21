import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, MessageSquare, MessageSquarePlus, MoreHorizontal, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AccountMenu } from "@/components/account-menu";
import { DeptIcon } from "@/components/dept-icon";
import { NuruWordmark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/departments";
import { archiveConversation, createConversation, listConversations, renameConversation } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/app")({
  staticData: { sitemap: false },
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof listConversations>>["items"]>([]);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminRole() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user || cancelled) return;

      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!cancelled) setIsAdmin(!error && data !== null);
    }

    void checkAdminRole();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshHistory = useCallback(() => {
    listConversations().then((result) => setHistory(result.items)).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    refreshHistory();
    window.addEventListener("nuru-history-changed", refreshHistory);
    return () => window.removeEventListener("nuru-history-changed", refreshHistory);
  }, [pathname, refreshHistory]);

  async function newChat() {
    try {
      const item = await createConversation();
      setOpen(false);
      refreshHistory();
      await navigate({ to: "/app/chat/$conversationId", params: { conversationId: item.id } });
    } catch { toast.error("Could not start a new conversation."); }
  }

  async function rename(id: string, current: string) {
    const title = window.prompt("Rename conversation", current)?.trim();
    if (!title || title === current) return;
    try { await renameConversation({ data: { conversationId: id, title } }); refreshHistory(); }
    catch { toast.error("Could not rename this conversation."); }
  }

  async function archive(id: string) {
    try {
      await archiveConversation({ data: { conversationId: id } });
      refreshHistory();
      if (pathname.endsWith(id)) await navigate({ to: "/app" });
    } catch { toast.error("Could not delete this conversation."); }
  }

  const primary = DEPARTMENTS.slice(0, 4);
  const more = DEPARTMENTS.slice(4);

  const departmentLink = (d: (typeof DEPARTMENTS)[number]) => {
    const active = d.path === "/app"
      ? pathname === "/app" || pathname.startsWith("/app/chat/")
      : pathname.startsWith(d.path);
    return (
      <Link key={d.id} to={d.path} onClick={() => setOpen(false)} className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
        active ? "bg-primary/12 font-medium text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}>
        <DeptIcon name={d.icon} className="size-4 shrink-0" /><span className="truncate">{d.name}</span>
      </Link>
    );
  };

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3" aria-label="Nuru departments">
      {primary.map(departmentLink)}
      <Collapsible className="mt-1">
        <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
          Explore more departments <ChevronDown className="size-4 transition-transform [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-0.5">{more.map(departmentLink)}</CollapsibleContent>
      </Collapsible>
      {isAdmin && (
        <Link
          to="/app/admin"
          onClick={() => setOpen(false)}
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/app/admin")
              ? "bg-primary/12 font-medium text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <ShieldCheck className="size-4 shrink-0" />
          <span className="truncate">Admin</span>
        </Link>
      )}
    </nav>
  );

  const conversations = (
    <section className="border-t border-border p-3">
      <div className="mb-2 flex items-center justify-between px-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversations</p>
        <Button size="icon" variant="ghost" className="size-11 sm:size-9" onClick={() => void newChat()} aria-label="New chat"><Plus /></Button>
      </div>
      <div className="space-y-0.5">
        {history.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">Your conversations will appear here.</p>}
        {history.slice(0, 20).map((item) => {
          const active = pathname.endsWith(item.id);
          return (
            <div key={item.id} className={cn("group flex min-w-0 items-center rounded-xl", active && "bg-secondary")}>
              <Link to="/app/chat/$conversationId" params={{ conversationId: item.id }} onClick={() => setOpen(false)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-3 text-sm text-muted-foreground hover:text-foreground">
                <MessageSquare className="size-4 shrink-0" /><span className="truncate">{item.title}</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-11 shrink-0 sm:size-9" aria-label={`Options for ${item.title}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => void rename(item.id, item.title)}><Pencil /> Rename</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => void archive(item.id)}><Trash2 /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" aria-label="Nuru AI home">
            <NuruWordmark />
          </Link>
          <AccountMenu compact />
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="max-h-[42vh] overflow-y-auto">{conversations}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="chat-workspace sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-2 text-foreground lg:hidden">
          <Button
            size="icon"
            variant="ghost"
            className="size-11"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <Button size="icon" variant="ghost" className="size-11" onClick={() => void newChat()} aria-label="New chat">
            <MessageSquarePlus className="size-5" />
          </Button>
        </header>

        {open && (
          <div className="border-b border-border bg-card lg:hidden">
            <div className="flex items-center justify-end border-b border-border px-3 py-2"><AccountMenu /></div>
            <div className="max-h-[72vh] overflow-y-auto">{nav}{conversations}</div>
          </div>
        )}

        {/* Required: nested routes render here. */}
        <main className="flex min-h-0 min-w-0 flex-1 animate-fade-up flex-col overflow-x-clip"><Outlet /></main>
      </div>
    </div>
  );
}
