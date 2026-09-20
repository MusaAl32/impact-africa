# Nuru AI — Live Voice Assistant (Gemini Live)

Add a real-time, two-way voice conversation mode to Nuru AI: you speak, Nuru answers out loud immediately, you can cut in mid-sentence, and the whole exchange appears as text and is saved to your chat history.

## One thing is needed from you

Live voice runs on Google's Gemini Live service, which is separate from the AI that already powers Nuru's text chat. It needs its own Google AI Studio key (free tier available at aistudio.google.com → "Get API key"). I will request it through the secure key form once you approve this plan — it stays server-side and is never visible in the browser, the interface, or the saved data.

Without that key the Live voice mode cannot work; everything else in Nuru stays exactly as it is.

## What gets built

**Live voice button** in the existing chat composer (the "Start a voice chat" quick action also opens it). No redesign of the dashboard, chat, settings, agents, or history.

**Live session panel** that appears over the chat:
- Microphone permission request with a friendly message if it is denied
- "Nuru is listening" / "Nuru is speaking" states with an animated voice indicator
- Your words appearing as live text, and Nuru's reply appearing as text too
- Mute/unmute and End conversation buttons
- Cutting in while Nuru talks instantly stops its voice and hands the floor back to you

**Language**: the session follows Nuru's current language setting (English, Chichewa, Kiswahili, Somali, Français, and the rest of the list), with natural multilingual switching mid-conversation.

**Saved to history**: when the conversation ends, the spoken exchange is saved as a normal Nuru conversation (titled "Live voice conversation"), with your lines and Nuru's replies in order, tied to your account and protected by the same privacy rules as text chat. No audio is stored — text only.

**Friendly errors** for: microphone blocked, sign-in expired, connection lost, service busy or over quota, and session timeout — each with a plain-language message and a retry where it makes sense.

## Technical notes

- Server route `src/routes/api/live-token.ts` mints short-lived Gemini Live auth tokens with `@google/genai` (`authTokens.create`, ~30 min expiry, single-session). Requires an authenticated Supabase session; the permanent `GEMINI_API_KEY` never leaves the server.
- New `src/hooks/use-gemini-live.ts`: fetches the ephemeral token, opens the Live WebSocket via `ai.live.connect`, captures mic audio through an AudioWorklet, resamples to 16 kHz mono PCM16, streams continuously in small chunks, and plays 24 kHz PCM output through a scheduled `AudioContext` queue. Barge-in clears the queued output on the `interrupted` server event. `inputAudioTranscription` / `outputAudioTranscription` enabled; `contextWindowCompression` (sliding window) and session resumption enabled; one session at a time guarded by a ref.
- New `src/components/nuru-live-voice.tsx` renders the session panel using existing UI primitives and design tokens.
- Model id resolved against the live model listing at implementation time; the requested `gemini-3.8-live` is used if the API serves it, otherwise the current stable native-audio Live model, and I will tell you which one is active.
- Persistence reuses the existing `conversations` / `messages` tables and owner-scoped server functions in `src/lib/chat.functions.ts` (a new `saveLiveTranscript` function) — the app's tables are named `conversations`/`messages`, not `chat_sessions`/`chat_messages`.
- Full cleanup on end/unmount: mic tracks stopped, worklet and audio contexts closed, socket closed.

## Verification

Browser-driven tests for: sign-in gate, mic permission prompt, session start, transcription appearing, audio playback, barge-in stopping playback, mute, end-and-save, and error states. A scan of the built browser bundle to prove no Gemini key is present. Typecheck and build must stay clean, and existing chat, departments, history and auth flows re-tested for regressions.
