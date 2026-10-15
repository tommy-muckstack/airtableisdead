import Link from "next/link";
import { PricingBody } from "@/components/PricingBody";
import { pricingCfg } from "@/components/pricingCfg";
import "@/app/landing.css";

// Home page laid out like airtable.com: banner, centered hero, feature stack, card grid, stories, footer.
// Marks, copy and artwork are our own.
const REPO = "https://github.com/tommy-muckstack/airtableisdead";
const Logo = ({ s = 28 }: { s?: number }) => <svg height={s} viewBox="0 0 110 28" aria-hidden><path d="M2 10l11-5 11 5-11 5z" fill="#181d26" /><path d="M2 13l10 4.5v8L2 21z" fill="#181d26" opacity=".7" /><path d="M24 13l-10 4.5v8L24 21z" fill="#181d26" opacity=".85" /><text x="33" y="21" fontFamily="IsDead Inter Tight,sans-serif" fontSize="19" fontWeight="600" letterSpacing="-.6" fill="#181d26">Airtable</text></svg>;
const Dn = () => <svg width="7" height="5" viewBox="0 0 7 5" aria-hidden style={{ marginLeft: 5 }}><path d="M1 1l2.5 2.5L6 1" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;
const Tick = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="#1f5d3a" strokeWidth="1.6" /></svg>;
const brands = ["ANTHROPIC", "harvey", "MERCOR", "amazon", "Walmart", "NETFLIX", "Johnson&Johnson"];
const SOC: [string, string][] = [
  ["Facebook", "M12 1a11 11 0 100 22 11 11 0 000-22zm1.4 18v-6.2h2.1l.4-2.5h-2.5V8.7c0-.7.3-1.3 1.4-1.3h1.2V5.2c-.2 0-1-.1-1.9-.1-2 0-3.3 1.2-3.3 3.4v1.8H8.7v2.5h2.1V19z"],
  ["LinkedIn", "M3 3h18v18H3zm3.2 7.2V18h2.4v-7.8zM7.4 6.3a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zm3.2 3.9V18H13v-4.2c0-1 .5-1.7 1.4-1.7s1.3.6 1.3 1.7V18h2.4v-4.7c0-2-1-3.3-2.8-3.3-1 0-1.7.5-2.1 1.1v-.9z"],
  ["X", "M3 3h5l4.2 5.8L17.2 3H20l-6.5 7.4L21 21h-5l-4.4-6.1L6.3 21H3.6l6.8-7.8zm3.4 1.6l10.3 14.8h1.3L7.8 4.6z"],
  ["Instagram", "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.2-3.4a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"],
  ["YouTube", "M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2zm7 3.5v7l6-3.5z"],
];
const cols: [string, string[]][] = [["Platform", ["AI App Building", "AI Agents", "Airtable Platform", "Portals", "Scale", "Automations"]], ["Solutions", ["Product", "Marketing", "Project Management", "Operations", "Sales", "Design & Creative"]], ["Resources", ["Resources Hub", "Templates", "AI Plays", "Blog", "Customer Stories", "Videos"]], ["Learn", ["How-to guides", "Developer docs", "Academy", "Community", "Help center"]], ["Company", ["Try it for free", "Pricing", "Contact sales", "Contact support", "About", "Careers"]]];
const lists: [string, string[]][] = [["Scalable infrastructure", ["HyperDB with record limits in the hundreds of millions", "Scale workflows to tens of thousands of users", "Use AI models from leading providers (OpenAI, Gemini, Llama, Anthropic, and more)"]], ["Flexible administration", ["Admin roles, robust permissions, fine-grained RBAC", "Fine-grained controls to enable AI", "Programmatic provisioning and de-provisioning", "IDP synced groups"]], ["Security and compliance", ["ISO, HIPAA, SOC 2", "No customer data retained or used to train AI models", "Models run fully in your own AWS environment", "EKM, data loss prevention, audit logs, e-discovery", "European and Australian data residency support"]]];

export function Landing({ page }: { page?: "pricing" } = {}) {
  return <div className={"at" + (page === "pricing" ? " is-pr" : "")}>
    <div className="at-banner">Bring your Airtable data into Claude. <Link href="/pricing">Try it now →</Link><button aria-label="Close">×</button></div>
    <header className="at-nav"><Link href="/" className="at-logo"><Logo /></Link>
      <nav><button>Platform<Dn /></button><button>Solutions<Dn /></button><button>Resources<Dn /></button><Link href="/pricing">Enterprise</Link><Link href="/pricing">Pricing</Link></nav>
      <div className="at-nav__r"><Link href="/pricing" className="at-btn at-btn--line">Book Demo</Link><Link href="/login" className="at-btn at-btn--dark">Sign up for free</Link><Link href="/login" className="at-login">Log in</Link></div></header>
    <section className="at-hero"><h1>All your teams, all their workflows—connected in one workspace</h1>
      <p>Build AI-powered workflows that unify data, maximize collaboration, and set your teams up for long-term success. No code required.</p>
      <div className="at-hero__btns"><Link href="/login" className="at-btn at-btn--dark at-btn--lg">Get started for free</Link><Link href="/pricing" className="at-btn at-btn--line at-btn--lg">Book demo</Link></div>
      <button className="at-pause" aria-label="Pause"><i /><i /></button>
      <div className="at-demo" aria-hidden><div className="at-grid">{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</div></div></section>
    <section className="at-trust"><h2>Trusted by thousands of teams</h2><div className="at-brands">{brands.map((b, i) => <span key={b} className={"b" + i}>{b}</span>)}</div>
      <h2 className="at-wf">Sophisticated workflows in minutes, not months</h2></section>
    <section className="at-feat">
      <ol className="at-toc"><li className="on">01 AI app building</li><li>02 Agents at Scale</li><li>03 Meet Omni</li><li>04 Enterprise capabilities</li></ol>
      <article className="at-f at-f--1"><h3>Production apps at prototype speed</h3><p>Streamline your team's critical data through conversational building. Apps based on no-code components, no technical expertise required.</p><Link className="at-btn at-btn--white" href="/login">Learn more</Link><div className="at-glass" aria-hidden /></article>
      <article className="at-f at-f--2"><div className="at-sheet" aria-hidden><div className="at-tabs"><b>Competitors</b><span>Recent news</span><span>Price comparison</span><span>+ Add</span></div>{["Nestlé", "PepsiCo", "The Coca-Cola Company"].map((n, i) => <div key={n} className="at-row"><i>{i + 1}</i><span>{n}</span><em /><u>Leader</u></div>)}</div><h2>Don’t just ask AI. Deploy it.</h2><p>Embed intelligence into every workflow—agents think dynamically across thousands of records and orchestrate actions across your entire operation.</p><Link className="at-btn at-btn--dark" href="/login">Learn more</Link></article>
      <article className="at-f at-f--3"><div className="at-dots" aria-hidden>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 30}deg) translateY(-44px)` }} />)}</div><h2>Say hello to your assistant</h2><p>Use it to build any enterprise-grade application on your data. The possibilities are endless.</p><Link className="at-btn at-btn--dark" href="/login">Learn more</Link><span className="at-blob at-blob--1" /><span className="at-blob at-blob--2" /></article>
      <article className="at-f at-f--4"><svg width="28" height="32" viewBox="0 0 28 32" aria-hidden><path d="M14 2L3 6v9c0 7 5 13 11 15 6-2 11-8 11-15V6z" fill="none" stroke="#214224" strokeWidth="2" /><path d="M9 15l4 4 7-8" fill="none" stroke="#214224" strokeWidth="2" /></svg><h2>The power of AI with the industrial-grade platform your business demands</h2>
        <div className="at-lists">{lists.map(([h, items]) => <div key={h}><h4>{h}</h4><ul>{items.map(x => <li key={x}><Tick />{x}</li>)}</ul></div>)}</div></article></section>
    <section className="at-path"><h2>The path to 10x every person in your organization</h2><p>Use cases and templates to activate AI in your workflows</p><Link className="at-btn at-btn--dark" href="/pricing">See AI plays</Link>
      <div className="at-c at-c--1"><div className="at-mock"><b>Briefs</b><i /><i /><s /><s /><s /></div></div><div className="at-c at-c--2"><div className="at-mock at-mock--l"><b>Outreach</b>{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div></div>
      <div className="at-c at-c--3"><div className="at-mock at-mock--d"><b>Top opportunities</b><i /><i /></div></div><div className="at-c at-c--4"><div className="at-mock at-mock--g"><b>Localization agent</b><i /><i /><i /></div></div></section>
    <section className="at-res"><h2>Resources to inspire</h2>
      {[["Builders & Breakthroughs", "Hear from top product leaders as they share the pivotal insights and decisions behind building great products—hosted by our CEO."], ["The 2026 AI guide for marketers", "Learn how to prep your marketing organization for AI integration and layer AI across your most critical marketing workflows."], ["In action: product central", "See how a product team delivers a complete view of product investments at every altitude, infusing AI at each step of the process."]].map(([t, d], i) => <Link key={t} href="/pricing" className={"at-r at-r--" + i}><div className="at-r__img" aria-hidden /><h4>{t}</h4><p>{d}</p></Link>)}</section>
    <section className="at-story"><div className="at-story__pane"><blockquote>“It makes it easy to deliver AI insights to every team quickly and without complex builds.”</blockquote><div className="at-story__who"><b>shop</b><p>Angela Yanes<br />Director of Product Operations</p></div><Link className="at-btn at-btn--white" href="/pricing">Explore all customer stories</Link></div></section>
    <section className="at-cta"><div><h2>Start building with it</h2><p>Teams at thousands of forward-thinking organizations use this every day. Join them.</p><Link className="at-btn at-btn--dark at-btn--lg" href="/login">Get started for free</Link></div></section>
    {page === "pricing" && <PricingBody cfg={pricingCfg} />}
    <footer className="at-foot"><div className="at-foot__top"><Logo s={24} /><svg className="at-foot__ic" width="29" height="26" viewBox="0 0 29 26" aria-hidden><path d="M14 1L2 6l12 5 12-5z" fill="#1d1f25" /><path d="M2 9.5V19l11 5.5V14.5z" fill="#1d1f25" /><path d="M27 9.5V19l-11 5.5V14.5z" fill="#1d1f25" transform="translate(-1 0)" /></svg><nav>{["Platform", "Solutions", "Resources", "Enterprise", "Pricing", "Book Demo"].map(x => <Link key={x} href="/pricing">{x}</Link>)}</nav><span className="at-soc">{SOC.map(([n, d]) => <a key={n} href={REPO} aria-label={n}><svg width="19" height="19" viewBox="0 0 24 24" aria-hidden><path d={d} fill="currentColor" fillRule="evenodd" /></svg></a>)}</span></div>
      <div className="at-foot__acc" aria-hidden>{["Platform", "Solutions", "Resources", "Learn", "Company"].map(x => <div key={x}>{x}<i /></div>)}</div>
      <div className="at-foot__cols">{cols.map(([h, ls]) => <div key={h}><h5>{h}</h5>{ls.map(l => <Link key={l} href="/pricing">{l}</Link>)}<b>See more</b></div>)}</div>
      <div className="at-foot__bar"><nav>{["Security", "API", "Privacy", "Terms", "Do Not Sell/Share My Info", "Cookie Preferences", "Accessibility"].map(x => <Link key={x} href="/pricing">{x}</Link>)}</nav><span className="at-apps"><a href={REPO}>App Store</a><a href={REPO}>Google Play</a></span></div></footer>
  </div>;
}
