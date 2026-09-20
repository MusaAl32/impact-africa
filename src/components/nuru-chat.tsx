import { useChat } from "@ai-sdk/react";
import type { FileUIPart, UIMessage } from "ai";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
  AudioLines, ChevronDown, Copy, ExternalLink, Flag, Globe2, Headphones,
  Image, Mic, MicOff, MoreHorizontal, PencilLine, RefreshCcw, Share2, Sparkles,
  ThumbsDown, ThumbsUp, Volume2, VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message, MessageAction, MessageActions, MessageContent, MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu,
  PromptInputActionMenuContent, PromptInputActionMenuItem, PromptInputActionMenuTrigger,
  PromptInputButton, PromptInputFooter, PromptInputSubmit, PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { NuruMark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { branchConversation, saveMessage } from "@/lib/chat.functions";
import { cn } from "@/lib/utils";
import { loadPreferences } from "@/lib/workspace";
import { speak, stopSpeaking, useSpeechRecognition } from "@/hooks/use-speech";

type Source = { title: string; url: string; domain: string; date?: string };

export interface NuruChatProps {
  department: string;
  placeholder?: string;
  suggestions?: string[];
  initialPrompt?: string;
  language?: string;
  projectContext?: string;
  className?: string;
  accept?: string;
  heading?: string;
  persist?: boolean;
  conversationId?: string;
  initialMessages?: UIMessage[];
  onHistoryChanged?: () => void;
}

const extractText = (message: UIMessage) =>
  message.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n").trim();

function getSources(message: UIMessage): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const part of message.parts) {
    if (part.type !== "source-url" || seen.has(part.url)) continue;
    seen.add(part.url);
    let domain = part.url;
    try { domain = new URL(part.url).hostname.replace(/^www\./, ""); } catch { /* safe fallback */ }
    sources.push({ title: part.title || domain, url: part.url, domain });
  }
  return sources;
}

function friendlyError(error: Error | undefined) {
  const value = error?.message?.toLowerCase() ?? "";
  if (value.includes("429") || value.includes("rate")) return "Nuru is receiving many requests. Please wait a moment and try again.";
  if (value.includes("credit") || value.includes("quota")) return "Nuru is temporarily unavailable because the AI service limit was reached. Please try again later.";
  if (value.includes("timeout") || value.includes("timed out")) return "That response took too long. Please retry, or shorten your request.";
  if (value.includes("401") || value.includes("unauthorized")) return "Your session expired. Please sign in again to continue.";
  return "Nuru could not complete that response. Your conversation is safe—please try again.";
}

function fileParts(files: FileUIPart[]) {
  return files.map(({ type: _type, ...file }) => ({ type: "file" as const, ...file }));
}

export function NuruChat({
  department, initialPrompt, language,
  projectContext, className, accept, heading = "How can Nuru help?", persist = false,
  conversationId, initialMessages = [], onHistoryChanged,
}: NuruChatProps) {
  const [webAccess, setWebAccess] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [initialSent, setInitialSent] = useState(false);
  const { listening, supported: speechSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition();

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    headers: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
    },
  }), []);

  const { messages, sendMessage, status, stop, error, regenerate, setMessages } = useChat({
    id: conversationId ?? `${department}-ephemeral`,
    messages: initialMessages,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";

  // Reset the thread only when the conversation actually changes. `initialMessages`
  // is a fresh array on every render, so depending on it here loops forever.
  const initialMessagesRef = useRef(initialMessages);
  initialMessagesRef.current = initialMessages;
  useEffect(() => {
    setMessages(initialMessagesRef.current);
  }, [conversationId, setMessages]);

  const submit = useCallback(async (text: string, files: FileUIPart[] = []) => {
    const clean = text.trim();
    if ((!clean && files.length === 0) || busy) return;
    const id = crypto.randomUUID();
    const parts: UIMessage["parts"] = [
      ...(clean ? [{ type: "text" as const, text: clean }] : []),
      ...fileParts(files),
    ];
    if ((persist || conversationId) && conversationId) {
      try {
        await saveMessage({ data: {
          conversationId, clientMessageId: id, role: "user", parts, department,
        } });
        onHistoryChanged?.();
      } catch {
        toast.error("Your message could not be saved. Please check your connection and try again.");
        return;
      }
    }
    await sendMessage({ id, role: "user", parts }, {
      body: { department, language, projectContext, webAccess, conversationId },
    });
    onHistoryChanged?.();
  }, [busy, conversationId, department, language, onHistoryChanged, persist, projectContext, sendMessage, webAccess]);

  useEffect(() => {
    if (!initialPrompt || initialSent || messages.length > 0) return;
    setInitialSent(true);
    void submit(initialPrompt);
  }, [initialPrompt, initialSent, messages.length, submit]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Response copied.");
  }

  function shareWhatsApp(text: string) {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n\nShared from Nuru AI`)}`, "_blank", "noopener,noreferrer");
  }

  async function share(text: string) {
    if (navigator.share) {
      try { await navigator.share({ title: "Nuru AI response", text }); return; } catch { return; }
    }
    await copy(text);
  }

  async function branch(messageId: string) {
    if (!conversationId) {
      toast.error("Open a saved conversation before creating a branch.");
      return;
    }
    try {
      const next = await branchConversation({
        data: { conversationId, throughClientMessageId: messageId ?? "" },
      });
      window.dispatchEvent(new Event("nuru-history-changed"));
      window.location.assign(`/app/chat/${next.conversationId}`);
    } catch { toast.error("Nuru could not create that branch. Please try again."); }
  }

  function readAloud(id: string, text: string) {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    const prefs = loadPreferences();
    setSpeakingId(id);
    speak(text, language, {
      voiceURI: prefs.voiceURI,
      rate: prefs.voiceRate,
      onEnd: () => setSpeakingId(null),
    });
  }

  const emptyActions = [
    {
      label: "Start a voice chat",
      icon: Headphones,
      action: () => speechSupported
        ? startListening((text) => void submit(text), language)
        : toast.error("Voice input is not supported by this browser."),
    },
    { label: "Create an image or sticker", icon: Image, action: () => void submit("Create an image or sticker") },
    { label: "Write or edit", icon: PencilLine, action: () => void submit("Help me write or edit") },
  ];

  return (
    <section className={cn("chat-workspace flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground", className)} aria-label="Nuru AI chat">
      <Conversation className="min-h-[44vh]">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-4 pb-28 pt-3 sm:px-5 lg:pb-8">
          {messages.length === 0 ? (
            <ConversationEmptyState className="min-h-[calc(100dvh-13rem)] justify-end px-0 pb-4 pt-16 sm:min-h-[60vh] sm:justify-center">
              <div className="animate-fade-up w-full max-w-xl">
                <h1 className="sr-only">{heading}</h1>
                <div className="flex flex-col items-start gap-2">
                  {emptyActions.map(({ label, icon: Icon, action }) => (
                    <Button
                      key={label}
                      type="button"
                      variant="outline"
                      onClick={action}
                      className="min-h-11 max-w-full rounded-full border-border bg-background px-4 font-normal shadow-none hover:bg-secondary"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : messages.map((message) => {
            const text = extractText(message);
            const sources = getSources(message);
            const assistant = message.role === "assistant";
            return (
              <Message key={message.id} from={message.role} className="animate-fade-up max-w-full break-words">
                {assistant && <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><NuruMark className="size-5" /> Nuru</div>}
                <MessageContent className="overflow-visible">
                  {message.parts.map((part, index) => part.type === "text" ? (
                    <MessageResponse key={`${message.id}-${index}`} isAnimating={busy && message === messages.at(-1)}
                      className="break-words [&_a]:break-all [&_a]:text-primary [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto">
                      {part.text}
                    </MessageResponse>
                  ) : part.type === "reasoning" ? (
                    <Collapsible key={`${message.id}-${index}`} className="rounded-xl border border-border/70 bg-card/40">
                      <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between px-3 text-xs font-medium text-muted-foreground">Thinking summary <ChevronDown className="size-4" /></CollapsibleTrigger>
                      <CollapsibleContent className="border-t border-border px-3 py-3 text-sm text-muted-foreground"><MessageResponse>{part.text}</MessageResponse></CollapsibleContent>
                    </Collapsible>
                  ) : isToolUIPart(part) ? (
                    <Tool key={`${message.id}-${index}`} defaultOpen={false}>
                      {part.type === "dynamic-tool" ? <ToolHeader type={part.type} state={part.state} toolName={part.toolName} /> : <ToolHeader type={part.type} state={part.state} />}
                      <ToolContent><ToolInput input={part.input} /><ToolOutput output={part.output} errorText={part.errorText} /></ToolContent>
                    </Tool>
                  ) : null)}
                </MessageContent>
                {assistant && text && (
                  <>
                    {sources.length > 0 && <SourcesPanel sources={sources} />}
                    <MessageActions className="flex-wrap gap-0.5 text-muted-foreground">
                      <MessageAction className="size-10" tooltip={speakingId === message.id ? "Stop reading" : "Read aloud"} onClick={() => readAloud(message.id, text)}>
                        {speakingId === message.id ? <VolumeX /> : <Volume2 />}
                      </MessageAction>
                      <MessageAction className="size-10" tooltip="Helpful" onClick={() => setFeedback((v) => ({ ...v, [message.id]: "up" }))}>
                        <ThumbsUp className={feedback[message.id] === "up" ? "fill-current text-primary" : ""} />
                      </MessageAction>
                      <MessageAction className="size-10" tooltip="Not helpful" onClick={() => setFeedback((v) => ({ ...v, [message.id]: "down" }))}>
                        <ThumbsDown className={feedback[message.id] === "down" ? "fill-current text-primary" : ""} />
                      </MessageAction>
                      <MessageAction className="size-10" tooltip="Copy response" onClick={() => void copy(text)}><Copy /></MessageAction>
                      <MessageAction className="size-10" tooltip="Share to WhatsApp" onClick={() => shareWhatsApp(text)} aria-label="Share to WhatsApp">
                        <Share2 />
                      </MessageAction>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-10 rounded-md" aria-label="More response actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => void regenerate({ messageId: message.id, body: { department, language, projectContext, webAccess, conversationId } })}><RefreshCcw /> Regenerate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setWebAccess(true)}><Globe2 /> Web search</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void branch(message.id)}><Sparkles /> Branch</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => void copy(text)}><Copy /> Copy</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void share(text)}><Share2 /> Share</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => readAloud(message.id, text)}><Volume2 /> Read aloud</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Thank you. This response was reported for review.")}><Flag /> Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </MessageActions>
                  </>
                )}
              </Message>
            );
          })}
          {status === "submitted" && (
            <div className="flex animate-fade-up items-center gap-3 text-sm" role="status" aria-live="polite">
              <NuruMark className="size-5" /><Shimmer>Nuru is thinking…</Shimmer>
            </div>
          )}
          {error && (
            <div role="alert" className="animate-fade-up rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p>{friendlyError(error)}</p>
              <Button className="mt-3" size="sm" variant="outline" onClick={() => void regenerate({ body: { department, language, projectContext, webAccess, conversationId } })}>
                <RefreshCcw /> Try again
              </Button>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="size-11" />
      </Conversation>

      <div className="sticky bottom-0 z-20 bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-5">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            {...(accept ? { accept } : {})}
            multiple
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
            onError={({ message }) => { toast.error(message); }}
            onSubmit={({ text, files }) => submit(text, files)}
            className="rounded-full [&_[data-slot=input-group]]:relative [&_[data-slot=input-group]]:rounded-full [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-sm"
          >
            <PromptInputTextarea placeholder="Ask Ascender AI" className="min-h-14 max-h-36 py-4 pl-14 pr-28 text-base" />
            <PromptInputFooter className="pointer-events-none absolute inset-0 z-10 h-full w-full p-1.5">
              <PromptInputTools className="pointer-events-auto absolute left-1.5 top-1/2 -translate-y-1/2">
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger className="size-11 rounded-full" tooltip="Attachments and tools" />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                    <PromptInputActionMenuItem onSelect={() => setWebAccess((value) => !value)}>
                      <Globe2 className="mr-2 size-4" /> {webAccess ? "Turn off web search" : "Search the web"}
                    </PromptInputActionMenuItem>
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <div className="pointer-events-auto absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                {speechSupported && <PromptInputButton className={cn("size-11 rounded-full", listening && "bg-destructive/15 text-destructive")} tooltip={listening ? "Stop voice input" : "Voice input"}
                  onClick={() => listening ? stopListening() : startListening((text) => void submit(text), language)}>
                  {listening ? <MicOff /> : <Mic />}
                </PromptInputButton>}
                <PromptInputSubmit aria-label={busy ? "Stop response" : "Send message"} className="size-11 rounded-full bg-chat-audio text-chat-audio-foreground hover:bg-chat-audio/90" status={status} onStop={stop}>
                  <AudioLines className="size-5" />
                </PromptInputSubmit>
              </div>
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            Nuru can make mistakes. Verify important information locally.
          </p>
        </div>
      </div>
    </section>
  );
}

function SourcesPanel({ sources }: { sources: Source[] }) {
  return (
    <Collapsible className="rounded-2xl border border-border bg-card/50">
      <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between gap-3 px-4 text-sm font-medium">
        <span className="flex items-center gap-2"><Globe2 className="size-4 text-primary" /> Sources <span className="text-xs text-muted-foreground">{sources.length}</span></span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border px-3 py-2">
        <ol className="space-y-1">
          {sources.map((source, index) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="flex min-h-11 items-start gap-3 rounded-xl px-2 py-2 text-sm hover:bg-secondary">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary">{index + 1}</span>
                <span className="min-w-0 flex-1"><span className="line-clamp-1 font-medium">{source.title}</span><span className="text-xs text-muted-foreground">{source.domain}{source.date ? ` · ${source.date}` : ""}</span></span>
                <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}