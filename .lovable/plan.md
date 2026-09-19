# Export Nuru AI from Lovable to Local/VS Code

## Goal
Move the complete Nuru AI project out of the Lovable editor so it can be developed locally in VS Code (or any IDE) starting next month. Keep all existing functionality intact and preserve the option to continue editing in Lovable via GitHub sync.

## Scope
- Source code (everything in `src/`, config files, public assets)
- Runtime dependencies (recreatable from `package.json` + lockfile)
- Build outputs and generated files (optional — can be reproduced locally)
- Database schema and any exportable production data
- Environment variables / secrets inventory (values delivered separately through secure channels)

## Options

### Option A — GitHub sync (recommended)
Connect the Lovable project to a GitHub repository. This gives you a live, bidirectional copy: changes pushed from VS Code appear in Lovable, and Lovable edits push to GitHub.

Pros:
- No manual ZIP handling
- Continues to sync after the initial transfer
- Standard `git clone` into VS Code

Cons:
- Requires a GitHub account and authorizing the Lovable GitHub App
- Does not include the production database contents automatically

### Option B — One-time source ZIP
Download the codebase directly from Lovable as a ZIP file.

Pros:
- No GitHub setup needed
- Fast single deliverable

Cons:
- One-way export; further Lovable edits must be manually merged if desired
- Still requires `bun install` locally to recreate `node_modules/`

### Option C — Full working copy (source + dependencies + build output)
Produce a complete archive that runs immediately after extraction, including `node_modules/` and the generated `dist/` / `.output/` folders.

Pros:
- Runs without installing dependencies first

Cons:
- Much larger archive
- Build output may be platform-specific and is better recreated locally
- Not a standard Lovable export; requires manual packaging

## Plan

### 1. Inventory and prepare the project
- Confirm the current branch/state in Lovable is the version to export
- Run a final typecheck and build to ensure the project is in a working state
- Document the exact package manager and Node/Bun versions required
- List all environment variables the app needs (without their values)

### 2. Export the code
**If GitHub sync:**
1. Open the Plus (+) menu in Lovable chat input → GitHub → Connect project
2. Authorize the Lovable GitHub App
3. Select the target GitHub account/organization
4. Create the repository from Lovable
5. In VS Code: `git clone <repo-url>` and run `bun install`

**If ZIP download:**
1. Open the Code Editor in Lovable
2. Click **Download codebase** at the bottom of the file tree sidebar (paid workspace feature)
3. Extract the ZIP in VS Code workspace
4. Run `bun install` to restore dependencies

**If full working copy (Option C):**
1. Perform Option A or B first
2. Run `bun install` and `bun run build` in a clean checkout
3. Package the resulting folder including `node_modules/` and build output
4. Deliver the archive

### 3. Export the backend data
- Request a database export from Lovable Cloud when ready (Settings → Cloud → Advanced settings → Export data)
- Note: this is separate from code export and should be scheduled close to the transfer date to avoid stale data

### 4. Secrets handoff
- Prepare a list of required environment variables:
  - Supabase project URL and anon key (already public)
  - Any AI gateway or provider keys used server-side
  - MCP, OAuth, or webhook secrets if applicable
- Values must be transferred through a secure channel, never pasted into chat or included in the exported archive

### 5. Local verification
- Install dependencies with the documented package manager
- Run the dev server locally
- Confirm the homepage loads
- Confirm sign-in works with a test account
- Confirm chat, departments, and opportunity pages load

### 6. Documentation
- Provide a `LOCAL_SETUP.md` with step-by-step commands
- Note any Lovable-specific features that only work inside Lovable (e.g., MCP auto-registration, preview URLs, built-in auth session injection)

## Acceptance criteria
- The project opens and runs in VS Code without Lovable-specific errors
- All existing routes and features remain accessible
- User data remains isolated and secure during the transfer
- Secrets are not committed to the repository or included in the ZIP
- The transfer date and preferred method are confirmed with the user

## Next step
Decide which option to use and confirm the target transfer date. GitHub sync is recommended if ongoing two-way editing is desired; one-time ZIP is simpler if this is a final migration.