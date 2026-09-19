# Nuru AI polish and conversation-history upgrade

## Goal
Make the existing Nuru experience feel cohesive, fast, trustworthy, and mobile-ready without changing its identity, departments, language coverage, Business Hub content, or protected account model.

## What will change

### 1. Professional chat foundation
- Install and compose the official AI chat interface building blocks for the transcript, messages, markdown responses, tool activity, loading shimmer, and composer.
- Preserve Nuru’s real server streaming and render partial answers smoothly as they arrive, with a visible “Nuru is thinking…” state before the first words.
- Keep attachments, voice input, read-aloud, live web search, sources, feedback, regenerate, branch, and report actions working.
- Add explicit Copy and WhatsApp actions below every completed Nuru answer; retain the broader share option in the overflow menu.
- Keep the composer pinned to the bottom, auto-growing, keyboard-safe on mobile, and show the exact disclaimer: “Nuru can make mistakes. Verify important information locally.”
- Replace raw failure text with friendly messages for connection failures, timeouts, rate limits, credit/configuration problems, and blocked requests, with safe retry behavior.

### 2. Real persistent conversation history
- Convert the current single archived conversation model into user-owned threads using the existing conversations and messages data.
- Add secure functions to list, create, rename, open, and archive the signed-in user’s own conversations; every operation remains protected by account checks and database access rules.
- Add a dedicated conversation page at `/app/chat/:conversationId`; `/app` opens or creates the latest conversation and navigates there.
- Show recent conversations in the app sidebar, with New chat and overflow actions. Mobile history will live in the existing navigation drawer.
- Key chat state, loading, saving, and regeneration to the route conversation ID so messages never bleed between threads. Save each user message immediately and each completed assistant response to the same thread.

### 3. First impression and department navigation
- Show six polished first-message prompt cards on an empty main conversation, including the four requested examples. Clicking one sends immediately.
- Keep only AI Platform, African Languages, Business AI, and Agriculture AI visible first.
- Put all remaining existing departments and tools under an accessible “Explore more departments” disclosure; no departments are removed or renamed.
- Preserve the existing sidebar, account controls, admin visibility, and all current destinations.

### 4. Mobile and visual consistency audit
- Audit `/app`, all requested department pages, Opportunities, Hub, Workspace, Languages, Settings, and Admin at phone and desktop widths.
- Remove horizontal overflow; make dense tabs, selectors, cards, forms, tables, source panels, and message actions wrap or scroll intentionally.
- Standardize page widths, section spacing, type hierarchy, card radius, borders, controls, and minimum 44px touch targets through shared components and tokens.
- Add restrained fade/slide transitions for page entry, empty-state prompts, messages, and disclosures, while respecting reduced-motion preferences.
- Verify dark-theme contrast for text, muted copy, inputs, user messages, assistant messages, source cards, disabled states, and errors.

### 5. Trust and public company information
- Add Company/About to the primary desktop and mobile navigation.
- Refine the existing Company Profile into a genuine About page using only verified project facts: Africa Opportunity Hub ownership, mission, product scope, early-stage status, and vision. No personal founder biography will be invented; the founding organization will be identified instead.
- Replace static usage claims with a privacy-safe live aggregate only when real records exist. Show conversation and country counts without exposing identities; omit the section when there is no data.
- Preserve the exact 40+ language registry and Africa Business Hub content.

### 6. Reliability and verification
- Audit all internal links, buttons, loading/empty/error states, and unfinished copy; repair only confirmed defects.
- Add the required route metadata to any content page touched by this work.
- Test chat streaming, first-prompt submission, two separate saved conversations, switching, direct URL reload, copy, WhatsApp sharing, mobile navigation, voice controls, attachments, web sources, and failure recovery.
- Validate representative 384px mobile and 1280px desktop views, run lint/type/build checks, and review live console/runtime signals.

## Technical notes
- Keep TanStack Start, the current protected route gate, Lovable Cloud, the existing AI model, and all current server-side secret boundaries.
- Reuse the existing `conversations` and `messages` tables; any database change will preserve user data and retain owner-only access.
- The chat endpoint will continue receiving the complete active thread history and returning an AI SDK UI-message stream.
- Usage statistics will be aggregate-only and computed server-side; no profile, prompt, message, or location records will be exposed.
