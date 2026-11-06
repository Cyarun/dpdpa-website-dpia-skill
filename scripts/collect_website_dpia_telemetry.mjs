#!/usr/bin/env node
/**
 * collect_website_dpia_telemetry.mjs
 *
 * Read-Only, Reputation-Safe Website DPIA & Automation Telemetry Collector
 * Statutory Baseline:
 *   - Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule)
 *   - Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 Nov 2025; 23 Rules, 7 Schedules)
 *
 * Capabilities:
 *   1. Passive, non-intrusive inspection of any website URL (or local HTML file for offline testing).
 *   2. Attempts headless Playwright Chromium inspection first (captures runtime pre-consent cookies,
 *      localStorage, sessionStorage, IndexedDB, Service Workers, network requests, and DOM state).
 *   3. Gracefully falls back to pure Node HTTP/TLS + DOM static parser if Playwright browser binaries
 *      are unavailable in constrained environments.
 *   4. Emits both raw empirical telemetry AND a deterministic, JSON-Schema-compliant DPIA Readiness
 *      Report (`dpia-website-report.schema.json`) with verified reputation-safe advisory framing.
 *
 * Usage:
 *   node products/dpia-audit-skill/scripts/collect_website_dpia_telemetry.mjs <url> [--out <file.json>] [--model <claude|gemini|deepseek|qwen|deterministic-telemetry-only>]
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { URL } from 'node:url';

// ---------------------------------------------------------------------------
// 1. REPUTATION-SAFE VOCABULARY GUARDRAIL (HARD INVARIANT)
// ---------------------------------------------------------------------------
const PROHIBITED_ACCUSATORY_TERMS = [
  /\billegal\b/gi,
  /\bunlawful\b/gi,
  /\blawbreaker\b/gi,
  /\bviolator\b/gi,
  /\bcriminal\b/gi,
  /\bguilty\b/gi,
  /\bpenalized\b/gi,
  /\bfineable\b/gi,
  /\bsued\b/gi,
  /\boffender\b/gi,
  /\bscam\b/gi,
  /\bfraud\b/gi
];

export function sanitizeReputationSafeText(text) {
  if (typeof text !== 'string') return text;
  let cleaned = text;
  const replacements = [
    [/\billegal\b/gi, 'non-aligned with statutory readiness benchmarks'],
    [/\bunlawful\b/gi, 'requiring statutory alignment'],
    [/\blawbreaker\b/gi, 'entity requiring governance alignment'],
    [/\bviolator\b/gi, 'entity with open readiness actions'],
    [/\bcriminal\b/gi, 'high-priority statutory'],
    [/\bguilty\b/gi, 'observed'],
    [/\bpenalized\b/gi, 'subject to regulatory scrutiny'],
    [/\bfineable\b/gi, 'subject to statutory schedule review'],
    [/\bsued\b/gi, 'subject to grievance escalation'],
    [/\boffender\b/gi, 'organisation'],
    [/\bscam\b/gi, 'deceptive interface pattern'],
    [/\bfraud\b/gi, 'misaligned representation']
  ];
  for (const [regex, replacement] of replacements) {
    cleaned = cleaned.replace(regex, replacement);
  }
  return cleaned;
}

export function verifyZeroProhibitedTerms(obj) {
  const serialized = JSON.stringify(obj);
  for (const regex of PROHIBITED_ACCUSATORY_TERMS) {
    if (regex.test(serialized)) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// 2. VENDOR & AUTOMATION SIGNATURE CATALOG (RULE 13(2), RULE 6, SEC 6, RULE 15)
// ---------------------------------------------------------------------------
const AUTOMATION_SIGNATURES = [
  // A. Marketing & CRM Automations
  {
    vendor: 'HubSpot Marketing & CRM Automation',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/js\.hs-scripts\.com/i, /js\.hs-analytics\.net/i, /hbspt\.forms/i, /_hsq\b/i, /hs-banner\.com/i],
    rule13Risk: 'Tracks visitor page views, form interactions, and identity tokens across sessions for automated CRM lead scoring (Rule 13(2) profiling relevance).',
    fix: 'Gate HubSpot tracking (`_hsq.push(["doNotTrack"])` or CMP script blocking) until affirmative Section 6 consent is recorded.'
  },
  {
    vendor: 'Adobe Marketo Munchkin',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/munchkin\.marketo\.net/i, /munchkin\.js/i, /\bMunchkin\.init\b/i],
    rule13Risk: 'Associates anonymous browsing behaviour with known CRM lead profiles upon form submission or email link click.',
    fix: 'Defer `Munchkin.init()` execution until the Data Principal opts into analytics/marketing under Rule 3.'
  },
  {
    vendor: 'Salesforce Pardot / Account Engagement',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States',
    patterns: [/pi\.pardot\.com/i, /pd\.js/i, /piAId\b/i],
    rule13Risk: 'Performs automated B2B prospect tracking and behavioural scoring.',
    fix: 'Load Pardot tracker exclusively inside a post-consent callback managed by your CMP.'
  },
  {
    vendor: 'ActiveCampaign Site Tracking',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States',
    patterns: [/trackcmp\.net/i, /diffuser\.js/i, /\bvgo\(/i],
    rule13Risk: 'Links website visits to automated email/SMS workflow triggers.',
    fix: 'Bind ActiveCampaign `vgo("process", "allowTracking")` to explicit user consent.'
  },
  {
    vendor: 'Klaviyo Marketing Automation',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States',
    patterns: [/static\.klaviyo\.com/i, /klaviyo\.js/i, /_learnq\b/i],
    rule13Risk: 'Captures browse abandonment, cart events, and email inputs for automated behavioural messaging.',
    fix: 'Prevent `_learnq` initialization prior to explicit consent and disable pre-submit email field capture.'
  },
  {
    vendor: 'Braze Customer Engagement SDK',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States',
    patterns: [/js\.appboycdn\.com/i, /braze\.min\.js/i, /\bbraze\.initialize\b/i],
    rule13Risk: 'Executes real-time user segmentation, web push orchestration, and in-browser messaging.',
    fix: 'Gate Braze Web SDK initialization and web push prompts behind granular Section 6 consent.'
  },
  {
    vendor: 'MoEngage Customer Engagement',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'India / United States (AWS)',
    patterns: [/cdn\.moengage\.com/i, /\bMoengage\b/i, /moe_uuid/i],
    rule13Risk: 'Performs omnichannel behavioural tracking, automated segmentation, and web push triggers.',
    fix: 'Configure MoEngage SDK in opt-in mode so event tracking begins only after affirmative consent.'
  },
  {
    vendor: 'WebEngage Retention Operating System',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'India / Global Cloud',
    patterns: [/widgets\.webengage\.com/i, /ssl\.widgets\.webengage\.com/i, /\bwebengage\.init\b/i],
    rule13Risk: 'Runs automated user journey workflows, surveys, and behavioural event profiling.',
    fix: 'Defer `webengage.init()` until consent is granted via the Section 6 notice banner.'
  },
  {
    vendor: 'CleverTap Retention & Engagement',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'India / United States / EU',
    patterns: [/wzrkt\.com/i, /d2r1yp2w7bby2u\.cloudfront\.net/i, /\bclevertap\.event\.push\b/i],
    rule13Risk: 'Builds persistent user profiles and automated behavioural segments across devices.',
    fix: 'Set `clevertap.privacy.push({optOut: true})` by default and toggle to `false` only after affirmative consent.'
  },
  {
    vendor: 'Zoho Marketing Automation / PageSense / SalesIQ',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'India / United States / EU',
    patterns: [/cdn\.pagesense\.io/i, /salesiq\.zoho\.(com|in)/i, /ma\.zoho\.(com|in)/i, /zohocdn\.com/i],
    rule13Risk: 'Combines visitor session tracking, heatmap telemetry, and CRM lead scoring.',
    fix: 'Enable Zoho privacy-Hold mode until explicit Data Principal consent is obtained.'
  },
  {
    vendor: 'Mailchimp / Mandrill Web Tracking',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States',
    patterns: [/chimpstatic\.com/i, /mc\.us\d+\.list-manage\.com/i],
    rule13Risk: 'Injects pop-up capture forms and campaign attribution cookies.',
    fix: 'Load `chimpstatic.com` scripts only after marketing consent is granted.'
  },
  {
    vendor: 'Customer.io / Drip / OmniSend',
    category: 'Marketing & CRM Automation',
    jurisdiction: 'United States / EU',
    patterns: [/track\.customer\.io/i, /tag\.getdrip\.com/i, /omnisnippet1\.com/i],
    rule13Risk: 'Automated behavioural lifecycle messaging and event tracking.',
    fix: 'Wrap tracker initialization in CMP consent callbacks.'
  },

  // B. CDP & Event Routing Automations
  {
    vendor: 'Segment Customer Data Platform (analytics.js)',
    category: 'CDP & Event Routing',
    jurisdiction: 'United States / EU',
    patterns: [/cdn\.segment\.com\/analytics\.js/i, /\banalytics\.load\b/i, /api\.segment\.io/i],
    rule13Risk: 'Acts as a central fan-out router forwarding personal data and behavioural events to multiple downstream sub-processors.',
    fix: 'Enforce category-based destination filtering in Segment (`consent-manager`) and disclose downstream recipients under Rule 3.'
  },
  {
    vendor: 'Google Tag Manager (gtm.js)',
    category: 'CDP & Event Routing',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/googletagmanager\.com\/gtm\.js/i, /\bdataLayer\b/i],
    rule13Risk: 'Dynamically injects third-party tracking scripts, pixels, and event listeners into the client DOM.',
    fix: 'Enable Google Consent Mode v2 (`ad_storage: "denied"`, `analytics_storage: "denied"`, `ad_user_data: "denied"`, `ad_personalization: "denied"` by default) prior to GTM initialization.'
  },
  {
    vendor: 'RudderStack / mParticle / Snowplow / Tealium / Adobe Launch',
    category: 'CDP & Event Routing',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/cdn\.rudderlabs\.com/i, /jssdkcdns\.mparticle\.com/i, /\bsp\.js\b/i, /tags\.tiqcdn\.com/i, /assets\.adobedtm\.com/i],
    rule13Risk: 'Streams granular client-side clickstream events to cloud data warehouses and third-party processors.',
    fix: 'Gate CDP event collection behind explicit Section 6 consent and document retention limits (Rule 8).'
  },

  // C. Session Replay & Behavioral Heatmap Automations
  {
    vendor: 'Microsoft Clarity Session Replay',
    category: 'Session Replay & Behavioral Heatmap',
    jurisdiction: 'United States / Global Azure',
    patterns: [/clarity\.ms\/tag/i, /\bwindow\.clarity\b/i],
    rule13Risk: 'Records full DOM mutations, mouse movements, scroll depth, and rage clicks (high Rule 13(2) behavioural profiling sensitivity if unmasked).',
    fix: 'Require explicit analytics consent before loading Clarity (`window.clarity("consent")`) and enforce strict DOM input masking (`data-clarity-mask="true"`).'
  },
  {
    vendor: 'Hotjar Behavior Analytics & Session Replay',
    category: 'Session Replay & Behavioral Heatmap',
    jurisdiction: 'European Union / Global Cloud',
    patterns: [/static\.hotjar\.com/i, /\bhjSiteSettings\b/i, /vars\.hotjar\.com/i],
    rule13Risk: 'Captures visual session recordings, heatmaps, and on-site feedback polls.',
    fix: 'Delay Hotjar script injection until consent is granted and verify `data-hj-suppress` on all personal data elements.'
  },
  {
    vendor: 'FullStory Digital Experience Intelligence',
    category: 'Session Replay & Behavioral Heatmap',
    jurisdiction: 'United States',
    patterns: [/edge\.fullstory\.com/i, /fullstory\.com\/s\/fs\.js/i, /_fs_namespace/i],
    rule13Risk: 'High-fidelity DOM reconstruction and user frustration indexing across sessions.',
    fix: 'Configure FullStory Private-by-Default mode (`.fs-exclude` / `.fs-mask`) and gate recording behind affirmative consent.'
  },
  {
    vendor: 'LogRocket / Smartlook / PostHog / Mouseflow / CrazyEgg / Contentsquare / LuckyOrange',
    category: 'Session Replay & Behavioral Heatmap',
    jurisdiction: 'United States / EU',
    patterns: [
      /cdn\.lr-ingest\.io/i,
      /cdn\.logrocket\.io/i,
      /rec\.smartlook\.com/i,
      /app\.posthog\.com/i,
      /us\.i\.posthog\.com/i,
      /cdn\.mouseflow\.com/i,
      /script\.crazyegg\.com/i,
      /t\.contentsquare\.net/i,
      /tools\.luckyorange\.com/i
    ],
    rule13Risk: 'Captures session replay, network payloads, console logs, or interaction heatmaps.',
    fix: 'Disable automatic session recording prior to Section 6 consent and sanitize all text/input fields.'
  },

  // D. AI Chatbots, Conversational Agents & Support Automations
  {
    vendor: 'Intercom Messenger & Fin AI Agent',
    category: 'AI Chatbot / Conversational Agent / Support Widget',
    jurisdiction: 'United States / EU',
    patterns: [/widget\.intercom\.io/i, /js\.intercomcdn\.com/i, /\bIntercom\(/i, /intercomSettings/i],
    rule13Risk: 'Collects conversational inputs, browser metadata, and processes queries through automated AI support agents (Rule 13(2) algorithmic risk & Section 5 notice).',
    fix: 'Lazy-load Intercom facade on user click or after consent, and display a concise Section 5 privacy notice link inside the chat welcome header.'
  },
  {
    vendor: 'Drift / Salesloft Conversational AI',
    category: 'AI Chatbot / Conversational Agent / Support Widget',
    jurisdiction: 'United States',
    patterns: [/js\.driftt\.com/i, /\bdrift\.load\b/i],
    rule13Risk: 'Performs automated IP-to-company deanonymization and conversational lead qualification.',
    fix: 'Defer `drift.load()` until user interaction or consent and disclose automated profiling under Rule 3.'
  },
  {
    vendor: 'Crisp / Freshchat / Zendesk / Tidio / LiveChat',
    category: 'AI Chatbot / Conversational Agent / Support Widget',
    jurisdiction: 'United States / EU / India',
    patterns: [
      /client\.crisp\.chat/i,
      /wchat\.freshchat\.com/i,
      /static\.zdassets\.com/i,
      /code\.tidio\.co/i,
      /cdn\.livechatinc\.com/i
    ],
    rule13Risk: 'Maintains persistent chat session cookies and automated bot triage flows.',
    fix: 'Use a lightweight click-to-chat placeholder prior to consent and include a clear link to the Privacy Notice before collecting email/phone.'
  },
  {
    vendor: 'AI Agent & Bot Frameworks (Botpress / Voiceflow / Ada / Yellow.ai / Haptik / Verloop / Gupshup)',
    category: 'AI Chatbot / Conversational Agent / Support Widget',
    jurisdiction: 'India / United States / Global Cloud',
    patterns: [
      /cdn\.botpress\.cloud/i,
      /cdn\.voiceflow\.com/i,
      /static\.ada\.support/i,
      /cdn\.yellowmessenger\.com/i,
      /toolassets\.haptikapi\.com/i,
      /verloop\.io/i,
      /gupshup\.io/i
    ],
    rule13Risk: 'Executes LLM/NLP conversational inference on user-submitted text and voice inputs (directly relevant to Rule 13(2) algorithmic risk assessment).',
    fix: 'Document the AI model sub-processor in the Privacy Notice, disable transcript training by default, and require affirmative notice acknowledgment.'
  },
  {
    vendor: 'WhatsApp Business / Wati Floating Chat Automation',
    category: 'AI Chatbot / Conversational Agent / Support Widget',
    jurisdiction: 'United States / Ireland / India (Meta / BSP)',
    patterns: [/wati\.io/i, /wa\.me\//i, /api\.whatsapp\.com\/send/i, /whatsapp-widget/i],
    rule13Risk: 'Transfers the Data Principal phone number and device metadata to WhatsApp/Meta upon initiation.',
    fix: 'Ensure the WhatsApp trigger clearly informs the user that initiating chat shares their phone number with WhatsApp/BSP for support purposes.'
  },

  // E. Ad Pixels & Auto-Advanced Matching Automations
  {
    vendor: 'Meta Pixel (fbevents.js & Automatic Advanced Matching)',
    category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    jurisdiction: 'United States / Ireland',
    patterns: [/connect\.facebook\.net.*fbevents\.js/i, /\bfbq\(['"]init['"]/i, /facebook\.com\/tr\?/i],
    rule13Risk: 'Cross-site retargeting and potential Automatic Advanced Matching (scraping email/phone/name DOM fields into SHA-256 hashes without explicit per-purpose consent).',
    fix: 'Block `fbevents.js` until explicit Marketing consent is given, and disable Automatic Advanced Matching in Meta Events Manager unless specifically consented.'
  },
  {
    vendor: 'Google Analytics 4 / Google Ads / Floodlight (gtag.js)',
    category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/googletagmanager\.com\/gtag\/js/i, /google-analytics\.com\/g\/collect/i, /googleads\.g\.doubleclick\.net/i, /\bgtag\(['"]config['"]/i],
    rule13Risk: 'Cross-site measurement, conversion attribution, and audience remarketing.',
    fix: 'Implement Google Consent Mode v2 with default `denied` state and enable IP anonymization / redacted URL parameters.'
  },
  {
    vendor: 'LinkedIn Insight Tag (lintrk)',
    category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    jurisdiction: 'United States / Ireland',
    patterns: [/snap\.licdn\.com\/li\.lms-analytics/i, /_linkedin_partner_id/i, /\blintrk\b/i],
    rule13Risk: 'Associates website visits with professional LinkedIn member profiles for B2B retargeting.',
    fix: 'Load `insight.min.js` strictly after the Data Principal grants marketing/advertising consent.'
  },
  {
    vendor: 'X (Twitter) / Snap / TikTok / Criteo / Taboola / Outbrain Ad Pixels',
    category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    jurisdiction: 'United States / EU / Singapore',
    patterns: [
      /static\.ads-twitter\.com\/uwt\.js/i,
      /sc-static\.net\/scevent\.min\.js/i,
      /analytics\.tiktok\.com/i,
      /static\.criteo\.net/i,
      /cdn\.taboola\.com/i,
      /widgets\.outbrain\.com/i
    ],
    rule13Risk: 'Cross-site behavioural advertising and lookalike audience profiling (prohibited for children under Section 9(3)).',
    fix: 'Gate all third-party advertising pixels behind affirmative opt-in consent and suppress entirely on child/youth-accessible flows.'
  }
];

const CMP_SIGNATURES = [
  { name: 'OneTrust', pattern: /cdn\.cookielaw\.org|optanon/i },
  { name: 'Cookiebot (Usercentrics)', pattern: /consent\.cookiebot\.com|usercentrics\.eu/i },
  { name: 'CookieYes', pattern: /cdn-cookieyes\.com|cookieyes/i },
  { name: 'Osano', pattern: /cmp\.osano\.com/i },
  { name: 'TrustArc', pattern: /consent\.trustarc\.com/i },
  { name: 'Securiti.ai CMP', pattern: /cdn-prod\.securiti\.ai/i },
  { name: 'Didomi', pattern: /sdk\.privacy-center\.org/i },
  { name: 'Klaro / Custom DPDP Consent Banner', pattern: /klaro|dpdp-consent|cookie-consent|consent-banner|privacy-banner/i }
];

const EIGHTH_SCHEDULE_LANGUAGE_HINTS = [
  'हिन्दी', 'हिंदी', 'বাংলা', 'मराठी', 'तेलुगू', 'தமிழ்', 'ગુજરાતી', 'اردو', 'ಕನ್ನಡ', 'ଓଡ଼ିଆ', 'മലയാളം', 'ਪੰਜਾਬੀ', 'অসমীয়া',
  'hindi', 'bengali', 'marathi', 'telugu', 'tamil', 'gujarati', 'kannada', 'malayalam', 'punjabi', 'odia', 'assamese', 'urdu'
];

// ---------------------------------------------------------------------------
// 3. TELEMETRY COLLECTION ENGINE (PLAYWRIGHT + STATIC HTTP FALLBACK)
// ---------------------------------------------------------------------------
async function collectWithPlaywrightOrFallback(targetUrl) {
  let parsedUrl;
  let isLocalFile = false;
  if (fs.existsSync(targetUrl)) {
    isLocalFile = true;
    parsedUrl = new URL(`file://${path.resolve(targetUrl)}`);
  } else {
    parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
  }

  const canonicalDomain = parsedUrl.hostname || 'localhost';

  // Try Playwright first if not forced to static mode
  if (process.env.DPIA_COLLECTOR_MODE !== 'http') {
    try {
      const pw = await import('playwright');
      const browser = await pw.chromium.launch({ headless: true, timeout: 12000 });
      try {
        const context = await browser.newContext({
          userAgent: 'DPDPA-Advisory-DPIA-Readiness-Auditor/2.0 (Read-Only Passive Inspection)'
        });
        const page = await context.newPage();

        const networkRequests = [];
        let mainResponseHeaders = {};

        page.on('request', (req) => {
          networkRequests.push({
            url: req.url(),
            resourceType: req.resourceType(),
            method: req.method()
          });
        });

        page.on('response', (res) => {
          if (res.url() === parsedUrl.href || Object.keys(mainResponseHeaders).length === 0) {
            mainResponseHeaders = res.headers();
          }
        });

        await page.goto(parsedUrl.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(1500);

        const cookies = await context.cookies();
        const domTelemetry = await page.evaluate(async () => {
          const lsKeys = [];
          try {
            for (let i = 0; i < localStorage.length; i++) lsKeys.push(localStorage.key(i));
          } catch {}
          const ssKeys = [];
          try {
            for (let i = 0; i < sessionStorage.length; i++) ssKeys.push(sessionStorage.key(i));
          } catch {}
          const idbDatabases = [];
          try {
            if (typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function') {
              const dbs = await indexedDB.databases();
              for (const db of dbs || []) {
                if (db && db.name) idbDatabases.push(db.name);
              }
            }
          } catch {}
          const swRegistrations = [];
          try {
            if (typeof navigator !== 'undefined' && navigator.serviceWorker && typeof navigator.serviceWorker.getRegistrations === 'function') {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const reg of regs || []) {
                if (reg && reg.scope) swRegistrations.push(reg.scope);
              }
            }
          } catch {}

          const scripts = Array.from(document.querySelectorAll('script')).map((s) => ({
            src: s.src || '',
            integrity: s.getAttribute('integrity') || '',
            inlineSnippet: (s.textContent || '').slice(0, 600)
          }));

          const links = Array.from(document.querySelectorAll('a')).map((a) => ({
            href: a.href || a.getAttribute('href') || '',
            text: (a.innerText || a.textContent || '').trim().slice(0, 120)
          }));

          const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]')).map((b) => ({
            text: (b.innerText || b.value || b.getAttribute('aria-label') || '').trim().slice(0, 100),
            id: b.id || '',
            className: typeof b.className === 'string' ? b.className : ''
          }));

          const forms = Array.from(document.querySelectorAll('form')).map((f) => {
            const checkboxes = Array.from(f.querySelectorAll('input[type="checkbox"]')).map((cb) => ({
              name: cb.name || cb.id || '',
              defaultChecked: cb.defaultChecked || cb.hasAttribute('checked'),
              required: cb.required
            }));
            return {
              action: f.getAttribute('action') || '',
              method: (f.getAttribute('method') || 'GET').toUpperCase(),
              checkboxes
            };
          });

          const preTickedGlobal = document.querySelectorAll('input[type="checkbox"][checked]').length;
          const bodyText = (document.body ? document.body.innerText : '').slice(0, 50000);
          const htmlSource = document.documentElement ? document.documentElement.outerHTML.slice(0, 150000) : '';

          return {
            lsKeys,
            ssKeys,
            idbDatabases,
            swRegistrations,
            scripts,
            links,
            buttons,
            forms,
            preTickedGlobal,
            bodyText,
            htmlSource
          };
        });

        await browser.close();
        return {
          collectionMethod: 'playwright-chromium-readonly',
          targetUrl: parsedUrl.href,
          canonicalDomain,
          headers: mainResponseHeaders,
          cookies,
          networkRequests,
          ...domTelemetry
        };
      } finally {
        await browser.close().catch(() => {});
      }
    } catch {
      // Fallback to Node fetch / file reader below
    }
  }

  // Fallback: Pure Node HTTP/File + HTML/DOM extraction
  let htmlSource = '';
  let headers = {};
  const cookies = [];

  if (isLocalFile) {
    htmlSource = fs.readFileSync(path.resolve(targetUrl), 'utf-8');
    headers = { 'content-type': 'text/html; charset=utf-8' };
  } else {
    const res = await fetch(parsedUrl.href, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'DPDPA-Advisory-DPIA-Readiness-Auditor/2.0 (Read-Only Passive Inspection)',
        Accept: 'text/html,application/xhtml+xml'
      }
    });
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    for (const rawCookie of setCookies) {
      const parts = rawCookie.split(';').map((p) => p.trim());
      const [nameVal] = parts;
      const eqIdx = nameVal ? nameVal.indexOf('=') : -1;
      const name = eqIdx > -1 ? nameVal.slice(0, eqIdx) : nameVal;
      cookies.push({
        name: name || 'cookie',
        domain: canonicalDomain,
        httpOnly: /;\s*httponly/i.test(rawCookie),
        secure: /;\s*secure/i.test(rawCookie),
        sameSite: (rawCookie.match(/;\s*samesite=([a-z]+)/i) || [])[1] || 'Unspecified',
        expires: -1
      });
    }
    htmlSource = await res.text();
  }

  // Parse scripts, links, buttons, forms from HTML
  const scripts = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRegex.exec(htmlSource)) !== null) {
    const attrs = m[1] || '';
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    const integrityMatch = attrs.match(/\bintegrity=["']([^"']+)["']/i);
    scripts.push({
      src: srcMatch ? srcMatch[1] : '',
      integrity: integrityMatch ? integrityMatch[1] : '',
      inlineSnippet: (m[2] || '').trim().slice(0, 800)
    });
  }

  const links = [];
  const linkRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  while ((m = linkRegex.exec(htmlSource)) !== null) {
    const hrefMatch = (m[1] || '').match(/\bhref=["']([^"']+)["']/i);
    const text = (m[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    links.push({
      href: hrefMatch ? hrefMatch[1] : '',
      text: text.slice(0, 120)
    });
  }

  const buttons = [];
  const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  while ((m = btnRegex.exec(htmlSource)) !== null) {
    const text = (m[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    buttons.push({
      text: text.slice(0, 100),
      id: ((m[1] || '').match(/\bid=["']([^"']+)["']/i) || [])[1] || '',
      className: ((m[1] || '').match(/\bclass=["']([^"']+)["']/i) || [])[1] || ''
    });
  }

  const forms = [];
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  while ((m = formRegex.exec(htmlSource)) !== null) {
    const attrs = m[1] || '';
    const inner = m[2] || '';
    const action = (attrs.match(/\baction=["']([^"']+)["']/i) || [])[1] || '';
    const method = ((attrs.match(/\bmethod=["']([^"']+)["']/i) || [])[1] || 'GET').toUpperCase();
    const checkboxes = [];
    const cbRegex = /<input\b[^>]*type=["']checkbox["'][^>]*>/gi;
    let cbMatch;
    while ((cbMatch = cbRegex.exec(inner)) !== null) {
      const tag = cbMatch[0];
      checkboxes.push({
        name: (tag.match(/\bname=["']([^"']+)["']/i) || [])[1] || '',
        defaultChecked: /\bchecked\b/i.test(tag),
        required: /\brequired\b/i.test(tag)
      });
    }
    forms.push({ action, method, checkboxes });
  }

  const preTickedGlobal = (htmlSource.match(/<input\b[^>]*type=["']checkbox["'][^>]*\bchecked\b[^>]*>/gi) || []).length;
  const bodyText = htmlSource
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const networkRequests = scripts
    .filter((s) => s.src && /^https?:\/\//i.test(s.src))
    .map((s) => ({ url: s.src, resourceType: 'script', method: 'GET' }));

  return {
    collectionMethod: 'node-passive-http-dom-inspector',
    targetUrl: parsedUrl.href,
    canonicalDomain,
    headers,
    cookies,
    networkRequests,
    lsKeys: [],
    ssKeys: [],
    scripts,
    links,
    buttons,
    forms,
    preTickedGlobal,
    bodyText,
    htmlSource
  };
}

// ---------------------------------------------------------------------------
// 4. STATUTORY DPDPA 2023 + RULES 2025 ANALYSIS & REPORT BUILDER
// ---------------------------------------------------------------------------
export function buildDpiaReportFromTelemetry(raw, modelFamily = 'deterministic-telemetry-only') {
  const combinedCorpus = [
    raw.htmlSource || '',
    ...raw.scripts.map((s) => `${s.src} ${s.inlineSnippet}`),
    ...raw.networkRequests.map((r) => r.url)
  ].join('\n');

  // 1. Detect Website Automations & Profiling
  const marketingAutomations = [];
  const cdpRouters = [];
  const sessionReplay = [];
  const aiChatbots = [];
  const adPixels = [];

  for (const sig of AUTOMATION_SIGNATURES) {
    let matchedSignal = null;
    for (const pat of sig.patterns) {
      const match = combinedCorpus.match(pat);
      if (match) {
        matchedSignal = match[0];
        break;
      }
    }
    if (matchedSignal) {
      const item = {
        vendor_name: sig.vendor,
        automation_category: sig.category,
        matched_signal: matchedSignal,
        loaded_before_consent: true,
        rule13_2_profiling_or_automated_risk_relevance: sig.rule13Risk,
        advisory_governance_action: sig.fix
      };
      if (sig.category === 'Marketing & CRM Automation') marketingAutomations.push(item);
      else if (sig.category === 'CDP & Event Routing') cdpRouters.push(item);
      else if (sig.category === 'Session Replay & Behavioral Heatmap') sessionReplay.push(item);
      else if (sig.category === 'AI Chatbot / Conversational Agent / Support Widget') aiChatbots.push(item);
      else if (sig.category === 'Ad Pixel / Auto-Advanced Matching / Retargeting') adPixels.push(item);
    }
  }

  const totalAutomations =
    marketingAutomations.length +
    cdpRouters.length +
    sessionReplay.length +
    aiChatbots.length +
    adPixels.length;

  // 2. Form & Dark Pattern Signals
  let preTickedCount = raw.preTickedGlobal || 0;
  const insecureForms = [];
  for (const f of raw.forms || []) {
    if (f.action && f.action.startsWith('http://')) {
      insecureForms.push(f.action);
    }
    for (const cb of f.checkboxes || []) {
      if (cb.defaultChecked) preTickedCount = Math.max(preTickedCount, 1);
    }
  }

  const earlyFieldListeners = /addEventListener\(['"](input|change|blur)['"]|_learnq\.push|fbq\(['"]init['"].*em:/i.test(
    combinedCorpus
  );

  // 3. Push & Fingerprinting Signals
  const pushOnLoad = /Notification\.requestPermission|onesignal\.com|pushengage\.com|izooto\.com/i.test(combinedCorpus);
  const canvasFingerprint = /toDataURL\(|getImageData\(|FingerprintJS|fpjs\.io|OfflineAudioContext/i.test(combinedCorpus);
  const beaconObserved = /navigator\.sendBeacon\b/i.test(combinedCorpus);

  // 4. Cookies & Pre-Consent Storage
  const cookiesInventory = (raw.cookies || []).map((c) => {
    const isThirdParty = Boolean(
      c.domain &&
        raw.canonicalDomain &&
        !c.domain.replace(/^\./, '').endsWith(raw.canonicalDomain.replace(/^www\./, ''))
    );
    const isTracker = /^(_ga|_gid|_fbp|_fbc|_hjid|_clck|_clsk|__hs|muc_ads|li_sugr|wzrkt)/i.test(c.name);
    const expiryDays =
      typeof c.expires === 'number' && c.expires > 0
        ? Math.max(0, Math.round((c.expires * 1000 - Date.now()) / 86400000))
        : 0;
    return {
      name: c.name,
      domain: c.domain || raw.canonicalDomain,
      is_third_party: isThirdParty,
      category: isTracker
        ? 'Analytics & Telemetry'
        : isThirdParty
          ? 'Marketing / Ad-Tech / Retargeting'
          : 'Strictly Necessary / Security',
      http_only: Boolean(c.httpOnly),
      secure: Boolean(c.secure),
      same_site: String(c.sameSite || 'Unspecified'),
      expiry_days: expiryDays,
      set_before_consent: true
    };
  });

  const firstPartyCount = cookiesInventory.filter((c) => !c.is_third_party).length;
  const thirdPartyCount = cookiesInventory.filter((c) => c.is_third_party).length;
  const preConsentTrackingObserved =
    thirdPartyCount > 0 ||
    cookiesInventory.some((c) => c.category !== 'Strictly Necessary / Security') ||
    sessionReplay.length > 0 ||
    adPixels.length > 0 ||
    marketingAutomations.length > 0;

  // 5. Section 5 & Rule 3 Notice Signals
  const privacyLinks = (raw.links || []).filter((l) =>
    /privacy|data\s*protection|notice|dpdp|cookie\s*policy/i.test(`${l.text} ${l.href}`)
  );
  const hasIndianLanguageSignal = EIGHTH_SCHEDULE_LANGUAGE_HINTS.some((lang) =>
    (raw.htmlSource || '').toLowerCase().includes(lang.toLowerCase())
  );

  // 6. Section 6 & Rule 3/4 Consent & CMP Symmetry
  const detectedCmps = CMP_SIGNATURES.filter((cmp) => cmp.pattern.test(combinedCorpus)).map((c) => c.name);
  const acceptButtons = (raw.buttons || []).filter((b) => /\b(accept|agree|allow\s*all|got\s*it)\b/i.test(b.text));
  const rejectButtons = (raw.buttons || []).filter((b) =>
    /\b(reject|decline|deny|necessary\s*only|essential\s*only|manage\s*preferences)\b/i.test(b.text)
  );
  const hasWithdrawalLink = /withdraw\s*consent|consent\s*preferences|cookie\s*settings|privacy\s*settings/i.test(
    raw.htmlSource || ''
  );

  // 7. Section 8(5) & Rule 6 Security Headers & SRI
  const hdrs = raw.headers || {};
  const isHttps = raw.targetUrl.startsWith('https://') || raw.targetUrl.startsWith('file://');
  const hasHsts = Boolean(hdrs['strict-transport-security']);
  const hasCsp = Boolean(hdrs['content-security-policy']);
  const hasXcto = Boolean(hdrs['x-content-type-options']);
  const hasReferrerPolicy = Boolean(hdrs['referrer-policy']);
  const hasPermissionsPolicy = Boolean(hdrs['permissions-policy']);
  const externalScripts = (raw.scripts || []).filter((s) => s.src && /^https?:\/\//i.test(s.src));
  const externalScriptsWithSri = externalScripts.filter((s) => Boolean(s.integrity));

  // 8. Section 9 & Rules 10-11 Children's Data
  const hasChildrenAudienceSignal = /\b(kids|children|under\s*18|minor|student|school|parental\s*consent)\b/i.test(
    raw.bodyText || ''
  );
  const hasAgeGateSignal = /\b(age\s*verification|verify\s*your\s*age|date\s*of\s*birth|parental\s*consent)\b/i.test(
    raw.bodyText || ''
  );

  // 9. Section 13 & Rule 14(3) Grievance Officer / DPO & 90-Day SLA
  const hasDpoOrGrievanceMention = /\b(grievance\s*officer|data\s*protection\s*officer|\bdpo\b|grievance\s*redressal)\b/i.test(
    raw.bodyText || ''
  );
  const emailMatches = (raw.bodyText || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const dpoEmails = emailMatches.filter((e) => /^(dpo|privacy|grievance|compliance|legal|dataprotection)@/i.test(e));
  const mentions90Days = /\b90\s*(days|calendar\s*days)\b/i.test(raw.bodyText || '');
  const mentionsLegacy30Or7Days = /\b(30|7)\s*(days|working\s*days)\b/i.test(raw.bodyText || '') && !mentions90Days;

  // 10. Section 16 & Rule 15 Third-Party Sub-Processors
  const thirdPartyDomainMap = new Map();
  for (const req of raw.networkRequests || []) {
    try {
      const u = new URL(req.url);
      if (
        u.hostname &&
        u.hostname !== raw.canonicalDomain &&
        !u.hostname.endsWith(`.${raw.canonicalDomain.replace(/^www\./, '')}`)
      ) {
        if (!thirdPartyDomainMap.has(u.hostname)) {
          const matchedVendor = AUTOMATION_SIGNATURES.find((sig) => sig.patterns.some((p) => p.test(req.url)));
          thirdPartyDomainMap.set(u.hostname, {
            third_party_domain: u.hostname,
            vendor_or_service_name: matchedVendor ? matchedVendor.vendor : 'External Web Sub-Processor / CDN',
            category: matchedVendor ? matchedVendor.category : 'External Asset / Script Host',
            estimated_primary_jurisdiction: matchedVendor
              ? matchedVendor.jurisdiction
              : 'Cross-Border / Global Cloud (Verify under Rule 15)',
            fired_before_consent: true,
            dpdpa_governance_recommendation: matchedVendor
              ? matchedVendor.fix
              : 'Verify Data Processing Agreement (Section 8(2)), Sub-Processor inventory disclosure (Rule 3), and Subresource Integrity (Rule 6).'
          });
        }
      }
    } catch {}
  }
  const subprocessorRegister = Array.from(thirdPartyDomainMap.values());

  // 11. Build Advisory Findings (Reputation-Safe)
  const findings = [];
  let findingCounter = 1;
  const nextId = () => `DPIA-${String(findingCounter++).padStart(3, '0')}`;

  // Notice Finding (Sec 5 / Rule 3)
  findings.push({
    finding_id: nextId(),
    pillar: 'Notice & Transparency (Sec 5 / Rule 3)',
    observed_technical_signal:
      privacyLinks.length > 0
        ? `Observed ${privacyLinks.length} privacy/notice anchor link(s) (${privacyLinks
            .slice(0, 2)
            .map((l) => l.href)
            .join(', ')}). Eighth Schedule Indian language selector signal: ${
            hasIndianLanguageSignal ? 'Present' : 'Not detected on landing DOM'
          }.`
        : 'No dedicated Privacy Notice anchor link detected in the inspected landing DOM.',
    statutory_mapping:
      'Section 5(1)-(2) of the DPDP Act, 2023 read with Rule 3 of the DPDP Rules, 2025 (G.S.R. 846(E))',
    readiness_tier:
      privacyLinks.length > 0 && hasIndianLanguageSignal
        ? 'Aligned'
        : privacyLinks.length > 0
          ? 'Advisory Enhancement'
          : 'Priority Readiness Action',
    reputation_safe_advisory_note:
      privacyLinks.length > 0
        ? 'A publicly accessible privacy notice link is present. Enhancing the notice with an itemised data-purpose table and Eighth Schedule language accessibility strengthens Section 5(1) and Rule 3 readiness ahead of the 13 May 2027 operational milestone.'
        : 'Adding a prominent, independently understandable Privacy Notice link at every personal data collection point is recommended to align with Section 5 and Rule 3.',
    recommended_engineering_fix:
      'Publish a standalone, itemised Section 5 / Rule 3 Privacy Notice detailing personal data categories, specific purposes, DPO/Grievance contact, 90-day grievance SLA (Rule 14(3)), and English + Eighth Schedule language toggle.',
    verification_method:
      'Inspect DOM footer and all form containers for `<a href="/privacy-notice">` and verify multi-language selector rendering.'
  });

  // Consent & Dark Patterns Finding (Sec 6 / Rules 3-4)
  const hasSymmetricConsent = detectedCmps.length > 0 && (rejectButtons.length > 0 || acceptButtons.length === 0);
  findings.push({
    finding_id: nextId(),
    pillar: 'Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4)',
    observed_technical_signal: `CMP scripts detected: ${
      detectedCmps.length > 0 ? detectedCmps.join(', ') : 'None'
    }; Pre-ticked checkboxes: ${preTickedCount}; Accept buttons: ${acceptButtons.length}, Reject/Essential-Only buttons: ${
      rejectButtons.length
    }; Consent withdrawal link: ${hasWithdrawalLink ? 'Detected' : 'Not detected'}.`,
    statutory_mapping:
      'Section 6(1), Section 6(4), and Section 6(6) of the DPDP Act, 2023 read with Rules 3 and 4 of the DPDP Rules, 2025',
    readiness_tier:
      preTickedCount > 0 || (preConsentTrackingObserved && detectedCmps.length === 0)
        ? 'Priority Readiness Action'
        : hasSymmetricConsent && hasWithdrawalLink
          ? 'Aligned'
          : 'Advisory Enhancement',
    reputation_safe_advisory_note:
      preTickedCount > 0
        ? 'Observed default-checked checkbox element(s). Under Section 6(1), affirmative consent requires a clear affirmative action without pre-selected defaults.'
        : detectedCmps.length === 0 && preConsentTrackingObserved
          ? 'Non-essential analytics, marketing, or automation scripts were observed loading prior to an explicit consent banner interaction.'
          : 'Consent interface signals are present; verifying equal visual prominence between "Accept" and "Reject / Essential Only" controls and a persistent consent withdrawal link ensures alignment with Section 6(4).',
    recommended_engineering_fix:
      'Remove all `checked` attributes from optional consent checkboxes, deploy a Section 6-aligned consent banner with equal-prominence `Accept` and `Reject Non-Essential` buttons, and expose a persistent footer trigger to withdraw consent with ease comparable to granting it.',
    verification_method:
      'Load the page in a clean browser context and verify zero non-essential cookies/beacons fire before clicking "Accept", and confirm "Reject" is reachable in the same layer.'
  });

  // Website Automations, AI Agents & Session Replay Finding (Rule 13(2) & Sec 6)
  findings.push({
    finding_id: nextId(),
    pillar: 'Website Automations, AI & Profiling (Sec 6 / Rule 13(2))',
    observed_technical_signal: `Total client-side automations detected: ${totalAutomations} (Marketing/CRM: ${marketingAutomations.length}, CDP/Tag Managers: ${cdpRouters.length}, Session Replay/Heatmaps: ${sessionReplay.length}, AI Chatbots/Widgets: ${aiChatbots.length}, Ad Pixels: ${adPixels.length}, Early field listeners: ${earlyFieldListeners}).`,
    statutory_mapping:
      'Section 6(1) & Section 10(2)(c)(ii) of the DPDP Act, 2023 read with Rule 13(1)-(3) and Rule 6 of the DPDP Rules, 2025',
    readiness_tier:
      sessionReplay.length > 0 || adPixels.length > 0 || earlyFieldListeners
        ? 'Priority Readiness Action'
        : totalAutomations > 0
          ? 'Advisory Enhancement'
          : 'Aligned',
    reputation_safe_advisory_note:
      totalAutomations > 0
        ? 'Observed client-side marketing, session replay, conversational AI, or ad-pixel automations. Under Rule 13(2), Data Fiduciaries (and Significant Data Fiduciaries in annual DPIAs) should verify that algorithmic software, automated profiling, and session capture scripts do not create unconsented risk to the rights of Data Principals.'
        : 'No intrusive third-party session replay, ad-pixel, or automated profiling scripts were observed on initial load.',
    recommended_engineering_fix:
      'Gate all marketing, CRM, session replay, and pixel automations behind affirmative consent categories; enforce strict DOM input masking (`data-clarity-mask`, `.fs-mask`) on session replay tools; and disable automatic form-field scraping prior to form submit.',
    verification_method:
      'Run `collect_website_dpia_telemetry.mjs` and confirm all third-party automation tags remain dormant until consent state transitions to granted.'
  });

  // Reasonable Security Safeguards Finding (Sec 8(5) / Rule 6 / Rule 8(3))
  findings.push({
    finding_id: nextId(),
    pillar: 'Reasonable Security Safeguards (Sec 8(5) / Rule 6)',
    observed_technical_signal: `HTTPS: ${isHttps}; HSTS: ${hasHsts}; CSP: ${hasCsp}; X-Content-Type-Options: ${hasXcto}; Referrer-Policy: ${hasReferrerPolicy}; Permissions-Policy: ${hasPermissionsPolicy}; External scripts with SRI: ${externalScriptsWithSri.length}/${externalScripts.length}.`,
    statutory_mapping:
      'Section 8(5) of the DPDP Act, 2023 read with Rule 6 (Reasonable Security Safeguards) and Rule 8(3) read with the Seventh Schedule (minimum 1-year log retention) of the DPDP Rules, 2025',
    readiness_tier:
      !isHttps || insecureForms.length > 0
        ? 'Priority Readiness Action'
        : hasHsts && hasCsp && hasXcto
          ? 'Aligned'
          : 'Advisory Enhancement',
    reputation_safe_advisory_note:
      hasHsts && hasCsp && hasXcto
        ? 'Core HTTP transport and browser security headers are configured in alignment with Rule 6 client-side hardening practices.'
        : 'Enhancing HTTP response security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and adding Subresource Integrity (`integrity=`) attributes on third-party scripts strengthens Rule 6(1) safeguards against client-side script tampering.',
    recommended_engineering_fix:
      'Configure `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, a strict `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and retain server/access logs for a minimum of 1 year under Rule 8(3) and the Seventh Schedule.',
    verification_method:
      'Inspect HTTP response headers via `curl -I` and verify SRI hashes on all external `<script src="...">` tags.'
  });

  // Children's Data Finding (Sec 9 / Rules 10-11)
  findings.push({
    finding_id: nextId(),
    pillar: "Children's Data Protection (Sec 9 / Rules 10-11)",
    observed_technical_signal: `Youth/child audience indicators: ${hasChildrenAudienceSignal}; Age-gate / verifiable parental consent signal: ${hasAgeGateSignal}; Active behavioural/ad pixels on page: ${
      adPixels.length + sessionReplay.length
    }.`,
    statutory_mapping:
      'Section 9(1)-(3) of the DPDP Act, 2023 read with Rules 10 and 11 and the Fourth Schedule of the DPDP Rules, 2025',
    readiness_tier:
      hasChildrenAudienceSignal && (adPixels.length > 0 || sessionReplay.length > 0 || !hasAgeGateSignal)
        ? 'Priority Readiness Action'
        : 'Aligned',
    reputation_safe_advisory_note:
      hasChildrenAudienceSignal
        ? 'Where web flows are accessible to or directed at children (under 18 years), Section 9(1) and Rule 10 require verifiable parental consent, and Section 9(3) strictly prohibits tracking, behavioural monitoring, and targeted advertising directed at children.'
        : 'Page content appears directed at general/adult audiences; maintaining a clear age declaration and suppressing ad-tech pixels for known minor sessions preserves Section 9 readiness.',
    recommended_engineering_fix:
      'If minor users are onboarded, implement a Rule 10 verifiable parental consent workflow (reliable identity/age token) and programmatically disable all behavioural analytics, session replay, and ad pixels for under-18 sessions (Section 9(3)).',
    verification_method:
      'Verify that sessions flagged as under-18 suppress all third-party marketing and behavioural telemetry.'
  });

  // Grievance Redressal & 90-Day SLA Finding (Sec 13 / Rule 14(3))
  findings.push({
    finding_id: nextId(),
    pillar: 'Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3))',
    observed_technical_signal: `Grievance Officer / DPO text mention: ${hasDpoOrGrievanceMention}; Dedicated privacy/grievance emails found: ${
      dpoEmails.length > 0 ? dpoEmails.join(', ') : 'None on landing page'
    }; 90-day SLA stated: ${mentions90Days}; Legacy 30/7-day SLA stated: ${mentionsLegacy30Or7Days}.`,
    statutory_mapping:
      'Section 8(9), Section 10(2)(a), and Section 13 of the DPDP Act, 2023 read with Rule 14(3) of the DPDP Rules, 2025 (90-day statutory grievance resolution period)',
    readiness_tier:
      hasDpoOrGrievanceMention && mentions90Days
        ? 'Aligned'
        : hasDpoOrGrievanceMention || dpoEmails.length > 0
          ? 'Advisory Enhancement'
          : 'Priority Readiness Action',
    reputation_safe_advisory_note:
      mentionsLegacy30Or7Days
        ? 'Observed a legacy grievance timeframe (e.g., 30 or 7 days). Under Rule 14(3) of the DPDP Rules, 2025 (G.S.R. 846(E)), the Data Fiduciary must publish a grievance redressal period not exceeding 90 days.'
        : 'Publishing the business contact details of the Data Protection Officer (for Significant Data Fiduciaries) or Grievance Officer along with an explicit commitment to respond within the 90-day statutory maximum under Rule 14(3) enhances transparency and Data Principal trust.',
    recommended_engineering_fix:
      'Display the Grievance Officer / DPO designation, official email, postal address, and an explicit statement that grievances are resolved within a period not exceeding 90 days in accordance with Section 13 and Rule 14(3).',
    verification_method:
      'Confirm the Privacy Notice and footer contain the DPO/Grievance contact block and the exact 90-day SLA reference.'
  });

  // Cross-Border Sub-Processors Finding (Sec 16 / Rule 15)
  findings.push({
    finding_id: nextId(),
    pillar: 'Cross-Border Sub-Processors (Sec 16 / Rule 15)',
    observed_technical_signal: `Observed ${subprocessorRegister.length} external third-party domain(s) receiving client network requests (${subprocessorRegister
      .slice(0, 4)
      .map((s) => s.third_party_domain)
      .join(', ')}).`,
    statutory_mapping:
      'Section 8(2) and Section 16 of the DPDP Act, 2023 read with Rule 15 of the DPDP Rules, 2025',
    readiness_tier: subprocessorRegister.length === 0 ? 'Aligned' : 'Advisory Enhancement',
    reputation_safe_advisory_note:
      subprocessorRegister.length > 0
        ? 'External script/API requests automatically transmit client IP addresses, browser headers, and page URLs to third-party infrastructure. Documenting these Data Processors under valid Section 8(2) contracts and verifying cross-border transfer conditions under Section 16 and Rule 15 is recommended.'
        : 'Zero external third-party network domains were observed during initial page load.',
    recommended_engineering_fix:
      'Maintain a live Sub-Processor & Cross-Border Transfer Register mapped to Section 8(2) Data Processing Agreements and Rule 15 transfer conditions; self-host static fonts and scripts where feasible.',
    verification_method:
      'Cross-check all domains in `subprocessor_and_cross_border_register` against signed Data Processor agreements.'
  });

  // Calculate Overall Readiness Score (0-100)
  const tierWeights = {
    Aligned: 100,
    'Advisory Enhancement': 72,
    'Priority Readiness Action': 40
  };
  const totalScore = Math.round(
    findings.reduce((acc, f) => acc + (tierWeights[f.readiness_tier] || 70), 0) / findings.length
  );

  const readinessPosture =
    totalScore >= 85
      ? 'High Readiness (Aligned)'
      : totalScore >= 65
        ? 'Moderate Readiness (Advisory Enhancements Recommended)'
        : 'Foundational Readiness (Priority Engineering Actions Recommended)';

  const rule13Triggered =
    sessionReplay.length > 0 || aiChatbots.length > 0 || adPixels.length > 0 || marketingAutomations.length > 0;

  const report = {
    report_metadata: {
      audit_id: `DPIA-WEB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      target_url: raw.targetUrl,
      canonical_domain: raw.canonicalDomain,
      evaluated_at_utc: new Date().toISOString(),
      assessment_framing: 'Confidential & Constructive Advisory DPIA Readiness Assessment',
      audit_scope:
        'Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)',
      statutory_baseline: {
        act: 'Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule)',
        rules: 'Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)',
        enforcement_timeline:
          'Phased: 13 Nov 2025 (Rules 1-2, 17-21); 13 Nov 2026 (Rule 4 Consent Manager registration); 13 May 2027 (Rules 3, 5-16, 22-23 operational compliance)',
        grievance_sla_days: 90,
        security_log_retention_minimum: 'Minimum 1 year (Rule 8(3) read with Seventh Schedule)'
      },
      evaluating_model_family: modelFamily
    },
    executive_readiness_summary: {
      overall_readiness_score_0_100: totalScore,
      readiness_posture: readinessPosture,
      rule13_dpia_and_algorithmic_risk_triggered: rule13Triggered,
      rule13_trigger_rationale: rule13Triggered
        ? `Observed ${totalAutomations} client-side automation/tracking integration(s) (including session replay, AI chat, CRM, or ad pixels) that process behavioural telemetry and warrant a formal Rule 13(2) algorithmic & software risk review.`
        : 'No high-risk client-side behavioural profiling, session replay, or automated decisioning scripts were observed on initial page load.',
      key_observed_strengths: findings
        .filter((f) => f.readiness_tier === 'Aligned')
        .map((f) => `${f.pillar}: ${f.observed_technical_signal}`),
      priority_readiness_enhancements: findings
        .filter((f) => f.readiness_tier !== 'Aligned')
        .map((f) => `${f.pillar}: ${f.recommended_engineering_fix}`),
      board_advisory_synopsis: sanitizeReputationSafeText(
        `This confidential, read-only DPIA readiness assessment inspected ${raw.canonicalDomain} against the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 (G.S.R. 846(E)). The website achieved an advisory readiness score of ${totalScore}/100 (${readinessPosture}), with ${totalAutomations} client-side automation/tracking signal(s) and ${subprocessorRegister.length} external sub-processor domain(s) catalogued for engineering and DPO review.`
      )
    },
    pre_consent_storage_and_cookies: {
      pre_consent_tracking_observed: preConsentTrackingObserved,
      first_party_cookies_count: firstPartyCount,
      third_party_cookies_count: thirdPartyCount,
      cookies_inventory: cookiesInventory,
      local_storage_keys: raw.lsKeys || [],
      session_storage_keys: raw.ssKeys || [],
      indexeddb_databases: raw.idbDatabases || [],
      service_workers_registered: raw.swRegistrations || []
    },
    website_automations_and_profiling_inventory: {
      total_automations_detected: totalAutomations,
      marketing_and_crm_automations: marketingAutomations,
      cdp_and_tag_managers: cdpRouters,
      session_replay_and_heatmaps: sessionReplay,
      ai_chatbots_and_support_widgets: aiChatbots,
      ad_pixels_and_auto_advanced_matching: adPixels,
      form_input_and_dark_pattern_signals: {
        forms_inspected_count: (raw.forms || []).length,
        pre_ticked_checkboxes_count: preTickedCount,
        bundled_consent_forms_count: preTickedCount > 0 ? 1 : 0,
        unencrypted_or_insecure_form_actions: insecureForms,
        early_field_capture_listeners_detected: earlyFieldListeners,
        observations: [
          `Inspected ${(raw.forms || []).length} HTML form container(s) and detected ${preTickedCount} pre-selected checkbox(es).`,
          earlyFieldListeners
            ? 'Detected input/change event listeners or pixel auto-matching patterns that may capture form inputs prior to explicit submission.'
            : 'No pre-submission keystroke/field exfiltration listeners detected in inspected scripts.'
        ]
      },
      fingerprinting_and_background_signals: {
        web_push_permission_requested_on_load: pushOnLoad,
        canvas_or_webgl_fingerprint_signals: canvasFingerprint,
        navigator_beacon_or_fetch_keepalive_observed: beaconObserved,
        details: [
          `Web Push on-load prompt: ${pushOnLoad ? 'Observed' : 'Not observed'}`,
          `Canvas/Audio fingerprinting signatures: ${canvasFingerprint ? 'Observed' : 'Not observed'}`,
          `Navigator sendBeacon telemetry: ${beaconObserved ? 'Observed' : 'Not observed'}`
        ]
      }
    },
    statutory_dpdpa_control_matrix: {
      section_5_rule_3_notice: {
        statutory_reference: 'Section 5(1)-(2) & Rule 3 (G.S.R. 846(E))',
        readiness_tier: findings[0].readiness_tier,
        observed_signals: [findings[0].observed_technical_signal],
        advisory_summary: findings[0].reputation_safe_advisory_note
      },
      section_6_rule_3_4_consent_and_cmp: {
        statutory_reference: 'Section 6(1)-(6) & Rules 3-4 (G.S.R. 846(E))',
        readiness_tier: findings[1].readiness_tier,
        observed_signals: [findings[1].observed_technical_signal],
        advisory_summary: findings[1].reputation_safe_advisory_note
      },
      section_8_5_rule_6_8_security_and_logs: {
        statutory_reference: 'Section 8(5), Rule 6 & Rule 8(3) + Seventh Schedule (1-Year Log Retention)',
        readiness_tier: findings[3].readiness_tier,
        observed_signals: [findings[3].observed_technical_signal],
        advisory_summary: findings[3].reputation_safe_advisory_note
      },
      section_9_rules_10_11_children_safeguards: {
        statutory_reference: 'Section 9(1)-(3) & Rules 10-11 + Fourth Schedule',
        readiness_tier: findings[4].readiness_tier,
        observed_signals: [findings[4].observed_technical_signal],
        advisory_summary: findings[4].reputation_safe_advisory_note
      },
      section_10_rule_13_dpia_and_algorithmic_governance: {
        statutory_reference: 'Section 10(2)(c)(ii) & Rule 13(1)-(3) (Annual DPIA & Algorithmic Risk)',
        readiness_tier: findings[2].readiness_tier,
        observed_signals: [findings[2].observed_technical_signal],
        advisory_summary: findings[2].reputation_safe_advisory_note
      },
      section_13_rule_14_3_grievance_and_dpo: {
        statutory_reference: 'Section 13 & Rule 14(3) (90-Day Statutory Grievance SLA)',
        readiness_tier: findings[5].readiness_tier,
        observed_signals: [findings[5].observed_technical_signal],
        advisory_summary: findings[5].reputation_safe_advisory_note
      },
      section_16_rule_15_cross_border_transfers: {
        statutory_reference: 'Section 8(2), Section 16 & Rule 15 (Cross-Border Data Transfers)',
        readiness_tier: findings[6].readiness_tier,
        observed_signals: [findings[6].observed_technical_signal],
        advisory_summary: findings[6].reputation_safe_advisory_note
      }
    },
    advisory_findings: findings,
    subprocessor_and_cross_border_register: subprocessorRegister,
    reputation_safety_attestation: {
      zero_defamation_verified: true,
      prohibited_terms_absent: true,
      read_only_passive_inspection_confirmed: true,
      disclaimer:
        'This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.'
    }
  };

  if (!verifyZeroProhibitedTerms(report)) {
    throw new Error('Reputation-safety invariant check failed: prohibited accusatory term detected.');
  }

  return report;
}

// ---------------------------------------------------------------------------
// 5. CLI ENTRYPOINT
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(
      'Usage: node collect_website_dpia_telemetry.mjs <url-or-html-path> [--out <output.json>] [--model <claude|gemini|deepseek|qwen|deterministic-telemetry-only>]'
    );
    process.exit(0);
  }

  const target = args[0];
  const outIdx = args.indexOf('--out');
  const outPath = outIdx > -1 ? args[outIdx + 1] : null;
  const modelIdx = args.indexOf('--model');
  const modelFamily = modelIdx > -1 ? args[modelIdx + 1] : 'deterministic-telemetry-only';

  const rawTelemetry = await collectWithPlaywrightOrFallback(target);
  const dpiaReport = buildDpiaReportFromTelemetry(rawTelemetry, modelFamily);

  const outputPayload = JSON.stringify(dpiaReport, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(path.resolve(outPath), outputPayload, 'utf-8');
    console.error(`[website-dpia-audit] Wrote reputation-safe DPIA report to ${outPath}`);
  } else {
    process.stdout.write(outputPayload + '\n');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`[website-dpia-audit] Error: ${err.message}`);
    process.exit(1);
  });
}
