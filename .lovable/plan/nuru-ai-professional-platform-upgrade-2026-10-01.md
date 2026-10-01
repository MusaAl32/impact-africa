# Nuru AI professional platform upgrade

## Goal
Upgrade the existing product in place so Nuru remains one unified assistant: visitors can try it immediately, signed-in users keep secure history, and specialist capabilities route quietly behind one conversation.

## Build scope

### 1. Unified chat and first-use journey
- Make the public first screen a real limited guest chat with the requested welcome text and example prompts.
- Keep guest conversations local to the device; prompt for a free account only when saving, history, projects, or other private features are requested.
- Carry the current local guest conversation into the signed-in experience where safely possible.
- Keep one Nuru conversation and remove department selection from the primary chat workflow; existing department pages remain available without becoming separate assistants.

### 2. Nuru capability system
- Add an extensible capability registry for Nuru Fast, Nuru 1, Nuru 2, Nuru 3, Nuru Vision, and Nuru Voice.
- Describe these honestly as Nuru capability modes backed by connected AI services, not independently trained foundation models.
- Route agriculture, business, education, translation, research, coding, documents, images, and voice internally based on the request and available inputs.
- Preserve the current streaming provider, memory, web evidence, image generation, and voice paths; do not switch providers or expose secrets.

### 3. Professional workspace
- Complete the sidebar and conversation actions: new, search, rename, archive, clear, and delete.
- Refine the message surface, loading/error states, actions, fixed composer, attachments, voice controls, mobile drawer, and model selector.
- Keep the selected Nuru visual direction: midnight and gold public identity with an editorial trust system, and a focused light conversation workspace.

### 4. Projects, files, and settings
- Add owner-scoped Projects with name, description, instructions, related conversations, and related files.
- Add supported upload records and secure storage for PDF, DOCX, TXT, and common images; clearly show processing, unsupported, and failed states.
- Reuse the existing document/image analysis paths where valid; never report analysis when processing failed.
- Organize Settings into General, Account, AI, Privacy & Security, and Plan & Usage, preserving current language, profile, memory, notifications, voice, and sign-out controls.

### 5. Plans and provider-neutral payments
- Restore a truthful plan/usage presentation for Free, $10, $15, and $20 planned tiers using configurable database entitlements.
- Keep payments provider-neutral and server-only. Do not activate checkout or show payment success unless a real provider confirms it.
- Present unavailable paid tiers as planned rather than purchasable, while preserving existing usage-limit enforcement and friendly limit messages.

### 6. Security and performance
- Add strict owner-only policies and grants for every new private table and storage object.
- Keep authenticated identity derived from the validated session, never browser-supplied owner IDs.
- Review guest, account, conversation, project, file, usage, admin, AI, and payment boundaries; fix only verified weaknesses without resetting data.
- Bound history/file context, lazy-load heavy features, avoid duplicate reads, preserve streaming, and keep technical errors out of the user interface.

## Technical implementation
- TanStack Start route structure and the managed authenticated gate remain unchanged.
- Public guest chat uses a dedicated rate-limited server route with no private history or memory access.
- Signed-in operations use authenticated server functions and existing bearer middleware; private records rely on row-level owner policies.
- Capability definitions, routing, provider calls, usage, payments, file processing, and UI remain separate modules.
- Database changes are additive migrations only, with explicit grants followed by row-level security policies for every new public-schema table.

## Verification and evidence
- Run the requested 20-flow matrix and record PASS, FAIL, BLOCKED, or NOT APPLICABLE with evidence.
- Use real browser flows on desktop and mobile, authenticated and signed-out sessions, upload tests, streaming/network evidence, and direct cross-user access tests.
- Run diagnostics and the production build after implementation.
- Report what was implemented, preserved, externally blocked, and still required before launch; no untested PASS claims.

## Guardrails
- No data reset, user deletion, conversation deletion, fake payments, fake model claims, or secret exposure.
- No unrelated redesign, no forced department choice, and no registration wall before the limited guest experience.
- Existing working integrations remain unless a verified security defect requires a narrow fix.
