# Confidential & Constructive Advisory DPIA Readiness Assessment
## Target: `https://razorpay.com` (Razorpay (Fintech & Payment Gateway) — Fintech / Payments)

- **Audit ID**: `DPIA-BENCH-2026-RAZORPAY`
- **Evaluated At (UTC)**: `2026-11-06T08:34:03.132Z`
- **Canonical Domain**: `razorpay.com`
- **Audit Scope**: Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)
- **Statutory Baseline**: Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule) & Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)
- **Overall Readiness Score**: **87 / 100** (`High Readiness (Aligned)`)
- **Rule 13 DPIA & Algorithmic Governance Triggered**: `true`

---

## 1. Executive Readiness Synopsis

This confidential, read-only passive DPIA readiness assessment of Razorpay (Fintech & Payment Gateway) (https://razorpay.com, Sector: Fintech / Payments) evaluated publicly observable HTTP headers, 6 Set-Cookie header(s), 5 external script(s), and 4 client-side automation signature(s) against the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 (G.S.R. 846(E)). Overall Readiness Score: 87/100 (High Readiness (Aligned)).

### Key Observed Strengths
- HTTPS transport security active on https://razorpay.com/ (HTTP 200, 404ms response time).
- Zero pre-ticked consent checkboxes observed across 0 inspected DOM form(s).
- Surfaces 4 accessible privacy/legal notice link(s) directly in the DOM.
- Enforces HTTP Strict-Transport-Security (max-age=315360000; includeSubDomains).
- Publishes Grievance Officer / redressal governance information in inspected policy documentation.

### Priority Readiness Enhancements
- Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4): Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.
- Website Automations, AI & Profiling (Sec 6 / Rule 13(2)): Maintain an internal Website Automation & Tag Governance Register mapping each client-side SDK to its consent category, data retention TTL, and DOM input-masking configuration.
- Reasonable Security Safeguards (Sec 8(5) / Rule 6): Configure edge CDN/web server responses to include Strict-Transport-Security (max-age=31536000; includeSubDomains), a restrictive Content-Security-Policy, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin, alongside 1-year security log retention (Rule 8(3)).
- Cross-Border Sub-Processors (Sec 16 / Rule 15): Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).

---

## 2. Passive HTTP & Security Header Telemetry (Section 8(5) & Rule 6)

| Signal | Observed Value |
| :--- | :--- |
| **HTTP Status & Final URL** | `HTTP 200` -> `https://razorpay.com/` (404 ms) |
| **Strict-Transport-Security (HSTS)** | `max-age=315360000; includeSubDomains` |
| **Content-Security-Policy (CSP)** | `Not present in initial response` |
| **X-Frame-Options** | `SAMEORIGIN` |
| **X-Content-Type-Options** | `nosniff` |
| **Referrer-Policy** | `Not present` |

---

## 3. Pre-Consent Storage & Cookie Inventory (Section 6 & Rules 3–4)

- **Pre-Consent Non-Essential Tracking Observed**: `true`
- **First-Party Cookies Set on Load**: `6`
- **Third-Party Cookies Set on Load**: `0`

| Cookie Name | Domain | Category | HttpOnly | Secure | SameSite | Expiry (Days) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ab_user_id` | `razorpay.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `additional-cache-params` | `razorpay.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `visit_time_stamp` | `razorpay.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `cloudfront_viewer_country` | `razorpay.com` | Strictly Necessary / Security | `false` | `true` | `Lax` | `0.2` |
| `cloudfront_viewer_country_region` | `razorpay.com` | Strictly Necessary / Security | `false` | `true` | `Lax` | `0.2` |
| `cloudfront_viewer_country_region_name` | `razorpay.com` | Strictly Necessary / Security | `false` | `true` | `Lax` | `0.2` |

---

## 4. Website Automations & Rule 13(2) Profiling Inventory

- **Total Client-Side Automations Detected**: `4`
- **Rule 13 Trigger Rationale**: Observed 4 client-side automation/telemetry signal(s) on razorpay.com (including CRM, CDP, session replay, chat, or ad-tech integrations), which warrant formal documentation under Rule 13(1)-(2) DPIA and algorithmic governance workflows.

| Vendor / Integration | Category | Empirical Signal Observed | Rule 13(2) Governance Relevance | Recommended Advisory Action |
| :--- | :--- | :--- | :--- | :--- |
| **Google Tag Manager (GTM)** | CDP & Event Routing | `Script URL: https://www.googletagmanager.com/gtag/js?id=G-F42RZ69DW8` | Orchestrates client-side event routing and third-party tag firing; requires consent gating under Section 6 and Rule 3 prior to non-essential telemetry dispatch. | Configure Google Tag Manager Consent Mode v2 with default denied state for analytics_storage and ad_storage until affirmative Data Principal consent is recorded. |
| **Google Analytics 4 (GA4)** | CDP & Event Routing | `Script URL: https://www.googletagmanager.com/gtag/js?id=G-F42RZ69DW8` | Collects pseudonymous client identifiers, pageview sequences, and behavioral engagement metrics relevant to Section 6 consent governance. | Gate GA4 initialization behind affirmative opt-in consent and enable IP anonymization and data retention controls aligned with Section 8(7). |
| **Segment / RudderStack CDP** | CDP & Event Routing | `DOM/Script signature match: cdn.segment.com` | Synchronizes user traits and behavioral events across downstream marketing and analytics destinations (Rule 13(2) profiling relevance). | Bind CDP middleware to the Consent Management Platform (CMP) category preferences prior to dispatching identify() or track() payloads. |
| **Microsoft Clarity** | Session Replay & Behavioral Heatmap | `DOM/Script signature match: clarity.ms/tag` | Captures DOM mutations, scroll heatmaps, and interaction telemetry; high relevance to Section 8(5) input masking and Rule 13(2). | Enforce strict DOM input masking for all personal data fields and delay script load until analytics consent is granted. |

---

## 5. Statutory DPDPA 2023 & DPDP Rules 2025 Control Matrix

| Statutory Pillar | Reference | Readiness Tier | Advisory Summary |
| :--- | :--- | :--- | :--- |
| **Notice & Transparency** | DPDP Act Section 5(1) & DPDP Rules, 2025 Rule 3 | **Aligned** | Privacy/legal notice links are discoverable in the DOM; ensure itemised data and purpose disclosures per Rule 3. |
| **Consent & Dark-Pattern Symmetry** | DPDP Act Section 6(1), 6(4) & DPDP Rules, 2025 Rules 3-4 | **Priority Readiness Action** | Gate non-essential cookies and analytics/marketing scripts behind an affirmative consent banner with symmetrical Reject/Manage controls. |
| **Security & 1-Yr Log Retention** | DPDP Act Section 8(5) & DPDP Rules, 2025 Rule 6 & Rule 8(3) | **Advisory Enhancement** | Enhance edge header posture by adding: Content-Security-Policy (CSP). |
| **Children's Data Safeguards** | DPDP Act Section 9(1)-(3) & DPDP Rules, 2025 Rules 10-11 | **Aligned** | Ensure age-gating or verifiable parental consent workflows are documented where services may be accessed by Data Principals under 18. |
| **Rule 13 DPIA & Algorithmic Risk** | DPDP Act Section 10(2)(c) & DPDP Rules, 2025 Rule 13(1)-(3) | **Advisory Enhancement** | Document client-side marketing, CDP, session replay, and conversational automations in the annual Rule 13 DPIA register. |
| **Grievance Redressal (90-Day SLA)** | DPDP Act Section 8(10), Section 13 & DPDP Rules, 2025 Rule 14(3) | **Aligned** | Publish designated Grievance Officer / DPO contact details and explicitly state the 90-day maximum grievance resolution SLA per Rule 14(3). |
| **Cross-Border Sub-Processors** | DPDP Act Section 8(2), Section 16 & DPDP Rules, 2025 Rule 15 | **Advisory Enhancement** | Document the 8 external script/asset domain(s) in the Sub-Processor & Cross-Border Transfer Register. |

---

## 6. Constructive Advisory Findings & Engineering Recommendations

### DPIA-001: Notice & Transparency (Sec 5 / Rule 3) — `Aligned`
- **Observed Technical Signal**: HTTP 200 on https://razorpay.com; 4 privacy/legal notice link(s) detected in DOM (https://razorpay.com/terms/90-day-free-pg-offer/, https://razorpay.com/terms/rsl).
- **Statutory Mapping**: DPDP Act, 2023 Section 5(1) read with DPDP Rules, 2025 Rule 3 (Itemised Notice in clear and plain language)
- **Constructive Advisory Note**: The website surfaces 4 accessible privacy/legal notice link(s) in the DOM. To strengthen Rule 3 readiness, ensure the notice presents an itemised inventory of personal data categories and specific processing purposes at every data collection point.
- **Recommended Engineering Fix**: Ensure every page footer and data collection form includes a prominent, static HTML anchor link to an itemised Section 5 / Rule 3 Privacy Notice with multi-language support (Eighth Schedule languages).
- **Verification Method**: Run a read-only curl/DOM check on the landing page and verify `<a href="/privacy">` is present in the server-rendered HTML.

### DPIA-002: Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4) — `Priority Readiness Action`
- **Observed Technical Signal**: Set-Cookie headers on initial GET: 6 cookie(s) (6 first-party, 0 third-party; cookie names: ab_user_id, additional-cache-params, visit_time_stamp, cloudfront_viewer_country, cloudfront_viewer_country_region, cloudfront_viewer_country_region_name); CMP banners detected: none; pre-ticked checkboxes: 0.
- **Statutory Mapping**: DPDP Act, 2023 Section 6(1) & Section 6(4) read with DPDP Rules, 2025 Rules 3 and 4 (Free, specific, informed, unconditional consent & withdrawal ease)
- **Constructive Advisory Note**: Initial page load sets 6 cookie(s) and loads 4 client-side telemetry/automation script signature(s) prior to an affirmative consent interaction. While common across modern web architectures, gating non-essential analytics and marketing tags behind an explicit opt-in banner with symmetrical 'Accept' and 'Reject / Manage' controls aligns the user journey with Section 6(1) and Section 6(4).
- **Recommended Engineering Fix**: Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.
- **Verification Method**: Inspect initial HTTP `Set-Cookie` headers and network requests in a clean browser profile before interacting with the consent banner.

### DPIA-003: Website Automations, AI & Profiling (Sec 6 / Rule 13(2)) — `Advisory Enhancement`
- **Observed Technical Signal**: Detected 4 client-side automation signature(s) across 5 external script(s): Google Tag Manager (GTM) (Script URL: https://www.googletagmanager.com/gtag/js?id=G-F42RZ69DW8); Google Analytics 4 (GA4) (Script URL: https://www.googletagmanager.com/gtag/js?id=G-F42RZ69DW8); Segment / RudderStack CDP (DOM/Script signature match: cdn.segment.com); Microsoft Clarity (DOM/Script signature match: clarity.ms/tag).
- **Statutory Mapping**: DPDP Act, 2023 Section 6 & Section 10(2)(c) read with DPDP Rules, 2025 Rule 13(1)-(3) (Annual DPIA & algorithmic/automated software risk assessment)
- **Constructive Advisory Note**: Passive DOM inspection identified 4 client-side automation or telemetry integration(s). Under Rule 13(2), Significant Data Fiduciaries (and privacy-forward enterprises conducting proactive DPIAs) are encouraged to document the purpose, behavioral profiling scope, and consent binding of all tag managers, CRM trackers, session replay tools, and conversational widgets.
- **Recommended Engineering Fix**: Maintain an internal Website Automation & Tag Governance Register mapping each client-side SDK to its consent category, data retention TTL, and DOM input-masking configuration.
- **Verification Method**: Verify that every script in the tag manager is bound to an explicit consent trigger and documented in the annual Rule 13 DPIA ledger.

### DPIA-004: Reasonable Security Safeguards (Sec 8(5) / Rule 6) — `Advisory Enhancement`
- **Observed Technical Signal**: Security headers on https://razorpay.com/: HSTS=Present, CSP=Absent, X-Frame-Options=SAMEORIGIN, X-Content-Type-Options=nosniff, Referrer-Policy=Absent.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(5) read with DPDP Rules, 2025 Rule 6 (Reasonable security safeguards, encryption in transit, access controls) and Rule 8(3) (1-year minimum security log retention)
- **Constructive Advisory Note**: HTTPS encryption is active on razorpay.com; adding Content-Security-Policy (CSP) in the HTTP response headers will further harden client-side defense-in-depth against unauthorized script injection or framing under Rule 6(1).
- **Recommended Engineering Fix**: Configure edge CDN/web server responses to include Strict-Transport-Security (max-age=31536000; includeSubDomains), a restrictive Content-Security-Policy, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin, alongside 1-year security log retention (Rule 8(3)).
- **Verification Method**: Run `curl -sI https://razorpay.com` and confirm all recommended security headers are returned with HTTP 200.

### DPIA-005: Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3)) — `Aligned`
- **Observed Technical Signal**: Grievance/DPO links in landing DOM: 1; Grievance Officer mention in policy corpus: true; DPO/Privacy contact mention: true; 90-day SLA mention: true.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(10) & Section 13 read with DPDP Rules, 2025 Rule 14(3) (Grievance resolution within a period not exceeding 90 days)
- **Constructive Advisory Note**: The inspected website and policy corpus surface clear Grievance Officer / DPO contact details and reference the statutory 90-day resolution timeline under Rule 14(3).
- **Recommended Engineering Fix**: Add a dedicated Grievance Redressal & DPO section to the Privacy Notice footer specifying the Officer name/designation, email/portal link, and the Rule 14(3) 90-day maximum resolution SLA.
- **Verification Method**: Inspect the public Privacy Notice page for explicit mention of "Grievance Officer" and "90 days" (Rule 14(3)).

### DPIA-006: Cross-Border Sub-Processors (Sec 16 / Rule 15) — `Advisory Enhancement`
- **Observed Technical Signal**: Observed 8 external asset/script domain(s) on initial page load: www.googletagmanager.com, events.framer.com, framerusercontent.com, cdn.segment.com, sentry-cdn.com, clarity.ms, browser.sentry-cdn.com, fonts.gstatic.com.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(2) & Section 16 read with DPDP Rules, 2025 Rule 15 (Cross-border transfer conditions & Data Processor contracts)
- **Constructive Advisory Note**: The website loads resources from 8 external domain(s), which initiates client browser connections (sharing IP address and User-Agent metadata) with global CDN or SaaS endpoints. Cataloging these endpoints in an internal Sub-Processor & Cross-Border Register supports Section 8(2) and Section 16 governance.
- **Recommended Engineering Fix**: Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).
- **Verification Method**: Cross-check all third-party domains observed in passive network telemetry against the published Sub-Processor Register.


---

## 7. External Sub-Processor & Cross-Border Endpoint Register (Section 16 / Rule 15)

| Third-Party Domain | Vendor / Service | Category | Primary Jurisdiction | Governance Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `www.googletagmanager.com` | Google LLC (Google Tag Manager / Analytics) | Tag Management & Web Analytics | United States / Global Cloud | Ensure Google Tag Manager Consent Mode v2 is active and documented in the Section 5 itemised notice and Section 16 cross-border register. |
| `events.framer.com` | External Service (events.framer.com) | Third-Party Web Resource / Telemetry Endpoint | Global / Multi-Region Cloud | Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15. |
| `framerusercontent.com` | External Service (framerusercontent.com) | Third-Party Web Resource / Telemetry Endpoint | Global / Multi-Region Cloud | Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15. |
| `cdn.segment.com` | External Service (cdn.segment.com) | Third-Party Web Resource / Telemetry Endpoint | Global / Multi-Region Cloud | Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15. |
| `sentry-cdn.com` | External Service (sentry-cdn.com) | Third-Party Web Resource / Telemetry Endpoint | Global / Multi-Region Cloud | Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15. |
| `clarity.ms` | Microsoft Corporation (Clarity / Bing) | UX Telemetry & Advertising Attribution | United States / Azure Global | Enforce strict DOM input masking in Clarity and gate initialization behind user consent. |
| `browser.sentry-cdn.com` | External Service (browser.sentry-cdn.com) | Third-Party Web Resource / Telemetry Endpoint | Global / Multi-Region Cloud | Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15. |
| `fonts.gstatic.com` | Google LLC (Fonts & Static Web Assets) | CDN & Typography Delivery | United States / Global Edge CDN | Consider self-hosting static web fonts or documenting CDN asset delivery under Section 8(5) vendor governance. |

---

## 8. Reputation-Safety & Passive Scope Attestation

> **Disclaimer**: This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.
