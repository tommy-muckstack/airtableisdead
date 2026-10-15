import type { PBCfg } from "@/components/PricingBody";
export const pricingCfg: PBCfg = {
  vars: { "--plan-min": "560px", "--ink": "#1d1f25", "--accent": "#166ee1", "--soft": "#e8f1fd", "--hero-pt": "64px", "--hero-pb": "44px", "--h1": "40px", "--h1-ls": "-.4px", "--h-weight": "600", "--card-r": "12px", "--btn-r": "8px", "--plan-h2": "24px", "--plan-h2-lh": "30px", "--row": "36px", "--faq-bg": "#fff", "--faq-card": "#fff", "--cta-bg": "#fff", "--max": "960px" } as Record<string, string>,
  title: "A plan for every organization’s needs",
  plans: [
    { name: "Free", price: "$0", per: "/ seat / month", desc: "For individuals or small teams just getting started", cta: "Sign up for free", lead: "Includes:", feats: ["Unlimited bases", "Up to 1,000 records per base", "Up to 5 editors", "Interface designer", "Core automations"] },
    { name: "Team", price: "$0", per: "/ seat / month", desc: "For teams building workflows", cta: "Sign up for free", hot: true, tag: "Most popular", lead: "Everything in Free, plus:", feats: ["50,000 records per base", "Unlimited editors", "Gantt and timeline", "Custom branded forms", "Sync integrations"] },
    { name: "Business", price: "$0", per: "/ seat / month", desc: "For admins managing multiple teams", cta: "Sign up for free", lead: "Everything in Team, plus:", feats: ["125,000 records per base", "Admin panel", "Granular permissions", "Verified data", "Two-way sync"] },
    { name: "Enterprise Scale", price: "Contact us", desc: "For orgs needing advanced security and scale", cta: "Contact sales", lead: "Everything in Business, plus:", feats: ["500,000 records per base", "Enterprise key management", "Audit logs", "SCIM", "Dedicated support"] },
  ],
  tableTitle: "Compare our plans", cols: ["Free", "Team", "Business", "Enterprise Scale"],
  groups: [["Fundamentals", ["Bases", "Records per base", "Attachment space per base", "Editors", "Revision history", "Snapshots"]], ["Visualizations", ["Grid", "Calendar", "Kanban", "Gallery", "Gantt", "Timeline", "Form"]], ["AI", ["AI credits", "AI field agents", "AI in automations"]], ["Project Management", ["Tasks", "Dependencies", "Milestones"]], ["Customization", ["Page designer", "Interface designer", "Custom branded forms"]], ["Automations", ["Automation runs", "Run history", "Scripting", "Webhooks"]], ["Security & compliance", ["SOC 2", "SSO", "Admin panel", "Audit logs", "Data residency"]], ["Support", ["Help center", "Community", "Priority support"]]],
  faqTitle: "Frequently asked questions", faqs: [["How does Airtable’s pricing work?", "This open-source clone is free. The plan names mirror the original for comparison."], ["What payment methods do you accept?", "Nothing is charged."], ["Can I use Airtable for free?", "Yes, everything here is free."]],
  cta: { title: "Have additional questions?", btn: "Contact us" },
  fill: 110,
  fillMobile: 0,
};
