import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowUp,
  ChevronDown,
  Copy,
  Flag,
  GitBranch,
  Globe,
  Loader2,
  Mic,
  MicOff,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Share2,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { NuruLogo } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DepartmentId } from "@/lib/departments";
import { speak, stopSpeaking, useSpeechRecognition } from "@/hooks/use-speech";
import { DEFAULT_PREFERENCES, loadPreferences } from "@/lib/workspace";
import { getConversation, saveMessage, startFreshConversation } from "@/lib/chat.functions";

type Attachment = { filename: string; mediaType: string; url: string };

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function readFile(file: File) {
  return new Promise<Attachment>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        filename: file.name,
        mediaType: file.type || "application/octet-stream",
        url: String(reader.result),
      });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function NuruChat({
  department,
  placeholder = "What do you want to accomplish?",
  suggestions = [],
  initialPrompt,
  language,
  projectContext,
  className,
  accept = "image/*,application/pdf,.txt,.md,.csv",
  heading,
}: {
  department: DepartmentId;
  placeholder?: string;
  suggestions?: string[];
  initialPrompt?: string;
  language?: string;
  projectContext?: string;
  className?: string;
  accept?: string;
  heading?: string;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop, regenerate, setMessages } = useChat({
    transport,
  });

  const [input, setInput] = useState(initialPrompt ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [webAccess, setWebAccess] = useState(true);
  const [voicePrefs, setVoicePrefs] = useState(DEFAULT_PREFERENCES);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speech = useSpeechRecognition();

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    setVoicePrefs(loadPreferences());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    if (speech.transcript) setInput((prev) => (prev ? `${prev} ${speech.transcript}` : speech.transcript));
  }, [speech.transcript]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    const picked = Array.from(list).slice(0, 4);
    const tooBig = picked.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      toast.error(`${tooBig.name} is larger than 8MB.`);
      return;
    }
    try {
      const next = await Promise.all(picked.map(readFile));
      setAttachments((prev) => [...prev, ...next].slice(0, 4));
    } catch (e) {
      toast.error((e as Error).message);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value && attachments.length === 0) return;
    if (busy) return;

    sendMessage(
      {
        role: "user",
        parts: [
          ...(value ? [{ type: "text" as const, text: value }] : []),
          ...attachments.map((a) => ({
            type: "file" as const,
            mediaType: a.mediaType,
            filename: a.filename,
            url: a.url,
          })),
        ],
      },
      {
        body: {
          department,
          webAccess,
          ...(language ? { language } : {}),
          ...(projectContext ? { projectContext } : {}),
        },
      },
    );

    setInput("");
    setAttachments([]);
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex-1 space-y-7 overflow-y-auto pb-6">
        {messages.length === 0 && (
          <div className="animate-fade-up py-6">
            <NuruLogo className="size-11" />
            {heading && (
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2>
            )}
            {suggestions.length > 0 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-xl border border-border bg-card/60 px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, idx) => (
          <MessageBubble
            key={m.id}
            message={m}
            language={language}
            voiceURI={voicePrefs.voiceURI}
            voiceRate={voicePrefs.voiceRate}
            streaming={busy && idx === messages.length - 1 && m.role === "assistant"}
            onRegenerate={() => regenerate()}
            onWebSearch={(q) => {
              setWebAccess(true);
              submit(`Search the live web and cite sources: ${q}`);
            }}
            onBranch={(text) => {
              setInput(text);
              textareaRef.current?.focus();
              toast.success("Branched — edit the prompt and send.");
            }}
          />
        ))}

        {status === "submitted" && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="animate-pulse">Nuru is thinking…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="font-medium">Nuru could not complete that request.</p>
            <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => regenerate()}>
              <RefreshCw className="mr-1.5 size-3.5" /> Try again
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 space-y-2 bg-gradient-to-t from-background via-background to-transparent pb-3 pt-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <span
                key={`${a.filename}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
              >
                {a.mediaType.startsWith("image/") && (
                  <img src={a.url} alt="" className="size-6 rounded object-cover" />
                )}
                <span className="max-w-[10rem] truncate">{a.filename}</span>
                <button
                  type="button"
                  aria-label={`Remove ${a.filename}`}
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="rounded-[1.75rem] border border-border bg-card/90 p-2 shadow-xl backdrop-blur transition-colors focus-within:border-primary/50">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={placeholder}
            aria-label={placeholder}
            className="max-h-52 w-full resize-none bg-transparent px-3.5 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    aria-label="Attachments and tools"
                  >
                    <Paperclip className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
                    <Paperclip className="mr-2 size-4" /> Attach files or photos
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setWebAccess((v) => !v)}>
                    <Globe className="mr-2 size-4" /> {webAccess ? "Turn off web sources" : "Turn on web sources"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setMessages([]);
                      stopSpeaking();
                    }}
                  >
                    <Sparkles className="mr-2 size-4" /> Start a new chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn("rounded-full", webAccess ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                aria-label={webAccess ? "Turn off web sources" : "Turn on web sources"}
                aria-pressed={webAccess}
                title={
                  webAccess
                    ? "Web sources on — Nuru checks the live web and cites links"
                    : "Web sources off — Nuru answers from general knowledge"
                }
                onClick={() => setWebAccess((v) => !v)}
              >
                <Globe className="size-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn("rounded-full", speech.listening && "bg-primary/10 text-primary")}
                aria-label={speech.listening ? "Stop voice input" : "Start voice input"}
                disabled={!speech.supported}
                title={speech.supported ? "Voice input" : "Voice input is not supported in this browser"}
                onClick={() => (speech.listening ? speech.stop() : speech.start(language))}
              >
                {speech.listening ? <MicOff className="size-4 animate-pulse" /> : <Mic className="size-4" />}
              </Button>
            </div>
            {busy ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="rounded-full"
                aria-label="Stop generating"
                onClick={() => stop()}
              >
                <Square className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                className="rounded-full"
                aria-label="Send message"
                disabled={!input.trim() && attachments.length === 0}
                onClick={() => submit()}
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="px-1 text-center text-[11px] text-muted-foreground">
          Nuru can make mistakes. Verify local prices, laws and health guidance.
        </p>
      </div>
    </div>
  );
}

type WebSource = {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  publishedDate: string | null;
};

function SourcesPanel({ query, sources, done, errorText }: {
  query: string;
  sources: WebSource[];
  done: boolean;
  errorText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Globe className={cn("size-3.5 text-primary", !done && "animate-pulse")} />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          {done ? `${sources.length} source${sources.length === 1 ? "" : "s"} checked` : "Searching the web…"}
          {query ? ` · “${query}”` : ""}
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border px-3 py-2.5">
          {done && errorText && <p className="text-xs text-muted-foreground">{errorText}</p>}
          {done && !errorText && sources.length === 0 && (
            <p className="text-xs text-muted-foreground">No usable public sources were found for this search.</p>
          )}
          {sources.length > 0 && (
            <ol className="space-y-2.5">
              {sources.map((s, idx) => (
                <li key={s.url} className="flex gap-2 text-xs">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <span className="min-w-0">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-primary hover:underline"
                    >
                      {s.title}
                    </a>
                    <span className="ml-1.5 text-muted-foreground">
                      {s.domain}
                      {s.publishedDate ? ` · ${s.publishedDate}` : ""}
                    </span>
                    {s.snippet && <p className="mt-0.5 line-clamp-2 text-muted-foreground">{s.snippet}</p>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  language,
  voiceURI,
  voiceRate,
  streaming,
  onRegenerate,
  onWebSearch,
  onBranch,
}: {
  message: UIMessage;
  language?: string | undefined;
  voiceURI: string;
  voiceRate: number;
  streaming: boolean;
  onRegenerate: () => void;
  onWebSearch: (query: string) => void;
  onBranch: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [reading, setReading] = useState(false);

  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("\n");

  useEffect(() => () => stopSpeaking(), []);

  function copy() {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  function share() {
    const nav = navigator as Navigator & { share?: (data: { text: string; title?: string }) => Promise<void> };
    if (nav.share) {
      void nav.share({ title: "Nuru AI", text }).catch(() => undefined);
      return;
    }
    void navigator.clipboard.writeText(text);
    toast.success("Answer copied — ready to share");
  }

  function readAloud() {
    if (reading) {
      stopSpeaking();
      setReading(false);
      return;
    }
    const ok = speak(text, language, {
      voiceURI,
      rate: voiceRate,
      onEnd: () => setReading(false),
    });
    if (!ok) {
      toast.error("Reading aloud is not supported in this browser.");
      return;
    }
    setReading(true);
  }

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <NuruLogo className="mt-0.5 hidden size-7 shrink-0 sm:inline-flex" />}

      <div className={cn("flex min-w-0 flex-col gap-2", isUser ? "max-w-[85%] items-end" : "w-full items-start")}>
        {message.parts.map((part, i) => {
          if (part.type === "file") {
            const filePart = part as { url: string; filename?: string; mediaType: string };
            return filePart.mediaType.startsWith("image/") ? (
              <img
                key={i}
                src={filePart.url}
                alt={filePart.filename ?? "Uploaded image"}
                className="max-h-56 rounded-xl border border-border object-cover"
              />
            ) : (
              <span key={i} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                {filePart.filename ?? "Attachment"}
              </span>
            );
          }
          if (part.type === "tool-activate_agents") {
            const input = (part as { input?: { agents?: string[]; plan?: string } }).input;
            if (!input?.agents?.length) return null;
            return (
              <div key={i} className="w-full rounded-xl border border-primary/25 bg-primary/5 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="size-3.5" /> Agents activated
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {input.agents.map((a) => (
                    <span key={a} className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium">
                      {a}
                    </span>
                  ))}
                </div>
                {input.plan && <p className="mt-2 text-xs text-muted-foreground">{input.plan}</p>}
              </div>
            );
          }
          if (part.type === "tool-search_web") {
            const p = part as {
              state?: string;
              input?: { query?: string };
              output?: { query?: string; error?: string; sources?: WebSource[] };
            };
            return (
              <SourcesPanel
                key={i}
                query={p.output?.query ?? p.input?.query ?? ""}
                sources={p.output?.sources ?? []}
                done={p.state === "output-available"}
                {...(p.output?.error ? { errorText: p.output.error } : {})}
              />
            );
          }
          return null;
        })}

        {text && (
          <div
            className={cn(
              "max-w-full text-[15px] leading-relaxed",
              isUser
                ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground"
                : "prose prose-sm prose-invert max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary",
            )}
          >
            {isUser ? <p className="whitespace-pre-wrap">{text}</p> : <ReactMarkdown>{text}</ReactMarkdown>}
          </div>
        )}

        {!isUser && streaming && (
          <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-primary/70" aria-hidden="true" />
        )}

        {!isUser && text && !streaming && (
          <div className="flex flex-wrap items-center gap-0.5 text-muted-foreground">
            <ActionButton label={reading ? "Stop reading" : "Read aloud"} onClick={readAloud} active={reading}>
              {reading ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </ActionButton>
            <ActionButton
              label="Good response"
              active={vote === "up"}
              onClick={() => {
                setVote("up");
                toast.success("Thanks — noted.");
              }}
            >
              <ThumbsUp className="size-3.5" />
            </ActionButton>
            <ActionButton
              label="Bad response"
              active={vote === "down"}
              onClick={() => {
                setVote("down");
                toast.success("Thanks — Nuru will try differently.");
              }}
            >
              <ThumbsDown className="size-3.5" />
            </ActionButton>
            <ActionButton label="Copy" onClick={copy}>
              <Copy className="size-3.5" />
            </ActionButton>
            <ActionButton label="Share" onClick={share}>
              <Share2 className="size-3.5" />
            </ActionButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="size-7 rounded-full" aria-label="More actions">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onSelect={onRegenerate}>
                  <RefreshCw className="mr-2 size-4" /> Regenerate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onWebSearch(text.slice(0, 200))}>
                  <Globe className="mr-2 size-4" /> Web search
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onBranch(text.slice(0, 500))}>
                  <GitBranch className="mr-2 size-4" /> Branch from here
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={copy}>
                  <Copy className="mr-2 size-4" /> Copy
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={share}>
                  <Share2 className="mr-2 size-4" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={readAloud}>
                  <Volume2 className="mr-2 size-4" /> {reading ? "Stop reading" : "Read aloud"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => toast.success("Reported. Thank you for flagging this answer.")}
                >
                  <Flag className="mr-2 size-4" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn("size-7 rounded-full", active && "bg-primary/10 text-primary")}
    >
      {children}
    </Button>
  );
}
