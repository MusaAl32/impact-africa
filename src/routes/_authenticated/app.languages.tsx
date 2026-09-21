import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Copy, Loader2, Mic, MicOff, Volume2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { NuruChat } from "@/components/nuru-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { speak, useSpeechRecognition } from "@/hooks/use-speech";
import {
  AFRICAN_LANGUAGES,
  CAPABILITY_LABEL,
  LANGUAGE_REGIONS,
  STATUS_COPY,
  findLanguage,
} from "@/lib/languages";
import { detectLanguage, translateText } from "@/lib/translate.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/languages")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "African Languages — Nuru AI translation and detection" },
      {
        name: "description",
        content: `Translate, detect and converse across ${AFRICAN_LANGUAGES.length}+ African languages with Nuru AI — Kiswahili, Hausa, Amharic, isiZulu, Chichewa, Yoruba and more.`,
      },
      { property: "og:title", content: "African Languages — Nuru AI" },
      {
        property: "og:description",
        content: "Translation, detection and conversation across 40+ African languages.",
      },
    ],
  }),
  component: LanguagesPage,
});

function LanguagesPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">African Languages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {AFRICAN_LANGUAGES.length}+ languages across {LANGUAGE_REGIONS.length} regions —
          translation, detection, voice and full conversation.
        </p>
      </header>

      <Tabs defaultValue="translate" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="self-start">
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="chat">Language chat</TabsTrigger>
          <TabsTrigger value="registry">Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="mt-6">
          <Translator />
        </TabsContent>

        <TabsContent value="chat" className="mt-6 flex min-h-0 flex-1 flex-col">
          <NuruChat
            department="languages"
            placeholder="Ask about grammar, idioms or write in any African language…"
            suggestions={[
              "Write a market advert in Kiswahili for dried fish",
              "Explain Chichewa greetings for a first business meeting",
              "Rewrite this clinic notice in simple Hausa",
            ]}
          />
        </TabsContent>

        <TabsContent value="registry" className="mt-6">
          <LanguageRegistry />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Translator() {
  const translate = useServerFn(translateText);
  const detect = useServerFn(detectLanguage);
  const speech = useSpeechRecognition();

  const [source, setSource] = useState("auto");
  const [target, setTarget] = useState("sw");
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);

  const targetLocale = findLanguage(target)?.locale;
  const sourceLocale = source === "auto" ? undefined : findLanguage(source)?.locale;

  useEffect(() => {
    if (speech.transcript) setText((prev) => (prev ? `${prev} ${speech.transcript}` : speech.transcript));
  }, [speech.transcript]);

  async function run() {
    if (!text.trim()) return;
    setBusy(true);
    setOutput("");
    try {
      const result = await translate({ data: { text: text.trim(), source, target } });
      if (result.error) toast.error(result.error);
      else setOutput(result.text);
    } catch {
      toast.error("Translation failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function runDetect() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const result = await detect({ data: { text: text.trim() } });
      if (result.error) {
        toast.error(result.error);
      } else if (result.code) {
        setSource(result.code);
        setDetected(result.name);
        toast.success(`Detected ${result.name}`);
      } else {
        toast.message("Nuru could not confidently detect that language.");
      }
    } catch (error) {
      toast.error((error as Error).message || "Detection failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <LanguageSelect value={source} onChange={setSource} includeAuto label="Source language" />
        <Button
          size="icon"
          variant="ghost"
          aria-label="Swap languages"
          disabled={source === "auto"}
          onClick={() => {
            if (source === "auto") return;
            const next = source;
            setSource(target);
            setTarget(next);
            setText(output || text);
            setOutput("");
          }}
        >
          <ArrowLeftRight className="size-4" />
        </Button>
        <LanguageSelect value={target} onChange={setTarget} label="Target language" />
        {detected && <span className="text-xs text-muted-foreground">Detected: {detected}</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Type or paste text to translate…"
            aria-label="Text to translate"
            className="w-full resize-none bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label={speech.listening ? "Stop dictation" : "Dictate text"}
                disabled={!speech.supported}
                onClick={() => (speech.listening ? speech.stop() : speech.start(setText, sourceLocale))}
                className={cn(speech.listening && "text-primary")}
              >
                {speech.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={runDetect} disabled={busy || !text.trim()}>
                <Wand2 className="mr-1.5 size-3.5" /> Detect
              </Button>
            </div>
            <Button onClick={run} disabled={busy || !text.trim()}>
              {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              Translate
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          {output ? (
            <>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{output}</p>
              <div className="mt-3 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(output);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="mr-1.5 size-3.5" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (!speak(output, targetLocale)) toast.error("Speech is not supported here.");
                  }}
                >
                  <Volume2 className="mr-1.5 size-3.5" /> Listen
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your translation appears here. Nuru keeps names, numbers and tone intact.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LanguageSelect({
  value,
  onChange,
  includeAuto,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  includeAuto?: boolean;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[190px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {includeAuto && <SelectItem value="auto">Detect language</SelectItem>}
        {AFRICAN_LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.name} · {l.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LanguageRegistry() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AFRICAN_LANGUAGES.filter(
      (l) =>
        (region === "all" || l.region === region) &&
        (!q ||
          l.name.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.family.toLowerCase().includes(q)),
    );
  }, [query, region]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages…"
          aria-label="Search languages"
          className="max-w-xs"
        />
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {LANGUAGE_REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="self-center text-xs text-muted-foreground">
          {filtered.length} of {AFRICAN_LANGUAGES.length}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <div key={l.code} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{l.name}</h3>
                <p className="text-xs text-muted-foreground">{l.nativeName}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  l.status === "supported"
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
                title={STATUS_COPY[l.status]}
              >
                {l.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {l.region} · {l.family} · {l.speakers}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {l.capabilities.map((c) => (
                <span key={c} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">
                  {CAPABILITY_LABEL[c]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
