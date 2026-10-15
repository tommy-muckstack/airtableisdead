"use client";
import { useState } from "react";
import { COLORS, FIELD_TYPES, OPS_BY_TYPE, changeFieldType, deleteField, field, newOpt, renameField, setOptions, uid, updateView, type Field, type FieldType, type Filter, type Table, type View } from "@/lib/airtable/model";
import { CellEditor, CellView, TYPE_ICON } from "./Cell";

type TP = { table: Table; view: View; onTable: (f: (t: Table) => Table) => void };
const patch = (p: TP, v: Partial<View>) => p.onTable(t => updateView(t, p.view.id, v));

export function FilterPanel(p: TP) {
  const { table, view } = p;
  const add = () => patch(p, { filters: [...view.filters, { id: uid("flt"), fieldId: table.fields[0].id, op: OPS_BY_TYPE[table.fields[0].type][0].op, value: "" }] });
  const upd = (id: string, x: Partial<Filter>) => patch(p, { filters: view.filters.map(f => (f.id === id ? { ...f, ...x } : f)) });
  return <div className="atb-panel" role="dialog" aria-label="Filter records" data-testid="filter-panel">
    {!view.filters.length && <p className="ids-muted" style={{ margin: 0 }}>No filter conditions are applied</p>}
    {view.filters.map((f, i) => { const fd = field(table, f.fieldId) ?? table.fields[0]; const ops = OPS_BY_TYPE[fd.type]; const op = ops.find(o => o.op === f.op) ?? ops[0];
      return <div key={f.id} className="atb-cond">
        {i === 0 ? <span className="ids-muted">Where</span> : i === 1 ? <select aria-label="Conjunction" value={view.conjunction} onChange={e => patch(p, { conjunction: e.target.value as "and" | "or" })}><option value="and">and</option><option value="or">or</option></select> : <span className="ids-muted">{view.conjunction}</span>}
        <select aria-label="Filter field" value={fd.id} onChange={e => { const nf = field(table, e.target.value)!; upd(f.id, { fieldId: nf.id, op: OPS_BY_TYPE[nf.type][0].op, value: "" }); }}>{table.fields.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select aria-label="Filter operator" value={op.op} onChange={e => upd(f.id, { op: e.target.value as Filter["op"] })}>{ops.map(o => <option key={o.op} value={o.op}>{o.label}</option>)}</select>
        {op.needsValue && (fd.type === "select" || fd.type === "multiselect" ? <select aria-label="Filter value" value={f.value} onChange={e => upd(f.id, { value: e.target.value })}><option value="">choose…</option>{fd.options?.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}</select>
          : <input className="atb-in" aria-label="Filter value" type={fd.type === "date" ? "date" : "text"} value={f.value} onChange={e => upd(f.id, { value: e.target.value })} placeholder="value" />)}
        <button className="iconbtn" aria-label="Remove condition" onClick={() => patch(p, { filters: view.filters.filter(x => x.id !== f.id) })}>✕</button></div>; })}
    <button className="iconbtn" onClick={add} data-testid="add-filter">＋ Add condition</button></div>;
}
export function SortPanel(p: TP) {
  const { table, view } = p; const unused = table.fields.filter(f => !view.sorts.some(s => s.fieldId === f.id));
  return <div className="atb-panel" role="dialog" aria-label="Sort records">
    {!view.sorts.length && <p className="ids-muted" style={{ margin: 0 }}>No sorts applied</p>}
    {view.sorts.map((s, i) => <div key={s.fieldId} className="atb-cond"><span className="ids-muted">{i ? "then" : "Sort by"}</span>
      <select aria-label="Sort field" value={s.fieldId} onChange={e => patch(p, { sorts: view.sorts.map((x, k) => (k === i ? { ...x, fieldId: e.target.value } : x)) })}>{table.fields.filter(f => f.id === s.fieldId || unused.includes(f)).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
      <select aria-label="Sort direction" value={s.dir} onChange={e => patch(p, { sorts: view.sorts.map((x, k) => (k === i ? { ...x, dir: e.target.value as "asc" | "desc" } : x)) })}><option value="asc">{field(table, s.fieldId)?.type === "number" ? "1 → 9" : "A → Z"}</option><option value="desc">{field(table, s.fieldId)?.type === "number" ? "9 → 1" : "Z → A"}</option></select>
      <button className="iconbtn" aria-label="Remove sort" onClick={() => patch(p, { sorts: view.sorts.filter((_, k) => k !== i) })}>✕</button></div>)}
    {unused.length > 0 && <button className="iconbtn" onClick={() => patch(p, { sorts: [...view.sorts, { fieldId: unused[0].id, dir: "asc" }] })}>＋ Pick a field to sort by</button>}</div>;
}
export function HidePanel(p: TP) {
  const { table, view } = p;
  return <div className="atb-panel" role="dialog" aria-label="Hide fields">{table.fields.map((f, i) => <label key={f.id} className="atb-hide"><input type="checkbox" disabled={i === 0} checked={!view.hidden.includes(f.id)} onChange={e => patch(p, { hidden: e.target.checked ? view.hidden.filter(h => h !== f.id) : [...view.hidden, f.id] })} /><span className="atb-ti">{TYPE_ICON[f.type]}</span>{f.name}</label>)}
    <div className="atb-panel__row"><button className="iconbtn" onClick={() => patch(p, { hidden: table.fields.slice(1).map(f => f.id) })}>Hide all</button><button className="iconbtn" onClick={() => patch(p, { hidden: [] })}>Show all</button></div></div>;
}
export function GroupPanel(p: TP) {
  const { table, view } = p; return <div className="atb-panel" role="dialog" aria-label="Group kanban by"><label className="atb-cond"><span className="ids-muted">Stacked by</span><select aria-label="Group by field" value={view.groupBy ?? ""} onChange={e => patch(p, { groupBy: e.target.value || null })}><option value="">choose a field…</option>{table.fields.filter(f => f.type === "select").map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label></div>;
}

/** Field header menu (rename, type, options, sort, hide, delete) and the Add field form share one popover. */
export function FieldMenu({ table, view, fieldId, onTable, onClose, onOptions }: TP & { fieldId: string; onClose: () => void; onOptions: (id: string) => void }) {
  const f = field(table, fieldId)!; const [name, setName] = useState(f.name); const primary = table.fields[0].id === f.id;
  return <div className="atb-panel atb-panel--menu" role="menu" aria-label={`${f.name} field`}>
    <label className="atb-lbl">Name<input className="atb-in" aria-label="Field name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { onTable(t => renameField(t, f.id, name)); onClose(); } }} onBlur={() => onTable(t => renameField(t, f.id, name))} /></label>
    <label className="atb-lbl">Type<select aria-label="Field type" value={f.type} onChange={e => onTable(t => changeFieldType(t, f.id, e.target.value as FieldType))}>{FIELD_TYPES.filter(t => !primary || ["text", "longtext", "number", "date", "url"].includes(t.id)).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
    {(f.type === "select" || f.type === "multiselect") && <button role="menuitem" onClick={() => { onOptions(f.id); onClose(); }}>Edit options…</button>}
    <button role="menuitem" onClick={() => { onTable(t => updateView(t, view.id, { sorts: [{ fieldId: f.id, dir: "asc" }] })); onClose(); }}>Sort A → Z</button>
    <button role="menuitem" onClick={() => { onTable(t => updateView(t, view.id, { sorts: [{ fieldId: f.id, dir: "desc" }] })); onClose(); }}>Sort Z → A</button>
    {!primary && <button role="menuitem" onClick={() => { onTable(t => updateView(t, view.id, { hidden: [...view.hidden, f.id] })); onClose(); }}>Hide field</button>}
    {!primary && <button role="menuitem" className="is-danger" onClick={() => { onTable(t => deleteField(t, f.id)); onClose(); }}>Delete field</button>}</div>;
}
export function AddFieldForm({ onAdd, onClose }: { onAdd: (name: string, type: FieldType) => void; onClose: () => void }) {
  const [name, setName] = useState(""); const [type, setType] = useState<FieldType>("text");
  return <form className="atb-panel atb-panel--menu" aria-label="Add field" onSubmit={e => { e.preventDefault(); onAdd(name, type); onClose(); }}>
    <label className="atb-lbl">Field name<input className="atb-in" autoFocus aria-label="New field name" value={name} onChange={e => setName(e.target.value)} placeholder="Field name" /></label>
    <label className="atb-lbl">Type<select aria-label="New field type" value={type} onChange={e => setType(e.target.value as FieldType)}>{FIELD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
    <div className="atb-panel__row"><button type="button" className="iconbtn" onClick={onClose}>Cancel</button><button className="ids-btn ids-btn--primary ids-btn--sm">Create field</button></div></form>;
}
export function OptionsDialog({ table, fieldId, onTable, onClose }: { table: Table; fieldId: string; onTable: (f: (t: Table) => Table) => void; onClose: () => void }) {
  const f = field(table, fieldId)!; const opts = f.options ?? []; const [nn, setNn] = useState("");
  const set = (o: typeof opts) => onTable(t => setOptions(t, fieldId, o));
  return <div className="atb-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="atb-modal" role="dialog" aria-label={`Options for ${f.name}`} onKeyDown={e => e.key === "Escape" && onClose()}>
    <h3>Options for “{f.name}”</h3>
    {opts.map((o, i) => <div key={o.id} className="atb-cond"><span className="atb-chip" style={{ background: o.color }}>&nbsp;</span>
      <input className="atb-in" aria-label={`Option ${i + 1} name`} value={o.name} onChange={e => set(opts.map(x => (x.id === o.id ? { ...x, name: e.target.value } : x)))} />
      <select aria-label={`Option ${i + 1} color`} value={o.color} onChange={e => set(opts.map(x => (x.id === o.id ? { ...x, color: e.target.value } : x)))}>{COLORS.map((c, k) => <option key={c} value={c}>Color {k + 1}</option>)}</select>
      <button className="iconbtn" aria-label={`Delete option ${o.name}`} onClick={() => set(opts.filter(x => x.id !== o.id))}>✕</button></div>)}
    <form className="atb-cond" onSubmit={e => { e.preventDefault(); if (nn.trim()) { set([...opts, newOpt(nn.trim(), opts.length)]); setNn(""); } }}><input className="atb-in" aria-label="New option" placeholder="Add an option" value={nn} onChange={e => setNn(e.target.value)} /><button className="iconbtn">Add</button></form>
    <div className="atb-panel__row"><button className="ids-btn ids-btn--primary ids-btn--sm" onClick={onClose}>Done</button></div></div></div>;
}
export function RecordModal({ table, recId, onTable, onClose, notify }: { table: Table; recId: string; onTable: (f: (t: Table) => Table) => void; onClose: () => void; notify: (m: string) => void }) {
  const r = table.records.find(x => x.id === recId); const [edit, setEdit] = useState<string | null>(null); if (!r) return null; const idx = table.records.findIndex(x => x.id === recId);
  return <div className="atb-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="atb-modal atb-record" role="dialog" aria-label="Record" data-testid="record" onKeyDown={e => e.key === "Escape" && !edit && onClose()}>
    <header><h3>{String(r.cells[table.fields[0].id] ?? "") || "Untitled"}</h3><span className="ids-muted">Record {idx + 1} of {table.records.length}</span><span style={{ flex: 1 }} />
      <button className="iconbtn" aria-label="Close" onClick={onClose}>✕</button></header>
    <div className="atb-record__body">{table.fields.map(f => <div key={f.id} className="atb-record__f"><label><span className="atb-ti">{TYPE_ICON[f.type]}</span>{f.name}</label>
      <div className="atb-record__v">{f.type === "checkbox" ? <input type="checkbox" aria-label={f.name} checked={!!r.cells[f.id]} onChange={e => onTable(t => ({ ...t, records: t.records.map(x => (x.id === r.id ? { ...x, cells: { ...x.cells, [f.id]: e.target.checked } } : x)) }))} />
        : <RecordField f={f} v={r.cells[f.id]} open={edit === f.id} setOpen={o => setEdit(o ? f.id : null)} onCommit={v => onTable(t => ({ ...t, records: t.records.map(x => (x.id === r.id ? { ...x, cells: { ...x.cells, [f.id]: v } } : x)) }))} notify={notify} />}</div></div>)}</div>
    <footer><button className="iconbtn is-danger" onClick={() => { onTable(t => ({ ...t, records: t.records.filter(x => x.id !== r.id) })); onClose(); notify("Record deleted"); }}>Delete record</button></footer></div></div>;
}
function RecordField({ f, v, open, setOpen, onCommit, notify }: { f: Field; v: any; open: boolean; setOpen: (o: boolean) => void; onCommit: (v: any) => void; notify: (m: string) => void }) {
  if (open) return <CellEditor f={f} v={v} onCommit={nv => { onCommit(nv); if (f.type !== "multiselect") setOpen(false); }} onCancel={() => setOpen(false)} onError={notify} />;
  return <button className="atb-record__btn" onClick={() => setOpen(true)} aria-label={`Edit ${f.name}`}><CellView f={f} v={v} />{(v == null || v === "" || (Array.isArray(v) && !v.length)) && <span className="ids-muted">Empty</span>}</button>;
}
