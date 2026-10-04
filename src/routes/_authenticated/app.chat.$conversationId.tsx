import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Share2, Pin, FolderPlus, Home, Archive, Sparkles, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NuruChat } from "@/components/nuru-chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveConversation, createConversation, deleteConversation, getConversation, renameConversation } from "@/lib/chat.functions";
import { getDepartment } from "@/lib/departments";

export const Route = createFileRoute("/_authenticated/app/chat/$conversationId")({
  staticData: { sitemap: false },
  loader: async ({ params }) => {
    const result = await getConversation({ data: { conversationId: params.conversationId } })
      .catch(() => null);
    if (!result?.conversation) return { conversation: null, messages: [] };
    return { conversation: result.conversation, messages: result.messages };
  },
  head: () => ({ meta: [{ title: "Conversation — Nuru AI" }] }),
  component: ConversationPage,
  notFoundComponent: MissingConversation,
  errorComponent: MissingConversation,
});

function MissingConversation() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">This conversation isn&apos;t available</h1>
      <p className="text-sm text-muted-foreground">
        It may have been removed, or it belongs to another account. Your own conversations are safe.
      </p>
      <Button asChild className="min-h-11"><Link to="/app">Back to Nuru</Link></Button>
    </div>
  );
}

function togglePinLocal(id: string) {
  const current: string[] = JSON.parse(localStorage.getItem("nuru-pinned") || "[]");
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  localStorage.setItem("nuru-pinned", JSON.stringify(next));
  toast.success(current.includes(id) ? "Removed from pinned chats" : "Chat pinned");
}

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [title, setTitle] = useState(data.conversation?.title ?? "Conversation");
  const department = data.messages.at(-1)?.department ?? "platform";
  const dept = getDepartment(department as Parameters<typeof getDepartment>[0]);
  const initialMessages = useMemo<UIMessage[]>(() => data.messages.map((message) => ({
    id: message.client_message_id ?? `saved-${message.created_at}`,
    role: message.role as UIMessage["role"],
    parts: message.parts as UIMessage["parts"],
  })), [data.messages]);

  if (!data.conversation) return <MissingConversation />;

  async function rename() {
    const next = window.prompt("Rename conversation", title)?.trim();
    if (!next || next === title) return;
    try {
      await renameConversation({ data: { conversationId, title: next } });
      setTitle(next);
      window.dispatchEvent(new Event("nuru-history-changed"));
    } catch { toast.error("Could not rename this conversation."); }
  }

  async function shareConversation() {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title, text: `Conversation with Nuru AI: ${title}`, url }); return; } catch { return; } }
    await navigator.clipboard.writeText(url);
    toast.success("Conversation link copied.");
  }

  async function clearChat() {
    if (!window.confirm("Start a fresh chat? This conversation will remain in your history.")) return;
    try {
      const next = await createConversation();
      window.dispatchEvent(new Event("nuru-history-changed"));
      await navigate({ to: "/app/chat/$conversationId", params: { conversationId: next.id } });
    } catch { toast.error("Could not start a fresh chat."); }
  }

  async function archive() {
    if (!window.confirm("Remove this conversation from your history?")) return;
    try {
      await archiveConversation({ data: { conversationId } });
      window.dispatchEvent(new Event("nuru-history-changed"));
      await navigate({ to: "/app", replace: true });
    } catch { toast.error("Could not delete this conversation."); }
  }

  async function remove() {
    if (!window.confirm("Permanently delete this conversation? This cannot be undone.")) return;
    try {
      await deleteConversation({ data: { conversationId } });
      window.dispatchEvent(new Event("nuru-history-changed"));
      await navigate({ to: "/app", replace: true });
    } catch { toast.error("Could not delete this conversation."); }
  }

  return (
    <div className="chat-workspace mx-auto flex h-[calc(100dvh-3.5rem)] min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden bg-background px-0 lg:h-screen lg:px-4 lg:py-5">
      <header className="mb-2 hidden min-h-11 items-center justify-between gap-3 lg:flex">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild size="icon" variant="ghost" className="size-9 lg:hidden">
            <Link to="/app" aria-label="Back to Nuru"><ArrowLeft /></Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-black/[.05]"><div className="size-7 rounded-lg bg-black/[.06] p-1.5"><Sparkles className="size-4" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">Nuru</p><p className="text-[11px] text-muted-foreground">{dept.name} · Auto</p></div><SlidersHorizontal className="ml-1 size-3.5 text-muted-foreground" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="start"><DropdownMenuItem onClick={() => toast.info("Automatic model routing is enabled.")}>Nuru Auto</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("Model selection will be connected to your platform configuration.")}>Model settings</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
          <span className="hidden truncate text-xs text-muted-foreground xl:inline">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="size-9" onClick={() => void shareConversation()} aria-label="Share conversation"><Share2 /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-9" aria-label="Conversation options"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => togglePinLocal(conversationId)}><Pin /> Pin chat</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Project management is ready to connect to your workspace.")}><FolderPlus /> Add to project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void shareConversation()}><Share2 /> Share</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Home shortcuts will be available on supported devices.")}><Home /> Add to home</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void rename()}><Pencil /> Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void clearChat()}><Sparkles /> Start new chat</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void archive()}><Archive /> Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => void remove()}><Trash2 /> Delete permanently</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <NuruChat
        key={conversationId}
        conversationId={conversationId}
        department={department}
        initialMessages={initialMessages}
        heading="What can I help you work through?"
        placeholder="Message Nuru AI"
        suggestions={dept.suggestions ?? []}
        onHistoryChanged={() => window.dispatchEvent(new Event("nuru-history-changed"))}
      />
    </div>
  );
}