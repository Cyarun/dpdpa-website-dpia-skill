# Confidential & Constructive Advisory DPIA Readiness Assessment
## Target: `https://www.nykaa.com` (Nykaa (Consumer Retail & E-Commerce) — Retail & E-Commerce)

- **Audit ID**: `DPIA-BENCH-2026-NYKAA`
- **Evaluated At (UTC)**: `2026-11-06T08:34:06.665Z`
- **Canonical Domain**: `www.nykaa.com`
- **Audit Scope**: Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)
- **Statutory Baseline**: Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule) & Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)
- **Overall Readiness Score**: **73 / 100** (`Moderate Readiness (Advisory Enhancements Recommended)`)
- **Rule 13 DPIA & Algorithmic Governance Triggered**: `true`

---

## 1. Executive Readiness Synopsis

This confidential, read-only passive DPIA readiness assessment of Nykaa (Consumer Retail & E-Commerce) (https://www.nykaa.com, Sector: Retail & E-Commerce) evaluated publicly observable HTTP headers, 86 Set-Cookie header(s), 22 external script(s), and 6 client-side automation signature(s) against the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 (G.S.R. 846(E)). Overall Readiness Score: 73/100 (Moderate Readiness (Advisory Enhancements Recommended)).

### Key Observed Strengths
- HTTPS transport security active on https://www.nykaa.com/ (HTTP 200, 1535ms response time).
- Zero pre-ticked consent checkboxes observed across 1 inspected DOM form(s).
- Surfaces 1 accessible privacy/legal notice link(s) directly in the DOM.
- Enforces HTTP Strict-Transport-Security (max-age=31536000 ; includeSubDomains ; preload).

### Priority Readiness Enhancements
- Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4): Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.
- Website Automations, AI & Profiling (Sec 6 / Rule 13(2)): Maintain an internal Website Automation & Tag Governance Register mapping each client-side SDK to its consent category, data retention TTL, and DOM input-masking configuration.
- Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3)): Add a dedicated Grievance Redressal & DPO section to the Privacy Notice footer specifying the Officer name/designation, email/portal link, and the Rule 14(3) 90-day maximum resolution SLA.
- Cross-Border Sub-Processors (Sec 16 / Rule 15): Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).

---

## 2. Passive HTTP & Security Header Telemetry (Section 8(5) & Rule 6)

| Signal | Observed Value |
| :--- | :--- |
| **HTTP Status & Final URL** | `HTTP 200` -> `https://www.nykaa.com/` (1535 ms) |
| **Strict-Transport-Security (HSTS)** | `max-age=31536000 ; includeSubDomains ; preload` |
| **Content-Security-Policy (CSP)** | `img-src 'self' data: *.nykaa.com *.naikaa.com fsnecommerce.sc.omtrdc.net evbk.gamooga.com ...` |
| **X-Frame-Options** | `sameorigin` |
| **X-Content-Type-Options** | `nosniff` |
| **Referrer-Policy** | `Not present` |

---

## 3. Pre-Consent Storage & Cookie Inventory (Section 6 & Rules 3–4)

- **Pre-Consent Non-Essential Tracking Observed**: `true`
- **First-Party Cookies Set on Load**: `86`
- **Third-Party Cookies Set on Load**: `0`

| Cookie Name | Domain | Category | HttpOnly | Secure | SameSite | Expiry (Days) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `countryCode` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `0` |
| `storeId` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `0` |
| `bcookie` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_NYKAA_NOW_RAAP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_NYKAA_NOW_FILTER` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_EMAIL_VERIFICATION_REVAMP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_NEW_SHOPPING_BAG` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_DWEB_SHOPPING_BAG_URL` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ITEM_DISCOUNT` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ORDERS_REVAMP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CART_LOGIN_SEGMENT` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_REORDER` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_CP_GAMES` | `www.nykaa.com` | Analytics & Telemetry | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_SEGMENT` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_VIEW_SIMILAR_HLP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_VIEW_SIMILAR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_PRODUCT_V3` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_HLP_CARD_REVAMP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_WISHLIST` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_PRICE_REVEAL_NEW` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PLP_INLINE_FILTER` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_EDD_DELIVERY_WIDGET` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_MULTI_COUPONS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_DWEB_MULTICOUPON` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ADP_RV_SEARCH_BAR_NEW` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_AUTH_DWEB` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PLP_INLINE_WIDGETS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PLP_PINKBOX_CTA` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_QUERY_PARAM_EXP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_CALLOUT_NUDGE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_TOP_NAV_CONFIG` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_QUERY_PARAM_EXP_DWEB` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_HP_SEARCH_ANIMATION` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_PDP_HAMBURGER` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AD_BRV` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_ZENDESK_CHAT` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_HORIZONTAL_WIDGET_TYPE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_SPECULATIVE_PRERENDERING` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_TAGS_RATING_ON_LISTING` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_REVIEW_SUBMIT` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_OFFER_DELTA_COMMUNICATION` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_NEW_GC_PAGE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PLP_DNW_DWEB` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_GETAPP_DWEB` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_CONVENIENCE_FEE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CONVERSATION_ROUTE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_SALE_PRICE_TAG` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_DS_AUTH_FLOW` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_PRODUCT_RACK_CS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_RATING_REVIEW` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_SHOW_ASPECTS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_SEARCHCOUNT_MWEB` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_BP_DN_PERS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PLP_DESIGN_PARITY` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_STICKY_PRICE_V2` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CART_GROUPING` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_DWEB_COLLAPSED_PRICE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CATEGORY_NUDGE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CART_MINI_PDP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_AGG_FOOTER_SSR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_COUPON_OFFER_REORDER` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_PDP_LITE_OFFERS_SSR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_HEADER_SUBSTORE_TABS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_HYBRID_SUBSTORE_TABS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_LADDER_OFFERS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_TOP_FILTERS_PLP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_FUTURE_COUPONS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_HLP_RECO_WIDGETS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_BELOW_FOLD_SECTIONS_SSR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_BEST_SELLER_SEO` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_NEW_USER_OFFER` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CART_NORTH_STAR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_HP_NORTH_STAR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PDP_AI_REVIEW_SUMMARY` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_STICKY_PRICE_ON_LOAD` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CART_ADDRESS_BAR` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_AB_BP_RECO_DN_PERS` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_OVERNIGHT_ALLOCATION` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_CART_SAVINGS_REVAMP` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_PERS_DIFF_PRICING` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_ASK_NYKAA` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_UPDATED_AT` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `EXP_SSR_CACHE` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `365` |
| `bm_s` | `www.nykaa.com` | Strictly Necessary / Security | `true` | `true` | `Unspecified` | `31` |
| `bm_so` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `true` | `Unspecified` | `1` |
| `bm_sz` | `www.nykaa.com` | Strictly Necessary / Security | `false` | `false` | `Unspecified` | `0.2` |

---

## 4. Website Automations & Rule 13(2) Profiling Inventory

- **Total Client-Side Automations Detected**: `6`
- **Rule 13 Trigger Rationale**: Observed 6 client-side automation/telemetry signal(s) on www.nykaa.com (including CRM, CDP, session replay, chat, or ad-tech integrations), which warrant formal documentation under Rule 13(1)-(2) DPIA and algorithmic governance workflows.

| Vendor / Integration | Category | Empirical Signal Observed | Rule 13(2) Governance Relevance | Recommended Advisory Action |
| :--- | :--- | :--- | :--- | :--- |
| **Google Tag Manager (GTM)** | CDP & Event Routing | `DOM/Script signature match: googletagmanager.com/gtm.js` | Orchestrates client-side event routing and third-party tag firing; requires consent gating under Section 6 and Rule 3 prior to non-essential telemetry dispatch. | Configure Google Tag Manager Consent Mode v2 with default denied state for analytics_storage and ad_storage until affirmative Data Principal consent is recorded. |
| **Google Analytics 4 (GA4)** | CDP & Event Routing | `HTTP Response Header match: google-analytics.com` | Collects pseudonymous client identifiers, pageview sequences, and behavioral engagement metrics relevant to Section 6 consent governance. | Gate GA4 initialization behind affirmative opt-in consent and enable IP anonymization and data retention controls aligned with Section 8(7). |
| **CleverTap / WebEngage / MoEngage** | Marketing & CRM Automation | `HTTP Response Header match: clevertap.com` | Performs user segmentation, automated lifecycle triggers, and behavioral cohort profiling subject to Rule 13(2) algorithmic governance. | Ensure omnichannel engagement SDKs initialize in opt-out mode by default and log consent provenance for push/email automation. |
| **Intercom / Freshchat / Zendesk / Drift / Crisp / Yellow.ai / Verloop** | AI Chatbot / Conversational Agent / Support Widget | `HTTP Response Header match: zdassets.com` | Processes free-text conversational inputs and automated support triage; directly implicates Section 5 notice and Rule 13(2) algorithmic risk governance. | Display a concise pre-chat Section 5 notice snippet clarifying how conversational transcripts are processed and retained. |
| **Google Ads / DoubleClick Floodlight** | Ad Pixel / Auto-Advanced Matching / Retargeting | `HTTP Response Header match: googleadservices.com` | Tracks advertising conversions and remarketing identifiers across web properties. | Block advertising conversion tags prior to explicit opt-in consent and provide one-click withdrawal parity. |
| **LinkedIn Insight Tag / X (Twitter) Pixel / Bing UET** | Ad Pixel / Auto-Advanced Matching / Retargeting | `HTTP Response Header match: bat.bing.com` | Associates site visits with social/professional profiles for retargeting cohorts. | Require explicit marketing category opt-in before loading social advertising pixels. |

---

## 5. Statutory DPDPA 2023 & DPDP Rules 2025 Control Matrix

| Statutory Pillar | Reference | Readiness Tier | Advisory Summary |
| :--- | :--- | :--- | :--- |
| **Notice & Transparency** | DPDP Act Section 5(1) & DPDP Rules, 2025 Rule 3 | **Aligned** | Privacy/legal notice links are discoverable in the DOM; ensure itemised data and purpose disclosures per Rule 3. |
| **Consent & Dark-Pattern Symmetry** | DPDP Act Section 6(1), 6(4) & DPDP Rules, 2025 Rules 3-4 | **Priority Readiness Action** | Gate non-essential cookies and analytics/marketing scripts behind an affirmative consent banner with symmetrical Reject/Manage controls. |
| **Security & 1-Yr Log Retention** | DPDP Act Section 8(5) & DPDP Rules, 2025 Rule 6 & Rule 8(3) | **Aligned** | Core HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) are present. |
| **Children's Data Safeguards** | DPDP Act Section 9(1)-(3) & DPDP Rules, 2025 Rules 10-11 | **Aligned** | Ensure age-gating or verifiable parental consent workflows are documented where services may be accessed by Data Principals under 18. |
| **Rule 13 DPIA & Algorithmic Risk** | DPDP Act Section 10(2)(c) & DPDP Rules, 2025 Rule 13(1)-(3) | **Advisory Enhancement** | Document client-side marketing, CDP, session replay, and conversational automations in the annual Rule 13 DPIA register. |
| **Grievance Redressal (90-Day SLA)** | DPDP Act Section 8(10), Section 13 & DPDP Rules, 2025 Rule 14(3) | **Advisory Enhancement** | Publish designated Grievance Officer / DPO contact details and explicitly state the 90-day maximum grievance resolution SLA per Rule 14(3). |
| **Cross-Border Sub-Processors** | DPDP Act Section 8(2), Section 16 & DPDP Rules, 2025 Rule 15 | **Advisory Enhancement** | Document the 1 external script/asset domain(s) in the Sub-Processor & Cross-Border Transfer Register. |

---

## 6. Constructive Advisory Findings & Engineering Recommendations

### DPIA-001: Notice & Transparency (Sec 5 / Rule 3) — `Aligned`
- **Observed Technical Signal**: HTTP 200 on https://www.nykaa.com; 1 privacy/legal notice link(s) detected in DOM (https://www.nykaa.com/terms-conditions/lp).
- **Statutory Mapping**: DPDP Act, 2023 Section 5(1) read with DPDP Rules, 2025 Rule 3 (Itemised Notice in clear and plain language)
- **Constructive Advisory Note**: The website surfaces 1 accessible privacy/legal notice link(s) in the DOM. To strengthen Rule 3 readiness, ensure the notice presents an itemised inventory of personal data categories and specific processing purposes at every data collection point.
- **Recommended Engineering Fix**: Ensure every page footer and data collection form includes a prominent, static HTML anchor link to an itemised Section 5 / Rule 3 Privacy Notice with multi-language support (Eighth Schedule languages).
- **Verification Method**: Run a read-only curl/DOM check on the landing page and verify `<a href="/privacy">` is present in the server-rendered HTML.

### DPIA-002: Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4) — `Priority Readiness Action`
- **Observed Technical Signal**: Set-Cookie headers on initial GET: 86 cookie(s) (86 first-party, 0 third-party; cookie names: countryCode, storeId, bcookie, EXP_AB_NYKAA_NOW_RAAP, EXP_AB_NYKAA_NOW_FILTER, EXP_AB_EMAIL_VERIFICATION_REVAMP, EXP_AB_NEW_SHOPPING_BAG, EXP_AB_DWEB_SHOPPING_BAG_URL, EXP_ITEM_DISCOUNT, EXP_ORDERS_REVAMP, EXP_CART_LOGIN_SEGMENT, EXP_ADP_RV_REORDER, EXP_AB_CP_GAMES, EXP_ADP_RV_SEGMENT, EXP_ADP_RV_VIEW_SIMILAR_HLP, EXP_ADP_RV_VIEW_SIMILAR, EXP_ADP_RV_PRODUCT_V3, EXP_AB_HLP_CARD_REVAMP, EXP_AB_WISHLIST, EXP_AB_PRICE_REVEAL_NEW, EXP_PLP_INLINE_FILTER, EXP_EDD_DELIVERY_WIDGET, EXP_ADP_RV_MULTI_COUPONS, EXP_AB_DWEB_MULTICOUPON, EXP_ADP_RV_SEARCH_BAR_NEW, EXP_AB_AUTH_DWEB, EXP_PLP_INLINE_WIDGETS, EXP_PLP_PINKBOX_CTA, EXP_QUERY_PARAM_EXP, EXP_AB_CALLOUT_NUDGE, EXP_AB_TOP_NAV_CONFIG, EXP_QUERY_PARAM_EXP_DWEB, EXP_AB_HP_SEARCH_ANIMATION, EXP_AB_PDP_HAMBURGER, EXP_AD_BRV, EXP_AB_ZENDESK_CHAT, EXP_AB_HORIZONTAL_WIDGET_TYPE, EXP_SPECULATIVE_PRERENDERING, EXP_AB_TAGS_RATING_ON_LISTING, EXP_REVIEW_SUBMIT, EXP_AB_OFFER_DELTA_COMMUNICATION, EXP_AB_NEW_GC_PAGE, EXP_PLP_DNW_DWEB, EXP_AB_GETAPP_DWEB, EXP_AB_CONVENIENCE_FEE, EXP_CONVERSATION_ROUTE, EXP_AB_SALE_PRICE_TAG, EXP_AB_DS_AUTH_FLOW, EXP_AB_PRODUCT_RACK_CS, EXP_AB_RATING_REVIEW, EXP_AB_SHOW_ASPECTS, EXP_AB_SEARCHCOUNT_MWEB, EXP_AB_BP_DN_PERS, EXP_PLP_DESIGN_PARITY, EXP_AB_STICKY_PRICE_V2, EXP_CART_GROUPING, EXP_DWEB_COLLAPSED_PRICE, EXP_CATEGORY_NUDGE, EXP_CART_MINI_PDP, EXP_AB_AGG_FOOTER_SSR, EXP_COUPON_OFFER_REORDER, EXP_AB_PDP_LITE_OFFERS_SSR, EXP_HEADER_SUBSTORE_TABS, EXP_HYBRID_SUBSTORE_TABS, EXP_LADDER_OFFERS, EXP_AB_TOP_FILTERS_PLP, EXP_FUTURE_COUPONS, EXP_HLP_RECO_WIDGETS, EXP_AB_BELOW_FOLD_SECTIONS_SSR, EXP_BEST_SELLER_SEO, EXP_NEW_USER_OFFER, EXP_CART_NORTH_STAR, EXP_HP_NORTH_STAR, EXP_PDP_AI_REVIEW_SUMMARY, EXP_STICKY_PRICE_ON_LOAD, EXP_CART_ADDRESS_BAR, EXP_AB_BP_RECO_DN_PERS, EXP_OVERNIGHT_ALLOCATION, EXP_CART_SAVINGS_REVAMP, EXP_PERS_DIFF_PRICING, EXP_ASK_NYKAA, EXP_UPDATED_AT, EXP_SSR_CACHE, bm_s, bm_so, bm_sz); CMP banners detected: none; pre-ticked checkboxes: 0.
- **Statutory Mapping**: DPDP Act, 2023 Section 6(1) & Section 6(4) read with DPDP Rules, 2025 Rules 3 and 4 (Free, specific, informed, unconditional consent & withdrawal ease)
- **Constructive Advisory Note**: Initial page load sets 86 cookie(s) and loads 6 client-side telemetry/automation script signature(s) prior to an affirmative consent interaction. While common across modern web architectures, gating non-essential analytics and marketing tags behind an explicit opt-in banner with symmetrical 'Accept' and 'Reject / Manage' controls aligns the user journey with Section 6(1) and Section 6(4).
- **Recommended Engineering Fix**: Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.
- **Verification Method**: Inspect initial HTTP `Set-Cookie` headers and network requests in a clean browser profile before interacting with the consent banner.

### DPIA-003: Website Automations, AI & Profiling (Sec 6 / Rule 13(2)) — `Advisory Enhancement`
- **Observed Technical Signal**: Detected 6 client-side automation signature(s) across 22 external script(s): Google Tag Manager (GTM) (DOM/Script signature match: googletagmanager.com/gtm.js); Google Analytics 4 (GA4) (HTTP Response Header match: google-analytics.com); CleverTap / WebEngage / MoEngage (HTTP Response Header match: clevertap.com); Intercom / Freshchat / Zendesk / Drift / Crisp / Yellow.ai / Verloop (HTTP Response Header match: zdassets.com); Google Ads / DoubleClick Floodlight (HTTP Response Header match: googleadservices.com); LinkedIn Insight Tag / X (Twitter) Pixel / Bing UET (HTTP Response Header match: bat.bing.com).
- **Statutory Mapping**: DPDP Act, 2023 Section 6 & Section 10(2)(c) read with DPDP Rules, 2025 Rule 13(1)-(3) (Annual DPIA & algorithmic/automated software risk assessment)
- **Constructive Advisory Note**: Passive DOM inspection identified 6 client-side automation or telemetry integration(s). Under Rule 13(2), Significant Data Fiduciaries (and privacy-forward enterprises conducting proactive DPIAs) are encouraged to document the purpose, behavioral profiling scope, and consent binding of all tag managers, CRM trackers, session replay tools, and conversational widgets.
- **Recommended Engineering Fix**: Maintain an internal Website Automation & Tag Governance Register mapping each client-side SDK to its consent category, data retention TTL, and DOM input-masking configuration.
- **Verification Method**: Verify that every script in the tag manager is bound to an explicit consent trigger and documented in the annual Rule 13 DPIA ledger.

### DPIA-004: Reasonable Security Safeguards (Sec 8(5) / Rule 6) — `Aligned`
- **Observed Technical Signal**: Security headers on https://www.nykaa.com/: HSTS=Present, CSP=Present, X-Frame-Options=sameorigin, X-Content-Type-Options=nosniff, Referrer-Policy=Absent.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(5) read with DPDP Rules, 2025 Rule 6 (Reasonable security safeguards, encryption in transit, access controls) and Rule 8(3) (1-year minimum security log retention)
- **Constructive Advisory Note**: All primary HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) are present on www.nykaa.com, supporting robust transport and browser-side script isolation under Rule 6.
- **Recommended Engineering Fix**: Configure edge CDN/web server responses to include Strict-Transport-Security (max-age=31536000; includeSubDomains), a restrictive Content-Security-Policy, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin, alongside 1-year security log retention (Rule 8(3)).
- **Verification Method**: Run `curl -sI https://www.nykaa.com` and confirm all recommended security headers are returned with HTTP 200.

### DPIA-005: Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3)) — `Advisory Enhancement`
- **Observed Technical Signal**: Grievance/DPO links in landing DOM: 0; Grievance Officer mention in policy corpus: false; DPO/Privacy contact mention: false; 90-day SLA mention: false.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(10) & Section 13 read with DPDP Rules, 2025 Rule 14(3) (Grievance resolution within a period not exceeding 90 days)
- **Constructive Advisory Note**: While privacy or contact channels are available, explicitly publishing the designated Grievance Officer / Data Protection Officer contact coordinates and stating the statutory resolution SLA of 'not exceeding 90 days' (Rule 14(3)) in the public privacy notice provides immediate statutory clarity for Data Principals.
- **Recommended Engineering Fix**: Add a dedicated Grievance Redressal & DPO section to the Privacy Notice footer specifying the Officer name/designation, email/portal link, and the Rule 14(3) 90-day maximum resolution SLA.
- **Verification Method**: Inspect the public Privacy Notice page for explicit mention of "Grievance Officer" and "90 days" (Rule 14(3)).

### DPIA-006: Cross-Border Sub-Processors (Sec 16 / Rule 15) — `Advisory Enhancement`
- **Observed Technical Signal**: Observed 1 external asset/script domain(s) on initial page load: cdn.naikaa.com.
- **Statutory Mapping**: DPDP Act, 2023 Section 8(2) & Section 16 read with DPDP Rules, 2025 Rule 15 (Cross-border transfer conditions & Data Processor contracts)
- **Constructive Advisory Note**: The website loads resources from 1 external domain(s), which initiates client browser connections (sharing IP address and User-Agent metadata) with global CDN or SaaS endpoints. Cataloging these endpoints in an internal Sub-Processor & Cross-Border Register supports Section 8(2) and Section 16 governance.
- **Recommended Engineering Fix**: Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).
- **Verification Method**: Cross-check all third-party domains observed in passive network telemetry against the published Sub-Processor Register.


---

## 7. External Sub-Processor & Cross-Border Endpoint Register (Section 16 / Rule 15)

| Third-Party Domain | Vendor / Service | Category | Primary Jurisdiction | Governance Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `cdn.naikaa.com` | External Service (cdn.naikaa.com) | Third-Party Web Resource / Telemetry Endpoint | Global / Multi-Region Cloud | Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15. |

---

## 8. Reputation-Safety & Passive Scope Attestation

> **Disclaimer**: This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.
