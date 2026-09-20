# Minimal mobile chat workspace

## Goal
Refine only the main Nuru chat workspace into a clean, mobile-first interface while preserving saved conversations, departments, web search, attachments, voice, authentication, and all existing message actions.

## Changes
- Rework the mobile app bar so the drawer control is on the left and a new-chat control is on the right, with no subscription or upgrade UI.
- Replace the empty-chat prompt grid with three compact actions: Start a voice chat, Create an image or sticker, and Write or edit.
- Restyle the existing AI Elements composer as a fixed rounded input bar with attachment/tools, “Ask Ascender AI,” microphone, and a circular primary audio/send control.
- Keep populated conversations, streaming, sources, response actions, errors, and desktop history navigation working as they do now.
- Preserve the existing design tokens and adapt the chat surface to a clean light canvas without changing unrelated public pages.

## Validation
- Verify `/app` and a populated conversation on mobile and desktop.
- Confirm drawer, new chat, quick actions, attachment menu, typing, voice input, send/stop, scrolling, and saved history still work.
- Confirm no horizontal overflow, all mobile controls meet touch-target sizing, and no upgrade button appears.
- Confirm the current build and runtime diagnostics remain clean.