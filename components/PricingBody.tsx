import Link from "next/link";
import "@/app/pricing-body.css";
import { PbCollapse } from "@/components/PbCollapse";
import mxa from "@/lib/atMatrix.json";

export type Plan = { name: string; price: string; per?: string; desc: string; cta: string; feats: string[]; hot?: boolean; tag?: string; lead?: string; addon?: string[] };
export type PBCfg = {
  vars?: Record<string, string>;
  title: string; sub?: string; note?: string; toggle?: [string, string];
  plans: Plan[];
  extra?: { title: string; text: string; cta: string; bullets?: string[] };
  tableTitle: string; cols: string[]; groups: [string, string[]][];
  faqTitle: string; faqs: [string, string][];
  cta?: { title: string; btn: string };
  mxa?: boolean;
};
const Mark = ({ on }: { on: boolean }) => on ? <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg> : <i aria-hidden>–</i>;

export function PricingBody({ cfg }: { cfg: PBCfg }) {
  const { plans } = cfg; const nc = cfg.cols.length;
  return <div className="pb" style={cfg.vars as React.CSSProperties}>
    <section className="pb-hero"><h1>{cfg.title}</h1>{cfg.sub && <p>{cfg.sub}</p>}{cfg.note && <span className="pb-note">{cfg.note}</span>}
      {cfg.toggle && <div className="pb-toggle"><b>{cfg.toggle[0]}</b><span>{cfg.toggle[1]}</span></div>}</section>
    <section className="pb-plans" style={{ ["--n" as string]: plans.length } as React.CSSProperties}>
      {plans.map(p => <article key={p.name} className={"pb-plan" + (p.hot ? " pb-plan--hot" : "")}>
        {p.tag && <em>{p.tag}</em>}<h2>{p.name}</h2><p className="pb-plan__d">{p.desc}</p>
        <div className="pb-price"><b>{p.price}</b>{p.per && <small>{p.per}</small>}</div>
        <Link className="pb-btn" href="/login">{p.cta}</Link>
        {p.lead && <h4>{p.lead}</h4>}
        <ul>{p.feats.map(f => <li key={f}><Mark on />{f}</li>)}</ul>{p.addon && <><h4>Available add-ons:</h4><ul>{p.addon.map(f => <li key={f}><Mark on />{f}</li>)}</ul></>}</article>)}
    </section>
    {cfg.extra && <section className="pb-extra"><div><h2>{cfg.extra.title}</h2><p>{cfg.extra.text}</p>{cfg.extra.bullets && <ul>{cfg.extra.bullets.map(b => <li key={b}>{b}</li>)}</ul>}<Link className="pb-btn pb-btn--p" href="/login">{cfg.extra.cta}</Link></div><div className="pb-extra__art" aria-hidden><i /><i /><i /></div></section>}
    {cfg.mxa && <section className="pb-ax"><div className="pb-ax__hd"><h2>{cfg.tableTitle}</h2>{cfg.cols.map((c, i) => <div key={c}><b>{c}</b><Link href="/login" className={i === 1 ? "on" : ""}>{plans[i]?.cta}</Link></div>)}</div>
      {(mxa as { g: string; r: string[][] }[]).map(g => <div key={g.g} className="pb-ax__g"><h3>{g.g}</h3>{g.r.map((r, i) => <div key={i} className="pb-ax__r"><span>{r[0].endsWith(" NEW") ? <>{r[0].slice(0, -4)}<em>NEW</em></> : r[0]}</span>{r.slice(1).map((v, j) => <span key={j}>{v === "✓" ? <Mark on /> : v}</span>)}</div>)}</div>)}
      <div className="pb-ax__fn"><p>* Pricing for Portals starts at $127.50/month for 15 guests on our annual plan for Business.</p><p>** Payment by invoice is available to Business customers who purchase through our sales team.</p><p>*** Airtable professional service packages are available for purchase by qualified customers on Business and Enterprise Scale plans.</p><p>**** Enterprise Scale customers can configure custom revision history timeframes.</p></div>
      <div className="pb-ax__q"><h2>Have additional questions?</h2><div><div><small>BILLING / PRICING</small><Link href="/login">Billing FAQ</Link></div><div><small>SPECIAL PLANS FOR</small><span><Link href="/login">Nonprofits</Link> or <Link href="/login">Education</Link></span></div><div><small>ENTERPRISE PLANS</small><Link href="/login">Contact Sales</Link></div></div></div></section>}
    <section className={"pb-table" + (cfg.mxa ? " pb-table--m" : "")}><h2>{cfg.tableTitle}</h2>
      <div className="pb-tbl" style={{ ["--c" as string]: nc } as React.CSSProperties}>
        <div className="pb-tr pb-tr--h"><span />{cfg.cols.map(c => <b key={c}>{c}</b>)}</div>
        {cfg.groups.map(([g, rows]) => <details key={g} className="pb-grp" open><summary className="pb-tr pb-tr--g"><strong>{g}</strong></summary>
          {rows.map(r => { const off = r.startsWith("-"); return <div key={r} className="pb-tr"><span className={off ? "off" : ""}>{off ? r.slice(1) : r}</span>{cfg.cols.map(c => <div key={c}><Mark on={!off} /></div>)}</div>; })}</details>)}
        <PbCollapse keep={1} />
      </div></section>
    <section className="pb-faq"><h2>{cfg.faqTitle}</h2>{cfg.faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
    {cfg.cta && !cfg.mxa && <section className="pb-cta"><div><h2>{cfg.cta.title}</h2><Link className="pb-btn pb-btn--p" href="/login">{cfg.cta.btn}</Link></div></section>}
  </div>;
}
