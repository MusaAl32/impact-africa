# Nuru AI — Developer Handoff Pack

**Planned transfer date: 19–20 October 2026**
Owner: Lena Dipo · Receiving party: your own developer

This document is the single checklist for handing the complete Nuru AI project
over to an external developer working in VS Code.

---

## 1. Connect the GitHub repository (you must do this step)

**Target repository:** `https://github.com/MusaAl32/impact-africa.git`

Connecting GitHub requires your GitHub account, so it has to be done from the
Lovable interface — it cannot be done from chat.

1. In the Lovable editor, open the **Plus (+)** menu at the bottom-left of the
   chat input.
2. Choose **GitHub → Connect project**.
3. Authorize the Lovable GitHub App.
4. Pick the GitHub account or organisation that should **own** the repository.
   Choose an organisation if the repo should outlive your personal account.
5. Click **Create Repository**. If the `impact-africa` repository already exists,
   make sure it is empty first so Lovable can populate it cleanly; otherwise the
   connection may fail or overwrite existing files.

After this, the sync is two-way and continuous:

- Changes made in Lovable are pushed to GitHub automatically.
- Changes pushed to GitHub appear in Lovable automatically.

Your developer can then simply:

```bash
git clone <repo-url> nuru-ai
cd nuru-ai
bun install
bun run dev
```

Branching and pull requests work normally; Lovable can also switch branches.

### What the repository contains

Everything that makes up the app: all source code (`src/`), styles and design
tokens (`src/styles.css`), public assets (`public/`), configuration
(`package.json`, `vite.config.ts`, `tsconfig.json`, `components.json`,
`eslint.config.js`), Supabase configuration (`supabase/`), documentation
(`docs/`, `README.md`, `LOCAL_SETUP.md`, this file), and the full commit
history from the moment of connection onwards.

### What the repository does NOT contain (by design)

- `node_modules/` and build output — restored with `bun install` / `bun run build`
- `.env` and any secret values — see section 3
- Database rows — see section 4

---

## 2. Give your developer access

- Add them as a collaborator on the GitHub repository (Settings → Collaborators).
- Optionally add them to the Lovable workspace (**Share** button, top right) if
  they should also use the Lovable editor.

---

## 3. Secrets — transfer securely, never in the repo

These are required for full functionality and must be sent through a secure
channel (password manager share, encrypted message), never committed:

| Variable | Purpose |
|---|---|
| `LOVABLE_API_KEY` | AI gateway (all Nuru AI responses) |
| `FIRECRAWL_API_KEY` | Web-search evidence and citations |
| `LOVABLE_CRON_SECRET` / `LOVABLE_CRON_SECRET_PREVIOUS` | Scheduled endpoints |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server operations |

Note: on Lovable Cloud the service-role key and database password are not
retrievable. If your developer needs them, the backend must be migrated to a
self-managed Supabase project, or they keep using Lovable Cloud hosting.

The public values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID`) are safe and are listed in `LOCAL_SETUP.md`.

---

## 4. Database and data export

The app's data lives in the Lovable Cloud backend, not in the repository.

- To hand over the data: **Cloud → Advanced settings → Export data**.
- Schema history is in `supabase/` migrations, so the structure can be recreated
  on any Supabase project.
- Do not delete or reset the production backend during the handoff.

---

## 5. Hosting after handoff

Two options, both valid:

- **Keep Lovable hosting** — the live site, custom domains
  (`africaopportunity.app`) and the published build stay as they are while the
  developer works through GitHub.
- **Self-host** — the codebase is standard TanStack Start + Vite and deploys to
  any edge/Node host. Environment variables must be configured there.

---

## 6. Handoff-day checklist (19–20 October 2026)

- [ ] GitHub repository created and syncing
- [ ] Developer added as collaborator
- [ ] Developer has cloned the repo and run `bun install`
- [ ] Secrets delivered through a secure channel
- [ ] Database export requested and delivered (if needed)
- [ ] Developer has run `bun run dev` and loaded the homepage locally
- [ ] Developer has run `bun run build` successfully
- [ ] Sign-up / sign-in, chat, and department pages verified locally
- [ ] Custom domain and hosting decision confirmed
- [ ] Access to any third-party accounts (Firecrawl, Google Search Console)
      transferred or shared

---

## 7. Reference documents

- `LOCAL_SETUP.md` — step-by-step local setup, scripts, project structure
- `README.md` — project overview
- `docs/mcp.md` — the public read-only MCP server and its tools
- `roadmap.md` — feature milestones
