import { useChat } from "@ai-sdk/react";
import type { FileUIPart, UIMessage } from "ai";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
  Check, ChevronDown, Copy, ExternalLink, Flag, Globe2, Mic, MicOff, MoreHorizontal,
  RefreshCcw, Share2, Sparkles, ThumbsDown, ThumbsUp, Volume2, VolumeX,
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
  PromptInputActionMenuContent, PromptInputActionMenuTrigger, PromptInputBody,
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

const DEFAULT_PROMPTS = [
  "Draft a business plan for a poultry farm in Lagos",
  "Translate this sentence to Hausa",
  "What crops suit dry season in Kenya?",
  "Summarise this document for me",
  "Research a market opportunity in Malawi",
  "Help me plan a community education project",
];

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
  department, placeholder = "Message Nuru", suggestions = [], initialPrompt, language,
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

  const promptCards = (suggestions.length >= 4 ? suggestions : DEFAULT_PROMPTS).slice(0, 6);

  return (
    <section className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)} aria-label="Nuru AI chat">
      <Conversation className="min-h-[44vh]">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-0 pb-8 pt-3 sm:px-2">
          {messages.length === 0 ? (
            <ConversationEmptyState className="min-h-[48vh] justify-center px-0 py-10">
              <div className="animate-fade-up w-full text-left">
                <NuruMark className="mb-5 size-10" />
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Ask naturally. Nuru can coordinate specialist departments, search the web, and explain its evidence.
                </p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {promptCards.map((prompt, index) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submit(prompt)}
                      className="min-h-20 animate-fade-up rounded-2xl border border-border bg-card/70 p-4 text-left text-sm leading-relaxed transition hover:border-primary/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <Sparkles className="mb-2 size-4 text-primary" />
                      {prompt}
                    </button>
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

      <div className="sticky bottom-0 z-20 bg-gradient-to-t from-background via-background to-transparent px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-5">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            {...(accept ? { accept } : {})}
            multiple
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
            onError={({ message }) => { toast.error(message); }}
            onSubmit={({ text, files }) => submit(text, files)}
            className="rounded-3xl shadow-[0_16px_50px_-20px_rgba(0,0,0,.85)] [&_[data-slot=input-group]]:rounded-3xl [&_[data-slot=input-group]]:border-border/80 [&_[data-slot=input-group]]:bg-card"
          >
            <PromptInputBody>
              <PromptInputTextarea placeholder={placeholder} className="min-h-20 px-4 pt-4 text-base" />
            </PromptInputBody>
            <PromptInputFooter className="px-2 pb-2">
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger className="size-11 rounded-full" tooltip="Attachments and tools" />
                  <PromptInputActionMenuContent><PromptInputActionAddAttachments /></PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  className={cn("h-11 rounded-full px-3", webAccess && "bg-primary/15 text-primary")}
                  tooltip="Search the web and include evidence"
                  onClick={() => setWebAccess((value) => !value)}
                  aria-pressed={webAccess}
                ><Globe2 /> <span className="hidden sm:inline">Web</span></PromptInputButton>
                {speechSupported && <PromptInputButton className={cn("size-11 rounded-full", listening && "bg-destructive/15 text-destructive")} tooltip={listening ? "Stop voice input" : "Voice input"}
                  onClick={() => listening ? stopListening() : startListening((text) => void submit(text))}>
                  {listening ? <MicOff /> : <Mic />}
                </PromptInputButton>}
              </PromptInputTools>
              <PromptInputSubmit className="size-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" status={status} onStop={stop} />
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