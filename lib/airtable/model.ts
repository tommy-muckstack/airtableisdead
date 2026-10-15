// AirtableIsDead core: one base of typed tables with grid and kanban views. Pure functions over JSON so they are easy to test and persist.
export type FieldType = "text" | "longtext" | "number" | "checkbox" | "select" | "multiselect" | "date" | "url";
export const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: "text", label: "Single line text" }, { id: "longtext", label: "Long text" }, { id: "number", label: "Number" }, { id: "checkbox", label: "Checkbox" },
  { id: "select", label: "Single select" }, { id: "multiselect", label: "Multiple select" }, { id: "date", label: "Date" }, { id: "url", label: "URL" },
];
export const COLORS = ["#CFDFFF", "#D0F0FD", "#C2F5E9", "#D1F7C4", "#FFEAB6", "#FEE2D5", "#FFDAF6", "#EDE2FE", "#E5E9F0"];
export type Opt = { id: string; name: string; color: string };
export type Field = { id: string; name: string; type: FieldType; options?: Opt[] };
export type Value = string | number | boolean | string[] | null;
export type Rec = { id: string; cells: Record<string, Value>; createdAt: string };
export type FilterOp = "contains" | "not_contains" | "is" | "is_not" | "empty" | "not_empty" | "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "checked" | "unchecked" | "before" | "after";
export type Filter = { id: string; fieldId: string; op: FilterOp; value: string };
export type Sort = { fieldId: string; dir: "asc" | "desc" };
export type View = { id: string; name: string; type: "grid" | "kanban"; filters: Filter[]; conjunction: "and" | "or"; sorts: Sort[]; hidden: string[]; groupBy: string | null; search?: string };
export type Table = { id: string; name: string; fields: Field[]; records: Rec[]; views: View[] };
export type Base = { id: string; name: string; tables: Table[] };

let n = 0; export const uid = (p: string) => `${p}_${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const iso = (d: Date) => d.toISOString();

export const OPS_BY_TYPE: Record<FieldType, { op: FilterOp; label: string; needsValue: boolean }[]> = (() => {
  const t = [{ op: "contains" as const, label: "contains", needsValue: true }, { op: "not_contains" as const, label: "does not contain", needsValue: true }, { op: "is" as const, label: "is", needsValue: true }, { op: "is_not" as const, label: "is not", needsValue: true }, { op: "empty" as const, label: "is empty", needsValue: false }, { op: "not_empty" as const, label: "is not empty", needsValue: false }];
  const num = [{ op: "eq" as const, label: "=", needsValue: true }, { op: "neq" as const, label: "≠", needsValue: true }, { op: "gt" as const, label: ">", needsValue: true }, { op: "lt" as const, label: "<", needsValue: true }, { op: "gte" as const, label: "≥", needsValue: true }, { op: "lte" as const, label: "≤", needsValue: true }, t[4], t[5]];
  const sel = [{ op: "is" as const, label: "is", needsValue: true }, { op: "is_not" as const, label: "is not", needsValue: true }, { op: "contains" as const, label: "has", needsValue: true }, t[4], t[5]];
  return { text: t, longtext: t, url: t, number: num, checkbox: [{ op: "checked", label: "is checked", needsValue: false }, { op: "unchecked", label: "is unchecked", needsValue: false }], select: sel.filter(o => o.op !== "contains"), multiselect: [sel[2], { op: "not_contains", label: "does not have", needsValue: true }, t[4], t[5]], date: [{ op: "is", label: "is", needsValue: true }, { op: "before", label: "is before", needsValue: true }, { op: "after", label: "is after", needsValue: true }, t[4], t[5]] } as any;
})();

export const field = (t: Table, id: string | null | undefined) => t.fields.find(f => f.id === id);
export const newOpt = (name: string, i: number): Opt => ({ id: uid("opt"), name, color: COLORS[i % COLORS.length] });
const emptyValue = (type: FieldType): Value => (type === "checkbox" ? false : type === "multiselect" ? [] : null);

// ---- values ----
/** Turn what a person typed into the stored value for a field type. Returns { error } for text that can't be that type. */
export function parseInput(f: Field, raw: string): { value: Value } | { error: string } {
  const s = raw.trim();
  switch (f.type) {
    case "text": case "longtext": return { value: raw === "" ? null : raw };
    case "url": if (!s) return { value: null }; return /^https?:\/\/\S+$/i.test(s) ? { value: s } : /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s) ? { value: "https://" + s } : { error: "Enter a full URL, like https://example.com" };
    case "number": { if (!s) return { value: null }; const v = Number(s.replace(/[$,\s]/g, "")); return Number.isFinite(v) ? { value: v } : { error: "That isn't a number" }; }
    case "checkbox": return { value: /^(true|yes|1|x|✓|checked)$/i.test(s) };
    case "date": { if (!s) return { value: null }; const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T00:00:00Z") : new Date(s); if (isNaN(+d)) return { error: "Use a date like 2026-10-31" }; return { value: d.toISOString().slice(0, 10) }; }
    case "select": { if (!s) return { value: null }; const o = f.options?.find(o => o.name.toLowerCase() === s.toLowerCase() || o.id === s); return o ? { value: o.id } : { error: `“${s}” isn't one of the options` }; }
    case "multiselect": { if (!s) return { value: [] }; const ids: string[] = []; for (const part of s.split(",").map(x => x.trim()).filter(Boolean)) { const o = f.options?.find(o => o.name.toLowerCase() === part.toLowerCase() || o.id === part); if (!o) return { error: `“${part}” isn't one of the options` }; if (!ids.includes(o.id)) ids.push(o.id); } return { value: ids }; }
  }
}
export function display(f: Field, v: Value | undefined): string {
  if (v == null || v === "") return f.type === "checkbox" ? "☐" : "";
  switch (f.type) {
    case "checkbox": return v ? "☑" : "☐";
    case "select": return f.options?.find(o => o.id === v)?.name ?? "";
    case "multiselect": return (v as string[]).map(id => f.options?.find(o => o.id === id)?.name).filter(Boolean).join(", ");
    case "number": return typeof v === "number" ? String(v) : "";
    default: return String(v);
  }
}

// ---- tables, fields, records ----
export const defaultView = (name = "Grid view", type: View["type"] = "grid", groupBy: string | null = null): View => ({ id: uid("viw"), name, type, filters: [], conjunction: "and", sorts: [], hidden: [], groupBy });
export function createTable(base: Base, name: string): { base: Base; table: Table } {
  const nm = name.trim() || "Untitled table"; const f: Field = { id: uid("fld"), name: "Name", type: "text" };
  const table: Table = { id: uid("tbl"), name: nm, fields: [f], records: [], views: [defaultView()] };
  table.records = [1, 2, 3].map(() => newRecord(table));
  return { base: { ...base, tables: [...base.tables, table] }, table };
}
export const newRecord = (t: Table, now = new Date(), cells: Record<string, Value> = {}): Rec => ({ id: uid("rec"), cells: { ...Object.fromEntries(t.fields.map(f => [f.id, emptyValue(f.type)])), ...cells }, createdAt: iso(now) });
export const mapTable = (b: Base, tid: string, fn: (t: Table) => Table): Base => ({ ...b, tables: b.tables.map(t => (t.id === tid ? fn(t) : t)) });
export const renameTable = (b: Base, tid: string, name: string) => mapTable(b, tid, t => ({ ...t, name: name.trim() || t.name }));
export const deleteTable = (b: Base, tid: string): Base => (b.tables.length > 1 ? { ...b, tables: b.tables.filter(t => t.id !== tid) } : b);
export function addField(t: Table, name: string, type: FieldType): { table: Table; field: Field } {
  let nm = name.trim() || "Field"; let k = 2; while (t.fields.some(f => f.name.toLowerCase() === nm.toLowerCase())) nm = `${name.trim() || "Field"} ${k++}`;
  const f: Field = { id: uid("fld"), name: nm, type, ...(type === "select" || type === "multiselect" ? { options: [newOpt("Option 1", 0), newOpt("Option 2", 1)] } : {}) };
  return { field: f, table: { ...t, fields: [...t.fields, f], records: t.records.map(r => ({ ...r, cells: { ...r.cells, [f.id]: emptyValue(type) } })) } };
}
export const renameField = (t: Table, id: string, name: string): Table => { const nm = name.trim(); if (!nm || t.fields.some(f => f.id !== id && f.name.toLowerCase() === nm.toLowerCase())) return t; return { ...t, fields: t.fields.map(f => (f.id === id ? { ...f, name: nm } : f)) }; };
export function deleteField(t: Table, id: string): Table {
  if (t.fields.length <= 1 || t.fields[0].id === id) return t; // the primary field stays
  return { ...t, fields: t.fields.filter(f => f.id !== id), records: t.records.map(r => { const { [id]: _, ...cells } = r.cells; return { ...r, cells }; }),
    views: t.views.map(v => ({ ...v, filters: v.filters.filter(x => x.fieldId !== id), sorts: v.sorts.filter(s => s.fieldId !== id), hidden: v.hidden.filter(h => h !== id), groupBy: v.groupBy === id ? null : v.groupBy })) };
}
/** Change a field's type, converting existing values where it makes sense (anything else becomes empty). */
export function changeFieldType(t: Table, id: string, type: FieldType): Table {
  const f = field(t, id); if (!f || f.type === type || t.fields[0].id === id && !["text", "longtext", "number", "date", "url"].includes(type)) return t;
  let options = f.options; const toOpt = type === "select" || type === "multiselect";
  const labelOf = (v: Value) => display(f, v);
  if (toOpt && !options?.length) { const names = [...new Set(t.records.flatMap(r => labelOf(r.cells[id]).split(/,\s*/)).filter(Boolean))].slice(0, 20); options = names.length ? names.map(newOpt) : [newOpt("Option 1", 0)]; }
  const nf: Field = { ...f, type, ...(toOpt ? { options } : { options: undefined }) };
  const conv = (v: Value | undefined): Value => {
    const txt = labelOf(v ?? null); if (v == null || txt === "") return emptyValue(type);
    const p = parseInput(nf, txt); return "value" in p ? p.value : emptyValue(type);
  };
  const viewsFix = t.views.map(v => ({ ...v, filters: v.filters.filter(x => x.fieldId !== id), groupBy: v.groupBy === id && type !== "select" ? null : v.groupBy }));
  return { ...t, fields: t.fields.map(x => (x.id === id ? nf : x)), records: t.records.map(r => ({ ...r, cells: { ...r.cells, [id]: conv(r.cells[id]) } })), views: viewsFix };
}
export function setOptions(t: Table, fieldId: string, options: Opt[]): Table {
  const keep = new Set(options.map(o => o.id));
  return { ...t, fields: t.fields.map(f => (f.id === fieldId ? { ...f, options } : f)), records: t.records.map(r => { const v = r.cells[fieldId]; const nv = Array.isArray(v) ? v.filter(x => keep.has(x)) : typeof v === "string" && !keep.has(v) ? null : v; return nv === v ? r : { ...r, cells: { ...r.cells, [fieldId]: nv as Value } }; }) };
}
export const addRecord = (t: Table, cells: Record<string, Value> = {}, now = new Date()): { table: Table; record: Rec } => { const record = newRecord(t, now, cells); return { record, table: { ...t, records: [...t.records, record] } }; };
export const setCell = (t: Table, recId: string, fieldId: string, value: Value): Table => ({ ...t, records: t.records.map(r => (r.id === recId ? { ...r, cells: { ...r.cells, [fieldId]: value } } : r)) });
export const deleteRecords = (t: Table, ids: string[]): Table => ({ ...t, records: t.records.filter(r => !ids.includes(r.id)) });
export const duplicateRecord = (t: Table, id: string, now = new Date()): Table => { const i = t.records.findIndex(r => r.id === id); if (i < 0) return t; const c: Rec = { id: uid("rec"), cells: JSON.parse(JSON.stringify(t.records[i].cells)), createdAt: iso(now) }; return { ...t, records: [...t.records.slice(0, i + 1), c, ...t.records.slice(i + 1)] }; };

// ---- views ----
export const addView = (t: Table, name: string, type: View["type"]): { table: Table; view: View } => {
  const sel = t.fields.find(f => f.type === "select"); const view = defaultView(name.trim() || (type === "grid" ? "Grid view" : "Kanban"), type, type === "kanban" ? sel?.id ?? null : null);
  return { view, table: { ...t, views: [...t.views, view] } };
};
export const updateView = (t: Table, id: string, patch: Partial<View>): Table => ({ ...t, views: t.views.map(v => (v.id === id ? { ...v, ...patch } : v)) });
export const deleteView = (t: Table, id: string): Table => (t.views.length > 1 ? { ...t, views: t.views.filter(v => v.id !== id) } : t);

const cmpVal = (f: Field, a: Value | undefined, b: Value | undefined) => {
  const ea = a == null || a === "" || (Array.isArray(a) && !a.length), eb = b == null || b === "" || (Array.isArray(b) && !b.length);
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1; // empties always last (handled by caller for desc)
  if (f.type === "number") return (a as number) - (b as number);
  if (f.type === "checkbox") return Number(a) - Number(b);
  return display(f, a ?? null).localeCompare(display(f, b ?? null), undefined, { numeric: true, sensitivity: "base" });
};
export function matchesFilter(t: Table, r: Rec, flt: Filter): boolean {
  const f = field(t, flt.fieldId); if (!f) return true; const v = r.cells[f.id]; const q = flt.value.trim().toLowerCase();
  const empty = v == null || v === "" || (Array.isArray(v) && !v.length); const shown = display(f, v ?? null).toLowerCase();
  switch (flt.op) {
    case "empty": return f.type === "checkbox" ? !v : empty;
    case "not_empty": return f.type === "checkbox" ? !!v : !empty;
    case "checked": return !!v; case "unchecked": return !v;
    case "contains": if (f.type === "multiselect") return (v as string[]).some(id => f.options?.find(o => o.id === id)?.name.toLowerCase() === q); return shown.includes(q);
    case "not_contains": if (f.type === "multiselect") return !(v as string[]).some(id => f.options?.find(o => o.id === id)?.name.toLowerCase() === q); return !shown.includes(q);
    case "is": return f.type === "select" ? f.options?.find(o => o.id === v)?.name.toLowerCase() === q : shown === q;
    case "is_not": return f.type === "select" ? f.options?.find(o => o.id === v)?.name.toLowerCase() !== q : shown !== q;
    case "eq": case "neq": case "gt": case "lt": case "gte": case "lte": { if (typeof v !== "number") return flt.op === "neq"; const x = Number(q); if (!Number.isFinite(x)) return true; return flt.op === "eq" ? v === x : flt.op === "neq" ? v !== x : flt.op === "gt" ? v > x : flt.op === "lt" ? v < x : flt.op === "gte" ? v >= x : v <= x; }
    case "before": return typeof v === "string" && !!q && v < q; case "after": return typeof v === "string" && !!q && v > q;
  }
}
/** Records as seen through a view: search, then filters (and/or), then sorts (empties last). */
export function viewRecords(t: Table, v: View): Rec[] {
  let rs = t.records; const s = (v.search ?? "").trim().toLowerCase();
  if (s) rs = rs.filter(r => t.fields.some(f => display(f, r.cells[f.id] ?? null).toLowerCase().includes(s)));
  const active = v.filters.filter(f => field(t, f.fieldId));
  if (active.length) rs = rs.filter(r => (v.conjunction === "and" ? active.every(f => matchesFilter(t, r, f)) : active.some(f => matchesFilter(t, r, f))));
  if (v.sorts.length) rs = [...rs].sort((a, b) => { for (const so of v.sorts) { const f = field(t, so.fieldId); if (!f) continue; const ea = a.cells[f.id] == null || a.cells[f.id] === "", eb = b.cells[f.id] == null || b.cells[f.id] === ""; if (ea !== eb && f.type !== "checkbox") return ea ? 1 : -1; const c = cmpVal(f, a.cells[f.id], b.cells[f.id]); if (c) return so.dir === "asc" ? c : -c; } return 0; });
  return rs;
}
export type Lane = { id: string | null; name: string; color: string; records: Rec[] };
/** Kanban lanes: one per option of the grouping field, plus "Uncategorized" when needed. */
export function kanbanLanes(t: Table, v: View): Lane[] {
  const f = field(t, v.groupBy); if (!f || f.type !== "select") return [];
  const rs = viewRecords(t, v);
  const lanes: Lane[] = (f.options ?? []).map(o => ({ id: o.id, name: o.name, color: o.color, records: rs.filter(r => r.cells[f.id] === o.id) }));
  const un = rs.filter(r => !r.cells[f.id] || !f.options?.some(o => o.id === r.cells[f.id]));
  return un.length || !lanes.length ? [{ id: null, name: "Uncategorized", color: "#E5E9F0", records: un }, ...lanes] : lanes;
}
export const moveCard = (t: Table, recId: string, fieldId: string, laneId: string | null): Table => setCell(t, recId, fieldId, laneId);

// ---- summaries ----
export function summarize(t: Table, v: View, f: Field) {
  const rs = viewRecords(t, v); const vals = rs.map(r => r.cells[f.id]); const filled = vals.filter(x => x != null && x !== "" && !(Array.isArray(x) && !x.length)).length;
  const base = { count: rs.length, filled, empty: rs.length - filled };
  if (f.type === "number") { const nums = vals.filter((x): x is number => typeof x === "number"); const sum = nums.reduce((a, b) => a + b, 0); return { ...base, sum, avg: nums.length ? sum / nums.length : null, min: nums.length ? Math.min(...nums) : null, max: nums.length ? Math.max(...nums) : null }; }
  if (f.type === "checkbox") return { ...base, checked: vals.filter(Boolean).length };
  return base;
}

// ---- CSV ----
const q = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
export function toCsv(t: Table, v?: View): string {
  const fields = t.fields.filter(f => !v?.hidden.includes(f.id)); const rs = v ? viewRecords(t, v) : t.records;
  return [fields.map(f => q(f.name)).join(","), ...rs.map(r => fields.map(f => q(f.type === "checkbox" ? (r.cells[f.id] ? "true" : "false") : display(f, r.cells[f.id] ?? null))).join(","))].join("\n") + "\n";
}
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", inQ = false; const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) { if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else inQ = false; } else cell += c; }
    else if (c === '"') inQ = true; else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && s[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim() !== ""));
}
/** Build a table from CSV, guessing each column's type from its values. */
export function importCsv(base: Base, name: string, csv: string, now = new Date()): { base: Base; table: Table } {
  const rows = parseCsv(csv); if (rows.length < 1) throw new Error("That file is empty");
  const head = rows[0].map((h, i) => h.trim() || `Field ${i + 1}`); const body = rows.slice(1);
  const names = new Set<string>(); const fields: Field[] = head.map((h, i) => {
    let nm = h; let k = 2; while (names.has(nm.toLowerCase())) nm = `${h} ${k++}`; names.add(nm.toLowerCase());
    const col = body.map(r => (r[i] ?? "").trim()).filter(Boolean); let type: FieldType = "text";
    if (i > 0 && col.length) {
      if (col.every(x => /^(true|false|yes|no)$/i.test(x))) type = "checkbox";
      else if (col.every(x => /^-?[\d,]*\.?\d+$/.test(x.replace(/[$\s]/g, "")))) type = "number";
      else if (col.every(x => /^\d{4}-\d{2}-\d{2}$/.test(x))) type = "date";
      else if (col.every(x => /^https?:\/\//i.test(x))) type = "url";
      else if (col.length >= 4 && new Set(col).size <= Math.min(8, Math.floor(col.length / 2))) type = "select";
      else if (col.some(x => x.length > 80 || x.includes("\n"))) type = "longtext";
    }
    const f: Field = { id: uid("fld"), name: nm, type };
    if (type === "select") f.options = [...new Set(col)].map(newOpt);
    return f;
  });
  const table: Table = { id: uid("tbl"), name: name.trim() || "Imported table", fields, records: [], views: [defaultView()] };
  table.records = body.map(r => { const cells: Record<string, Value> = {}; fields.forEach((f, i) => { const raw = r[i] ?? ""; const p = parseInput(f, raw); cells[f.id] = "value" in p ? p.value : emptyValue(f.type); }); return newRecord(table, now, cells); });
  const sel = fields.find(f => f.type === "select"); if (sel) table.views.push(defaultView("Kanban", "kanban", sel.id));
  return { base: { ...base, tables: [...base.tables, table] }, table };
}
