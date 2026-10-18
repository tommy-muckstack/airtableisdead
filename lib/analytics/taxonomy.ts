// Analytics taxonomy for the shared IsDead PostHog project 666931 (contract: yourappisdead/ANALYTICS.md, see docs/ANALYTICS.md).
// Super properties: product (this app's slug), surface ("landing" = logged-out marketing pages, "app" = the working product
// and anything it publishes), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>` (or `landing_<object>_<action>` for marketing CTAs); the product name lives in
// `product`, never in an event name. Never send user content (titles, URLs, emails, text) as properties.
export const APP = "airtableisdead" as const;
export type Surface = "landing" | "app";
export const EVENTS = {
  app_signed_up: "app_signed_up",       // method ("password" | "google")
  app_signed_in: "app_signed_in",       // method ("password" | "google")
  app_signed_out: "app_signed_out",
  app_table_created: "app_table_created",     // tables (count after)
  app_table_deleted: "app_table_deleted",     // tables (count after)
  app_record_created: "app_record_created",   // via ("grid" | "kanban")
  app_record_duplicated: "app_record_duplicated",
  app_records_deleted: "app_records_deleted", // count, via ("row_menu" | "bulk" | "record_modal")
  app_field_added: "app_field_added",         // field_type (text | longtext | number | checkbox | select | multiselect | date | url)
  app_view_created: "app_view_created",       // view_type ("grid" | "kanban")
  app_csv_imported: "app_csv_imported",       // records, fields (counts)
  app_csv_exported: "app_csv_exported",       // records, fields (counts)
  landing_cta_clicked: "landing_cta_clicked", // target ("signup" | "app" | "pricing" | ...)
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: APP, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment", "ads_blocked", "account_type"] as const;
