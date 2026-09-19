# Africa Opportunity Hub — MCP server

**Read-only** Model Context Protocol server exposing the Africa Opportunity Hub's
published problem database, public research library and live ecosystem status.

- Endpoint: `/mcp` (Streamable HTTP)
- Auth: **OAuth required** — callers must present a valid Nuru AI (Supabase) access token
  (`aud: authenticated`). Unauthenticated calls return `401` with the protected-resource
  metadata pointer.
- Authorisation: **admin-granted allow-list.** A valid token is not enough. Every tool call
  re-checks that the caller has an active row in `public.mcp_access` (granted in the app's
  admin control room, revocable at any time). Callers without a grant receive a structured
  `invalid_request` denial and no data. Access is verified per call with the caller's own
  token, so row-level security applies; no service-role key exists anywhere in the MCP code.
- Rate limiting is applied **per authenticated user** (60 tool calls/minute per instance),
  not per shared bucket.
- Metadata: `/.well-known/oauth-protected-resource`
- Server name: `africa-opportunity-hub`

## Data policy

Only intentionally public data is reachable. Tools query the database through the
anonymous (publishable-key) client, so row-level security applies as `anon`. They cannot read
submissions, contact emails, `created_by` identifiers, unpublished/draft problems, secrets, or
any private user data. There is no privileged/service-role access anywhere in the MCP code.

All tools are read-only: no create, update, delete, publish or admin capability is exposed.

Database text is treated as **untrusted input**: values are length-capped and screened for
prompt-injection payloads before being returned or sent to the model.

## Tools

### `get_ecosystem`

Real-time snapshot of the Nuru AI ecosystem.

| Input | Type | Notes |
| --- | --- | --- |
| `section` | `"overview" \| "departments" \| "languages" \| "sectors" \| "stats"` | default `overview` |

Output: `platform` (name, tagline, description, public hub URL, `generatedAt`),
`departments[]` (id, name, path, tagline), `languages` (total, regions, items with
code/name/nativeName/region/status/capabilities), `hub` (sectors, trade corridors),
`stats` (live `publishedProblems`, `publicResearch`, `topCountries`, `topCategories`,
`latestProblems`) or `null` when the section excludes stats, plus `error`.

Counts are read live from the public database on every call. Rate limit: shared
read bucket (60 calls/minute per instance).



### `list_problems`

Search published problems/opportunities.

| Input | Type | Notes |
| --- | --- | --- |
| `query` | string (1–120) | optional free text over title/description |
| `country` | string (2–60) | optional |
| `category` | string (2–60) | optional sector |
| `status` | `"published"` | optional; only published records exist publicly |
| `limit` | integer 1–50 | default 10 |
| `offset` | integer 0–5000 | default 0 |

Output:

```json
{
  "problems": [
    {
      "id": "uuid", "title": "…", "description": "…", "category": "…",
      "country": "…", "region": "…|null", "status": "published",
      "severity": 4, "opportunityScore": 82, "evidence": "…|null",
      "publishedAt": "ISO|null", "updatedAt": "ISO|null",
      "sourceUrl": "https://…|null", "publicUrl": "/app/opportunities?type=problem&id=…"
    }
  ],
  "pagination": { "limit": 10, "offset": 0, "returned": 10, "hasMore": true },
  "error": null
}
```

Example: `{"country":"Kenya","category":"Agriculture","limit":5}`

### `list_research`

Search the public research library. Inputs mirror `list_problems` (no `status`).
Each item: `id`, `title`, `summary`, `topic`, `country`, `source`, `year`, `publishedAt`,
`updatedAt`, `sourceUrl`, `publicUrl`, plus the same `pagination` and `error` fields.

### Removed: `analyze_entry`

The AI analysis tool was removed from this server. Running a Nuru AI analysis is a metered,
credit-consuming operation, so it is no longer reachable from the MCP surface at all;
analyses are run only by signed-in people inside the Nuru AI app, and are recorded against
their account.

## Errors

Errors are structured and never leak stack traces, SQL, file paths or secrets:

```json
{ "problems": [], "pagination": {…}, "error": { "code": "no_results", "message": "…" } }
```

Codes: `invalid_request`, `not_found`, `no_results`, `rate_limited`, `internal_error`.
Unexpected failures are logged server-side and returned as a generic `internal_error`.

## Limits

- `limit` max 50, `offset` max 5000; oversized or malformed inputs are rejected by schema validation.
- Best-effort rate limiting per server instance: 60 list calls/minute. Exceeding it returns
  `rate_limited` with `retryAfterSeconds`. This is per-instance, not a distributed guarantee.
- No metered/AI-credit-consuming tool is exposed.
- `publicUrl` is a site-relative path to the Opportunity Hub view.

## Limitations

- No write, subscribe or admin tools; no MCP resources or prompts are advertised.
- Rate limiting is per server instance rather than distributed.
