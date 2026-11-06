# Confidential & Constructive Advisory DPIA Readiness Assessment
## Target: `https://zerodha.com` (Zerodha (Financial Services & Broking) — Financial Services / Broking)

- **Audit ID**: `DPIA-BENCH-2026-ZERODHA`
- **Evaluated At (UTC)**: `2026-11-06T08:34:06.374Z`
- **Canonical Domain**: `zerodha.com`
- **Audit Scope**: Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)
- **Statutory Baseline**: Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule) & Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)
- **Overall Readiness Score**: **87 / 100** (`High Readiness (Aligned)`)
- **Rule 13 DPIA & Algorithmic Governance Triggered**: `false`

---

## 1. Executive Readiness Synopsis

This confidential, read-only passive DPIA readiness assessment of Zerodha (Financial Services & Broking) (https://zerodha.com, Sector: Financial Services / Broking) evaluated publicly observable HTTP headers, 2 Set-Cookie header(s), 6 external script(s), and 1 client-side automation signature(s) against the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 (G.S.R. 846(E)). Overall Readiness Score: 87/100 (High Readiness (Aligned)).

### Key Observed Strengths
- HTTPS transport security active on https://zerodha.com/ (HTTP 200, 217ms response time).
- Zero pre-ticked consent checkboxes observed across 0 inspected DOM form(s).
- Surfaces 2 accessible privacy/legal notice link(s) directly in the DOM.
- Enforces HTTP Strict-Transport-Security (max-age=15552000).
- Publishes Grievance Officer / redressal governance information in inspected policy documentation.

### Priority Readiness Enhancements
- Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4): Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.
- Reasonable Security Safeguards (Sec 8(5) / Rule 6): Configure edge CDN/web server responses to include Strict-Transport-Security (max-age=31536000; includeSubDomains), a restrictive Content-Security-Policy, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin, alongside 1-year security log retention (Rule 8(3)).
- Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3)): Add a dedicated Grievance Redressal & DPO section to the Privacy Notice footer specifying the Officer name/designation, email/portal link, and the Rule 14(3) 90-day maximum resolution SLA.
- Cross-Border Sub-Processors (Sec 16 / Rule 15): Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).

---

## 2. Passive HTTP & Security Header Telemetry (Section 8(5) & Rule 6)

| Signal | Observed Value |
| :--- | :--- |
| **HTTP Status & Final URL** | `HTTP 200` -> `https://zerodha.com/` (217 ms) |
| **Strict-Transport-Security (HSTS)** | `max-age=15552000` |
| **Content-Security-Policy (CSP)** | `Not present in initial response` |
| **X-Frame-Options** | `DENY` |
| **X-Content-Type-Options** | `Not present` |
| **Referrer-Policy** | `Not present` |

---

## 3. Pre-Consent Storage & Cookie Inventory (Section 6 & Rules 3–4)

- **Pre-Consent Non-Essential Tracking Observed**: `false`
- **First-Party Cookies Set on Load**: `2`
- **Third-Party Cookies Set on Load**: `0`

| Cookie Name | Domain | Category | HttpOnly | Secure | SameSite | Expiry (Days) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `__cf_bm` | `zerodha.com` | Strictly Necessary / Security | `true` | `true` | `None` | `0` |
| `_cfuvid` | `zerodha.com` | Strictly Necessary / Security | `true` | `true` | `None` | `0` |

---

## 4. Website Automations & Rule 13(2) Profiling Inventory

- **Total Client-Side Automations Detected**: `1`
- **Rule 13 Trigger Rationale**: Observed 1 client-side automation signal(s) on initial load without invasive cross-site behavioral profiling or automated decisioning triggers on the public landing page.

| Vendor / Integration | Category | Empirical Signal Observed | Rule 13(2) Governance Relevance | Recommended Advisory Action |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Web Analytics / Insights** | CDP & Event Routing | `HTTP Set-Cookie: __cf_bm (domain: zerodha.com)` | Provides edge bot mitigation and aggregate performance telemetry under Section 8(5) reasonable security safeguards. | Document edge security cookies and telemetry in the Section 5 / Rule 3 itemised privacy notice. |

---

## 5. Statutory DPDPA 2023 & DPDP Rules 2025 Control Matrix

| Statutory Pillar | Reference | Readiness Tier | Advisory Summary |
| :--- | :--- | :--- | :--- |
| **Notice & Transparency** | DPDP Act Section 5(1) & DPDP Rules, 2025 Rule 3 | **Aligned** | Privacy/legal notice links are discoverable in the DOM; ensure itemised data and purpose disclosures per Rule 3. |
| **Consent & Dark-Pattern Symmetry** | DPDP Act Section 6(1), 6(4) & DPDP Rules, 2025 Rules 3-4 | **Advisory Enhancement** | Pre-consent cookie and form posture is clean on initial HTTP load. |
| **Security & 1-Yr Log Retention** | DPDP Act Section 8(5) & DPDP Rules, 2025 Rule 6 & Rule 8(3) | **Advisory Enhancement** | Enhance edge header posture by adding: Content-Security-Policy (CSP), X-Content-Type-Options. |
| **Children's Data Safeguards** | DPDP Act Section 9(1)-(3) & DPDP Rules, 2025 Rules 10-11 | **Aligned** | Ensure age-gating or verifiable parental consent workflows are documented where services may be accessed by Data Principals under 18. |
| **Rule 13 DPIA & Algorithmic Risk** | DPDP Act Section 10(2)(c) & DPDP Rules, 2025 Rule 13(1)-(3) | **Aligned** | Low client-side automation complexity observed on initial landing page. |
| **Grievance Redressal (90-Day SLA)** | DPDP Act Section 8(10), Section 13 & DPDP Rules, 2025 Rule 14(3) | **Advisory Enhancement** | Publish designated Grievance Officer / DPO contact details and explicitly state the 90-day maximum grievance resolution SLA per Rule 14(3). |
| **Cross-Border Sub-Processors** | DPDP Act Section 8(2), Section 16 & DPDP Rules, 2025 Rule 15 | **Advisory Enhancement** | Document the 1 external script/asset domain(s) in the Sub-Processor & Cross-Border Transfer Register. |

---

## 6. Constructive Advisory Findings & Engineering Recommendations

### DPIA-001: Notice & Transparency (Sec 5 / Rule 3) — `Aligned`
- **Observed Technical Signal**: HTTP 200 on https://zerodha.com; 2 privacy/legal notice link(s) detected in DOM (https://zerodha.com/terms-and-conditions/, https://zerodha.com/privacy-policy/).
- **Statutory Mapping**: DPDP Act, 2023 Section 5(1) read with DPDP Rules, 2025 Rule 3 (Itemised Notice in clear and plain language)
- **Constructive Advisory Note**: The website surfaces 2 accessible privacy/legal notice link(s) in the DOM. To strengthen Rule 3 readiness, ensure the notice presents an itemised inventory of personal data categories and specific processing purposes at every data collection point.
- **Recommended Engineering Fix**: Ensure every page footer and data collection form includes a prominent, static HTML anchor link to an itemised Section 5 / Rule 3 Privacy Notice with multi-language support (Eighth Schedule languages).
- **Verification Method**: Run a read-only curl/DOM check on the landing page and verify `<a href="/privacy">` is present in the server-rendered HTML.

### DPIA-002: Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4) — `Advisory Enhancement`
- **Observed Technical Signal**: Set-Cookie headers on initial GET: 2 cookie(s) (2 first-party, 0 third-party; cookie names: __cf_bm, _cfuvid); CMP banners detected: none; pre-ticked checkboxes: 0.
- **Statutory Mapping**: DPDP Act, 2023 Section 6(1) & Section 6(4) read with DPDP Rules, 2025 Rules 3 and 4 (Free, specific, informed, unconditional consent & withdrawal ease)
- **Constructive Advisory Note**: Initial HTTP response sets 2 cookie(s) (0 non-essential) and zero pre-ticked checkboxes (0 found across 0 form(s)). Maintaining strict pre-consent script gating preserves high Section 6 readiness.
- **Recommended Engineering Fix**: Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.
- **Verification Method**: Inspect initial HTTP `Set-Cookie` headers and network requests in a clean browser profile before interacting with the consent banner.

### DPIA-003: Website Automations, AI & Profiling (Sec 6 / Rule 13(2)) — `Aligned`
- **Observed Technical Signal**: Detected 1 client-side automation signature(s) across 6 external script(s): Cloudflare Web Analytics / Insights (HTTP Set-Cookie: __cf_bm (domain: zerodha.com)).
- **Statutory Mapping**: DPDP Act, 2023 Section 6 & Section 10(2)(c) read with DPDP Rules, 2025 Rule 13(1)-(3) (Annual DPIA & algorithmic/automated software risk assessment)
- **Constructive Advisory Note**: Passive DOM inspection identified 1 client-side automation or telemetry integration(s). Under Rule 13(2), Significant Data Fiduciaries (and privacy-forward enterprises conducting proactive DPIAs) are encouraged to document the purpose, behavioral profiling scope, and consent binding of all tag managers, CRM trackers, session replay tools, and conversational widgets.
- **Recommended Engineering Fix**: Maintain an internal Website Automation & Tag Governance Register mapping each client-side SDK to its consent category, data retention TTL, and DOM input-masking configuration.
- **Verification Method**: Verify that every script in the tag manager is bound to an explicit consent trigger and documented in the annual Rule 13 DPIA ledger.

### DPIA-004: Reasonable Security Safeguards (Sec 8(5) / Rule 6) — `Advisory Enhancement`
- **Observed Technical Signal**: Security headers on https://zerodha.com/: HSTS=Present, CSP=Absent, X-Frame-Options=DENY, X-Content-Type-Options=Absent, Referrer-Policy=Absent.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(5) read with DPDP Rules, 2025 Rule 6 (Reasonable security safeguards, encryption in transit, access controls) and Rule 8(3) (1-year minimum security log retention)
- **Constructive Advisory Note**: HTTPS encryption is active on zerodha.com; adding Content-Security-Policy (CSP), X-Content-Type-Options in the HTTP response headers will further harden client-side defense-in-depth against unauthorized script injection or framing under Rule 6(1).
- **Recommended Engineering Fix**: Configure edge CDN/web server responses to include Strict-Transport-Security (max-age=31536000; includeSubDomains), a restrictive Content-Security-Policy, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin, alongside 1-year security log retention (Rule 8(3)).
- **Verification Method**: Run `curl -sI https://zerodha.com` and confirm all recommended security headers are returned with HTTP 200.

### DPIA-005: Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3)) — `Advisory Enhancement`
- **Observed Technical Signal**: Grievance/DPO links in landing DOM: 3; Grievance Officer mention in policy corpus: true; DPO/Privacy contact mention: true; 90-day SLA mention: false.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(10) & Section 13 read with DPDP Rules, 2025 Rule 14(3) (Grievance resolution within a period not exceeding 90 days)
- **Constructive Advisory Note**: While privacy or contact channels are available, explicitly publishing the designated Grievance Officer / Data Protection Officer contact coordinates and stating the statutory resolution SLA of 'not exceeding 90 days' (Rule 14(3)) in the public privacy notice provides immediate statutory clarity for Data Principals.
- **Recommended Engineering Fix**: Add a dedicated Grievance Redressal & DPO section to the Privacy Notice footer specifying the Officer name/designation, email/portal link, and the Rule 14(3) 90-day maximum resolution SLA.
- **Verification Method**: Inspect the public Privacy Notice page for explicit mention of "Grievance Officer" and "90 days" (Rule 14(3)).

### DPIA-006: Cross-Border Sub-Processors (Sec 16 / Rule 15) — `Advisory Enhancement`
- **Observed Technical Signal**: Observed 1 external asset/script domain(s) on initial page load: fonts.googleapis.com.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(2) & Section 16 read with DPDP Rules, 2025 Rule 15 (Cross-border transfer conditions & Data Processor contracts)
- **Constructive Advisory Note**: The website loads resources from 1 external domain(s), which initiates client browser connections (sharing IP address and User-Agent metadata) with global CDN or SaaS endpoints. Cataloging these endpoints in an internal Sub-Processor & Cross-Border Register supports Section 8(2) and Section 16 governance.
- **Recommended Engineering Fix**: Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).
- **Verification Method**: Cross-check all third-party domains observed in passive network telemetry against the published Sub-Processor Register.


---

## 7. External Sub-Processor & Cross-Border Endpoint Register (Section 16 / Rule 15)

| Third-Party Domain | Vendor / Service | Category | Primary Jurisdiction | Governance Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `fonts.googleapis.com` | Google LLC (Fonts & Static Web Assets) | CDN & Typography Delivery | United States / Global Edge CDN | Consider self-hosting static web fonts or documenting CDN asset delivery under Section 8(5) vendor governance. |

---

## 8. Reputation-Safety & Passive Scope Attestation

> **Disclaimer**: This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.
