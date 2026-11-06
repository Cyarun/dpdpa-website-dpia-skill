# Confidential & Constructive Advisory DPIA Readiness Assessment

- **Target URL**: `https://razorpay.com/`
- **Canonical Domain**: `razorpay.com`
- **Audit ID**: `DPIA-WEB-D626F9B4`
- **Evaluated At (UTC)**: `2026-11-06T08:35:42.979Z`
- **Evaluating Model Adapter**: `deepseek`
- **Audit Scope**: Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)

> **Disclaimer**: This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.

---

## 1. Statutory Baseline (Tier-1 Canonical Sources)
- **Primary Act**: Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule)
- **Subordinate Rules**: Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)
- **Phased Enforcement Timeline**: Phased: 13 Nov 2025 (Rules 1-2, 17-21); 13 Nov 2026 (Rule 4 Consent Manager registration); 13 May 2027 (Rules 3, 5-16, 22-23 operational compliance)
- **Grievance Redressal SLA**: Maximum **90 days** (Section 13 read with Rule 14(3))
- **Security Log Retention Minimum**: **Minimum 1 year (Rule 8(3) read with Seventh Schedule)**

---

## 2. Executive Readiness Summary
- **Overall Readiness Score**: **62 / 100**
- **Readiness Posture**: **Foundational Readiness (Priority Engineering Actions Recommended)**
- **Rule 13(2) DPIA & Algorithmic Risk Triggered**: `true`
- **Rule 13 Rationale**: Observed 4 client-side automation/tracking integration(s) (including session replay, AI chat, CRM, or ad pixels) that process behavioural telemetry and warrant a formal Rule 13(2) algorithmic & software risk review.

### Board Advisory Synopsis
This confidential, read-only DPIA readiness assessment inspected razorpay.com against the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 (G.S.R. 846(E)). The website achieved an advisory readiness score of 62/100 (Foundational Readiness (Priority Engineering Actions Recommended)), with 4 client-side automation/tracking signal(s) and 3 external sub-processor domain(s) catalogued for engineering and DPO review.

---

## 3. Pre-Consent Storage & Cookies Inventory
- **Pre-Consent Tracking Observed**: `false`
- **First-Party Cookies Count**: 0
- **Third-Party Cookies Count**: 0

---

## 4. Website Automations, AI Agents, Session Replay & Profiling Inventory (Rule 13(2))
- **Total Client-Side Automations Detected**: **4**
- **Marketing & CRM Automations**: 0
- **CDP & Event Routers**: 2
- **Session Replay & Behavioral Heatmaps**: 1
- **AI Chatbots & Support Widgets**: 0
- **Ad Pixels & Auto-Advanced Matching**: 1
- **Forms Inspected**: 0 (Pre-ticked checkboxes: 0)

---

## 5. Statutory DPDPA Control Matrix
| Statutory Pillar | Reference | Readiness Tier | Advisory Summary |
| :--- | :--- | :--- | :--- |
| Notice & Transparency | Section 5(1)-(2) & Rule 3 (G.S.R. 846(E)) | **Advisory Enhancement** | A publicly accessible privacy notice link is present. Enhancing the notice with an itemised data-purpose table and Eighth Schedule language accessibility strengthens Section 5(1) and Rule 3 readiness ahead of the 13 May 2027 operational milestone. |
| Consent & CMP Symmetry | Section 6(1)-(6) & Rules 3-4 (G.S.R. 846(E)) | **Priority Readiness Action** | Non-essential analytics, marketing, or automation scripts were observed loading prior to an explicit consent banner interaction. |
| Security Safeguards & 1-Yr Logs | Section 8(5), Rule 6 & Rule 8(3) + Seventh Schedule (1-Year Log Retention) | **Advisory Enhancement** | Enhancing HTTP response security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and adding Subresource Integrity (`integrity=`) attributes on third-party scripts strengthens Rule 6(1) safeguards against client-side script tampering. |
| Children's Data Safeguards | Section 9(1)-(3) & Rules 10-11 + Fourth Schedule | **Priority Readiness Action** | Where web flows are accessible to or directed at children (under 18 years), Section 9(1) and Rule 10 require verifiable parental consent, and Section 9(3) strictly prohibits tracking, behavioural monitoring, and targeted advertising directed at children. |
| DPIA & Algorithmic Governance | Section 10(2)(c)(ii) & Rule 13(1)-(3) (Annual DPIA & Algorithmic Risk) | **Priority Readiness Action** | Observed client-side marketing, session replay, conversational AI, or ad-pixel automations. Under Rule 13(2), Data Fiduciaries (and Significant Data Fiduciaries in annual DPIAs) should verify that algorithmic software, automated profiling, and session capture scripts do not create unconsented risk to the rights of Data Principals. |
| Grievance Redressal (90-Day SLA) | Section 13 & Rule 14(3) (90-Day Statutory Grievance SLA) | **Aligned** | Publishing the business contact details of the Data Protection Officer (for Significant Data Fiduciaries) or Grievance Officer along with an explicit commitment to respond within the 90-day statutory maximum under Rule 14(3) enhances transparency and Data Principal trust. |
| Cross-Border Sub-Processors | Section 8(2), Section 16 & Rule 15 (Cross-Border Data Transfers) | **Advisory Enhancement** | External script/API requests automatically transmit client IP addresses, browser headers, and page URLs to third-party infrastructure. Documenting these Data Processors under valid Section 8(2) contracts and verifying cross-border transfer conditions under Section 16 and Rule 15 is recommended. |

---

## 6. Constructive Advisory Findings
### DPIA-001: Notice & Transparency (Sec 5 / Rule 3) — [Advisory Enhancement]
- **Observed Technical Signal**: Observed 6 privacy/notice anchor link(s) (https://razorpay.com/privacy/, https://razorpay.com/notice/). Eighth Schedule Indian language selector signal: Not detected on landing DOM.
- **Statutory Mapping**: Section 5(1)-(2) of the DPDP Act, 2023 read with Rule 3 of the DPDP Rules, 2025 (G.S.R. 846(E))
- **Advisory Note**: A publicly accessible privacy notice link is present. Enhancing the notice with an itemised data-purpose table and Eighth Schedule language accessibility strengthens Section 5(1) and Rule 3 readiness ahead of the 13 May 2027 operational milestone.
- **Recommended Engineering Fix**: Publish a standalone, itemised Section 5 / Rule 3 Privacy Notice detailing personal data categories, specific purposes, DPO/Grievance contact, 90-day grievance SLA (Rule 14(3)), and English + Eighth Schedule language toggle.
- **Verification Method**: Inspect DOM footer and all form containers for `<a href="/privacy-notice">` and verify multi-language selector rendering.

### DPIA-002: Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4) — [Priority Readiness Action]
- **Observed Technical Signal**: CMP scripts detected: None; Pre-ticked checkboxes: 0; Accept buttons: 0, Reject/Essential-Only buttons: 0; Consent withdrawal link: Not detected.
- **Statutory Mapping**: Section 6(1), Section 6(4), and Section 6(6) of the DPDP Act, 2023 read with Rules 3 and 4 of the DPDP Rules, 2025
- **Advisory Note**: Non-essential analytics, marketing, or automation scripts were observed loading prior to an explicit consent banner interaction.
- **Recommended Engineering Fix**: Remove all `checked` attributes from optional consent checkboxes, deploy a Section 6-aligned consent banner with equal-prominence `Accept` and `Reject Non-Essential` buttons, and expose a persistent footer trigger to withdraw consent with ease comparable to granting it.
- **Verification Method**: Load the page in a clean browser context and verify zero non-essential cookies/beacons fire before clicking "Accept", and confirm "Reject" is reachable in the same layer.

### DPIA-003: Website Automations, AI & Profiling (Sec 6 / Rule 13(2)) — [Priority Readiness Action]
- **Observed Technical Signal**: Total client-side automations detected: 4 (Marketing/CRM: 0, CDP/Tag Managers: 2, Session Replay/Heatmaps: 1, AI Chatbots/Widgets: 0, Ad Pixels: 1, Early field listeners: false).
- **Statutory Mapping**: Section 6(1) & Section 10(2)(c)(ii) of the DPDP Act, 2023 read with Rule 13(1)-(3) and Rule 6 of the DPDP Rules, 2025
- **Advisory Note**: Observed client-side marketing, session replay, conversational AI, or ad-pixel automations. Under Rule 13(2), Data Fiduciaries (and Significant Data Fiduciaries in annual DPIAs) should verify that algorithmic software, automated profiling, and session capture scripts do not create unconsented risk to the rights of Data Principals.
- **Recommended Engineering Fix**: Gate all marketing, CRM, session replay, and pixel automations behind affirmative consent categories; enforce strict DOM input masking (`data-clarity-mask`, `.fs-mask`) on session replay tools; and disable automatic form-field scraping prior to form submit.
- **Verification Method**: Run `collect_website_dpia_telemetry.mjs` and confirm all third-party automation tags remain dormant until consent state transitions to granted.

### DPIA-004: Reasonable Security Safeguards (Sec 8(5) / Rule 6) — [Advisory Enhancement]
- **Observed Technical Signal**: HTTPS: true; HSTS: false; CSP: false; X-Content-Type-Options: false; Referrer-Policy: false; Permissions-Policy: false; External scripts with SRI: 0/6.
- **Statutory Mapping**: Section 8(5) of the DPDP Act, 2023 read with Rule 6 (Reasonable Security Safeguards) and Rule 8(3) read with the Seventh Schedule (minimum 1-year log retention) of the DPDP Rules, 2025
- **Advisory Note**: Enhancing HTTP response security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and adding Subresource Integrity (`integrity=`) attributes on third-party scripts strengthens Rule 6(1) safeguards against client-side script tampering.
- **Recommended Engineering Fix**: Configure `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, a strict `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and retain server/access logs for a minimum of 1 year under Rule 8(3) and the Seventh Schedule.
- **Verification Method**: Inspect HTTP response headers via `curl -I` and verify SRI hashes on all external `<script src="...">` tags.

### DPIA-005: Children's Data Protection (Sec 9 / Rules 10-11) — [Priority Readiness Action]
- **Observed Technical Signal**: Youth/child audience indicators: true; Age-gate / verifiable parental consent signal: false; Active behavioural/ad pixels on page: 2.
- **Statutory Mapping**: Section 9(1)-(3) of the DPDP Act, 2023 read with Rules 10 and 11 and the Fourth Schedule of the DPDP Rules, 2025
- **Advisory Note**: Where web flows are accessible to or directed at children (under 18 years), Section 9(1) and Rule 10 require verifiable parental consent, and Section 9(3) strictly prohibits tracking, behavioural monitoring, and targeted advertising directed at children.
- **Recommended Engineering Fix**: If minor users are onboarded, implement a Rule 10 verifiable parental consent workflow (reliable identity/age token) and programmatically disable all behavioural analytics, session replay, and ad pixels for under-18 sessions (Section 9(3)).
- **Verification Method**: Verify that sessions flagged as under-18 suppress all third-party marketing and behavioural telemetry.

### DPIA-006: Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3)) — [Aligned]
- **Observed Technical Signal**: Grievance Officer / DPO text mention: true; Dedicated privacy/grievance emails found: None on landing page; 90-day SLA stated: true; Legacy 30/7-day SLA stated: false.
- **Statutory Mapping**: Section 8(9), Section 10(2)(a), and Section 13 of the DPDP Act, 2023 read with Rule 14(3) of the DPDP Rules, 2025 (90-day statutory grievance resolution period)
- **Advisory Note**: Publishing the business contact details of the Data Protection Officer (for Significant Data Fiduciaries) or Grievance Officer along with an explicit commitment to respond within the 90-day statutory maximum under Rule 14(3) enhances transparency and Data Principal trust.
- **Recommended Engineering Fix**: Display the Grievance Officer / DPO designation, official email, postal address, and an explicit statement that grievances are resolved within a period not exceeding 90 days in accordance with Section 13 and Rule 14(3).
- **Verification Method**: Confirm the Privacy Notice and footer contain the DPO/Grievance contact block and the exact 90-day SLA reference.

### DPIA-007: Cross-Border Sub-Processors (Sec 16 / Rule 15) — [Advisory Enhancement]
- **Observed Technical Signal**: Observed 3 external third-party domain(s) receiving client network requests (www.googletagmanager.com, events.framer.com, framerusercontent.com).
- **Statutory Mapping**: Section 8(2) and Section 16 of the DPDP Act, 2023 read with Rule 15 of the DPDP Rules, 2025
- **Advisory Note**: External script/API requests automatically transmit client IP addresses, browser headers, and page URLs to third-party infrastructure. Documenting these Data Processors under valid Section 8(2) contracts and verifying cross-border transfer conditions under Section 16 and Rule 15 is recommended.
- **Recommended Engineering Fix**: Maintain a live Sub-Processor & Cross-Border Transfer Register mapped to Section 8(2) Data Processing Agreements and Rule 15 transfer conditions; self-host static fonts and scripts where feasible.
- **Verification Method**: Cross-check all domains in `subprocessor_and_cross_border_register` against signed Data Processor agreements.
