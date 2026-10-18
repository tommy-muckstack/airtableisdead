"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BP } from "@/lib/basepath";
import { useLocal } from "@/lib/useLocal";
import { Logo } from "@/components/Logo";
import { addField, addView, createTable, deleteTable, deleteView, field, importCsv, mapTable, renameTable, toCsv, updateView, viewRecords, type Base, type FieldType, type Table, type View } from "@/lib/airtable/model";
import { seedBase } from "@/lib/airtable/seed";
import { track, trackNow, identify, resetIdentity, EVENTS } from "@/lib/analytics";
import { Grid } from "./Grid";
import { Kanban } from "./Kanban";
import { AddFieldForm, FieldMenu, FilterPanel, GroupPanel, HidePanel, OptionsDialog, RecordModal, SortPanel } from "./Panels";

type Pop = null | { kind: "filter" | "sort" | "hide" | "group" } | { kind: "field"; id: string; x: number; y: number } | { kind: "addfield"; x: number; y: number };
const dl = (name: string, text: string, type = "text/csv") => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "table";

export function Workspace({ uid, email, demo, guest = false }: { uid: string; name: string; email: string; demo: boolean; guest?: boolean }) {
  const [stored, setStored, ready] = useLocal<Base | null>(uid, "base", null);
  const [prefs, setPrefs] = useLocal<{ table: string | null; views: Record<string, string> }>(uid, "prefs", { table: null, views: {} });
  const [pop, setPop] = useState<Pop>(null); const [open, setOpen] = useState<string | null>(null); const [opts, setOpts] = useState<string | null>(null); const [toast, setToast] = useState("");
  const [navOpen, setNavOpen] = useState(false); const [renaming, setRenaming] = useState<string | null>(null); const fileRef = useRef<HTMLInputElement>(null); const [vq, setVq] = useState("");
  useEffect(() => { if (ready && !stored) setStored(demo ? seedBase() : createTable({ id: "base", name: "My base", tables: [] }, "Table 1").base); }, [ready, stored, demo, setStored]);
  const base = stored;
  useEffect(() => { identify(uid, demo ? "demo" : guest ? "guest" : "firebase"); }, [uid, demo, guest]);
  const notify = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(t => (t === m ? "" : t)), 2600); }, []);
  const table: Table | undefined = base ? base.tables.find(t => t.id === prefs.table) ?? base.tables[0] : undefined;
  const view: View | undefined = table ? table.views.find(v => v.id === prefs.views[table.id]) ?? table.views[0] : undefined;
  const onTable = useCallback((f: (t: Table) => Table) => { if (table) setStored(b => (b ? mapTable(b, table.id, f) : b) as Base); }, [table, setStored]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setPop(null); setOpen(null); setOpts(null); setNavOpen(false); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  if (!base || !table || !view) return <div className="atb-loading" role="status">Loading your base…</div>;
  const pickView = (id: string) => { setPrefs(p => ({ ...p, views: { ...p.views, [table.id]: id } })); setPop(null); };
  const panelProps = { table, view, onTable };
  const anchor = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return { x: Math.min(r.left, window.innerWidth - 300), y: r.bottom + 4 }; };
  const toggle = (kind: "filter" | "sort" | "hide" | "group") => setPop(p => (p?.kind === kind ? null : { kind }));
  const tb = (kind: "filter" | "sort" | "hide" | "group", label: string, count = 0) => <button className={"atb-tool" + (count ? " is-active" : "") + (pop?.kind === kind ? " on" : "")} aria-expanded={pop?.kind === kind} onClick={() => toggle(kind)} data-testid={`tool-${kind}`}>{label}{count > 0 && <b>{count}</b>}</button>;
  const total = table.records.length; const shown = viewRecords(table, view).length;

  return <div className="atb" data-testid="airtable-app" onClick={e => { if (!(e.target as HTMLElement).closest(".atb-panel,.atb-tool,.atb-addfield,.atb-head__m")) setPop(p => (p && (p.kind === "field" || p.kind === "addfield") ? null : p)); }}>
    <header className="atb-top">
      <button className="atb-burger" aria-label="Toggle sidebar" onClick={() => setNavOpen(o => !o)}>☰</button>
      <div className="atb-brand"><Logo size={22} /><span className="atb-base">{base.name}</span><svg className="atb-caret" width="10" height="6" viewBox="0 0 10 6" aria-hidden><path d="M1 1l4 4 4-4" fill="none" stroke="#fff" strokeWidth="1.6" /></svg></div>
      <div className="atb-prod" aria-hidden><span className="on">Data</span><span>Automations</span><span>Interfaces</span><span>Forms</span></div>
      <div className="atb-top__r"><button className="iconbtn" onClick={() => fileRef.current?.click()}>Import CSV</button><span className="ids-muted atb-who">{demo ? "Demo account" : email}</span><form method="post" action={`${BP}/api/session/logout`} style={{ margin: 0 }} onSubmit={e => { e.preventDefault(); const f = e.currentTarget; void trackNow(EVENTS.app_signed_out).then(() => { resetIdentity(); f.submit(); }); }}><button className="iconbtn">Sign out</button></form></div>
    </header>
      <nav className="atb-tables" aria-label="Tables">{base.tables.map(t => renaming === t.id
        ? <input key={t.id} className="atb-tab atb-tab--edit" autoFocus aria-label="Table name" defaultValue={t.name} onBlur={e => { setStored(b => renameTable(b!, t.id, e.target.value)); setRenaming(null); }} onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur(); }} />
        : <button key={t.id} className={"atb-tab" + (t.id === table.id ? " on" : "")} aria-current={t.id === table.id} onClick={() => { setPrefs(p => ({ ...p, table: t.id })); setPop(null); }} onDoubleClick={() => setRenaming(t.id)} data-testid="table-tab">{t.name}</button>)}
        <button className="atb-tab atb-tab--add" aria-label="Add table" onClick={() => { const r = createTable(base, `Table ${base.tables.length + 1}`); setStored(r.base); setPrefs(p => ({ ...p, table: r.table.id })); track(EVENTS.app_table_created, { tables: r.base.tables.length }); }} data-testid="add-table">＋ Add or import</button></nav>
    <div className="atb-body">
      <aside className={"atb-views" + (navOpen ? " is-open" : "")} aria-label="Views">
        <input className="atb-vfind" aria-label="Find a view" placeholder="Find a view" value={vq} onChange={e => setVq(e.target.value)} />
        {table.views.filter(v => v.name.toLowerCase().includes(vq.toLowerCase())).map(v => <div key={v.id} className={"atb-view" + (v.id === view.id ? " on" : "")}><button onClick={() => { pickView(v.id); setNavOpen(false); }} data-testid="view-tab" aria-current={v.id === view.id}><span aria-hidden>{v.type === "grid" ? "▦" : "▥"}</span>{v.name}</button></div>)}
        <div className="atb-views__add"><button className="iconbtn" onClick={() => { const r = addView(table, `Grid ${table.views.length + 1}`, "grid"); onTable(() => r.table); pickView(r.view.id); track(EVENTS.app_view_created, { view_type: "grid" }); }} data-testid="add-grid">＋ Grid</button><button className="iconbtn" onClick={() => { const r = addView(table, `Kanban ${table.views.length + 1}`, "kanban"); onTable(() => r.table); pickView(r.view.id); track(EVENTS.app_view_created, { view_type: "kanban" }); }} data-testid="add-kanban">＋ Kanban</button></div>
        <div className="atb-views__h" style={{ marginTop: 20 }}>This table</div>
        <button className="iconbtn atb-wide" onClick={() => { dl(`${slug(table.name)}.csv`, toCsv(table, view)); notify("Exported CSV"); track(EVENTS.app_csv_exported, { records: viewRecords(table, view).length, fields: table.fields.length - view.hidden.length }); }}>Export view as CSV</button>
        <button className="iconbtn atb-wide" onClick={() => setRenaming(table.id)}>Rename table</button>
        <button className="iconbtn atb-wide" onClick={() => { const r = { ...view }; onTable(t => deleteView(t, r.id)); }} disabled={table.views.length < 2}>Delete this view</button>
        <button className="iconbtn atb-wide is-danger" onClick={() => { if (base.tables.length > 1) { setStored(deleteTable(base, table.id)); setPrefs(p => ({ ...p, table: null })); notify("Table deleted"); track(EVENTS.app_table_deleted, { tables: base.tables.length - 1 }); } }} disabled={base.tables.length < 2}>Delete table</button>
      </aside>
      <section className="atb-main">
        <div className="atb-toolbar" role="toolbar" aria-label="View tools">
          <input className="atb-viewname" aria-label="View name" value={view.name} onChange={e => onTable(t => updateView(t, view.id, { name: e.target.value }))} />
          {tb("hide", `Hide fields`, view.hidden.length)}{tb("filter", "Filter", view.filters.length)}{view.type === "kanban" ? tb("group", "Group", view.groupBy ? 1 : 0) : null}{tb("sort", "Sort", view.sorts.length)}
          <input className="atb-search" aria-label="Search records" placeholder="Find in view" value={view.search ?? ""} onChange={e => onTable(t => updateView(t, view.id, { search: e.target.value }))} />
          <span className="ids-muted atb-toolbar__n">{shown === total ? `${total} records` : `${shown} of ${total}`}</span>
          {pop && (pop.kind === "filter" || pop.kind === "sort" || pop.kind === "hide" || pop.kind === "group") && <div className="atb-pop">{pop.kind === "filter" ? <FilterPanel {...panelProps} /> : pop.kind === "sort" ? <SortPanel {...panelProps} /> : pop.kind === "hide" ? <HidePanel {...panelProps} /> : <GroupPanel {...panelProps} />}</div>}
        </div>
        <div className="atb-content">{view.type === "grid" ? <Grid table={table} view={view} onTable={onTable} onOpen={setOpen} notify={notify} onFieldMenu={(f, el) => setPop({ kind: "field", id: f.id, ...anchor(el) })} onAddField={el => setPop({ kind: "addfield", ...anchor(el) })} />
          : <Kanban table={table} view={view} onTable={onTable} onOpen={setOpen} onGroup={id => onTable(t => updateView(t, view.id, { groupBy: id }))} />}</div>
      </section>
    </div>
    {pop?.kind === "field" && field(table, pop.id) && <div className="atb-float" style={{ left: pop.x, top: pop.y }}><FieldMenu {...panelProps} fieldId={pop.id} onClose={() => setPop(null)} onOptions={setOpts} /></div>}
    {pop?.kind === "addfield" && <div className="atb-float" style={{ left: pop.x, top: pop.y }}><AddFieldForm onClose={() => setPop(null)} onAdd={(name: string, type: FieldType) => { onTable(t => addField(t, name, type).table); track(EVENTS.app_field_added, { field_type: type }); }} /></div>}
    {opts && <OptionsDialog table={table} fieldId={opts} onTable={onTable} onClose={() => setOpts(null)} />}
    {open && <RecordModal table={table} recId={open} onTable={onTable} onClose={() => setOpen(null)} notify={notify} />}
    <input ref={fileRef} type="file" accept=".csv,text/csv" hidden data-testid="import-file" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const r = importCsv(base, f.name.replace(/\.csv$/i, ""), await f.text()); setStored(r.base); setPrefs(p => ({ ...p, table: r.table.id })); notify(`Imported ${r.table.records.length} records into “${r.table.name}”`); track(EVENTS.app_csv_imported, { records: r.table.records.length, fields: r.table.fields.length }); } catch (err) { notify((err as Error).message); } e.target.value = ""; }} />
    {toast && <div className="atb-toast" role="status" data-testid="toast">{toast}</div>}
  </div>;
}
