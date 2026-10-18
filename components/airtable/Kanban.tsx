"use client";
import { useState } from "react";
import { addRecord, display, field, kanbanLanes, moveCard, newOpt, setOptions, type Table, type View } from "@/lib/airtable/model";
import { Chips } from "./Cell";
import { track, EVENTS } from "@/lib/analytics";

export function Kanban({ table, view, onTable, onOpen, onGroup }: { table: Table; view: View; onTable: (f: (t: Table) => Table) => void; onOpen: (id: string) => void; onGroup: (fieldId: string) => void }) {
  const [over, setOver] = useState<string | null>(null); const [stack, setStack] = useState("");
  const g = field(table, view.groupBy); const lanes = kanbanLanes(table, view); const primary = table.fields[0];
  const selects = table.fields.filter(f => f.type === "select");
  if (!g || g.type !== "select") return <div className="atb-empty" data-testid="kanban-setup"><h3>Group this kanban by a single select field</h3>{selects.length ? <div className="atb-empty__row">{selects.map(f => <button key={f.id} className="ids-btn ids-btn--outline" onClick={() => onGroup(f.id)}>{f.name}</button>)}</div> : <p className="ids-muted">Add a single select field first (the + at the end of the grid header).</p>}</div>;
  const shown = table.fields.filter(f => f.id !== primary.id && f.id !== g.id && !view.hidden.includes(f.id)).slice(0, 3);
  return <div className="atb-kanban" data-testid="kanban">
    {lanes.map(l => <section key={l.id ?? "none"} className={"atb-lane" + (over === (l.id ?? "none") ? " is-over" : "")} data-lane={l.name}
      onDragOver={e => { e.preventDefault(); setOver(l.id ?? "none"); }} onDragLeave={() => setOver(null)} onDrop={e => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) onTable(t => moveCard(t, id, g.id, l.id)); }}>
      <header><span className="atb-chip" style={{ background: l.color }}>{l.name}</span><span className="ids-muted">{l.records.length}</span></header>
      {l.records.map(r => <article key={r.id} draggable className="atb-card" data-testid="card" data-id={r.id} onDragStart={e => e.dataTransfer.setData("text/plain", r.id)} onClick={() => onOpen(r.id)}>
        <div className="atb-card__t">{display(primary, r.cells[primary.id] ?? null) || <span className="ids-muted">Untitled</span>}</div>
        {shown.map(f => { const v = r.cells[f.id]; if (v == null || v === "" || (Array.isArray(v) && !v.length) || v === false) return null;
          return <div key={f.id} className="atb-card__f"><span className="ids-muted">{f.name}</span>{f.type === "select" || f.type === "multiselect" ? <span className="atb-chips"><Chips f={f} v={v} /></span> : <span>{display(f, v)}</span>}</div>; })}
      </article>)}
      <button className="atb-lane__add" aria-label={`Add card to ${l.name}`} onClick={() => { const r = addRecord(table, l.id ? { [g.id]: l.id } : {}); onTable(() => r.table); track(EVENTS.app_record_created, { source: "kanban" }); onOpen(r.record.id); }}>＋ Add card</button>
    </section>)}
    <form className="atb-lane atb-lane--new" onSubmit={e => { e.preventDefault(); const nm = stack.trim(); if (!nm) return; onTable(t => setOptions(t, g.id, [...(field(t, g.id)?.options ?? []), newOpt(nm, field(t, g.id)?.options?.length ?? 0)])); setStack(""); }}>
      <input className="ids-input" aria-label="New stack name" placeholder="＋ Add stack" value={stack} onChange={e => setStack(e.target.value)} /></form>
  </div>;
}
