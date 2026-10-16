"use client";
// Airtable-style login (form + promo card) and signup (single centred column).
import { useState } from "react";
import Link from "next/link";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { useAuth } from "@/components/useAuth";

const GG = <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;
function Cube({ s = 38 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden><path d="M19 4 3 10.600a1.100 1.100 0 0 0 0 2l16.100 6.400a3.600 3.600 0 0 0 2.700 0l16.100-6.400a1.100 1.100 0 0 0 0-2L21.800 4a3.600 3.600 0 0 0-2.700 0z" fill="#111" /><path d="M21.700 22.500v14.400a1 1 0 0 0 1.400.9l16-6.300a1 1 0 0 0 .6-.9V16.200a1 1 0 0 0-1.400-.9l-16 6.300a1 1 0 0 0-.6.900z" fill="#111" /><path d="M17.800 23.600l-5.400 2.600-.6.300L2 31.200a1 1 0 0 1-1.500-.9V16.300a1 1 0 0 1 1.400-.9l15.900 6.200a1 1 0 0 1 0 2z" fill="#111" transform="translate(1.700 0.600)" /></svg>;
}
function Promo() {
  const tile = (i: number, bg: string, body: React.ReactNode) => <div key={i} className="at-au-tile" style={{ background: bg }}>{body}</div>;
  const dots = (c: string) => <svg viewBox="0 0 100 100" width="100%" height="100%">{Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={50 + 26 * Math.cos(i * Math.PI / 6)} cy={50 + 26 * Math.sin(i * Math.PI / 6)} r="4.500" fill={c} />)}<rect x="44" y="46" width="12" height="8" rx="2" fill="#d6249f" /></svg>;
  return <aside className="at-au-promo" aria-hidden>
    <h2>Meet Omni, your AI collaborator for building custom apps.</h2>
    <span className="at-au-pill">Start building</span>
    <div className="at-au-tiles">
      {tile(0, "#2b2b2f", <svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M22 70 q-6 -40 28 -48 q34 8 28 48 l-12 8 l-32 0z" fill="#8a8e96" /><path d="M32 52 h36 v10 h-36z" fill="#1a1a1e" /></svg>)}
      {tile(1, "#f78fe8", dots("#fff"))}
      {tile(2, "#7a2430", <div className="at-au-photo"><b>Campaign concept</b><i /></div>)}
      {tile(3, "#f8b99a", <div className="at-au-ui"><i /><i /><i /></div>)}
      {tile(4, "#a9ebb0", <div className="at-au-ui g"><i /><i /><i /></div>)}
      {tile(5, "#2b2b2f", <svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="28" fill="#44444a" />{Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={50 + 34 * Math.cos(i * Math.PI / 4)} cy={50 + 34 * Math.sin(i * Math.PI / 4)} r="5" fill="#caa46a" />)}</svg>)}
    </div>
  </aside>;
}
export function AuthScreen({ config, demo, to, signup = false }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup?: boolean }) {
  const a = useAuth({ config, demo, to, signup });
  const [foc, setFoc] = useState(false);
  const su = a.mode === "signup", reset = a.mode === "reset";
  const ready = a.email.trim().length > 3;
  return <main className={`at-au${su ? " su" : ""}`}>
    <div className="at-au-col">
      <Link href="/" aria-label="Home" className="at-au-logo"><Cube s={su ? 34 : 36} /></Link>
      <h1>{reset ? "Reset your password" : "Welcome to Airtable"}</h1>
      <form onSubmit={a.submit(true)}>
        <label htmlFor="at-e">{su ? "Work email" : <>Email<em>*</em></>}</label>
        <input id="at-e" type="email" required autoComplete="email" placeholder={su ? "name@company.com" : "Email address"} className={foc || su ? "f" : ""} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} value={a.email} onChange={e => a.setEmail(e.target.value)} readOnly={a.step === 2} />
        {a.step === 2 && !reset && <><label htmlFor="at-p" className="p">Password</label><input id="at-p" type="password" required minLength={6} autoFocus value={a.password} onChange={e => a.setPassword(e.target.value)} autoComplete={su ? "new-password" : "current-password"} className="f" /></>}
        <button className={`at-au-cta${ready ? " on" : ""}`} disabled={a.busy}>{reset ? "Send reset link" : a.step === 2 ? (su ? "Create account" : "Sign in") : "Continue"}</button>
        {a.err && <p role="alert" className="at-au-err">{a.err}</p>}{a.note && <p role="status" className="at-au-ok">{a.note}</p>}
      </form>
      {!reset && <>
        <div className="at-au-or">or</div>
        <button type="button" className="at-au-prov" onClick={a.google} disabled={a.busy}>{GG}<span>Continue with <b>Google</b></span></button></>}
      <p className="at-au-legal">{su ? <>By using Airtable, you agree to the <a href="#" onClick={a.off}>Terms of Service</a> and <a href="#" onClick={a.off}>Privacy Policy</a>.</> : <>By signing up, you agree to the <a href="#" onClick={a.off}>Terms of Service</a> and <a href="#" onClick={a.off}>Privacy Policy</a>.</>}</p>
      <p className="at-au-legal">Manage your cookie preferences <a href="#" onClick={a.off} className="b">here</a></p>
      <p className="at-au-sw">{reset ? <a href="#" onClick={a.go("signin")}>Back to sign in</a> : su ? <>Already have an account? <a href="#" onClick={a.go("signin")}>Sign in</a></> : <>New to Airtable? <a href="#" onClick={a.go("signup")}>Create an account</a> · <a href="#" onClick={a.go("reset")}>Forgot password?</a></>}</p>
      {a.demo && <button type="button" className="at-au-demo" onClick={a.useDemo}>Use the demo account</button>}
    </div>
    {!su && <Promo />}
    {!a.configured && <p className="at-au-cfg" role="status">Sign-in isn’t configured on this deployment yet.</p>}
  </main>;
}
