# Nuru AI — Intelligence Core Upgrade

This is an additive upgrade. Existing routes, departments, UI, database migrations and capabilities are preserved.

## What was added

### 1. One-chat orchestration
Nuru remains one conversation. The user does not need to choose an agent. The main model can silently call `consult_specialists` when a request needs specialist reasoning, then synthesize the findings into one Nuru response.

### 2. Specialist council
The council can consult up to four specialists in parallel:
- languages
- voice
- vision
- business
- education
- agriculture
- research
- developer
- creative
- documents
- opportunities
- hub

The specialist outputs are internal findings, not separate user-facing chats.

### 3. Long-term memory retrieval
Nuru now retrieves relevant stored memories and historical messages across the user's previous conversations before answering. It uses relevance scoring so old conversations can be recalled without dumping the entire history into every prompt.

New user turns are also durably recorded in `user_memory` for future retrieval.

### 4. More agentic reasoning steps
The chat loop now permits more tool/reasoning steps so Nuru can research, consult specialists and synthesize instead of stopping after a shallow response.

## Important implementation boundary

This upgrade strengthens the intelligence/orchestration layer without pretending that a file has been modified when no file-edit tool exists. The next additive capability should be a governed workspace/tool layer for reading, editing, creating and verifying user files (code, documents, spreadsheets and PDFs), with explicit confirmation for consequential writes.

## Production verification

Run:

```bash
npm install
npm run lint
npm run build
```

Then apply the new Supabase migration before enabling long-term memory in production.
