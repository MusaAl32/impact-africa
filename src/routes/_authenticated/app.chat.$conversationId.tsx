import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NuruChat } from "@/components/nuru-chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveConversation, getConversation, renameConversation } from "@/lib/chat.functions";
import { getDepartment } from "@/lib/departments";

export const Route = createFileRoute("/_authenticated/app/chat/$conversationId")({
  staticData: { sitemap: false },
  loader: async ({ params }) => {
    try {
      return await getConversation({ data: { conversationId: params.conversationId } });
    } catch {
      throw notFound();
    }
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

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [title, setTitle] = useState(data.conversation.title);
  const department = data.messages.at(-1)?.department ?? "platform";
  const dept = getDepartment(department as Parameters<typeof getDepartment>[0]);
  const initialMessages = useMemo<UIMessage[]>(() => data.messages.map((message) => ({
    id: message.client_message_id ?? `saved-${message.created_at}`,
    role: message.role as UIMessage["role"],
    parts: message.parts as UIMessage["parts"],
  })), [data.messages]);

  async function rename() {
    const next = window.prompt("Rename conversation", title)?.trim();
    if (!next || next === title) return;
    try {
      await renameConversation({ data: { conversationId, title: next } });
      setTitle(next);
      window.dispatchEvent(new Event("nuru-history-changed"));
    } catch { toast.error("Could not rename this conversation."); }
  }

  async function archive() {
    if (!window.confirm("Remove this conversation from your history?")) return;
    try {
      await archiveConversation({ data: { conversationId } });
      window.dispatchEvent(new Event("nuru-history-changed"));
      await navigate({ to: "/app", replace: true });
    } catch { toast.error("Could not archive this conversation."); }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-4xl flex-1 flex-col px-4 py-3 lg:min-h-screen lg:py-5">
      <header className="mb-2 flex min-h-11 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild size="icon" variant="ghost" className="size-11 lg:hidden">
            <Link to="/app" aria-label="Back to Nuru"><ArrowLeft /></Link>
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{dept.name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-11" aria-label="Conversation options"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void rename()}><Pencil /> Rename</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => void archive()}><Trash2 /> Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <NuruChat
        key={conversationId}
        conversationId={conversationId}
        department={department}
        initialMessages={initialMessages}
        heading="What can I help you work through?"
        placeholder="Ask Nuru anything — in English, Kiswahili, Hausa, Chichewa…"
        suggestions={dept.suggestions ?? []}
        onHistoryChanged={() => window.dispatchEvent(new Event("nuru-history-changed"))}
      />
    </div>
  );
}