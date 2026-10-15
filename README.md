# AirtableIsDead

Free, open-source Airtable alternative. Part of the [IsDead series](https://yourappisdead.com). Served at `https://yourappisdead.com/airtableisdead`.

**Status: open source, not deployed yet**. Surfaces follow `templates/marketing-site.md` in `@isdead/design`: one marketing page (`/`, price comparison at `#pricing`), `/login`, and the app at `/app`.

## What works
- **Grid:** keyboard editing (arrows, type to edit, Enter, Tab, Esc), typed cells (text, long text, number, checkbox, single/multi-select, date, URL) with validation, column summaries, add/rename/retype/delete fields, edit select options and colors, expand any record into a form.
- **Views:** saved grid and kanban views per table, each with its own filters (and/or), multi-sort, hidden fields and search; kanban stacks by any select field with drag-and-drop, add-card and add-stack.
- **Tables:** several tables per base, CSV import with type detection, CSV export of the current view.
- Core logic is pure functions in `lib/airtable/model.ts` with 33 unit tests; `npm run shots` runs a Playwright smoke test of the whole flow.

## Known gaps
- Data lives in the browser (localStorage, per user). No realtime collaboration or sharing; that needs a Firestore-backed store.
- No linked records, lookups, formulas, rollups, forms, gallery/calendar views, attachments, automations or API.
- Airtable's brand font (Haas) is approximated with Archivo.

## Auth
Shared Firebase project `yourappisdead` (email/password + Google), helpers in `lib/isdead-auth` (vendored from `isdead-design/auth`). The session cookie `isdead_session` has path `/`, so one sign-in covers every IsDead app. Env: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`. Without them, `/login` shows "Sign-in not configured". The single demo account ("Use the demo account") is available outside production or with `DEMO_MODE=1`.

## Develop
```
npm install
npm run dev        # http://localhost:3000/airtableisdead
npm test           # unit tests
npm run typecheck
npm run build && npm run shots   # product screenshots + end-to-end smoke test (Playwright)
```
Theme and font: `vendor/isdead-design` (OFL fonts, see `fonts/*/OFL-*.txt`). Not affiliated with Airtable; all trademarks belong to their owners. Apache-2.0.
