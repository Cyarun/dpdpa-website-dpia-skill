---
name: website-dpia-audit
description: Use when conducting a read-only, reputation-safe Website Data Protection Impact Assessment (DPIA) & Client-Side Automation Readiness Audit under India's Digital Personal Data Protection Act, 2023 (DPDP Act) and DPDP Rules, 2025 (G.S.R. 846(E)). Detects pre-consent cookies, storage, marketing/CRM automations, CDPs, session replay, AI chatbots, ad pixels, dark patterns, security headers, 90-day grievance SLA signals, and cross-border sub-processors across Claude, Gemini, DeepSeek, and Qwen.
---

# Website DPIA & Automation Readiness Auditor (`website-dpia-audit`)

## Purpose & Scope (Websites Only — Read-Only & Reputation-Safe)

This skill conducts an empirical, **read-only, non-intrusive Website DPIA (Data Protection Impact Assessment) & Automation Readiness Assessment** for any target website URL or local HTML build. It is engineered to work deterministically across **Claude (3.5/3.7/4 Sonnet & Opus)**, **Google Gemini (2.5 Pro/Flash)**, **DeepSeek (R1 & V3)**, and **Alibaba Qwen (Qwen-2.5/Qwen3/QwQ)**.

---

## Hard Invariants (Never Violate)

1. **Statutory Precision (Tier-1 Canonical Sources Only)**:
   - **DPDP Act, 2023 (Act No. 22 of 2023)**: **9 Chapters, 44 Sections, 1 Schedule**.
   - **DPDP Rules, 2025 (G.S.R. 846(E), notified 13 November 2025)**: **23 Rules, 7 Schedules**.
     - *Phased Commencement*: **13 Nov 2025** (Rules 1–2, 17–21); **13 Nov 2026** (+1 yr: Rule 4 Consent Manager registration); **13 May 2027** (+18 mo: Rules 3, 5–16, 22–23 operational compliance).
   - **Grievance Redressal SLA**: Maximum **90 days** under **Rule 14(3)** read with **Section 13** (never cite 30 or 7 days as the DPDP statutory cap).
   - **Security & Access Log Retention**: Minimum **1 year** under **Rule 8(3)** read with the **Seventh Schedule**.
   - **DPIA & Algorithmic Risk Assessment Mandate**: **Section 10(2)(c)(ii)** read with **Rule 13(1)–(3)** (annual DPIA for Significant Data Fiduciaries + duty to verify that algorithmic software, AI chatbots, session replay, and automated profiling do not pose a risk to the rights of Data Principals).
   - **Children's Data**: **Section 9(1)–(3)** read with **Rules 10–11** and the **Fourth Schedule** (verifiable parental consent for under-18 users; strict prohibition on tracking, behavioural monitoring, and targeted advertising directed at children).

2. **Reputation-Safe, Constructive Advisory Framing (Zero Defamation)**:
   - Every report MUST be titled and framed as a **"Confidential & Constructive Advisory DPIA Readiness Assessment"** based solely on publicly observable client-side signals at the timestamp of inspection.
   - **Prohibited Words**: Never use `illegal`, `unlawful`, `lawbreaker`, `violator`, `criminal`, `guilty`, `penalized`, `fineable`, `sued`, `offender`, `scam`, or `fraud`.
   - **Required 5-Part Finding Structure**:
     1. `observed_technical_signal` (exact DOM/header/cookie/network evidence; zero hallucination)
     2. `statutory_mapping` (exact DPDP Act 2023 Section + DPDP Rules 2025 Rule)
     3. `readiness_tier` (`Aligned` | `Advisory Enhancement` | `Priority Readiness Action`)
     4. `reputation_safe_advisory_note` (neutral, board-ready explanation)
     5. `recommended_engineering_fix` (concrete code/header/CMP configuration step)

---

## Step-by-Step Audit Workflow

### Step 1: Collect Empirical Website Telemetry & Baseline DPIA Report

Run the read-only telemetry collector against the target website URL (or local HTML file):

```bash
node products/dpia-audit-skill/scripts/collect_website_dpia_telemetry.mjs "<https://target-website.example>" \
  --out "/tmp/dpia-telemetry-report.json" \
  --model "<claude|gemini|deepseek|qwen|deterministic-telemetry-only>"
```

What `collect_website_dpia_telemetry.mjs` automatically inspects in read-only mode:
- **A. Pre-Consent Storage & Cookies**: First-party and third-party cookies set prior to any user interaction (`httpOnly`, `secure`, `sameSite`, expiry), `localStorage`, `sessionStorage`, `IndexedDB`, and `ServiceWorker` registrations.
- **B. Website Automations, AI Agents, Session Replay & Behavioral Profiling (Rule 13(2) & Section 6)**:
  - *Marketing & CRM Automations*: HubSpot, Marketo, Pardot, ActiveCampaign, Klaviyo, Braze, MoEngage, WebEngage, CleverTap, Zoho PageSense/SalesIQ, Mailchimp, Customer.io, Drip, OmniSend.
  - *CDP & Event Routers*: Segment (`analytics.js`), Google Tag Manager (`gtm.js`), RudderStack, mParticle, Snowplow, Tealium, Adobe Launch.
  - *Session Replay & Behavioral Heatmaps*: Microsoft Clarity, Hotjar, FullStory, LogRocket, Smartlook, PostHog, Mouseflow, CrazyEgg, Contentsquare, LuckyOrange.
  - *AI Chatbots & Support Widgets*: Intercom, Drift, Crisp, Freshchat, Zendesk, Tidio, LiveChat, Botpress, Voiceflow, Ada, Yellow.ai, Haptik, Verloop, Gupshup, Wati / WhatsApp Business floating widgets.
  - *Ad Pixels & Auto-Advanced Matching*: Meta Pixel (`fbevents.js`, `fbq`), Google Ads/Analytics (`gtag.js`), LinkedIn Insight (`lintrk`), X/Twitter, Snap, TikTok, Criteo, Taboola, Outbrain.
  - *Form Listeners & Dark Patterns*: Pre-ticked checkboxes (`input[type="checkbox"][checked]`), bundled consent, insecure `http://` form actions, pre-submit field capture listeners, on-load Web Push prompts (`Notification.requestPermission`), and Canvas/Audio fingerprinting signals.
- **C. Statutory Control Pillars**:
  - **Sec 5 / Rule 3**: Privacy Notice link presence & Eighth Schedule Indian language availability signals.
  - **Sec 6 / Rules 3–4**: CMP presence (OneTrust, Cookiebot, CookieYes, Osano, TrustArc, Securiti, Didomi, Klaro/custom) & visual symmetry between `Accept` and `Reject / Essential Only` controls + consent withdrawal link.
  - **Sec 8(5) / Rule 6 / Rule 8(3)**: HTTPS, HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, Subresource Integrity (`integrity=`) on external scripts, and 1-year log retention advisory.
  - **Sec 9 / Rules 10–11**: Children's audience signals vs. active behavioural/ad trackers.
  - **Sec 13 / Rule 14(3)**: DPO / Grievance Officer contact details and **90-day statutory SLA** verification.
  - **Sec 16 / Rule 15**: Cross-border sub-processor domain inventory.

### Step 2: Synthesize & Validate Against the Multi-Model Schema

1. Load the universal prompt pack from `products/dpia-audit-skill/prompts/universal-dpia-system-prompt.md`.
2. Validate the output JSON against `products/dpia-audit-skill/schema/dpia-website-report.schema.json`.
3. Present both the structured JSON report and an executive Markdown summary table for the user, preserving the **Confidential & Constructive Advisory DPIA Readiness Assessment** disclaimer.

---

## Reference Artifacts

- **Telemetry Collector & Report Builder**: `products/dpia-audit-skill/scripts/collect_website_dpia_telemetry.mjs`
- **Multi-Model Prompt Pack (Claude / Gemini / DeepSeek / Qwen)**: `products/dpia-audit-skill/prompts/universal-dpia-system-prompt.md`
- **JSON Schema Contract**: `products/dpia-audit-skill/schema/dpia-website-report.schema.json`
