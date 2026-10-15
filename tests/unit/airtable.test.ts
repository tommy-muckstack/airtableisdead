import { describe, it, expect } from "vitest";
import { addField, addRecord, addView, changeFieldType, createTable, deleteField, deleteRecords, display, duplicateRecord, field, importCsv, kanbanLanes, matchesFilter, moveCard, parseCsv, parseInput, setCell, setOptions, summarize, toCsv, updateView, viewRecords, type Base } from "@/lib/airtable/model";
import { seedBase } from "@/lib/airtable/seed";
const empty: Base = { id: "b", name: "B", tables: [] };
const seeded = () => { const b = seedBase(); const t = b.tables[0]; const by = (n: string) => t.fields.find(f => f.name === n)!; return { b, t, by }; };
describe("parsing and display", () => {
  const { t, by } = seeded();
  it("numbers accept $ and commas, reject words", () => { expect(parseInput(by("Estimate (h)"), "$1,250.5")).toEqual({ value: 1250.5 }); expect("error" in parseInput(by("Estimate (h)"), "abc")).toBe(true); expect(parseInput(by("Estimate (h)"), "")).toEqual({ value: null }); });
  it("dates normalize and reject nonsense", () => { expect(parseInput(by("Due"), "2026-10-31")).toEqual({ value: "2026-10-31" }); expect("error" in parseInput(by("Due"), "someday")).toBe(true); });
  it("urls need a scheme or a plausible domain", () => { const f = { id: "u", name: "u", type: "url" as const }; expect(parseInput(f, "example.com/a")).toEqual({ value: "https://example.com/a" }); expect("error" in parseInput(f, "not a url")).toBe(true); });
  it("selects resolve option names case-insensitively and store ids", () => { const f = by("Status"); const r = parseInput(f, "in PROGRESS") as { value: string }; expect(display(f, r.value)).toBe("In progress"); expect("error" in parseInput(f, "Nope")).toBe(true); });
  it("multi-selects take comma lists and dedupe", () => { const f = by("Tags"); const r = parseInput(f, "design, ENG, Design") as { value: string[] }; expect(r.value).toHaveLength(2); expect(display(f, r.value)).toBe("Design, Eng"); });
  it("checkbox text", () => { const f = by("Shipped"); expect(parseInput(f, "yes")).toEqual({ value: true }); expect(parseInput(f, "no")).toEqual({ value: false }); });
});
describe("tables, fields and records", () => {
  it("new tables start with a primary field, three rows and a grid view", () => { const { table } = createTable(empty, "Leads"); expect(table.fields).toHaveLength(1); expect(table.records).toHaveLength(3); expect(table.views[0].type).toBe("grid"); });
  it("adding a field backfills every record, with unique names", () => {
    const { table } = createTable(empty, "T"); const a = addField(table, "Notes", "longtext"); const b = addField(a.table, "notes", "text");
    expect(b.table.fields.map(f => f.name)).toEqual(["Name", "Notes", "notes 2"]); expect(b.table.records.every(r => b.table.fields.every(f => f.id in r.cells))).toBe(true);
  });
  it("select fields come with starter options; checkboxes default false", () => { const { table } = createTable(empty, "T"); const s = addField(table, "S", "select"); expect(s.field.options).toHaveLength(2); const c = addField(s.table, "C", "checkbox"); expect(c.table.records[0].cells[c.field.id]).toBe(false); });
  it("the primary field can't be deleted; others can, and views forget them", () => {
    const { b, t, by } = seeded(); expect(deleteField(t, t.fields[0].id)).toBe(t); const due = by("Due"); const t2 = updateView(t, t.views[0].id, { sorts: [{ fieldId: due.id, dir: "asc" }] }); const t3 = deleteField(t2, due.id);
    expect(t3.fields.find(f => f.id === due.id)).toBeUndefined(); expect(t3.views[0].sorts).toHaveLength(0); expect(Object.keys(t3.records[0].cells)).not.toContain(due.id);
  });
  it("changing text → number keeps numeric text and blanks the rest", () => {
    let { table } = createTable(empty, "T"); const a = addField(table, "Qty", "text"); table = a.table; table = setCell(table, table.records[0].id, a.field.id, "42"); table = setCell(table, table.records[1].id, a.field.id, "lots");
    const n = changeFieldType(table, a.field.id, "number"); expect(n.records[0].cells[a.field.id]).toBe(42); expect(n.records[1].cells[a.field.id]).toBeNull();
  });
  it("changing text → single select builds options from existing values", () => {
    let { table } = createTable(empty, "T"); const a = addField(table, "Stage", "text"); table = a.table; table = setCell(table, table.records[0].id, a.field.id, "Lead"); table = setCell(table, table.records[1].id, a.field.id, "Won");
    const s = changeFieldType(table, a.field.id, "select"); const f = field(s, a.field.id)!; expect(f.options!.map(o => o.name).sort()).toEqual(["Lead", "Won"]); expect(display(f, s.records[0].cells[f.id])).toBe("Lead");
  });
  it("removing an option clears it from records", () => {
    const { t, by } = seeded(); const st = by("Status"); const todo = st.options!.find(o => o.name === "Todo")!; const t2 = setOptions(t, st.id, st.options!.filter(o => o.id !== todo.id));
    expect(t2.records.some(r => r.cells[st.id] === todo.id)).toBe(false);
  });
  it("add, duplicate and delete records", () => { const { t } = seeded(); const a = addRecord(t); expect(a.table.records).toHaveLength(t.records.length + 1); const d = duplicateRecord(a.table, t.records[0].id); expect(d.records[1].id).not.toBe(t.records[0].id); expect(d.records[1].cells).toEqual(t.records[0].cells); expect(deleteRecords(d, [d.records[1].id]).records).toHaveLength(a.table.records.length); });
});
describe("views", () => {
  const { t, by } = seeded();
  it("filters with and/or", () => {
    const high = { id: "1", fieldId: by("Priority").id, op: "is" as const, value: "High" }; const eng = { id: "2", fieldId: by("Tags").id, op: "contains" as const, value: "Eng" };
    const v = { ...t.views[0], filters: [high, eng], conjunction: "and" as const }; const and = viewRecords(t, v).length; const or = viewRecords(t, { ...v, conjunction: "or" }).length;
    expect(and).toBeGreaterThan(0); expect(or).toBeGreaterThan(and);
  });
  it("number comparisons and empties", () => { const e = by("Estimate (h)"); const v = { ...t.views[0], filters: [{ id: "1", fieldId: e.id, op: "gte" as const, value: "5" }] }; expect(viewRecords(t, v).every(r => (r.cells[e.id] as number) >= 5)).toBe(true); const blank = addRecord(t).table; expect(viewRecords(blank, { ...v, filters: [{ id: "x", fieldId: e.id, op: "empty", value: "" }] })).toHaveLength(1); });
  it("sorts ascending/descending with empties last, multi-key", () => {
    const e = by("Estimate (h)"); const withBlank = addRecord(t).table; const asc = viewRecords(withBlank, { ...t.views[0], sorts: [{ fieldId: e.id, dir: "asc" }] }); const desc = viewRecords(withBlank, { ...t.views[0], sorts: [{ fieldId: e.id, dir: "desc" }] });
    expect(asc[0].cells[e.id]).toBe(1); expect(asc.at(-1)!.cells[e.id]).toBeNull(); expect(desc[0].cells[e.id]).toBe(6); expect(desc.at(-1)!.cells[e.id]).toBeNull();
    const two = viewRecords(t, { ...t.views[0], sorts: [{ fieldId: by("Owner").id, dir: "asc" }, { fieldId: e.id, dir: "desc" }] }); expect(two[0].cells[by("Owner").id]).toBe("Ada"); expect(two[0].cells[e.id]).toBe(4);
  });
  it("search looks across all fields using display text", () => { expect(viewRecords(t, { ...t.views[0], search: "in progress" }).length).toBe(2); expect(viewRecords(t, { ...t.views[0], search: "  " })).toHaveLength(t.records.length); });
  it("the seeded 'Open, by due date' view hides shipped tasks and is date-sorted", () => { const v = t.views.find(x => x.name.startsWith("Open"))!; const r = viewRecords(t, v); expect(r.every(x => !x.cells[by("Shipped").id])).toBe(true); const d = r.map(x => x.cells[by("Due").id] as string); expect([...d].sort()).toEqual(d); });
  it("kanban lanes follow the select options, with Uncategorized only when needed", () => {
    const v = t.views.find(x => x.type === "kanban")!; const lanes = kanbanLanes(t, v); expect(lanes.map(l => l.name)).toEqual(["Todo", "In progress", "Review", "Done"]); expect(lanes.reduce((n, l) => n + l.records.length, 0)).toBe(t.records.length);
    const withBlank = addRecord(t).table; expect(kanbanLanes(withBlank, v)[0].name).toBe("Uncategorized");
  });
  it("moving a card changes its select value", () => { const v = t.views.find(x => x.type === "kanban")!; const st = by("Status"); const lanes = kanbanLanes(t, v); const card = lanes[0].records[0]; const done = lanes[3]; const t2 = moveCard(t, card.id, st.id, done.id); expect(t2.records.find(r => r.id === card.id)!.cells[st.id]).toBe(done.id); expect(kanbanLanes(t2, v)[3].records).toHaveLength(done.records.length + 1); });
  it("a kanban needs a single select to group by", () => { const { table } = createTable(empty, "T"); const r = addView(table, "K", "kanban"); expect(r.view.groupBy).toBeNull(); expect(kanbanLanes(r.table, r.view)).toEqual([]); const w = addView(t, "K2", "kanban"); expect(w.view.groupBy).toBe(by("Status").id); });
  it("matchesFilter ignores filters on fields that no longer exist", () => expect(matchesFilter(t, t.records[0], { id: "x", fieldId: "gone", op: "is", value: "x" })).toBe(true));
  it("summaries", () => { const e = by("Estimate (h)"); const s = summarize(t, t.views[0], e) as any; expect(s.sum).toBe(34); expect(s.min).toBe(1); expect(s.max).toBe(6); expect(summarize(t, t.views[0], by("Shipped")) as any).toMatchObject({ checked: 2 }); });
});
describe("CSV", () => {
  it("parses quotes, escaped quotes, commas and newlines inside cells", () => expect(parseCsv('a,b\n"x, y","say ""hi"""\n"line\nbreak",z\n')).toEqual([["a", "b"], ["x, y", 'say "hi"'], ["line\nbreak", "z"]]));
  it("handles CRLF and a BOM", () => expect(parseCsv("\uFEFFa,b\r\n1,2\r\n")).toEqual([["a", "b"], ["1", "2"]]));
  it("exports the view's visible fields and rows, escaping as needed", () => { const { t } = seeded(); const csv = toCsv(t, t.views.find(v => v.name.startsWith("Open"))!); const rows = parseCsv(csv); expect(rows[0]).not.toContain("Notes"); expect(rows[0][0]).toBe("Task"); expect(rows).toHaveLength(1 + 7); });
  it("round-trips a table through CSV with typed columns", () => {
    const { t } = seeded(); const csv = toCsv(t); const r = importCsv(empty, "Copy", csv); const f = (n: string) => r.table.fields.find(x => x.name === n)!;
    expect(r.table.records).toHaveLength(t.records.length); expect(f("Estimate (h)").type).toBe("number"); expect(f("Due").type).toBe("date"); expect(f("Shipped").type).toBe("checkbox"); expect(f("Status").type).toBe("select");
    expect(r.table.views.some(v => v.type === "kanban")).toBe(true);
    const total = r.table.records.reduce((n, x) => n + (x.cells[f("Estimate (h)").id] as number), 0); expect(total).toBe(34);
  });
  it("rejects empty files and dedupes header names", () => { expect(() => importCsv(empty, "x", "")).toThrow(); const r = importCsv(empty, "d", "a,a\n1,2\n"); expect(r.table.fields.map(f => f.name)).toEqual(["a", "a 2"]); });
});
