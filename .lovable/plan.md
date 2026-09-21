# Nuru AI production chat refinement

## Goal
Polish the existing Nuru AI chat and voice experience without redesigning the wider app or changing its authentication, database ownership, AI providers, agents, language settings, or saved-history architecture.

## What already works and will be preserved
- Authenticated, user-owned conversation history with dedicated conversation URLs, automatic message saving, New chat, rename, and archive controls.
- AI Elements-based transcript, message rendering, composer, smooth word streaming, sources, tools, reasoning, copy/share/read-aloud, regenerate, and scroll-to-latest controls.
- Gemini Live voice with ephemeral server-issued credentials, 16 kHz microphone streaming, live transcription, 24 kHz playback, interruption handling, mute, cleanup, and saved text transcripts.
- Responsive mobile drawer and desktop sidebar, existing Nuru branding, department routing, attachments, web search, and language preferences.

## Focused improvements

### 1. Chat interaction reliability
- Make the send control switch to a true Stop button from the first “thinking” frame through streaming, rather than showing an uncancelable loading spinner.
- Preserve the partial assistant response when generation is stopped and visibly mark it as stopped; save that partial response once so it remains after reload.
- Add Edit and resend to user messages. Editing will replace the selected turn and regenerate from that point while keeping the same owned conversation.
- Keep regenerate, copy, sources, tools, auto-scroll, and optimistic user-message display intact; prevent duplicate sends and duplicate persistence.
- Restore keyboard focus to the composer after send, completion, stop, retry, and conversation changes.

### 2. Clear, safe errors
- Normalize chat failures into concise user-facing messages for offline/network failure, timeout, usage limits, authentication expiry, rate limits, and general service failure.
- Never surface raw API, database, stack, or provider details in the transcript.
- Use the authoritative gateway message when it safely includes a reset time; otherwise show a clear limit message without inventing an hour count.
- Ensure failed or stopped requests always clear the thinking state and leave the composer usable.

### 3. Voice and speaker controls
- Improve browser microphone input with explicit permission/service errors instead of silently stopping.
- Keep Gemini Live listening, processing, speaking, mute, interruption, and cleanup behavior; tighten race handling so a late connection cannot reopen after the panel closes.
- Add explicit Stop speaking and Replay controls for completed assistant text responses, with a clear active playback state. Use device-supported pause/resume only where the browser supports it reliably.
- Make Live Voice states and failures consistently visible and user-safe; keep transcript saving text-only and associated with the authenticated user.

### 4. Interface polish without redesign
- Refine message spacing, user/assistant separation, response action visibility, composer focus, and mobile action wrapping within the current light chat workspace and Nuru identity.
- Keep the existing mobile top bar, desktop history sidebar, empty-state quick actions, fixed composer, and all department behavior.
- Use restrained transitions only; respect reduced-motion preferences and preserve 44px touch targets.

### 5. Verification
- Verify desktop and mobile layouts, no horizontal overflow, empty and populated conversations, sidebar history, rename/archive/new chat, edit/resend, regenerate, copy, stop-before-first-token, stop-mid-stream, reload persistence, and composer focus.
- Verify microphone denial, Live Voice start/end/mute/interruption/transcription/save behavior, text read-aloud stop/replay, and friendly offline/service errors.
- Confirm no private key reaches browser files and all conversation operations remain scoped to the authenticated user.
- Run the project typecheck/build and review live browser, console, runtime, and network signals before completion.
