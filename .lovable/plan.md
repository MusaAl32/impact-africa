# Nuru AI: accounts, saved chat history, and a multilingual interface

Three additions to the existing app. Nothing is rebuilt: the current chat, agents, web search with sources, voice, workspace, Opportunity Hub and agent integrations all stay exactly as they are.

## 1. Accounts (sign-in required for chat)

- A new sign-in page with email + password and "Continue with Google".
- Email confirmation on sign-up, plus a forgot-password flow and a page to set a new password.
- The whole Nuru workspace (dashboard, departments, languages, hub, opportunities, workspace, settings) moves behind sign-in. Anyone not signed in is sent to the sign-in page.
- The public homepage, privacy and terms pages stay open to everyone, with a sign-in button that turns into an account menu (name, settings, sign out) once signed in.
- Each person gets a small profile record holding their display name, country, preferred language and voice settings, so their setup follows them to any device instead of living only in one browser.

## 2. One saved conversation per person

- Each signed-in person has a single ongoing conversation with Nuru, stored securely in the backend and readable only by them.
- Messages are saved as they are sent and as Nuru finishes answering, including which agent answered and the web sources cited, so reopening the app restores the conversation exactly.
- A "Start fresh" action clears the visible conversation and begins a new one; earlier messages are archived, not silently destroyed.
- Everything else in the chat stays: streaming answers, Read Aloud, Like/Dislike, Copy, Share, the ⋯ menu, attachments, the web toggle and the microphone.

## 3. Interface in all 40+ languages

- A language switcher in Settings and in the top bar changes the app's own labels, buttons and menus, not just Nuru's replies.
- English is the source. French, Swahili, Arabic, Portuguese and Amharic get hand-checked wording; the remaining languages are filled in automatically using the translation service already in the app, cached in the backend so each phrase is translated once.
- Arabic switches the layout to right-to-left.
- Any phrase not yet translated falls back to English rather than showing a blank, and machine-translated languages are marked as such so nobody mistakes them for reviewed copy.

## 4. Stability and polish

- The dashboard is tightened up: clearer greeting with the person's name, recent conversation preview, agent shortcuts and quick actions, all comfortable on a phone.
- Existing features are re-checked after the change: agents, web search citations, voice, Opportunity Hub, agent integrations and the public pages.

## Technical notes

- Enable email auth and configure the Google provider in the same change; Google sign-in goes through the Lovable broker with `redirect_uri = window.location.origin`.
- Routes move under a `_authenticated` gate; `src/routes/index.tsx`, `privacy`, `terms`, `/auth`, `/auth/callback`, `/reset-password`, `/api/public/*` and `/mcp` stay public and unauthenticated.
- New tables, all with RLS scoped to `auth.uid()` and explicit grants: `profiles` (trigger-created on sign-up), `conversations` (one active per user), `messages` (role, parts JSON, department, sources, created_at), and `ui_translations` (locale + key + text, public read, service-role write).
- Chat persistence uses `createServerFn` with `requireSupabaseAuth`; the assistant message is written in `toUIMessageStreamResponse`'s `onFinish`. `/api/chat` verifies the bearer token itself rather than trusting the client.
- Message history loads through an authenticated server function called from the chat component, not from a public route loader.
- i18n is a lightweight key/dictionary provider (no new heavy dependency) hydrated from `ui_translations`; missing keys fall back to English. Machine fill-in reuses `src/lib/translate.functions.ts`.
- The public MCP server keeps reading only approved public records; conversations, profiles and translations tables are never exposed through it.
