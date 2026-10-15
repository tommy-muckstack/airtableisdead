import { addRecord, defaultView, newOpt, uid, type Base, type Field, type Table } from "./model";
const opt = (names: string[]) => names.map((n, i) => newOpt(n, i));
/** A launch-planning base: Tasks (grid + kanban) and Assets. */
export function seedBase(): Base {
  const nameF: Field = { id: uid("fld"), name: "Task", type: "text" };
  const status: Field = { id: uid("fld"), name: "Status", type: "select", options: opt(["Todo", "In progress", "Review", "Done"]) };
  const pri: Field = { id: uid("fld"), name: "Priority", type: "select", options: opt(["High", "Medium", "Low"]).map((o, i) => ({ ...o, color: ["#FEE2D5", "#FFEAB6", "#D1F7C4"][i] })) };
  const owner: Field = { id: uid("fld"), name: "Owner", type: "text" };
  const due: Field = { id: uid("fld"), name: "Due", type: "date" };
  const est: Field = { id: uid("fld"), name: "Estimate (h)", type: "number" };
  const tags: Field = { id: uid("fld"), name: "Tags", type: "multiselect", options: opt(["Design", "Eng", "Marketing", "Legal"]) };
  const done: Field = { id: uid("fld"), name: "Shipped", type: "checkbox" };
  const notes: Field = { id: uid("fld"), name: "Notes", type: "longtext" };
  const tasks: Table = { id: uid("tbl"), name: "Tasks", fields: [nameF, status, pri, owner, due, est, tags, done, notes], records: [], views: [] };
  const S = (n: string) => status.options!.find(o => o.name === n)!.id, P = (n: string) => pri.options!.find(o => o.name === n)!.id, T = (...n: string[]) => n.map(x => tags.options!.find(o => o.name === x)!.id);
  const rows: [string, string, string, string, string, number, string[], boolean, string][] = [
    ["Write launch announcement", "In progress", "High", "Ada", "2026-10-20", 4, ["Marketing"], false, "Lead with the free price; keep it under 300 words."],
    ["Design the pricing comparison", "Review", "High", "Grace", "2026-10-18", 6, ["Design"], false, ""],
    ["Fix sign-up redirect bug", "Done", "High", "Linus", "2026-10-12", 2, ["Eng"], true, "Plus signs in emails were being dropped."],
    ["Legal review of trademark note", "Todo", "Medium", "Ada", "2026-10-25", 3, ["Legal"], false, ""],
    ["Record the demo video", "Todo", "Medium", "Grace", "2026-10-22", 5, ["Marketing", "Design"], false, ""],
    ["Set up analytics", "In progress", "Low", "Linus", "2026-10-24", 3, ["Eng"], false, ""],
    ["Prepare Product Hunt assets", "Todo", "Medium", "Ada", "2026-10-28", 4, ["Marketing", "Design"], false, ""],
    ["Load-test the booking API", "Review", "Medium", "Linus", "2026-10-21", 6, ["Eng"], false, ""],
    ["Draft changelog", "Done", "Low", "Grace", "2026-10-10", 1, ["Marketing"], true, ""],
  ];
  let t = tasks;
  for (const r of rows) t = addRecord(t, { [nameF.id]: r[0], [status.id]: S(r[1]), [pri.id]: P(r[2]), [owner.id]: r[3], [due.id]: r[4], [est.id]: r[5], [tags.id]: T(...r[6]), [done.id]: r[7], [notes.id]: r[8] }, new Date("2026-10-01T12:00:00Z")).table;
  t = { ...t, views: [defaultView("All tasks"), { ...defaultView("By status", "kanban", status.id) }, { ...defaultView("Open, by due date"), filters: [{ id: uid("flt"), fieldId: done.id, op: "unchecked", value: "" }], sorts: [{ fieldId: due.id, dir: "asc" }], hidden: [notes.id] }] };
  const aName: Field = { id: uid("fld"), name: "Asset", type: "text" };
  const kind: Field = { id: uid("fld"), name: "Kind", type: "select", options: opt(["Image", "Video", "Doc"]) };
  const link: Field = { id: uid("fld"), name: "Link", type: "url" };
  const ready: Field = { id: uid("fld"), name: "Ready", type: "checkbox" };
  let a: Table = { id: uid("tbl"), name: "Assets", fields: [aName, kind, link, ready], records: [], views: [defaultView("Grid view")] };
  for (const [n, k, l, r] of [["Hero screenshot", "Image", "https://example.com/hero.png", true], ["Demo video", "Video", "", false], ["Press kit", "Doc", "https://example.com/press", false]] as const) a = addRecord(a, { [aName.id]: n, [kind.id]: kind.options!.find(o => o.name === k)!.id, [link.id]: l || null, [ready.id]: r }).table;
  return { id: uid("base"), name: "Product launch", tables: [t, a] };
}
