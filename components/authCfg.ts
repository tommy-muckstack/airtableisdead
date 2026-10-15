import type { AuthCfg } from "@/components/AuthScreen";
export const authCfg: AuthCfg = { layout: "center", accent: "#166ee1", ctaBg: "#166ee1", radius: 6, ink: "#1d1f25", muted: "#6a6e78", logoCenter: true, logoSize: 30,
  title: "Sign in to Airtable", signupTitle: "Create your account", emailLabel: "Email", providersAfter: true, emailFirst: true,
  providers: [{ id: "sso", label: "Sign in with Single Sign On", signupLabel: "Sign up with Single Sign On" }, { id: "google", label: "Continue with Google" }, { id: "apple", label: "Continue with Apple" }], ctaNext: "Continue", cta: "Sign in", switchText: ["New to this site?", "Create an account"], signupSwitchText: ["Already have an account?", "Sign in"] };
