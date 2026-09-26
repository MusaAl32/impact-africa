# Make Nuru strong across every area

## What I will not build
Real-money investing (deposits, returns paid out, withdrawals). Holding other people's money needs a financial licence and a regulator's approval. Building it without those would put you at legal risk. Instead you get investment advice in chat plus a personal tracker where no money moves.

## 1. Every department answers properly
- Research, Health, Business, Agriculture, Education, Developer, Creative, Documents, Voice and Vision all use the same strong chat, with the web search and memory it already has.
- Each department gets its own expert instructions. For example, Health gives safe, sourced guidance and says when to see a doctor. Research cites real sources.
- I'll test a real question on every department page and record the result.

## 2. Images
- Nuru can create an image from a request ("Create an image or sticker" button and in chat).
- People can upload a photo and Nuru describes or reads it (Vision).
- Images are saved with the conversation so they reappear in history.

## 3. Investments
- **Advice in chat:** explains options such as savings, bonds, shares and small business, compares risk, and finds real current opportunities with links. It always adds a "not financial advice" note.
- **Investment tracker (new page):** people add, edit and delete their own investments (name, type, amount, start date, expected yearly return). The page shows value to date, total gains, and a status for each. It checks every field, shows loading and success/error messages, and has an empty state. Only the owner can see their entries.

## 4. Settings
- Check every option (language, voice, tone, profile, memory on/off, log out) and make sure each one saves, shows a confirmation, and actually takes effect.
- Add a "Clear my memory" button and a notifications on/off switch.

## 5. Push notifications (Firebase)
- People can allow notifications. Nuru stores their device safely, and you can send alerts from the admin page.
- **Needs from you:** a Firebase project, its web settings, and a server key. I'll open secure forms for these. Nothing will be sent until they're added.

## 6. Robustness pass
- Every button, form and pop-up: no dead buttons, no endless spinners. Failures show a clear message and a Retry button, and loading shows placeholders.
- Pricing stays Free only, with no upgrade buttons that go nowhere.

## Technical details
- New table `investments` (user_id, name, kind, amount, currency, start_date, expected_annual_return, status, notes). Includes grants, owner-only row security and an updated_at trigger. Returns are calculated on the fly (compound growth), not stored.
- Route `_authenticated/app.investments.tsx`, owner-scoped server functions with zod validation.
- Per-department system prompt additions in `prompts.ts`. Image generation through the AI gateway image model. Vision uses the existing multimodal chat parts.
- Table `push_subscriptions` (user_id, token, platform) with owner-only row security. The FCM service account is stored as a secret. An admin-only server function sends notifications. The service worker is `firebase-messaging-sw.js`.
- Audit with Playwright across all routes, followed by typecheck and build.
