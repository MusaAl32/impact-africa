import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowUp,
  Copy,
  Globe,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  RefreshCw,
  Square,
  Sparkles,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DepartmentId } from "@/lib/departments";
import { useSpeechRecognition } from "@/hooks/use-speech";

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
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const speech = useSpeechRecognition();


  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    if (speech.transcript) setInput((prev) => (prev ? `${prev} ${speech.transcript}` : speech.transcript));
  }, [speech.transcript]);

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
      <div className="flex-1 space-y-6 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="animate-fade-up">
            {heading && (
              <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2>
            )}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border border-border bg-card px-3.5 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Nuru is thinking…
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

      <div className="sticky bottom-0 space-y-2 bg-background pt-2">
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

        <div className="rounded-2xl border border-border bg-card p-2 shadow-lg focus-within:border-primary/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder={placeholder}
            aria-label={placeholder}
            className="max-h-48 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Attach files or images"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={speech.listening ? "Stop voice input" : "Start voice input"}
                disabled={!speech.supported}
                title={speech.supported ? "Voice input" : "Voice input is not supported in this browser"}
                onClick={() => (speech.listening ? speech.stop() : speech.start(language))}
                className={cn(speech.listening && "text-primary")}
              >
                {speech.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              {messages.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => setMessages([])}
                >
                  New chat
                </Button>
              )}
            </div>
            {busy ? (
              <Button type="button" size="icon" variant="secondary" aria-label="Stop generating" onClick={() => stop()}>
                <Square className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                aria-label="Send message"
                disabled={!input.trim() && attachments.length === 0}
                onClick={() => submit()}
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="px-1 text-[11px] text-muted-foreground">
          Nuru can make mistakes. Verify local prices, laws and health guidance.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("\n");

  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
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
        return null;
      })}

      {text && (
        <div
          className={cn(
            "max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "prose prose-sm prose-invert max-w-none border border-border bg-card text-card-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary",
          )}
        >
          {isUser ? <p className="whitespace-pre-wrap">{text}</p> : <ReactMarkdown>{text}</ReactMarkdown>}
        </div>
      )}

      {!isUser && text && (
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => {
            void navigator.clipboard.writeText(text);
            toast.success("Copied");
          }}
        >
          <Copy className="size-3" /> Copy
        </button>
      )}
    </div>
  );
}
