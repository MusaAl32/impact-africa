import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, PhoneOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGeminiLive } from "@/hooks/use-gemini-live";
import { saveLiveTranscript } from "@/lib/chat.functions";
import { AFRICAN_LANGUAGES } from "@/lib/languages";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SYSTEM_INSTRUCTION =
  "You are Nuru AI, a helpful, intelligent and respectful AI assistant built to serve users in Africa and connect them with the wider world. Have natural conversational dialogue. Keep responses clear and useful. Respond in the user's selected system language when possible. If the user speaks English, respond in English. If the user speaks Chichewa, respond in Chichewa. Support multilingual conversation naturally. Do not interrupt the user. If the user interrupts you, immediately stop speaking and listen.";

export function NuruLiveVoice({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (() => void) | undefined;
}) {
  const { locale } = useI18n();
  const languageHint = useMemo(() => {
    if (locale === "en") return "English";
    const match = AFRICAN_LANGUAGES.find((language) => language.code === locale);
    return match ? `${match.name} (${match.nativeName})` : undefined;
  }, [locale]);

  const { status, error, muted, turns, start, stop, toggleMute } = useGeminiLive({
    systemInstruction: SYSTEM_INSTRUCTION,
    languageHint,
  });
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      void start();
    }
    if (!open && startedRef.current) {
      startedRef.current = false;
      stop();
    }
  }, [open, start, stop]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const endConversation = async () => {
    const transcript = turns
      .map((turn) => ({ role: turn.role, text: turn.text.trim() }))
      .filter((turn) => turn.text.length > 0);
    stop();
    startedRef.current = false;
    if (transcript.length > 0) {
      setSaving(true);
      try {
        await saveLiveTranscript({ data: { turns: transcript } });
        toast.success("Voice conversation saved to your history.");
        onSaved?.();
      } catch {
        toast.error("Nuru could not save this voice conversation.");
      } finally {
        setSaving(false);
      }
    }
    onOpenChange(false);
  };

  const label =
    status === "connecting"
      ? "Connecting to Nuru…"
      : status === "speaking"
        ? "Nuru AI is speaking"
        : status === "listening"
          ? muted
            ? "Microphone muted"
            : "Nuru AI is listening"
          : status === "error"
            ? "Live voice stopped"
            : "Ready";

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : void endConversation())}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Nuru Live Voice
          </DialogTitle>
          <DialogDescription>Speak naturally — you can cut in at any time.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "relative flex size-24 items-center justify-center rounded-full border border-border bg-secondary transition",
              status === "speaking" && "border-primary/60",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 rounded-full",
                status === "listening" && !muted && "animate-ping bg-primary/15",
                status === "speaking" && "animate-pulse bg-primary/25",
              )}
              aria-hidden
            />
            {status === "connecting" ? (
              <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
            ) : muted ? (
              <MicOff className="size-8 text-muted-foreground" aria-hidden />
            ) : (
              <Mic className="relative size-8 text-primary" aria-hidden />
            )}
          </div>
          <p aria-live="polite" className="text-sm font-medium text-foreground">
            {label}
          </p>
          {error ? <p className="px-4 text-center text-sm text-destructive">{error}</p> : null}
        </div>

        <div ref={scrollRef} className="min-h-24 flex-1 space-y-3 overflow-y-auto rounded-xl bg-muted/40 p-3">
          {turns.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Your words and Nuru&apos;s replies will appear here as you talk.
            </p>
          ) : (
            turns.map((turn) => (
              <div key={turn.id} className={cn("text-sm", turn.role === "user" ? "text-foreground" : "text-muted-foreground")}>
                <span className="font-medium">{turn.role === "user" ? "You" : "Nuru"}: </span>
                {turn.text}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {status === "error" ? (
            <Button className="min-h-11 rounded-full" onClick={() => void start()}>
              Try again
            </Button>
          ) : (
            <Button variant="outline" className="min-h-11 rounded-full" onClick={toggleMute}>
              {muted ? <Mic className="size-4" aria-hidden /> : <MicOff className="size-4" aria-hidden />}
              {muted ? "Unmute" : "Mute"}
            </Button>
          )}
          <Button variant="destructive" className="min-h-11 rounded-full" disabled={saving} onClick={() => void endConversation()}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <PhoneOff className="size-4" aria-hidden />}
            End conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
