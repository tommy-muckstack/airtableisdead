// Drives the production build with the demo account: smoke-tests grid, kanban, filters, CSV AND captures product shots.
import fs from "node:fs"; import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("airtableisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name, home = true) => { await page.screenshot({ path: `${dir}/${name}.png` }); if (home) fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
await withApp("airtableisdead", async ({ base, browser }) => {
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.getByTestId("grid").waitFor(); await page.waitForSelector('[data-testid="row"]');
  const rows = () => page.locator('[data-testid="row"]').count(); assert.equal(await rows(), 9);
  const cell = (r, c) => page.locator('[data-testid="row"]').nth(r).locator('[role="gridcell"]').nth(c);
  // keyboard editing
  await cell(0, 0).click(); await page.keyboard.type("Write the launch post"); await page.keyboard.press("Enter"); await page.waitForTimeout(150); assert.match(await cell(0, 0).innerText(), /Write the launch post/);
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
  await page.keyboard.type("abc"); await page.keyboard.press("Enter"); await page.getByTestId("toast").waitFor(); assert.match(await page.getByTestId("toast").innerText(), /isn't a number/);
  await page.keyboard.press("Escape"); await page.getByTestId("toast").waitFor({ state: "hidden", timeout: 5000 }); await page.keyboard.press("Enter"); await page.keyboard.press("Control+a"); await page.keyboard.type("8"); await page.keyboard.press("Enter"); await page.waitForTimeout(150); assert.equal((await cell(0, 5).innerText()).trim(), "8");
  // select edit by double click
  await cell(1, 1).dblclick(); await page.getByRole("option", { name: "Done" }).click(); await page.waitForTimeout(150); assert.match(await cell(1, 1).innerText(), /Done/);
  // checkbox
  await cell(0, 7).click(); await page.waitForTimeout(150); assert.ok(await cell(0, 7).locator(".atb-box.on").count());
  await cell(2, 0).click(); await save(page, "grid");
  // filter
  await page.getByTestId("tool-filter").click(); await page.getByTestId("add-filter").click(); await page.getByLabel("Filter field").selectOption({ label: "Priority" }); await page.getByLabel("Filter value").selectOption("High");
  await page.waitForTimeout(150); const filtered = await rows(); assert.ok(filtered < 9 && filtered > 0, `filtered ${filtered}`); assert.match(await page.getByTestId("count").innerText(), /filtered from 9/); await save(page, "filter");
  await page.getByLabel("Remove condition").click(); await page.getByTestId("tool-filter").click(); assert.equal(await rows(), 9);
  // sort by header menu
  await page.getByRole("button", { name: "Estimate (h) field menu" }).click(); await page.getByRole("menuitem", { name: "Sort Z → A" }).click(); await page.waitForTimeout(150); assert.equal((await cell(0, 5).innerText()).trim(), "8");
  // add a field
  await page.getByRole("button", { name: "Add field" }).click(); await page.getByLabel("New field name").fill("Budget"); await page.getByLabel("New field type").selectOption("number"); await page.getByRole("button", { name: "Create field" }).click();
  await page.getByRole("columnheader", { name: /Budget/ }).waitFor();
  // expand record
  await page.locator(`[data-testid="row"]`).first().hover(); await page.locator(`[aria-label="Expand row 1"]`).click(); await page.getByTestId("record").waitFor(); await page.waitForTimeout(200); await save(page, "record"); await page.keyboard.press("Escape");
  // kanban
  await page.getByRole("button", { name: /By status/ }).click(); await page.getByTestId("kanban").waitFor(); await page.waitForTimeout(200);
  const cardsIn = lane => page.locator(`[data-lane="${lane}"] [data-testid="card"]`).count(); const before = await cardsIn("Todo");
  await page.locator('[data-lane="Todo"] [data-testid="card"]').first().dragTo(page.locator('[data-lane="Review"]')); await page.waitForFunction(n => document.querySelectorAll('[data-lane="Todo"] [data-testid="card"]').length === n - 1, before); await save(page, "kanban");
  // new view + export CSV
  await page.getByTestId("add-grid").click(); await page.getByLabel("View name").fill("Mine"); await page.waitForTimeout(100);
  const dlp = page.waitForEvent("download"); await page.getByRole("button", { name: "Export view as CSV" }).click(); const f = await dlp; await f.saveAs(`${dir}/export.csv`); const csv = fs.readFileSync(`${dir}/export.csv`, "utf8"); assert.match(csv, /^Task,Status,Priority/); assert.match(csv, /Write the launch post/);
  // import CSV
  await page.setInputFiles('[data-testid="import-file"]', { name: "leads.csv", mimeType: "text/csv", buffer: Buffer.from("Company,ARR,Closed,Stage\nAcme,12000,true,Won\nGlobex,\"3,400\",false,Lead\nInitech,800,false,Lead\nHooli,50,false,Lead\nUmbrella,9000,true,Won\nStark,70000,true,Won\n") });
  await page.getByRole("button", { name: "leads", exact: true }).waitFor(); assert.equal(await rows(), 6); assert.match(await page.getByTestId("grid").innerText(), /Sum 95250|Sum 99400|Sum/);
  // persistence
  await page.reload(); await page.getByRole("button", { name: "leads", exact: true }).waitFor();
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const mp = await m.newPage();
  await mp.goto(base + "/login"); await mp.getByRole("button", { name: "Use the demo account" }).click(); await mp.waitForURL(/\/app/); await mp.getByTestId("grid").waitFor(); await mp.screenshot({ path: `${dir}/mobile-app.png` }); await m.close();
  const hp = await ctx.newPage(); await hp.setViewportSize({ width: 1440, height: 900 }); await hp.goto(base); await hp.screenshot({ path: `${dir}/home-top.png` }); await hp.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await ctx.clearCookies(); await hp.goto(base + "/login"); await hp.screenshot({ path: `${dir}/login.png` });
  console.log("airtableisdead smoke OK");
});
