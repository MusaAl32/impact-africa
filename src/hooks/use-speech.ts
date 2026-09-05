import { useCallback, useEffect, useRef, useState } from "react";

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => Recognition) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Browser speech-to-text, used for voice input across Nuru surfaces. */
export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const ref = useRef<Recognition | null>(null);

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()));
    return () => ref.current?.stop();
  }, []);

  const start = useCallback((locale?: string) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = locale || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result?.[0]?.transcript ?? "";
      if (text) setTranscript(text.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    ref.current = recognition;
    setTranscript("");
    recognition.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, start, stop };
}

/** Browser text-to-speech for Nuru voice replies. */
export function speak(
  text: string,
  locale?: string,
  options?: { voiceURI?: string; rate?: number; onEnd?: () => void },
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (locale) utterance.lang = locale;
  if (options?.rate) utterance.rate = options.rate;
  if (options?.voiceURI) {
    const match = window.speechSynthesis.getVoices().find((v) => v.voiceURI === options.voiceURI);
    if (match) {
      utterance.voice = match;
      utterance.lang = match.lang;
    }
  }
  if (options?.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** The reading voices this browser/device actually offers. */
export function useSpeechVoices() {
  const [voices, setVoices] = useState<{ voiceURI: string; name: string; lang: string }[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const sync = () =>
      setVoices(
        window.speechSynthesis
          .getVoices()
          .map((v) => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang })),
      );
    sync();
    window.speechSynthesis.addEventListener("voiceschanged", sync);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", sync);
  }, []);

  return voices;
}
