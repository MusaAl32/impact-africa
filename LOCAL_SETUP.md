# Local Development Setup — Nuru AI

This guide explains how to run the Nuru AI project locally in VS Code (or any editor) after exporting it from Lovable.

## Prerequisites

- **Bun** `>= 1.3.3` (the project is built and run with Bun)
- **Node.js** `>= 22.x` (used by some tooling; Bun itself embeds a compatible runtime)
- A Lovable Cloud / Supabase backend for the project (data and auth are hosted)

> The current Lovable sandbox uses **Bun 1.3.3** and **Node v22.22.0**.

## 1. Get the code

### Option A — GitHub sync (recommended)

If you connected Lovable to a GitHub repository:

```bash
git clone <your-github-repo-url> nuru-ai
cd nuru-ai
```

### Option B — Downloaded ZIP

If you used **Download codebase** in Lovable:

1. Extract the ZIP into a folder, e.g. `nuru-ai`.
2. Open that folder in VS Code.

## 2. Install dependencies

```bash
bun install
```

This restores `node_modules/` from `package.json` and the lockfile.

## 3. Configure environment variables

Create a `.env` file in the project root. The minimum required public values are:

```env
VITE_SUPABASE_URL=https://nxzacvdllwzqayeqkkuo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_3Ik0pTEOKhT4Lmn-LLA9Mg_CZrhNt2H
VITE_SUPABASE_PROJECT_ID=nxzacvdllwzqayeqkkuo
SUPABASE_URL=https://nxzacvdllwzqayeqkkuo.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_3Ik0pTEOKhT4Lmn-LLA9Mg_CZrhNt2H
SUPABASE_PROJECT_ID=nxzacvdllwzqayeqkkuo
```

### Server-only secrets

The following variables are required for full server-side functionality. They must be obtained from your Lovable Cloud / secret manager and **must never be committed to the repository**:

- `SUPABASE_SERVICE_ROLE_KEY` — required for admin/privileged server operations
- `LOVABLE_API_KEY` — required for the AI gateway
- `FIRECRAWL_API_KEY` — required for web-search evidence
- `LOVABLE_CRON_SECRET` / `LOVABLE_CRON_SECRET_PREVIOUS` — required for cron endpoints

Add them to `.env` locally but keep them out of Git (`.env` is already in `.gitignore`).

## 4. Run the development server

```bash
bun run dev
```

The dev server starts on `http://localhost:8080` by default.

## 5. Build for production

```bash
bun run build
```

Output goes to `dist/` / `.output/` (these folders are generated and should not be committed).

## 6. Useful scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Build for production |
| `bun run build:dev` | Build in development mode |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

## 7. Project structure

- `src/routes/` — TanStack Start routes and API endpoints
- `src/components/` — React components, including `ai-elements/` and UI primitives
- `src/lib/` — Server functions, MCP tools, prompts, departments, languages
- `src/integrations/supabase/` — Supabase client and auth middleware
- `src/styles.css` — Tailwind v4 theme and design tokens
- `supabase/` — Supabase configuration

## 8. Lovable-specific features

Some features are managed automatically inside Lovable and may need manual setup when running locally:

- **Auth session injection** — Lovable's preview can mint test sessions automatically. Locally you sign in through the normal email/Google flow.
- **Preview URLs** — only available through Lovable's hosting.
- **MCP auto-registration** — the `/mcp` endpoint exists in the code but published discovery depends on Lovable's deployment plumbing.

## 9. Database

The app uses the existing Lovable Cloud / Supabase project. No local Postgres is required. If you need a copy of production data for local work, request a database export from Lovable Cloud (`Settings → Cloud → Advanced settings → Export data`) and import it into a separate Supabase project for development.

## 10. Verification checklist

After setup, confirm:

- [ ] `bun install` completes without errors
- [ ] `bunx tsgo --noEmit` passes (typecheck)
- [ ] `bun run build` completes successfully
- [ ] `bun run dev` serves `http://localhost:8080`
- [ ] The homepage loads
- [ ] Sign-up / sign-in works
- [ ] A chat can be created and messages persist on refresh
- [ ] Department routes load correctly

## Need help?

- Lovable docs: https://docs.lovable.dev/integrations/github
- TanStack Start docs: https://tanstack.com/start/latest
- Tailwind v4 docs: https://tailwindcss.com/docs/v4-beta
