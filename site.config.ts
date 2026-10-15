import type { Site } from "@/lib/site-types";
const GH = "https://github.com/tommy-muckstack/airtableisdead";
export const site: Site = {
  slug: "airtableisdead", name: "AirtableIsDead", replaces: "Airtable", theme: "airtable",
  glyph: "M4 8 L12 4 L20 8 L12 12 Z M4 12 L12 16 L20 12 M4 16 L12 20 L20 16",
  nav: [{ label: "Product", id: "product" }, { label: "Solutions", id: "solutions" }, { label: "Resources", id: "resources" }, { label: "Pricing", id: "pricing" }],
  cta: "Sign up for free",
  hero: { variant: "split", eyebrow: "Free · Open source · No record limits", title: ["Your data,", "your way."], subtitle: "A spreadsheet that thinks like a database. Typed fields, grid and kanban views, filters, sorts and CSV import, with nothing locked behind a paid plan.",
    primary: { label: "Open the demo", href: "/login" }, secondary: { label: "See pricing", href: "/#pricing" }, shot: "grid.png", shotAlt: "The AirtableIsDead grid view of a launch tracker with colored select chips, dates, numbers and checkboxes" },
  audience: "For ops leads, founders, researchers and clubs who outgrew a spreadsheet but don't want to pay per seat for a database",
  stepsTitle: "From a messy sheet to a working system",
  steps: [{ t: "Bring your data", d: "Import a CSV and each column becomes a typed field: numbers, dates, checkboxes, selects and links." }, { t: "Shape it", d: "Add fields, rename them, change their type, and edit select options and colors in place." }, { t: "Look at it your way", d: "Save grid and kanban views with their own filters, sorts, hidden fields and search." }, { t: "Take it back out", d: "Export the current view as CSV any time. Your data is never trapped." }],
  rows: [
    { id: "product", k: "Grid view", h: "A grid that behaves like a real spreadsheet", p: "Arrow keys move, typing edits, Enter commits, Tab jumps right. Select cells hold chips, dates and checkboxes, and the footer sums your number columns.", img: "grid.png", alt: "The grid view with a selected cell and colored chips", cta: "Open the grid" },
    { id: "kanban", k: "Kanban", h: "Drag records through your pipeline", p: "Stack any single-select field as a kanban. Drop a card in another stack to change its value, add a card straight into a stack, or add a new stack on the spot.", img: "kanban.png", alt: "A kanban board stacked by status with draggable cards", cta: "Try the kanban" },
    { id: "solutions", k: "Filter & sort", h: "Ask your data a question", p: "Stack conditions with and/or, sort by several fields at once, and hide the columns you don't need. Each view remembers its own setup.", img: "filter.png", alt: "The filter panel open above the grid with two conditions", cta: "Filter a table" },
    { id: "resources", k: "Records", h: "Every record, one tap from full detail", p: "Expand a row to edit every field in a roomy form, including long text, dates and multi-select tags.", img: "record.png", alt: "An expanded record dialog showing all fields", cta: "Expand a record" },
  ],
  statsTitle: "Real numbers, no fine print",
  stats: [{ b: "$0", s: "per person, per month, forever" }, { b: "0 limits", s: "records per base, views per table, collaborators" }, { b: "8 field types", s: "text, long text, number, checkbox, select, multi-select, date, URL" }, { b: "Apache-2.0", s: "fork it, change it, ship it" }],
  integrations: { title: "CSV in, CSV out", text: "Import any CSV and we'll guess the types. Export the current view, filters and all, to hand it to anything else." },
  pricing: { title: "What you'd pay for a database elsewhere", vendor: "Airtable", asOf: "October 2026", plans: [{ name: "Team", perSeatMonth: 20, note: "billed monthly, per seat" }, { name: "Business", perSeatMonth: 45, note: "billed monthly, per seat" }], seats: 5,
    footnote: "Airtable's free plan caps records per base and hides some views; paid plans lift the caps. We don't ship forms, linked records, formulas or automations yet, so compare features, not just price.", featuresTitle: "Every feature, no plan gates",
    features: [{ name: "Unlimited records per base", plan: "Team" }, { name: "Grid and kanban views", plan: "Free" }, { name: "Filters, sorts and field hiding per view", plan: "Free" }, { name: "CSV import with type detection", plan: "Free" }, { name: "Unlimited views per table", plan: "Team" }, { name: "Summary footer for numbers and checkboxes", plan: "Team" }] },
  finalCta: { title: "Make the spreadsheet grow up.", sub: "Open the demo and drag a card." },
  footer: [
    { title: "Product", links: [{ label: "Grid", href: "/#product" }, { label: "Kanban", href: "/#kanban" }, { label: "Filters", href: "/#solutions" }, { label: "Pricing", href: "/#pricing" }] },
    { title: "Get started", links: [{ label: "Log in", href: "/login" }, { label: "Try the demo account", href: "/login" }, { label: "Price comparison", href: "/#pricing" }] },
    { title: "Open source", links: [{ label: "GitHub", href: GH }, { label: "Apache-2.0 license", href: GH + "/blob/main/LICENSE" }] },
    { title: "More IsDead apps", links: [{ label: "NotionIsDead", href: "/notionisdead" }, { label: "LinearIsDead", href: "/linearisdead" }, { label: "OtterIsDead", href: "/otterisdead" }, { label: "1PasswordIsDead", href: "/onepasswordisdead" }] },
  ],
  trademark: "AirtableIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Formagrid Inc. Airtable is a trademark of its owner.",
  repo: GH,
};
