import { useCallback, useEffect, useRef, useState } from "react";

import { createLiveToken } from "@/lib/live.functions";

export type LiveStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

export type LiveTurn = { id: string; role: "user" | "assistant"; text: string };

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const CHUNK = 2048;

const WORKLET = `
class NuruCapture extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (input) this.port.postMessage(new Float32Array(input));
    return true;
  }
}
registerProcessor('nuru-capture', NuruCapture);
`;

function floatToPcm16Base64(samples: Float32Array) {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i] as number);
  return btoa(binary);
}

function base64ToFloat32(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  const out = new Float32Array(bytes.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = view.getInt16(i * 2, true) / 0x8000;
  return out;
}

function friendlyError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const text = raw.toLowerCase();
  if (text.includes("permission") || text.includes("notallowed"))
    return "Nuru needs microphone access for live voice. Please allow it in your browser and try again.";
  if (text.includes("notfound") || text.includes("device"))
    return "Nuru could not find a microphone on this device.";
  if (text.includes("quota") || text.includes("429") || text.includes("resource_exhausted"))
    return "Live voice is busy right now. Please try again in a few minutes.";
  if (text.includes("401") || text.includes("403") || text.includes("unauthenticated") || text.includes("permission_denied"))
    return "Your session expired. Please sign in again to use live voice.";
  if (text.includes("network") || text.includes("websocket") || text.includes("closed") || text.includes("failed to fetch"))
    return "The live connection dropped. Check your internet and start again.";
  return "Something went wrong with live voice. Please try again.";
}

type LiveSessionHandle = {
  sendRealtimeInput: (input: { audio: { data: string; mimeType: string } }) => void;
  close: () => void;
};

/** Real-time two-way voice conversation with Nuru AI over the Gemini Live API. */
export function useGeminiLive(options: { systemInstruction: string; languageHint?: string | undefined }) {
  const { systemInstruction, languageHint } = options;
  const [status, setStatusState] = useState<LiveStatus>("idle");
  const mountedRef = useRef(true);
  const setStatus: typeof setStatusState = (value) => {
    if (mountedRef.current) setStatusState(value);
  };
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [turns, setTurns] = useState<LiveTurn[]>([]);

  const sessionRef = useRef<LiveSessionHandle | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const playheadRef = useRef(0);
  const mutedRef = useRef(false);
  const startingRef = useRef(false);
  const generationRef = useRef(0);
  const userBufferRef = useRef("");
  const modelBufferRef = useRef("");

  const optionsRef = useRef({ systemInstruction, languageHint });
  optionsRef.current = { systemInstruction, languageHint };

  const stopPlayback = useCallback(() => {
    for (const source of sourcesRef.current) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    sourcesRef.current.clear();
    playheadRef.current = 0;
  }, []);

  const cleanup = useCallback(() => {
    stopPlayback();
    try {
      sessionRef.current?.close();
    } catch {
      /* already closed */
    }
    sessionRef.current = null;
    workletRef.current?.port.close();
    workletRef.current?.disconnect();
    workletRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void inputCtxRef.current?.close().catch(() => undefined);
    inputCtxRef.current = null;
    void outputCtxRef.current?.close().catch(() => undefined);
    outputCtxRef.current = null;
  }, [stopPlayback]);

  const playChunk = useCallback((base64: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;
    const samples = base64ToFloat32(base64);
    if (samples.length === 0) return;
    const buffer = ctx.createBuffer(1, samples.length, OUTPUT_RATE);
    buffer.copyToChannel(samples, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime, playheadRef.current);
    source.start(startAt);
    playheadRef.current = startAt + buffer.duration;
    sourcesRef.current.add(source);
    source.onended = () => {
      sourcesRef.current.delete(source);
      if (sourcesRef.current.size === 0) setStatus((current) => (current === "speaking" ? "listening" : current));
    };
    setStatus((current) => (current === "error" ? current : "speaking"));
  }, []);

  const appendTurn = useCallback((role: "user" | "assistant", text: string) => {
    if (!text.trim()) return;
    setTurns((current) => {
      const last = current[current.length - 1];
      if (last && last.role === role) {
        return [...current.slice(0, -1), { ...last, text: `${last.text}${text}` }];
      }
      return [...current, { id: `${role}-${Date.now()}-${current.length}`, role, text }];
    });
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;
    cleanup();
    startingRef.current = false;
    setStatus("idle");
  }, [cleanup]);

  const start = useCallback(async () => {
    if (startingRef.current || sessionRef.current) return;
    startingRef.current = true;
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setError(null);
    setTurns([]);
    setStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (generationRef.current !== generation) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const { GoogleGenAI, Modality } = await import("@google/genai");
      const { token, model } = await createLiveToken();
      if (generationRef.current !== generation) return;

      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } });
      const languageLine = optionsRef.current.languageHint
        ? ` The user's selected interface language is ${optionsRef.current.languageHint}; reply in that language unless they speak another one.`
        : "";

      const session = (await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `${optionsRef.current.systemInstruction}${languageLine}`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          contextWindowCompression: { slidingWindow: {} },
          sessionResumption: {},
        },
        callbacks: {
          onopen: () => {
            if (generationRef.current === generation) setStatus("listening");
          },
          onmessage: (message: unknown) => {
            if (generationRef.current !== generation) return;
            const payload = message as {
              serverContent?: {
                interrupted?: boolean;
                inputTranscription?: { text?: string };
                outputTranscription?: { text?: string };
                modelTurn?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] };
                turnComplete?: boolean;
              };
            };
            const content = payload.serverContent;
            if (!content) return;

            if (content.interrupted) {
              stopPlayback();
              if (modelBufferRef.current.trim()) {
                appendTurn("assistant", "");
                modelBufferRef.current = "";
              }
              setStatus("listening");
            }
            const inputText = content.inputTranscription?.text;
            if (inputText) {
              userBufferRef.current += inputText;
              appendTurn("user", inputText);
            }
            const outputText = content.outputTranscription?.text;
            if (outputText) {
              modelBufferRef.current += outputText;
              appendTurn("assistant", outputText);
            }
            for (const part of content.modelTurn?.parts ?? []) {
              const data = part.inlineData?.data;
              if (data && (part.inlineData?.mimeType ?? "").startsWith("audio/")) playChunk(data);
            }
            if (content.turnComplete) {
              userBufferRef.current = "";
              modelBufferRef.current = "";
            }
          },
          onerror: (event: unknown) => {
            if (generationRef.current !== generation) return;
            setError(friendlyError((event as { message?: string })?.message ?? "websocket"));
            setStatus("error");
            cleanup();
          },
          onclose: () => {
            if (generationRef.current !== generation) return;
            sessionRef.current = null;
            setStatus((current) => (current === "error" ? current : "idle"));
          },
        },
      })) as unknown as LiveSessionHandle;

      if (generationRef.current !== generation) {
        session.close();
        return;
      }

      sessionRef.current = session;

      const inputCtx = new AudioContext({ sampleRate: INPUT_RATE });
      inputCtxRef.current = inputCtx;
      const blobUrl = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
      await inputCtx.audioWorklet.addModule(blobUrl);
      URL.revokeObjectURL(blobUrl);

      const source = inputCtx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(inputCtx, "nuru-capture");
      workletRef.current = worklet;
      let pending: number[] = [];
      worklet.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (mutedRef.current || !sessionRef.current) return;
        pending.push(...Array.from(event.data));
        while (pending.length >= CHUNK) {
          const frame = Float32Array.from(pending.slice(0, CHUNK));
          pending = pending.slice(CHUNK);
          try {
            sessionRef.current.sendRealtimeInput({
              audio: { data: floatToPcm16Base64(frame), mimeType: `audio/pcm;rate=${INPUT_RATE}` },
            });
          } catch {
            /* session closing */
          }
        }
      };
      source.connect(worklet);
      // Keep the worklet pulling without echoing the mic to the speakers.
      const silence = inputCtx.createGain();
      silence.gain.value = 0;
      worklet.connect(silence).connect(inputCtx.destination);

      const outputCtx = new AudioContext({ sampleRate: OUTPUT_RATE });
      outputCtxRef.current = outputCtx;
      await outputCtx.resume().catch(() => undefined);

      setStatus("listening");
    } catch (caught) {
      cleanup();
      setError(friendlyError(caught));
      setStatus("error");
    } finally {
      startingRef.current = false;
    }
  }, [appendTurn, cleanup, playChunk, stopPlayback]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      mutedRef.current = !current;
      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = current;
      });
      return !current;
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return { status, error, muted, turns, start, stop, toggleMute, active: status !== "idle" && status !== "error" };
}
