import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Archive, Bookmark, ChevronDown, GalleryVerticalEnd, Globe2, HelpCircle, Image as ImageIcon,
  Library, Menu, MessageCircle, MessageSquarePlus, MoreHorizontal, Pin, Plus, Search, Settings, Sparkles,
  Trash2, X, BriefcaseBusiness, HeartPulse, TrendingUp, SlidersHorizontal, LogOut, Share2, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AccountMenu } from "@/components/account-menu";
import { DeptIcon } from "@/components/dept-icon";
import { NuruWordmark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/departments";
import { archiveConversation, createConversation, listConversations, renameConversation } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/app")({
  staticData: { sitemap: false },
  component: AppLayout,
});

const quickTools = [
  { label: "New chat", icon: MessageSquarePlus, action: "new" },
  { label: "Search chats", icon: Search, action: "search" },
  { label: "Library", icon: Library, action: "library" },
  { label: "Projects", icon: BriefcaseBusiness, action: "projects" },
  { label: "Images", icon: ImageIcon, action: "images" },
];

const workspaceTools = [
  { label: "Health", icon: HeartPulse, to: "/app" },
  { label: "Investing", icon: TrendingUp, to: "/app/investments" },
  { label: "Business", icon: BriefcaseBusiness, to: "/app/business" },
  { label: "Research", icon: Globe2, to: "/app/research" },
] as Array<{ label: string; icon: typeof HeartPulse; to: string }>;

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<Awaited<ReturnType<typeof listConversations>>["items"]>([]);
  const [sortMode, setSortMode] = useState<"recent" | "oldest" | "az">("recent");
  const [pinned, setPinned] = useState<string[]>(() => JSON.parse(localStorage.getItem("nuru-pinned") || "[]"));

  useEffect(() => {
    let cancelled = false;
    async function checkAdminRole() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user || cancelled) return;
      const { data, error } = await supabase.from("user_roles").select("id").eq("user_id", authData.user.id).eq("role", "admin").maybeSingle();
      if (!cancelled) setIsAdmin(!error && data !== null);
    }
    void checkAdminRole();
    return () => { cancelled = true; };
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
    try { await renameConversation({ data: { conversationId: id, title } }); refreshHistory(); } catch { toast.error("Could not rename this conversation."); }
  }

  async function archive(id: string) {
    try {
      await archiveConversation({ data: { conversationId: id } });
      refreshHistory();
      if (pathname.endsWith(id)) await navigate({ to: "/app" });
    } catch { toast.error("Could not archive this conversation."); }
  }

  function togglePin(id: string) {
    const next = pinned.includes(id) ? pinned.filter((x) => x !== id) : [id, ...pinned];
    setPinned(next); localStorage.setItem("nuru-pinned", JSON.stringify(next));
    toast.success(pinned.includes(id) ? "Removed from pinned chats" : "Chat pinned");
  }

  function go(to: string) {
    setOpen(false);
    void navigate({ to });
  }

  async function share(id: string) {
    const url = `${window.location.origin}/app/chat/${id}`;
    try { await navigator.clipboard.writeText(url); toast.success("Link copied — only you can open it while signed in."); }
    catch { toast.error("Could not copy the link."); }
  }

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? history.filter((item) => item.title.toLowerCase().includes(q)) : history;
    return [...filtered].sort((a, b) => {
      if (sortMode === "az") return a.title.localeCompare(b.title);
      const ad = new Date(a.updated_at ?? 0).getTime(); const bd = new Date(b.updated_at ?? 0).getTime();
      return sortMode === "recent" ? bd - ad : ad - bd;
    });
  }, [history, search, sortMode]);

  const departmentLink = (d: (typeof DEPARTMENTS)[number]) => {
    const active = d.path === "/app" ? pathname === "/app" || pathname.startsWith("/app/chat/") : pathname.startsWith(d.path);
    return <Link key={d.id} to={d.path} onClick={() => setOpen(false)} className={cn("group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition-colors", active ? "bg-black/[.07] font-medium text-foreground" : "text-muted-foreground hover:bg-black/[.045] hover:text-foreground")}><DeptIcon name={d.icon} className="size-[17px] shrink-0" /><span className="truncate">{d.name}</span></Link>;
  };

  const primary = DEPARTMENTS.slice(0, 4); const more = DEPARTMENTS.slice(4);

  const conversations = (
    <section className="px-2 pb-3 pt-2">
      <div className="mb-1 flex items-center justify-between px-2">
        <p className="text-[12px] font-semibold text-muted-foreground">Chats</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-8 rounded-md"><SlidersHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem onClick={() => setSortMode("recent")}>Most recent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortMode("oldest")}>Oldest first</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortMode("az")}>A–Z</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {searchOpen && <div className="mb-2 flex items-center rounded-lg bg-black/[.05] px-2"><Search className="size-4 text-muted-foreground" /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a chat" className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" /><button onClick={() => { setSearch(""); setSearchOpen(false); }}><X className="size-4 text-muted-foreground" /></button></div>}
      <div className="space-y-0.5">
        {filteredHistory.length === 0 && <p className="px-2 py-5 text-xs text-muted-foreground">{search ? "No chats found." : "Your conversations will appear here."}</p>}
        {filteredHistory.slice(0, 40).map((item) => {
          const active = pathname.endsWith(item.id);
          return <div key={item.id} className={cn("group flex min-w-0 items-center rounded-lg", active && "bg-black/[.07]")}>
            {pinned.includes(item.id) && <Pin className="ml-2 size-3 text-muted-foreground" />}
            <Link to="/app/chat/$conversationId" params={{ conversationId: item.id }} onClick={() => setOpen(false)} className="flex min-h-10 min-w-0 flex-1 items-center gap-2 px-2 text-[13px] text-muted-foreground hover:text-foreground"><MessageCircle className="size-4 shrink-0 opacity-70" /><span className="truncate">{item.title}</span></Link>
            <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="mr-1 size-8 shrink-0 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => togglePin(item.id)}><Pin /> {pinned.includes(item.id) ? "Unpin chat" : "Pin chat"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void rename(item.id, item.title)}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void share(item.id)}><Share2 /> Copy link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void archive(item.id)}><Archive /> Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => { if (window.confirm("Remove this chat from your list?")) void archive(item.id); }}><Trash2 /> Delete</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
          </div>;
        })}
      </div>
    </section>
  );

  const nav = <div className="px-2 pt-3">
    <Button onClick={() => void newChat()} variant="outline" className="mb-2 h-10 w-full justify-start gap-3 rounded-lg border-black/[.08] bg-transparent px-3 text-sm font-medium shadow-none hover:bg-black/[.05]"><MessageSquarePlus className="size-[18px]" /> New chat</Button>
    <button onClick={() => { setSearchOpen(true); setOpen(true); }} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-muted-foreground hover:bg-black/[.045] hover:text-foreground"><Search className="size-[18px]" /> Search chats <kbd className="ml-auto hidden rounded border bg-white px-1.5 py-0.5 text-[10px] text-muted-foreground xl:inline">Ctrl K</kbd></button>
    <button onClick={() => go("/app/workspace")} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-muted-foreground hover:bg-black/[.045] hover:text-foreground"><Library className="size-[18px]" /> Library</button>
    <button onClick={() => go("/app/workspace")} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-muted-foreground hover:bg-black/[.045] hover:text-foreground"><BriefcaseBusiness className="size-[18px]" /> Projects</button>
    <button onClick={() => go("/app/creative")} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-muted-foreground hover:bg-black/[.045] hover:text-foreground"><ImageIcon className="size-[18px]" /> Images</button>
    <div className="my-3 border-t border-black/[.07]" />
    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nuru</p>
    {primary.map(departmentLink)}
    <Collapsible className="mt-0.5"><CollapsibleTrigger className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-[14px] text-muted-foreground hover:bg-black/[.045] hover:text-foreground">More <ChevronDown className="size-4 transition-transform [[data-state=open]>&]:rotate-180" /></CollapsibleTrigger><CollapsibleContent className="space-y-0.5">{more.map(departmentLink)}</CollapsibleContent></Collapsible>
    <div className="mt-3 border-t border-black/[.07] pt-2"><p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Explore</p>{workspaceTools.map(({ label, icon: Icon, to }) => <Link key={label} to={to} onClick={() => setOpen(false)} className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-black/[.045] hover:text-foreground"><Icon className="size-4" /> {label}</Link>)}</div>
    {isAdmin && <Link to="/app/admin" className="mt-2 flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-black/[.045]"><Settings className="size-4" /> Admin</Link>}
  </div>;

  return <div className="chat-app flex min-h-screen bg-background text-foreground">
    <aside className={cn("fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-black/[.08] bg-[#f7f7f8] transition-[width] duration-200 lg:flex", collapsed ? "w-[68px]" : "w-[270px]")}>
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && <Link to="/" aria-label="Nuru AI home" className="px-2"><NuruWordmark /></Link>}
        <Button size="icon" variant="ghost" className="size-9 rounded-lg" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</Button>
      </div>
      {collapsed ? <div className="flex flex-col items-center gap-2 px-2 pt-2"><Button size="icon" variant="ghost" onClick={() => void newChat()}><Plus /></Button><Button size="icon" variant="ghost" onClick={() => { setCollapsed(false); setSearchOpen(true); }}><Search /></Button><Button size="icon" variant="ghost" onClick={() => go("/app/workspace")}><Library /></Button><Button size="icon" variant="ghost" onClick={() => go("/app/workspace")}><BriefcaseBusiness /></Button></div> : <div className="flex min-h-0 flex-1 flex-col overflow-hidden"><div className="shrink-0">{nav}</div><div className="min-h-0 flex-1 overflow-y-auto">{conversations}</div></div>}
      <div className="border-t border-black/[.07] p-2"><AccountMenu /></div>
    </aside>

    <div className={cn("flex min-w-0 flex-1 flex-col transition-[margin] duration-200", collapsed ? "lg:ml-[68px]" : "lg:ml-[270px]")}>
      <header className="chat-workspace sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/[.06] bg-background/95 px-2 backdrop-blur lg:hidden"><Button size="icon" variant="ghost" className="size-10" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button><NuruWordmark /><Button size="icon" variant="ghost" className="size-10" onClick={() => void newChat()}><MessageSquarePlus /></Button></header>
      {open && <div className="fixed inset-0 z-50 bg-black/20 lg:hidden" onClick={() => setOpen(false)}><div className="h-full w-[300px] bg-[#f7f7f8] shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex h-14 items-center justify-between px-3"><NuruWordmark /><Button size="icon" variant="ghost" onClick={() => setOpen(false)}><X /></Button></div><div className="max-h-[calc(100vh-56px)] overflow-y-auto"><div>{nav}</div>{conversations}</div></div></div>}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip"><Outlet /></main>
    </div>
  </div>;
}
