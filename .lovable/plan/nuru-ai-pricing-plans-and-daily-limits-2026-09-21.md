# Nuru AI pricing, plans and daily limits

Add four subscription plans, a public pricing page, live usage tracking with daily
resets, and real card payments. Limits live in the database so they can be changed
without touching the app.

## The four plans

| Plan | Price | Messages/day | Voice min/day | Files/day | Searches/day |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | 20 | 10 | 3 | 5 |
| Nuru AI Pro | $10/mo | 200 | 60 | 20 | 50 |
| Nuru AI Pro Plus | $15/mo | 400 | 120 | 40 | 100 |
| Nuru AI Pro Max | $20/mo | 600 | 180 | 60 | 150 |

## Pricing page (public, at /pricing)

- All four plans side by side, Nuru's dark gold/orange styling, mobile first.
- Signed out: plan cards plus a "Start free" button leading to sign-up.
- Signed in: the current plan is marked, and a panel above the cards shows
  remaining messages, voice minutes, files and searches for today, plus a live
  countdown to the daily reset (midnight UTC).
- Each paid card has an Upgrade button that opens card checkout. The current plan's
  button reads "Your plan" and is disabled; lower plans read "Downgrade".
- Linked from the site footer and the account menu.

## Usage limits that actually apply

Every reply, voice minute, file and web search is counted for the signed-in user.
When a daily allowance runs out, Nuru answers with a clear message naming the
limit, the reset time and a link to the pricing page — never a technical error.
Counting and blocking happen on the server, so limits cannot be bypassed from
the browser.

Voice minutes are counted from live-session duration, rounded up to the minute.

## Payments

Set up Lovable's built-in Stripe payments (as you chose). This creates a test
environment first so we can verify the whole flow with no real money, then you
verify the account to take live payments. Three subscription products are created
($10, $15, $20 monthly). After a successful payment, the account's plan is updated
automatically and the new allowances apply immediately.

## Technical notes

- New tables: `plans` (slug, name, price cents, four limit columns, stripe price id,
  sort order, active) seeded with the four rows in the migration; `subscriptions`
  (user_id, plan_slug, status, provider ids, current period end); `usage_events`
  (user_id, kind, quantity, day date) with a per-user/day/kind aggregate index.
- All tables get GRANTs; `plans` is publicly readable, `subscriptions` and
  `usage_events` are owner-scoped read-only for the user and written only by
  server-side code.
- `resolveEntitlements(userId)` server helper returns the plan row plus today's
  usage; `consumeQuota(userId, kind, qty)` checks and records atomically via a
  security-definer SQL function, returning allowed/remaining/reset.
- Enforcement points: `src/routes/api/chat.ts` (messages, and searches inside the
  `search_web` tool), live voice session save (voice minutes), attachment handling
  (files).
- Public `/pricing` route reads plans through a publishable-key server function so
  it renders for signed-out visitors; usage panel loads client-side for signed-in
  users.
- Checkout + webhook handled by the built-in payments integration; the webhook
  route lives under `src/routes/api/public/` with signature verification.

## Verification

Live browser checks at desktop and mobile widths: plan cards, current-plan badge,
usage panel and countdown, upgrade button opening checkout, a blocked request
showing the friendly limit message, and a test payment upgrading the plan.
Typecheck and build must pass.
