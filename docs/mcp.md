# Africa Opportunity Hub — MCP server

Public, **read-only** Model Context Protocol server exposing the Africa Opportunity Hub's
published problem database, public research library, and Nuru AI analysis of those entries.

- Endpoint: `/mcp` (Streamable HTTP)
- Auth: **none** — anyone with the URL can call these tools once the app is published
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

### `analyze_entry`

Nuru AI specialist analysis of one public entry.

| Input | Type | Notes |
| --- | --- | --- |
| `itemType` | `"problem"` \| `"research"` | required |
| `itemId` | UUID string | required, from a list tool |
| `department` | one of `platform, business, agriculture, research, education, developer, creative, documents` | default `business` |

Output separates the verified source record from the AI output:

```json
{
  "source": { "id": "…", "type": "problem", "title": "…", "summary": "…",
              "category": "…", "country": "…", "sourceUrl": null, "publicUrl": "…" },
  "analysis": { "department": "business", "generatedAt": "ISO",
                "markdown": "…", "disclaimer": "AI-generated analysis…",
                "isAiGenerated": true, "verified": false },
  "error": null
}
```

The analysis includes **Assumptions**, **Uncertainty and evidence gaps**, and
**Recommendations (unverified)** sections. When an entry lacks enough public detail, the tool
returns `no_results` instead of speculating. AI output is never verified fact.

## Errors

Errors are structured and never leak stack traces, SQL, file paths or secrets:

```json
{ "problems": [], "pagination": {…}, "error": { "code": "no_results", "message": "…" } }
```

Codes: `invalid_request`, `not_found`, `no_results`, `rate_limited`, `internal_error`.
Unexpected failures are logged server-side and returned as a generic `internal_error`.

## Limits

- `limit` max 50, `offset` max 5000; oversized or malformed inputs are rejected by schema validation.
- Best-effort rate limiting per server instance: 60 list calls/minute, 6 analysis calls/minute.
  Exceeding it returns `rate_limited` with `retryAfterSeconds`. This is per-instance, not a
  distributed guarantee.
- `publicUrl` is a site-relative path to the Opportunity Hub view.

## Limitations

- No write, subscribe or admin tools; no MCP resources or prompts are advertised.
- No per-caller identity, so rate limiting is global per instance rather than per client.
- Analysis latency depends on the AI gateway; very long entries are truncated at 4,000 characters.
