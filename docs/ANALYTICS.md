# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead sub-app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how AirtableIsDead follows it.

## Setup
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token; `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com` (both already set on Vercel). No key → analytics is a no-op.
- Reverse proxy through the app's own origin: `/airtableisdead/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true`).
- `<Analytics />` is mounted once in `app/layout.tsx`; it boots the client and sends PostHog's `$pageview` per route change. Autocapture and session replay are off.
- posthog-js drops automated browsers. In dev, `localStorage.isdead_ph_debug = "1"` turns on verbose logs and lets Playwright capture; production keeps the bot filter.

## Super properties (every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `airtableisdead` | the one property to filter by |
| `surface` | `landing` \| `app` | `landing` = home, pricing, compare, login; `app` = the base editor under `/app` |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `guest` \| `demo` | registered once the workspace loads |

All IsDead apps share the yourappisdead.com cookie, so the client unregisters other apps' legacy super properties at boot and re-registers ours after `reset()`.

## Identity
Signed-in users are identified by Firebase uid (`account_type: "firebase"`). Guests and the demo account are never identified (only `account_type` is registered). Sign-out sends `app_signed_out`, then calls `reset()`.

## Events
`app_<object>_<action>`, snake_case, past tense; the product name is never in an event name. Properties are kinds, counts and booleans only, never user content (table/field/view names, cell values, file names).

| event | properties |
| --- | --- |
| `app_signed_up` | `method` (`password`) |
| `app_signed_in` | `method` (`password` \| `google`) |
| `app_signed_out` | |
| `app_table_created` | `tables` (count after) |
| `app_table_deleted` | `tables` (count after) |
| `app_record_created` | `source` (`grid` \| `kanban`) |
| `app_record_duplicated` | |
| `app_records_deleted` | `count`, `source` (`row_menu` \| `bulk` \| `record_modal`) |
| `app_field_added` | `field_type` |
| `app_view_created` | `view_type` (`grid` \| `kanban`) |
| `app_csv_imported` | `records`, `fields` |
| `app_csv_exported` | `records`, `fields` |

Adding an event = add it to `lib/analytics/taxonomy.ts` (the only place names are defined) and this table. `tests/unit/analytics.test.ts` rejects names outside `app_` / `landing_` and names containing the product.

## Where the calls live
`lib/analytics/` (client + taxonomy), `components/useAuth.ts` (sign-in/up, sent with `trackNow` before the redirect), `components/airtable/Workspace.tsx` (identify, sign-out, tables, views, fields, CSV), `Grid.tsx` / `Kanban.tsx` / `Panels.tsx` (records).
