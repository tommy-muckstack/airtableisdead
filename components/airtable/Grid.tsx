"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { addRecord, duplicateRecord, parseInput, setCell, summarize, viewRecords, type Field, type Table, type Value, type View } from "@/lib/airtable/model";
import { CellEditor, CellView, TYPE_ICON } from "./Cell";

export type Sel = { rec: string; fld: string } | null;
export function Grid({ table, view, onTable, onOpen, onFieldMenu, onAddField, notify }: { table: Table; view: View; onTable: (f: (t: Table) => Table) => void; onOpen: (id: string) => void; onFieldMenu: (f: Field, el: HTMLElement) => void; onAddField: (el: HTMLElement) => void; notify: (m: string) => void }) {
  const fields = table.fields.filter(f => !view.hidden.includes(f.id)); const rows = useMemo(() => viewRecords(table, view), [table, view]);
  const [sel, setSel] = useState<Sel>(null); const [editing, setEditing] = useState<{ initial?: string } | null>(null); const [checked, setChecked] = useState<Set<string>>(new Set()); const [menu, setMenu] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { setChecked(c => new Set([...c].filter(id => rows.some(r => r.id === id)))); }, [rows]);
  const ri = sel ? rows.findIndex(r => r.id === sel.rec) : -1; const fi = sel ? fields.findIndex(f => f.id === sel.fld) : -1;
  const go = (dr: number, dc: number) => { if (!rows.length || !fields.length) return; const r = Math.max(0, Math.min(rows.length - 1, (ri < 0 ? 0 : ri) + dr)); const c = Math.max(0, Math.min(fields.length - 1, (fi < 0 ? 0 : fi) + dc)); setSel({ rec: rows[r].id, fld: fields[c].id }); };
  useEffect(() => { if (sel) root.current?.querySelector(`[data-cell="${sel.rec}:${sel.fld}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [sel]);
  const commit = (recId: string, f: Field, v: Value, keepOpen = false) => { onTable(t => setCell(t, recId, f.id, v)); if (!keepOpen) { setEditing(null); root.current?.focus(); } };
  const keydown = (e: React.KeyboardEvent) => {
    if (editing) return; const f = fields[fi]; const r = rows[ri];
    if (e.key === "ArrowDown") { e.preventDefault(); go(1, 0); } else if (e.key === "ArrowUp") { e.preventDefault(); go(-1, 0); } else if (e.key === "ArrowRight") { e.preventDefault(); go(0, 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(0, -1); }
    else if (e.key === "Tab") { e.preventDefault(); if (e.shiftKey) go(0, -1); else if (fi === fields.length - 1 && ri < rows.length - 1) setSel({ rec: rows[ri + 1].id, fld: fields[0].id }); else go(0, 1); }
    else if (!sel || !f || !r) return;
    else if (e.key === "Enter" || e.key === "F2") { e.preventDefault(); if (f.type === "checkbox") commit(r.id, f, !r.cells[f.id], true); else setEditing({}); }
    else if (e.key === " " && f.type === "checkbox") { e.preventDefault(); commit(r.id, f, !r.cells[f.id], true); }
    else if (e.key === " " && e.shiftKey) { e.preventDefault(); onOpen(r.id); }
    else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); const p = parseInput(f, ""); if ("value" in p) commit(r.id, f, f.type === "checkbox" ? false : p.value, true); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && ["text", "longtext", "number", "url", "date"].includes(f.type)) { e.preventDefault(); setEditing({ initial: e.key }); }
  };
  const sums = (f: Field) => { const s = summarize(table, view, f) as any; return f.type === "number" ? `Sum ${Math.round(s.sum * 100) / 100}` : f.type === "checkbox" ? `${s.checked} checked` : `${s.filled} filled`; };
  const add = () => { const r = addRecord(table, {}); onTable(() => r.table); setSel({ rec: r.record.id, fld: fields[0].id }); setTimeout(() => root.current?.focus(), 0); };
  const allChecked = rows.length > 0 && rows.every(r => checked.has(r.id));
  return <div className="atb-grid" ref={root} tabIndex={0} role="grid" aria-label={`${table.name} grid`} aria-rowcount={rows.length + 1} onKeyDown={keydown} data-testid="grid">
    <div className="atb-grid__scroll">
      <div className="atb-row atb-row--head" role="row"><div className="atb-gut"><input type="checkbox" aria-label="Select all rows" checked={allChecked} onChange={e => setChecked(e.target.checked ? new Set(rows.map(r => r.id)) : new Set())} /></div>
        {fields.map((f, i) => <div key={f.id} role="columnheader" className={"atb-cell atb-head" + (i === 0 ? " is-primary" : "")} data-testid="col-head"><span className="atb-ti" aria-hidden>{TYPE_ICON[f.type]}</span><span className="atb-head__n">{f.name}</span>
          <button className="atb-head__m" aria-label={`${f.name} field menu`} onClick={e => onFieldMenu(f, e.currentTarget)}>▾</button></div>)}
        <button className="atb-addfield" aria-label="Add field" onClick={e => onAddField(e.currentTarget)}>＋</button></div>
      {rows.map((r, n) => <div key={r.id} role="row" className={"atb-row" + (checked.has(r.id) ? " is-checked" : "")} data-testid="row" data-id={r.id}>
        <div className="atb-gut"><span className="atb-gut__n">{n + 1}</span><input type="checkbox" aria-label={`Select row ${n + 1}`} checked={checked.has(r.id)} onChange={e => setChecked(c => { const x = new Set(c); e.target.checked ? x.add(r.id) : x.delete(r.id); return x; })} />
          <button className="atb-gut__x" aria-label={`Expand row ${n + 1}`} onClick={() => onOpen(r.id)}>⤢</button>
          <button className="atb-gut__x" aria-label={`Row ${n + 1} menu`} onClick={() => setMenu(menu === r.id ? null : r.id)}>⋯</button>
          {menu === r.id && <div className="atb-menu atb-menu--row" role="menu" onMouseLeave={() => setMenu(null)}><button role="menuitem" onClick={() => { onOpen(r.id); setMenu(null); }}>Expand record</button><button role="menuitem" onClick={() => { onTable(t => duplicateRecord(t, r.id)); setMenu(null); }}>Duplicate record</button><button role="menuitem" className="is-danger" onClick={() => { onTable(t => ({ ...t, records: t.records.filter(x => x.id !== r.id) })); setMenu(null); notify("Record deleted"); }}>Delete record</button></div>}</div>
        {fields.map((f, i) => { const isSel = sel?.rec === r.id && sel.fld === f.id; const isEdit = isSel && editing;
          return <div key={f.id} role="gridcell" aria-selected={isSel} data-cell={`${r.id}:${f.id}`} className={"atb-cell" + (isSel ? " is-sel" : "") + (i === 0 ? " is-primary" : "") + (f.type === "longtext" ? " is-long" : "")}
            onMouseDown={(e) => { if ((e.target as HTMLElement).closest(".atb-pick")) return; setSel({ rec: r.id, fld: f.id }); if (editing) setEditing(null); }} onClick={(e) => { if ((e.target as HTMLElement).closest(".atb-pick")) return; if (f.type === "checkbox") commit(r.id, f, !r.cells[f.id], true); }} onDoubleClick={() => { if (f.type !== "checkbox") setEditing({}); }}>
            {isEdit ? <CellEditor f={f} v={r.cells[f.id]} initial={editing.initial} onCommit={(v) => commit(r.id, f, v, f.type === "multiselect")} onCancel={() => { setEditing(null); root.current?.focus(); }} onError={notify} /> : <CellView f={f} v={r.cells[f.id]} />}</div>; })}</div>)}
      <button className="atb-row atb-row--add" onClick={add} data-testid="add-row" aria-label="Add record"><div className="atb-gut">＋</div><span className="ids-muted">Add record</span></button>
      <div className="atb-row atb-row--sum" aria-label="Summary"><div className="atb-gut" />{fields.map(f => <div key={f.id} className="atb-cell ids-muted">{sums(f)}</div>)}</div>
    </div>
    {checked.size > 0 && <div className="atb-bulk" role="status"><b>{checked.size} selected</b><button className="iconbtn" onClick={() => { onTable(t => ({ ...t, records: t.records.filter(r => !checked.has(r.id)) })); notify(`${checked.size} record${checked.size > 1 ? "s" : ""} deleted`); setChecked(new Set()); }}>Delete</button><button className="iconbtn" onClick={() => setChecked(new Set())}>Clear</button></div>}
    <div className="atb-foot ids-muted" data-testid="count">{rows.length} record{rows.length === 1 ? "" : "s"}{rows.length !== table.records.length ? ` (filtered from ${table.records.length})` : ""}</div>
  </div>;
}
