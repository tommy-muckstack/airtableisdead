"use client";
import { useEffect, useRef, useState } from "react";
import { display, parseInput, type Field, type Value } from "@/lib/airtable/model";

export const TYPE_ICON: Record<string, string> = { text: "A", longtext: "¶", number: "#", checkbox: "☑", select: "◉", multiselect: "☰", date: "▦", url: "↗" };

export function Chips({ f, v }: { f: Field; v: Value | undefined }) {
  const ids = f.type === "select" ? (v ? [v as string] : []) : f.type === "multiselect" ? (v as string[] ?? []) : [];
  return <>{ids.map(id => { const o = f.options?.find(o => o.id === id); return o ? <span key={id} className="atb-chip" style={{ background: o.color }}>{o.name}</span> : null; })}</>;
}
export function CellView({ f, v }: { f: Field; v: Value | undefined }) {
  if (f.type === "select" || f.type === "multiselect") return <span className="atb-chips"><Chips f={f} v={v} /></span>;
  if (f.type === "checkbox") return <span className={"atb-box" + (v ? " on" : "")} aria-label={v ? "Checked" : "Unchecked"}>{v ? "✓" : ""}</span>;
  if (f.type === "url" && v) return <a href={String(v)} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()}>{String(v)}</a>;
  if (f.type === "number") return <span style={{ display: "block", textAlign: "right" }}>{display(f, v ?? null)}</span>;
  return <span>{display(f, v ?? null)}</span>;
}
/** Editor for one cell. Commits on Enter/blur, cancels on Escape. Select-like fields open an options list. */
export function CellEditor({ f, v, initial, onCommit, onCancel, onError }: { f: Field; v: Value | undefined; initial?: string; onCommit: (v: Value) => void; onCancel: () => void; onError: (m: string) => void }) {
  const raw = initial ?? (f.type === "checkbox" ? "" : f.type === "select" || f.type === "multiselect" ? "" : v == null ? "" : String(v));
  const [text, setText] = useState(raw); const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); if (initial === undefined) ref.current?.select?.(); }, []); // eslint-disable-line
  const commit = (s: string) => { const p = parseInput(f, s); if ("error" in p) { onError(p.error); return false; } onCommit(p.value); return true; };
  if (f.type === "select") return <div className="atb-pick" role="listbox" aria-label={`${f.name} options`}><button onClick={() => onCommit(null)} className="atb-pick__none">Clear</button>{f.options?.map(o => <button key={o.id} role="option" aria-selected={v === o.id} onClick={() => onCommit(o.id)}><span className="atb-chip" style={{ background: o.color }}>{o.name}</span></button>)}
    <button className="atb-pick__none" onClick={onCancel}>Close</button></div>;
  if (f.type === "multiselect") { const cur = (v as string[]) ?? []; return <div className="atb-pick" role="listbox" aria-label={`${f.name} options`}>{f.options?.map(o => <label key={o.id}><input type="checkbox" checked={cur.includes(o.id)} onChange={e => onCommit(e.target.checked ? [...cur, o.id] : cur.filter(x => x !== o.id), )} /><span className="atb-chip" style={{ background: o.color }}>{o.name}</span></label>)}<button className="atb-pick__none" onClick={onCancel}>Done</button></div>; }
  const common = { ref: ref as any, value: text, onChange: (e: any) => setText(e.target.value), "aria-label": `Edit ${f.name}`, className: "atb-edit",
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onCancel(); } else if (e.key === "Enter" && !(f.type === "longtext" && e.shiftKey)) { e.preventDefault(); e.stopPropagation(); if (commit(text)) { /* committed */ } } else if (e.key === "Tab") { /* grid handles after blur */ } },
    onBlur: () => { const p = parseInput(f, text); if ("value" in p) { if (JSON.stringify(p.value) !== JSON.stringify(v ?? null) && !(p.value == null && v == null)) onCommit(p.value); else onCancel(); } else onCancel(); } };
  if (f.type === "longtext") return <textarea {...common} rows={3} />;
  return <input {...common} type={f.type === "number" ? "text" : f.type === "date" ? "date" : "text"} inputMode={f.type === "number" ? "decimal" : undefined} />;
}
