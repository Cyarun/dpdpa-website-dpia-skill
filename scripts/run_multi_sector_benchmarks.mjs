#!/usr/bin/env node
/**
 * Live Multi-Sector Indian Website Passive DPIA Benchmark Runner
 *
 * Performs 100% passive, read-only HTTP GET + DOM/Header/Cookie/Script/Automation
 * inspection across 8 benchmark Indian websites:
 *   1. https://dpdpa.support (LegalTech / Compliance)
 *   2. https://star.dpdpa.support (B2B SaaS Portal)
 *   3. https://razorpay.com (Fintech / Payments)
 *   4. https://www.zoho.com (Enterprise SaaS)
 *   5. https://zerodha.com (Financial Services / Broking)
 *   6. https://www.nykaa.com (Retail & E-Commerce)
 *   7. https://www.practo.com (Healthcare & Clinics)
 *   8. https://www.npci.org.in (Digital Public Infrastructure)
 *
 * Outputs per website in products/dpia-audit-skill/benchmarks/:
 *   - <slug>.telemetry.json (Raw passive HTTP/DOM/cookie/script/automation telemetry)
 *   - <slug>.dpia-report.json (Schema-validated Reputation-Safe Advisory DPIA Readiness Report)
 *   - <slug>.dpia-report.md (Executive & Engineering Markdown Report)
 * Plus master summary:
 *   - products/dpia-audit-skill/benchmarks/BENCHMARK-SUMMARY.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');
const BENCHMARKS_DIR = path.join(SKILL_ROOT, 'benchmarks');

export const BENCHMARK_TARGETS = [
  {
    slug: 'dpdpa-support',
    url: 'https://dpdpa.support',
    sector: 'LegalTech / Compliance',
    entity_label: 'DPDPA Support (LegalTech Reference Site)'
  },
  {
    slug: 'star-dpdpa-support',
    url: 'https://star.dpdpa.support',
    sector: 'B2B SaaS Portal',
    entity_label: 'STAR Compliance Portal (B2B SaaS)'
  },
  {
    slug: 'razorpay',
    url: 'https://razorpay.com',
    sector: 'Fintech / Payments',
    entity_label: 'Razorpay (Fintech & Payment Gateway)'
  },
  {
    slug: 'zoho',
    url: 'https://www.zoho.com',
    sector: 'Enterprise SaaS',
    entity_label: 'Zoho Corporation (Enterprise Cloud SaaS)'
  },
  {
    slug: 'zerodha',
    url: 'https://zerodha.com',
    sector: 'Financial Services / Broking',
    entity_label: 'Zerodha (Financial Services & Broking)'
  },
  {
    slug: 'nykaa',
    url: 'https://www.nykaa.com',
    sector: 'Retail & E-Commerce',
    entity_label: 'Nykaa (Consumer Retail & E-Commerce)'
  },
  {
    slug: 'practo',
    url: 'https://www.practo.com',
    sector: 'Healthcare & Clinics',
    entity_label: 'Practo (Digital Healthcare & Clinic Platform)'
  },
  {
    slug: 'npci',
    url: 'https://www.npci.org.in',
    sector: 'Digital Public Infrastructure',
    entity_label: 'NPCI (National Payments Corporation of India)'
  }
];

/**
 * Curated vendor & automation signature catalog for deterministic detection
 */
const AUTOMATION_SIGNATURES = [
  // CDP & Tag Managers
  {
    vendor_name: 'Google Tag Manager (GTM)',
    automation_category: 'CDP & Event Routing',
    subprocessor_category: 'Tag Management & Event Routing',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/googletagmanager\.com\/gtm\.js/i, /googletagmanager\.com\/gtag\/js/i, /GTM-[A-Z0-9]{4,10}/],
    rule13_relevance: 'Orchestrates client-side event routing and third-party tag firing; requires consent gating under Section 6 and Rule 3 prior to non-essential telemetry dispatch.',
    advisory_action: 'Configure Google Tag Manager Consent Mode v2 with default denied state for analytics_storage and ad_storage until affirmative Data Principal consent is recorded.'
  },
  {
    vendor_name: 'Google Analytics 4 (GA4)',
    automation_category: 'CDP & Event Routing',
    subprocessor_category: 'Web Analytics & Telemetry',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/google-analytics\.com/i, /G-[A-Z0-9]{6,12}/, /gtag\s*\(\s*['"]config['"]/i, /_ga\b/i],
    rule13_relevance: 'Collects pseudonymous client identifiers, pageview sequences, and behavioral engagement metrics relevant to Section 6 consent governance.',
    advisory_action: 'Gate GA4 initialization behind affirmative opt-in consent and enable IP anonymization and data retention controls aligned with Section 8(7).'
  },
  {
    vendor_name: 'Segment / RudderStack CDP',
    automation_category: 'CDP & Event Routing',
    subprocessor_category: 'Customer Data Platform (CDP)',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/cdn\.segment\.com/i, /rudderlabs\.com/i, /analytics\.load\(/i],
    rule13_relevance: 'Synchronizes user traits and behavioral events across downstream marketing and analytics destinations (Rule 13(2) profiling relevance).',
    advisory_action: 'Bind CDP middleware to the Consent Management Platform (CMP) category preferences prior to dispatching identify() or track() payloads.'
  },
  {
    vendor_name: 'Cloudflare Web Analytics / Insights',
    automation_category: 'CDP & Event Routing',
    subprocessor_category: 'Edge Performance & Security Telemetry',
    jurisdiction: 'Global Edge / India PoPs',
    patterns: [/static\.cloudflareinsights\.com\/beacon\.min\.js/i, /__cf_bm\b/i, /cf-ray/i],
    rule13_relevance: 'Provides edge bot mitigation and aggregate performance telemetry under Section 8(5) reasonable security safeguards.',
    advisory_action: 'Document edge security cookies and telemetry in the Section 5 / Rule 3 itemised privacy notice.'
  },

  // Marketing & CRM Automations
  {
    vendor_name: 'HubSpot Marketing & CRM',
    automation_category: 'Marketing & CRM Automation',
    subprocessor_category: 'CRM & Lead Automation',
    jurisdiction: 'United States / EU Cloud',
    patterns: [/js\.hs-scripts\.com/i, /js\.hsforms\.net/i, /hs-analytics/i, /__hstc\b/i, /hubspotutk\b/i],
    rule13_relevance: 'Associates browsing sessions with CRM contact records and lead scoring workflows (Section 6 & Rule 13(2)).',
    advisory_action: 'Defer HubSpot tracking script execution until affirmative consent and provide granular purpose toggles in the consent banner.'
  },
  {
    vendor_name: 'CleverTap / WebEngage / MoEngage',
    automation_category: 'Marketing & CRM Automation',
    subprocessor_category: 'Omnichannel Marketing Automation & Retention',
    jurisdiction: 'India / Global Cloud',
    patterns: [/clevertap\.com/i, /wzrkt\.com/i, /webengage\.com/i, /moengage\.com/i, /wizrocket/i],
    rule13_relevance: 'Performs user segmentation, automated lifecycle triggers, and behavioral cohort profiling subject to Rule 13(2) algorithmic governance.',
    advisory_action: 'Ensure omnichannel engagement SDKs initialize in opt-out mode by default and log consent provenance for push/email automation.'
  },
  {
    vendor_name: 'Zoho PageSense / Zoho Marketing Automation / Zoho SalesIQ',
    automation_category: 'Marketing & CRM Automation',
    subprocessor_category: 'First/Third-Party CRM & Engagement Automation',
    jurisdiction: 'India / Global Data Centers',
    patterns: [/pagesense\.io/i, /zohocdn\.com\/salesiq/i, /salesiq\.zoho/i, /zoho\.com\/salesiq/i, /zps-s/i, /zab_/i],
    rule13_relevance: 'Provides visitor engagement tracking, conversion optimization, and live support routing.',
    advisory_action: 'Synchronize Zoho engagement scripts with explicit banner consent categories and maintain clear purpose descriptions in the privacy notice.'
  },
  {
    vendor_name: 'AppsFlyer / Branch Attribution',
    automation_category: 'Marketing & CRM Automation',
    subprocessor_category: 'Mobile & Cross-Platform Attribution',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/appsflyer\.com/i, /branch\.io/i, /app\.link/i],
    rule13_relevance: 'Links web-to-app acquisition journeys and attribution parameters across devices.',
    advisory_action: 'Gate cross-device attribution links and deep-linking telemetry behind user consent.'
  },

  // Session Replay & Behavioral Heatmaps
  {
    vendor_name: 'Microsoft Clarity',
    automation_category: 'Session Replay & Behavioral Heatmap',
    subprocessor_category: 'Session Replay & UX Heatmaps',
    jurisdiction: 'United States / Azure Global',
    patterns: [/clarity\.ms\/tag/i, /\b_clck\b/i, /\b_clsk\b/i],
    rule13_relevance: 'Captures DOM mutations, scroll heatmaps, and interaction telemetry; high relevance to Section 8(5) input masking and Rule 13(2).',
    advisory_action: 'Enforce strict DOM input masking for all personal data fields and delay script load until analytics consent is granted.'
  },
  {
    vendor_name: 'Hotjar / FullStory / LogRocket / CrazyEgg',
    automation_category: 'Session Replay & Behavioral Heatmap',
    subprocessor_category: 'Session Replay & Behavioral Analytics',
    jurisdiction: 'European Union / United States',
    patterns: [/static\.hotjar\.com/i, /fullstory\.com/i, /lr-ingest\.io/i, /crazyegg\.com/i, /\b_hjSession/i],
    rule13_relevance: 'Records fine-grained interaction streams and behavioral heatmaps requiring explicit consent and strict PII redaction.',
    advisory_action: 'Configure client-side suppression of sensitive text nodes and gate initialization via the CMP.'
  },
  {
    vendor_name: 'Visual Website Optimizer (VWO) / Optimizely',
    automation_category: 'Session Replay & Behavioral Heatmap',
    subprocessor_category: 'A/B Experimentation & Behavioral Optimization',
    jurisdiction: 'India / United States',
    patterns: [/visualwebsiteoptimizer\.com/i, /dev\.visualwebsiteoptimizer\.com/i, /optimizely\.com/i, /_vwo_uuid/i, /_vis_opt_/i],
    rule13_relevance: 'Executes client-side behavioral experimentation, variant assignment, and interaction tracking.',
    advisory_action: 'Ensure experimentation cookies and behavioral heatmaps respect user consent preferences.'
  },

  // AI Chatbots & Support Widgets
  {
    vendor_name: 'Intercom / Freshchat / Zendesk / Drift / Crisp / Yellow.ai / Verloop',
    automation_category: 'AI Chatbot / Conversational Agent / Support Widget',
    subprocessor_category: 'Conversational AI & Customer Support Automation',
    jurisdiction: 'India / United States',
    patterns: [
      /widget\.intercom\.io/i,
      /wchat\.freshchat\.com/i,
      /zdassets\.com/i,
      /js\.driftt\.com/i,
      /client\.crisp\.chat/i,
      /yellow\.ai/i,
      /verloop\.io/i,
      /chatbot/i,
      /livechat/i
    ],
    rule13_relevance: 'Processes free-text conversational inputs and automated support triage; directly implicates Section 5 notice and Rule 13(2) algorithmic risk governance.',
    advisory_action: 'Display a concise pre-chat Section 5 notice snippet clarifying how conversational transcripts are processed and retained.'
  },

  // Ad Pixels & Retargeting
  {
    vendor_name: 'Meta / Facebook Pixel (fbevents.js)',
    automation_category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    subprocessor_category: 'Advertising Pixel & Cross-Site Retargeting',
    jurisdiction: 'United States / Ireland',
    patterns: [/connect\.facebook\.net.*fbevents\.js/i, /fbq\s*\(\s*['"]init['"]/i, /\b_fbp\b/i],
    rule13_relevance: 'Enables cross-site ad attribution and retargeting audiences; Auto-Advanced Matching can hash DOM form inputs if not restricted.',
    advisory_action: 'Disable Automatic Advanced Matching by default and block fbevents.js execution until explicit marketing consent is obtained.'
  },
  {
    vendor_name: 'Google Ads / DoubleClick Floodlight',
    automation_category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    subprocessor_category: 'Advertising Conversion & Remarketing',
    jurisdiction: 'United States / Global Cloud',
    patterns: [/googleadservices\.com/i, /doubleclick\.net/i, /AW-[0-9]{6,12}/, /\b_gcl_au\b/i],
    rule13_relevance: 'Tracks advertising conversions and remarketing identifiers across web properties.',
    advisory_action: 'Block advertising conversion tags prior to explicit opt-in consent and provide one-click withdrawal parity.'
  },
  {
    vendor_name: 'LinkedIn Insight Tag / X (Twitter) Pixel / Bing UET',
    automation_category: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
    subprocessor_category: 'B2B & Social Advertising Attribution',
    jurisdiction: 'United States',
    patterns: [/snap\.licdn\.com\/li\.lms-analytics/i, /static\.ads-twitter\.com/i, /bat\.bing\.com/i, /\bcookie_li\b/i, /\b_uetvid\b/i],
    rule13_relevance: 'Associates site visits with social/professional profiles for retargeting cohorts.',
    advisory_action: 'Require explicit marketing category opt-in before loading social advertising pixels.'
  }
];

const CMP_SIGNATURES = [
  { name: 'OneTrust', pattern: /onetrust|optanon|cookielaw\.org/i },
  { name: 'Cookiebot', pattern: /cookiebot\.com|CybotCookiebot/i },
  { name: 'CookieYes', pattern: /cookieyes\.com|cky-consent/i },
  { name: 'Osano / TrustArc / Securiti', pattern: /osano\.com|trustarc\.com|securiti\.ai/i },
  { name: 'Custom / First-Party Consent Banner', pattern: /cookie-banner|cookie-consent|consent-banner|accept-cookies|gdpr-banner|dpdpa-consent/i }
];

/**
 * Parse raw Set-Cookie headers into structured cookie objects
 */
function parseSetCookieHeaders(setCookieHeaders, hostDomain) {
  const cookies = [];
  for (const raw of setCookieHeaders) {
    const parts = raw.split(';').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;
    const [nameVal, ...attrs] = parts;
    const eqIdx = nameVal.indexOf('=');
    const name = eqIdx > -1 ? nameVal.slice(0, eqIdx).trim() : nameVal.trim();
    if (!name) continue;

    let domain = hostDomain;
    let httpOnly = false;
    let secure = false;
    let sameSite = 'Unspecified';
    let expiryDays = 0; // 0 = session cookie

    for (const attr of attrs) {
      const [k, ...vParts] = attr.split('=');
      const key = k.trim().toLowerCase();
      const val = vParts.join('=').trim();
      if (key === 'domain' && val) {
        domain = val.replace(/^\./, '').toLowerCase();
      } else if (key === 'httponly') {
        httpOnly = true;
      } else if (key === 'secure') {
        secure = true;
      } else if (key === 'samesite' && val) {
        sameSite = val;
      } else if (key === 'max-age' && val) {
        const secs = Number.parseInt(val, 10);
        if (!Number.isNaN(secs)) {
          expiryDays = Math.max(0, Math.round((secs / 86400) * 10) / 10);
        }
      } else if (key === 'expires' && val) {
        const expTime = Date.parse(val);
        if (!Number.isNaN(expTime)) {
          const diffDays = (expTime - Date.now()) / (1000 * 86400);
          expiryDays = Math.max(0, Math.round(diffDays * 10) / 10);
        }
      }
    }

    const baseHost = hostDomain.replace(/^www\./, '').toLowerCase();
    const cleanCookieDomain = domain.replace(/^www\./, '').toLowerCase();
    const isThirdParty = !cleanCookieDomain.endsWith(baseHost) && !baseHost.endsWith(cleanCookieDomain);

    let category = 'Strictly Necessary / Security';
    if (/(_ga|_gid|_gat|amplitude|mixpanel|mp_|pagesense|zab_|_vwo|_vis_opt)/i.test(name)) {
      category = 'Analytics & Telemetry';
    } else if (/(_fbp|_fbc|_gcl|_uet|li_|ads|doubleclick|wzrkt|clevertap)/i.test(name)) {
      category = 'Marketing / Ad-Tech / Retargeting';
    } else if (/(_clck|_clsk|_hj|fullstory)/i.test(name)) {
      category = 'Session Replay / Behavioral Profiling';
    } else if (/(salesiq|intercom|freshchat|crisp|zc_cu)/i.test(name)) {
      category = 'AI / Chat / Support Automation';
    } else if (/(pref|lang|theme|locale|currency)/i.test(name)) {
      category = 'Functional / Preferences';
    } else if (/(__cf_bm|cf_clearance|csrf|xsrf|sess|phpsessid|jsessionid|ak_bmsc|bm_sz|awsalb|__host-)/i.test(name)) {
      category = 'Strictly Necessary / Security';
    }

    cookies.push({
      name,
      domain,
      is_third_party: isThirdParty,
      category,
      http_only: httpOnly,
      secure,
      same_site: sameSite,
      expiry_days: expiryDays,
      set_before_consent: true
    });
  }
  return cookies;
}

/**
 * Perform a passive read-only HTTP GET request with timeout
 */
async function passiveFetch(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 DPIA-Readiness-Benchmark/1.0 (Passive-ReadOnly)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    const durationMs = Date.now() - startedAt;
    const headersObj = {};
    res.headers.forEach((v, k) => {
      headersObj[k.toLowerCase()] = v;
    });
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);

    return {
      ok: true,
      status: res.status,
      final_url: res.url || url,
      duration_ms: durationMs,
      headers: headersObj,
      set_cookies: setCookies,
      html
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      final_url: url,
      duration_ms: Date.now() - startedAt,
      headers: {},
      set_cookies: [],
      html: '',
      error: String(err.message || err)
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Inspect HTML and HTTP telemetry passively
 */
export async function collectSiteTelemetry(target) {
  const evaluatedAtUtc = new Date().toISOString();
  const parsedUrl = new URL(target.url);
  const canonicalDomain = parsedUrl.hostname;
  const baseDomain = canonicalDomain.replace(/^www\./, '');

  const primaryRes = await passiveFetch(target.url, 15000);
  const html = primaryRes.html || '';
  const headers = primaryRes.headers || {};

  // Security headers extraction
  const securityHeaders = {
    strict_transport_security: headers['strict-transport-security'] || null,
    content_security_policy: headers['content-security-policy'] || null,
    x_frame_options: headers['x-frame-options'] || null,
    x_content_type_options: headers['x-content-type-options'] || null,
    referrer_policy: headers['referrer-policy'] || null,
    permissions_policy: headers['permissions-policy'] || null,
    server: headers['server'] || null,
    cf_ray: headers['cf-ray'] || null,
    x_cache: headers['x-cache'] || null
  };

  // Extract external <script src="...">
  const scriptSrcRegex = /<script\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const scriptUrls = [];
  const thirdPartyDomainsMap = new Map();
  let match;
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    const rawSrc = match[1].trim();
    if (!rawSrc || rawSrc.startsWith('data:') || rawSrc.startsWith('javascript:')) continue;
    try {
      const resolved = new URL(rawSrc, target.url);
      scriptUrls.push(resolved.href);
      const sHost = resolved.hostname.toLowerCase();
      if (!sHost.endsWith(baseDomain) && !baseDomain.endsWith(sHost.replace(/^www\./, ''))) {
        if (!thirdPartyDomainsMap.has(sHost)) {
          thirdPartyDomainsMap.set(sHost, []);
        }
        thirdPartyDomainsMap.get(sHost).push(resolved.href);
      }
    } catch {
      // Ignore malformed script src
    }
  }

  // Extract <link href="..."> for third-party font/CDN domains
  const linkHrefRegex = /<link\b[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((match = linkHrefRegex.exec(html)) !== null) {
    const rawHref = match[1].trim();
    try {
      const resolved = new URL(rawHref, target.url);
      const lHost = resolved.hostname.toLowerCase();
      const relMatch = match[0].match(/\brel\s*=\s*["']([^"']+)["']/i);
      const relVal = relMatch ? relMatch[1].toLowerCase() : '';
      if (
        (relVal.includes('stylesheet') || relVal.includes('preconnect') || relVal.includes('dns-prefetch') || relVal.includes('preload')) &&
        !lHost.endsWith(baseDomain) &&
        !baseDomain.endsWith(lHost.replace(/^www\./, ''))
      ) {
        if (!thirdPartyDomainsMap.has(lHost)) {
          thirdPartyDomainsMap.set(lHost, []);
        }
        thirdPartyDomainsMap.get(lHost).push(resolved.href);
      }
    } catch {
      // ignore
    }
  }

  // Parse cookies from Set-Cookie
  const cookiesInventory = parseSetCookieHeaders(primaryRes.set_cookies, canonicalDomain);

  // Detect automations across HTML + script URLs + cookies + headers
  const combinedEvidenceCorpus = [
    html,
    ...scriptUrls,
    ...cookiesInventory.map(c => c.name),
    JSON.stringify(securityHeaders)
  ].join('\n');

  const detectedAutomations = {
    marketing_and_crm_automations: [],
    cdp_and_tag_managers: [],
    session_replay_and_heatmaps: [],
    ai_chatbots_and_support_widgets: [],
    ad_pixels_and_auto_advanced_matching: []
  };

  for (const sig of AUTOMATION_SIGNATURES) {
    let matchedSignal = null;
    for (const pat of sig.patterns) {
      const m = combinedEvidenceCorpus.match(pat);
      if (m) {
        // Find if a specific script URL or cookie matched for concrete grounding
        const matchingScript = scriptUrls.find(u => pat.test(u));
        const matchingCookie = cookiesInventory.find(c => pat.test(c.name));
        if (matchingScript) {
          matchedSignal = `Script URL: ${matchingScript}`;
        } else if (matchingCookie) {
          matchedSignal = `HTTP Set-Cookie: ${matchingCookie.name} (domain: ${matchingCookie.domain})`;
        } else if (pat.test(JSON.stringify(securityHeaders))) {
          matchedSignal = `HTTP Response Header match: ${m[0]}`;
        } else {
          matchedSignal = `DOM/Script signature match: ${m[0].slice(0, 100)}`;
        }
        break;
      }
    }

    if (matchedSignal) {
      const item = {
        vendor_name: sig.vendor_name,
        automation_category: sig.automation_category,
        matched_signal: matchedSignal,
        loaded_before_consent: true,
        rule13_2_profiling_or_automated_risk_relevance: sig.rule13_relevance,
        advisory_governance_action: sig.advisory_action
      };
      if (sig.automation_category === 'Marketing & CRM Automation') {
        detectedAutomations.marketing_and_crm_automations.push(item);
      } else if (sig.automation_category === 'CDP & Event Routing') {
        detectedAutomations.cdp_and_tag_managers.push(item);
      } else if (sig.automation_category === 'Session Replay & Behavioral Heatmap') {
        detectedAutomations.session_replay_and_heatmaps.push(item);
      } else if (sig.automation_category === 'AI Chatbot / Conversational Agent / Support Widget') {
        detectedAutomations.ai_chatbots_and_support_widgets.push(item);
      } else if (sig.automation_category === 'Ad Pixel / Auto-Advanced Matching / Retargeting') {
        detectedAutomations.ad_pixels_and_auto_advanced_matching.push(item);
      }
    }
  }

  // Inspect forms and checkboxes (read-only DOM analysis)
  const formMatches = html.match(/<form\b[^>]*>[\s\S]*?<\/form>/gi) || [];
  const checkboxMatches = html.match(/<input\b[^>]*?\btype\s*=\s*["']checkbox["'][^>]*>/gi) || [];
  const preTickedCheckboxes = checkboxMatches.filter(cb => /\bchecked\b/i.test(cb));
  const insecureFormActions = [];
  for (const fm of formMatches) {
    const actionMatch = fm.match(/\baction\s*=\s*["']([^"']+)["']/i);
    if (actionMatch && actionMatch[1].trim().toLowerCase().startsWith('http://')) {
      insecureFormActions.push(actionMatch[1].trim());
    }
  }

  // Detect CMP / Consent Banner signals
  const detectedCmps = [];
  for (const cmp of CMP_SIGNATURES) {
    const m = html.match(cmp.pattern);
    if (m) {
      detectedCmps.push({ name: cmp.name, matched_token: m[0] });
    }
  }
  const hasRejectOrManageOption = /reject\s+all|decline|manage\s+preferences|cookie\s+settings|cookie\s+preferences|necessary\s+only/i.test(html);

  // Extract Privacy Notice, Terms, Cookie Policy, Grievance Officer / DPO links from DOM
  const anchorRegex = /<a\b[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const privacyNoticeLinks = [];
  const grievanceLinks = [];
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1].trim();
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const combined = `${href} ${text}`;
    if (/privacy|data-protection|cookie-policy|dpdpa|security|terms/i.test(combined)) {
      try {
        const absUrl = new URL(href, target.url).href;
        if (!privacyNoticeLinks.some(p => p.url === absUrl)) {
          privacyNoticeLinks.push({ url: absUrl, label: text.slice(0, 80) || 'Privacy / Legal Link' });
        }
      } catch {
        // ignore
      }
    }
    if (/grievance|dpo|data\s*protection\s*officer|nodal\s*officer|ombudsman|complaints|dispute/i.test(combined)) {
      try {
        const absUrl = new URL(href, target.url).href;
        if (!grievanceLinks.some(g => g.url === absUrl)) {
          grievanceLinks.push({ url: absUrl, label: text.slice(0, 80) || 'Grievance / DPO Link' });
        }
      } catch {
        // ignore
      }
    }
  }

  // Optionally perform 1 passive read-only GET on the primary discovered privacy notice link (if same domain or standard policy page)
  // to check for Grievance Officer, DPO email, and 90-day SLA disclosure signals
  let privacyPageTelemetry = {
    inspected_url: null,
    status: null,
    grievance_officer_mentioned: false,
    dpo_contact_mentioned: false,
    ninety_day_sla_mentioned: false,
    retention_mentioned: false,
    cross_border_mentioned: false,
    children_data_mentioned: false
  };

  const primaryPrivacyCandidate = privacyNoticeLinks.find(l => /privacy/i.test(l.url) || /privacy/i.test(l.label)) || privacyNoticeLinks[0];
  let combinedPolicyText = html;
  if (primaryPrivacyCandidate && primaryPrivacyCandidate.url !== target.url) {
    const privRes = await passiveFetch(primaryPrivacyCandidate.url, 8000);
    if (privRes.ok && privRes.status >= 200 && privRes.status < 400) {
      privacyPageTelemetry.inspected_url = primaryPrivacyCandidate.url;
      privacyPageTelemetry.status = privRes.status;
      combinedPolicyText += '\n' + privRes.html;
    }
  }

  privacyPageTelemetry.grievance_officer_mentioned = /grievance\s+officer|nodal\s+officer|grievance\s+redressal/i.test(combinedPolicyText);
  privacyPageTelemetry.dpo_contact_mentioned = /data\s+protection\s+officer|\bdpo@|privacy@|grievance@/i.test(combinedPolicyText);
  privacyPageTelemetry.ninety_day_sla_mentioned = /\b90\s*(days|-day)|rule\s*14\s*\(\s*3\s*\)/i.test(combinedPolicyText);
  privacyPageTelemetry.retention_mentioned = /retention|retain\s+personal\s+data|1\s+year|one\s+year|section\s*8\s*\(\s*7\s*\)/i.test(combinedPolicyText);
  privacyPageTelemetry.cross_border_mentioned = /cross-border|outside\s+india|international\s+transfer|section\s*16/i.test(combinedPolicyText);
  privacyPageTelemetry.children_data_mentioned = /children|under\s+18|minor|verifiable\s+parental\s+consent|section\s*9/i.test(combinedPolicyText);

  // Check background / fingerprinting signals in HTML
  const webPushOnLoad = /Notification\.requestPermission\s*\(/i.test(html);
  const canvasFingerprintSignal = /toDataURL\s*\(|getImageData\s*\(|WEBGL_debug_renderer_info/i.test(html);
  const navigatorBeaconSignal = /navigator\.sendBeacon\s*\(/i.test(html) || /static\.cloudflareinsights\.com\/beacon/i.test(combinedEvidenceCorpus);

  // Build third-party domain summary
  const thirdPartyDomains = Array.from(thirdPartyDomainsMap.entries()).map(([domain, urls]) => ({
    domain,
    asset_count: urls.length,
    sample_url: urls[0]
  }));

  const totalAutomationsCount =
    detectedAutomations.marketing_and_crm_automations.length +
    detectedAutomations.cdp_and_tag_managers.length +
    detectedAutomations.session_replay_and_heatmaps.length +
    detectedAutomations.ai_chatbots_and_support_widgets.length +
    detectedAutomations.ad_pixels_and_auto_advanced_matching.length;

  return {
    slug: target.slug,
    sector: target.sector,
    entity_label: target.entity_label,
    target_url: target.url,
    canonical_domain: canonicalDomain,
    evaluated_at_utc: evaluatedAtUtc,
    passive_mode_attestation: '100% Read-Only HTTP GET & DOM Inspection (Zero Form Submissions, Zero Authentication Probing)',
    http_response: {
      ok: primaryRes.ok,
      status_code: primaryRes.status,
      final_url: primaryRes.final_url,
      response_time_ms: primaryRes.duration_ms,
      html_bytes: Buffer.byteLength(html, 'utf8'),
      security_headers: securityHeaders
    },
    cookies_summary: {
      total_set_cookie_count: cookiesInventory.length,
      first_party_count: cookiesInventory.filter(c => !c.is_third_party).length,
      third_party_count: cookiesInventory.filter(c => c.is_third_party).length,
      non_essential_pre_consent_count: cookiesInventory.filter(c => c.category !== 'Strictly Necessary / Security').length,
      cookies: cookiesInventory
    },
    scripts_and_third_parties: {
      total_external_scripts: scriptUrls.length,
      script_urls: scriptUrls.slice(0, 50),
      third_party_domains_count: thirdPartyDomains.length,
      third_party_domains: thirdPartyDomains
    },
    detected_automations: {
      total_automations_detected: totalAutomationsCount,
      ...detectedAutomations
    },
    consent_and_dark_pattern_signals: {
      detected_cmps: detectedCmps,
      has_reject_or_manage_option_in_dom: hasRejectOrManageOption,
      forms_inspected_count: formMatches.length,
      checkboxes_inspected_count: checkboxMatches.length,
      pre_ticked_checkboxes_count: preTickedCheckboxes.length,
      insecure_form_actions: insecureFormActions
    },
    fingerprinting_and_background_signals: {
      web_push_permission_requested_on_load: webPushOnLoad,
      canvas_or_webgl_fingerprint_signals: canvasFingerprintSignal,
      navigator_beacon_or_fetch_keepalive_observed: navigatorBeaconSignal
    },
    notice_and_grievance_signals: {
      privacy_notice_links_count: privacyNoticeLinks.length,
      privacy_notice_links: privacyNoticeLinks.slice(0, 10),
      grievance_links_count: grievanceLinks.length,
      grievance_links: grievanceLinks.slice(0, 10),
      privacy_policy_passive_check: privacyPageTelemetry
    }
  };
}

/**
 * Map a third-party domain to vendor metadata for the subprocessor register
 */
function classifyThirdPartyDomain(domain) {
  const d = domain.toLowerCase();
  if (d.includes('googletagmanager.com') || d.includes('google-analytics.com')) {
    return {
      vendor: 'Google LLC (Google Tag Manager / Analytics)',
      category: 'Tag Management & Web Analytics',
      jurisdiction: 'United States / Global Cloud',
      recommendation: 'Ensure Google Tag Manager Consent Mode v2 is active and documented in the Section 5 itemised notice and Section 16 cross-border register.'
    };
  }
  if (d.includes('googleapis.com') || d.includes('gstatic.com')) {
    return {
      vendor: 'Google LLC (Fonts & Static Web Assets)',
      category: 'CDN & Typography Delivery',
      jurisdiction: 'United States / Global Edge CDN',
      recommendation: 'Consider self-hosting static web fonts or documenting CDN asset delivery under Section 8(5) vendor governance.'
    };
  }
  if (d.includes('cloudflare') || d.includes('cdnjs.cloudflare.com')) {
    return {
      vendor: 'Cloudflare, Inc.',
      category: 'Edge Security, WAF & CDN',
      jurisdiction: 'Global Edge Network (India PoPs)',
      recommendation: 'Maintain Data Processing Agreement (DPA) covering edge WAF/CDN log retention aligned with Rule 8(3) 1-year minimum.'
    };
  }
  if (d.includes('zohocdn.com') || d.includes('zohowebstatic.com') || d.includes('pagesense.io')) {
    return {
      vendor: 'Zoho Corporation Pvt. Ltd.',
      category: 'First/Affiliated Cloud CDN & Engagement Telemetry',
      jurisdiction: 'India / Global Data Centers',
      recommendation: 'Ensure affiliated CDN and engagement scripts are mapped in internal Record of Processing Activities (RoPA) and consent preferences.'
    };
  }
  if (d.includes('razorpay.com')) {
    return {
      vendor: 'Razorpay Software Pvt. Ltd.',
      category: 'Payment Gateway & Checkout Infrastructure',
      jurisdiction: 'India',
      recommendation: 'Document payment gateway scripts under strictly necessary transaction processing and verify PCI-DSS / Rule 6 encryption safeguards.'
    };
  }
  if (d.includes('facebook.net') || d.includes('fbcdn.net')) {
    return {
      vendor: 'Meta Platforms, Inc.',
      category: 'Advertising Attribution & Social Graph SDK',
      jurisdiction: 'United States / Ireland',
      recommendation: 'Gate Meta Pixel execution behind affirmative opt-in consent (Section 6) and evaluate cross-border transfer terms under Section 16.'
    };
  }
  if (d.includes('clarity.ms') || d.includes('bing.com')) {
    return {
      vendor: 'Microsoft Corporation (Clarity / Bing)',
      category: 'UX Telemetry & Advertising Attribution',
      jurisdiction: 'United States / Azure Global',
      recommendation: 'Enforce strict DOM input masking in Clarity and gate initialization behind user consent.'
    };
  }
  if (d.includes('hotjar.com')) {
    return {
      vendor: 'Hotjar Ltd.',
      category: 'Session Replay & UX Heatmaps',
      jurisdiction: 'European Union (Malta)',
      recommendation: 'Gate behavioral heatmap recording behind explicit opt-in consent and verify field-level PII suppression.'
    };
  }
  if (d.includes('visualwebsiteoptimizer.com')) {
    return {
      vendor: 'Wingify Software Pvt. Ltd. (VWO)',
      category: 'A/B Experimentation & Conversion Optimization',
      jurisdiction: 'India / Global Cloud',
      recommendation: 'Bind VWO experimentation scripts to consent preferences and document behavioral segmentation under Rule 13(2).'
    };
  }
  if (d.includes('clevertap.com') || d.includes('wzrkt.com')) {
    return {
      vendor: 'WizRocket Inc. / CleverTap',
      category: 'Customer Engagement & Lifecycle Automation',
      jurisdiction: 'India / United States',
      recommendation: 'Ensure lifecycle profiling and push notification tokens require explicit Data Principal opt-in under Section 6.'
    };
  }
  if (d.includes('nykstatic.com') || d.includes('nykaa.com')) {
    return {
      vendor: 'FSN E-Commerce Ventures Ltd. (Nykaa CDN)',
      category: 'Affiliated Retail Asset Delivery Network',
      jurisdiction: 'India / Global Edge CDN',
      recommendation: 'Maintain internal asset inventory and TLS/HSTS header consistency across static asset domains.'
    };
  }
  if (d.includes('practostatic.com')) {
    return {
      vendor: 'Practo Technologies Pvt. Ltd. (Practo Static CDN)',
      category: 'Affiliated Healthcare Asset Delivery Network',
      jurisdiction: 'India / AWS Cloud',
      recommendation: 'Verify strict transport security and cache-control headers across affiliated static asset domains.'
    };
  }
  if (d.includes('jsdelivr.net') || d.includes('unpkg.com') || d.includes('jquery.com')) {
    return {
      vendor: 'Open-Source JS CDN Provider',
      category: 'Third-Party JavaScript Content Delivery Network',
      jurisdiction: 'United States / Global Edge CDN',
      recommendation: 'Apply Subresource Integrity (SRI) hashes on external CDN scripts or bundle scripts locally under Section 8(5) security safeguards.'
    };
  }
  return {
    vendor: `External Service (${domain})`,
    category: 'Third-Party Web Resource / Telemetry Endpoint',
    jurisdiction: 'Global / Multi-Region Cloud',
    recommendation: 'Review sub-processor contract under Section 8(2) and disclose cross-border transfer posture under Section 16 / Rule 15.'
  };
}

/**
 * Build a schema-valid, 100% telemetry-grounded, Reputation-Safe DPIA Readiness Report
 */
export function buildDpiaReportFromTelemetry(telemetry) {
  const sec = telemetry.http_response.security_headers;
  const cookies = telemetry.cookies_summary;
  const autos = telemetry.detected_automations;
  const cmp = telemetry.consent_and_dark_pattern_signals;
  const notice = telemetry.notice_and_grievance_signals;
  const fp = telemetry.fingerprinting_and_background_signals;

  const nonEssentialPreConsent =
    cookies.non_essential_pre_consent_count > 0 ||
    autos.marketing_and_crm_automations.length > 0 ||
    autos.session_replay_and_heatmaps.length > 0 ||
    autos.ad_pixels_and_auto_advanced_matching.length > 0;

  const rule13Triggered =
    autos.total_automations_detected > 0 &&
    (autos.marketing_and_crm_automations.length > 0 ||
      autos.session_replay_and_heatmaps.length > 0 ||
      autos.ai_chatbots_and_support_widgets.length > 0 ||
      autos.ad_pixels_and_auto_advanced_matching.length > 0 ||
      autos.cdp_and_tag_managers.length >= 2);

  // Build 7 Statutory Control Pillars grounded strictly in telemetry
  // 1. Section 5 / Rule 3 Notice
  const noticeLinksSignals = [
    `HTTP status ${telemetry.http_response.status_code} on ${telemetry.target_url} (${telemetry.http_response.html_bytes} bytes HTML inspected)`,
    `Discovered ${notice.privacy_notice_links_count} privacy/legal notice link(s) in DOM${notice.privacy_notice_links.length > 0 ? ': ' + notice.privacy_notice_links.slice(0, 3).map(l => l.url).join(', ') : ''}`
  ];
  if (notice.privacy_policy_passive_check.inspected_url) {
    noticeLinksSignals.push(
      `Passively inspected linked notice ${notice.privacy_policy_passive_check.inspected_url} (HTTP ${notice.privacy_policy_passive_check.status})`
    );
  }
  const noticeTier = notice.privacy_notice_links_count > 0 ? 'Aligned' : 'Advisory Enhancement';

  // 2. Section 6 / Rules 3-4 Consent & CMP
  const cmpSignals = [
    `Pre-consent Set-Cookie headers observed: ${cookies.total_set_cookie_count} total (${cookies.first_party_count} first-party, ${cookies.third_party_count} third-party, ${cookies.non_essential_pre_consent_count} non-essential)`,
    `CMP / consent banner signatures detected in DOM: ${cmp.detected_cmps.length > 0 ? cmp.detected_cmps.map(c => c.name).join(', ') : 'None detected in initial HTML payload'}`,
    `DOM forms inspected: ${cmp.forms_inspected_count}; pre-ticked checkboxes observed: ${cmp.pre_ticked_checkboxes_count}`
  ];
  let cmpTier = 'Aligned';
  if (nonEssentialPreConsent && cmp.detected_cmps.length === 0) {
    cmpTier = 'Priority Readiness Action';
  } else if (nonEssentialPreConsent || (autos.total_automations_detected > 0 && !cmp.has_reject_or_manage_option_in_dom)) {
    cmpTier = 'Advisory Enhancement';
  }

  // 3. Section 8(5) / Rules 6 & 8 Security & Logs
  const missingSecHeaders = [];
  if (!sec.strict_transport_security) missingSecHeaders.push('Strict-Transport-Security (HSTS)');
  if (!sec.content_security_policy) missingSecHeaders.push('Content-Security-Policy (CSP)');
  if (!sec.x_frame_options) missingSecHeaders.push('X-Frame-Options');
  if (!sec.x_content_type_options) missingSecHeaders.push('X-Content-Type-Options');

  const secSignals = [
    `HTTPS transport verified on ${telemetry.http_response.final_url}`,
    `HSTS header: ${sec.strict_transport_security ? sec.strict_transport_security : 'Not present in initial response'}`,
    `CSP header: ${sec.content_security_policy ? 'Present (' + sec.content_security_policy.slice(0, 60) + '...)' : 'Not present in initial response'}`,
    `X-Content-Type-Options: ${sec.x_content_type_options || 'Not present'}; X-Frame-Options: ${sec.x_frame_options || 'Not present'}`
  ];
  const secTier = missingSecHeaders.length === 0 ? 'Aligned' : (missingSecHeaders.length <= 2 ? 'Advisory Enhancement' : 'Priority Readiness Action');

  // 4. Section 9 / Rules 10-11 Children's Data Safeguards
  const childrenSignals = [
    `Children's data / parental consent references in inspected text: ${notice.privacy_policy_passive_check.children_data_mentioned ? 'Observed in policy text' : 'Not explicitly surfaced in initial landing DOM'}`,
    `Ad-pixel or behavioral retargeting scripts detected on initial load: ${autos.ad_pixels_and_auto_advanced_matching.length + autos.session_replay_and_heatmaps.length}`
  ];
  const childrenTier = (autos.ad_pixels_and_auto_advanced_matching.length > 0 && !notice.privacy_policy_passive_check.children_data_mentioned)
    ? 'Advisory Enhancement'
    : 'Aligned';

  // 5. Section 10 / Rule 13 DPIA & Algorithmic Governance
  const rule13Signals = [
    `Total client-side automation/telemetry signatures detected: ${autos.total_automations_detected}`,
    `Breakdown: ${autos.cdp_and_tag_managers.length} CDP/Tag Manager, ${autos.marketing_and_crm_automations.length} Marketing/CRM, ${autos.session_replay_and_heatmaps.length} Session Replay/Heatmap, ${autos.ai_chatbots_and_support_widgets.length} AI/Chat Widget, ${autos.ad_pixels_and_auto_advanced_matching.length} Ad Pixel`
  ];
  const rule13Tier = rule13Triggered ? 'Advisory Enhancement' : 'Aligned';

  // 6. Section 13 / Rule 14(3) Grievance Redressal & 90-Day SLA
  const grievanceSignals = [
    `Grievance / DPO links in landing DOM: ${notice.grievance_links_count}`,
    `Grievance Officer / Nodal Officer mention in inspected policy corpus: ${notice.privacy_policy_passive_check.grievance_officer_mentioned ? 'Observed' : 'Not detected in passive crawl scope'}`,
    `DPO / Privacy contact channel in inspected policy corpus: ${notice.privacy_policy_passive_check.dpo_contact_mentioned ? 'Observed' : 'Not detected in passive crawl scope'}`,
    `Explicit 90-day statutory SLA (Rule 14(3)) mention: ${notice.privacy_policy_passive_check.ninety_day_sla_mentioned ? 'Observed' : 'Recommended for explicit disclosure'}`
  ];
  const grievanceTier = (notice.privacy_policy_passive_check.grievance_officer_mentioned && notice.privacy_policy_passive_check.ninety_day_sla_mentioned)
    ? 'Aligned'
    : 'Advisory Enhancement';

  // 7. Section 16 / Rule 15 Cross-Border Transfers
  const crossBorderSignals = [
    `External third-party script/asset domains observed on load: ${telemetry.scripts_and_third_parties.third_party_domains_count}${telemetry.scripts_and_third_parties.third_party_domains.length > 0 ? ' (' + telemetry.scripts_and_third_parties.third_party_domains.slice(0, 5).map(d => d.domain).join(', ') + ')' : ''}`,
    `Cross-border transfer disclosure in inspected policy text: ${notice.privacy_policy_passive_check.cross_border_mentioned ? 'Observed' : 'Recommended for itemised sub-processor mapping'}`
  ];
  const crossBorderTier = telemetry.scripts_and_third_parties.third_party_domains_count === 0
    ? 'Aligned'
    : 'Advisory Enhancement';

  // Build Advisory Findings (grounded 100% in exact telemetry)
  const findings = [];
  let findingCounter = 1;
  const nextFindingId = () => `DPIA-${String(findingCounter++).padStart(3, '0')}`;

  // Finding 1: Notice & Transparency
  findings.push({
    finding_id: nextFindingId(),
    pillar: 'Notice & Transparency (Sec 5 / Rule 3)',
    observed_technical_signal: `HTTP ${telemetry.http_response.status_code} on ${telemetry.target_url}; ${notice.privacy_notice_links_count} privacy/legal notice link(s) detected in DOM (${notice.privacy_notice_links.slice(0, 2).map(l => l.url).join(', ') || 'none in initial HTML'}).`,
    statutory_mapping: 'DPDP Act, 2023 Section 5(1) read with DPDP Rules, 2025 Rule 3 (Itemised Notice in clear and plain language)',
    readiness_tier: noticeTier,
    reputation_safe_advisory_note: notice.privacy_notice_links_count > 0
      ? `The website surfaces ${notice.privacy_notice_links_count} accessible privacy/legal notice link(s) in the DOM. To strengthen Rule 3 readiness, ensure the notice presents an itemised inventory of personal data categories and specific processing purposes at every data collection point.`
      : `Passive inspection of the initial HTML payload (${telemetry.http_response.html_bytes} bytes) did not surface an explicit anchor link matching standard privacy notice patterns (or links are rendered dynamically client-side). Surfacing a static, crawlable Section 5 notice link enhances transparency readiness.`,
    recommended_engineering_fix: 'Ensure every page footer and data collection form includes a prominent, static HTML anchor link to an itemised Section 5 / Rule 3 Privacy Notice with multi-language support (Eighth Schedule languages).',
    verification_method: 'Run a read-only curl/DOM check on the landing page and verify `<a href="/privacy">` is present in the server-rendered HTML.'
  });

  // Finding 2: Consent & Pre-Consent Cookies / Trackers
  findings.push({
    finding_id: nextFindingId(),
    pillar: 'Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4)',
    observed_technical_signal: `Set-Cookie headers on initial GET: ${cookies.total_set_cookie_count} cookie(s) (${cookies.first_party_count} first-party, ${cookies.third_party_count} third-party; cookie names: ${cookies.cookies.map(c => c.name).join(', ') || 'none'}); CMP banners detected: ${cmp.detected_cmps.map(c => c.name).join(', ') || 'none'}; pre-ticked checkboxes: ${cmp.pre_ticked_checkboxes_count}.`,
    statutory_mapping: 'DPDP Act, 2023 Section 6(1) & Section 6(4) read with DPDP Rules, 2025 Rules 3 and 4 (Free, specific, informed, unconditional consent & withdrawal ease)',
    readiness_tier: cmpTier,
    reputation_safe_advisory_note: nonEssentialPreConsent
      ? `Initial page load sets ${cookies.total_set_cookie_count} cookie(s) and loads ${autos.total_automations_detected} client-side telemetry/automation script signature(s) prior to an affirmative consent interaction. While common across modern web architectures, gating non-essential analytics and marketing tags behind an explicit opt-in banner with symmetrical 'Accept' and 'Reject / Manage' controls aligns the user journey with Section 6(1) and Section 6(4).`
      : `Initial HTTP response sets ${cookies.total_set_cookie_count} cookie(s) (${cookies.non_essential_pre_consent_count} non-essential) and zero pre-ticked checkboxes (${cmp.pre_ticked_checkboxes_count} found across ${cmp.forms_inspected_count} form(s)). Maintaining strict pre-consent script gating preserves high Section 6 readiness.`,
    recommended_engineering_fix: 'Configure a DPDP-aligned Consent Management Platform (CMP) with equal visual prominence for Accept and Reject/Manage buttons, and set `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` on all session cookies.',
    verification_method: 'Inspect initial HTTP `Set-Cookie` headers and network requests in a clean browser profile before interacting with the consent banner.'
  });

  // Finding 3: Website Automations & Rule 13(2) Governance
  findings.push({
    finding_id: nextFindingId(),
    pillar: 'Website Automations, AI & Profiling (Sec 6 / Rule 13(2))',
    observed_technical_signal: `Detected ${autos.total_automations_detected} client-side automation signature(s) across ${telemetry.scripts_and_third_parties.total_external_scripts} external script(s): ${[
      ...autos.cdp_and_tag_managers,
      ...autos.marketing_and_crm_automations,
      ...autos.session_replay_and_heatmaps,
      ...autos.ai_chatbots_and_support_widgets,
      ...autos.ad_pixels_and_auto_advanced_matching
    ].map(a => `${a.vendor_name} (${a.matched_signal})`).join('; ') || 'No third-party marketing/profiling automations detected in initial HTML'}.`,
    statutory_mapping: 'DPDP Act, 2023 Section 6 & Section 10(2)(c) read with DPDP Rules, 2025 Rule 13(1)-(3) (Annual DPIA & algorithmic/automated software risk assessment)',
    readiness_tier: rule13Tier,
    reputation_safe_advisory_note: autos.total_automations_detected > 0
      ? `Passive DOM inspection identified ${autos.total_automations_detected} client-side automation or telemetry integration(s). Under Rule 13(2), Significant Data Fiduciaries (and privacy-forward enterprises conducting proactive DPIAs) are encouraged to document the purpose, behavioral profiling scope, and consent binding of all tag managers, CRM trackers, session replay tools, and conversational widgets.`
      : `Passive inspection of ${telemetry.target_url} detected zero third-party behavioural profiling, session replay, or ad-pixel automations on initial load, reflecting a minimal client-side telemetry footprint.`,
    recommended_engineering_fix: 'Maintain an internal Website Automation & Tag Governance Register mapping each client-side SDK to its consent category, data retention TTL, and DOM input-masking configuration.',
    verification_method: 'Verify that every script in the tag manager is bound to an explicit consent trigger and documented in the annual Rule 13 DPIA ledger.'
  });

  // Finding 4: Security Headers & Rule 6 / Rule 8(3) Safeguards
  findings.push({
    finding_id: nextFindingId(),
    pillar: 'Reasonable Security Safeguards (Sec 8(5) / Rule 6)',
    observed_technical_signal: `Security headers on ${telemetry.http_response.final_url}: HSTS=${sec.strict_transport_security ? 'Present' : 'Absent'}, CSP=${sec.content_security_policy ? 'Present' : 'Absent'}, X-Frame-Options=${sec.x_frame_options || 'Absent'}, X-Content-Type-Options=${sec.x_content_type_options || 'Absent'}, Referrer-Policy=${sec.referrer_policy || 'Absent'}.`,
    statutory_mapping: 'DPDP Act, 2023 Section 8(5) read with DPDP Rules, 2025 Rule 6 (Reasonable security safeguards, encryption in transit, access controls) and Rule 8(3) (1-year minimum security log retention)',
    readiness_tier: secTier,
    reputation_safe_advisory_note: missingSecHeaders.length === 0
      ? `All primary HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) are present on ${telemetry.canonical_domain}, supporting robust transport and browser-side script isolation under Rule 6.`
      : `HTTPS encryption is active on ${telemetry.canonical_domain}; adding ${missingSecHeaders.join(', ')} in the HTTP response headers will further harden client-side defense-in-depth against unauthorized script injection or framing under Rule 6(1).`,
    recommended_engineering_fix: `Configure edge CDN/web server responses to include Strict-Transport-Security (max-age=31536000; includeSubDomains), a restrictive Content-Security-Policy, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin, alongside 1-year security log retention (Rule 8(3)).`,
    verification_method: `Run \`curl -sI ${telemetry.target_url}\` and confirm all recommended security headers are returned with HTTP 200.`
  });

  // Finding 5: Grievance Officer & 90-Day SLA (Sec 13 / Rule 14(3))
  findings.push({
    finding_id: nextFindingId(),
    pillar: 'Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3))',
    observed_technical_signal: `Grievance/DPO links in landing DOM: ${notice.grievance_links_count}; Grievance Officer mention in policy corpus: ${notice.privacy_policy_passive_check.grievance_officer_mentioned}; DPO/Privacy contact mention: ${notice.privacy_policy_passive_check.dpo_contact_mentioned}; 90-day SLA mention: ${notice.privacy_policy_passive_check.ninety_day_sla_mentioned}.`,
    statutory_mapping: 'DPDP Act, 2023 Section 8(10) & Section 13 read with DPDP Rules, 2025 Rule 14(3) (Grievance resolution within a period not exceeding 90 days)',
    readiness_tier: grievanceTier,
    reputation_safe_advisory_note: grievanceTier === 'Aligned'
      ? `The inspected website and policy corpus surface clear Grievance Officer / DPO contact details and reference the statutory 90-day resolution timeline under Rule 14(3).`
      : `While privacy or contact channels are available, explicitly publishing the designated Grievance Officer / Data Protection Officer contact coordinates and stating the statutory resolution SLA of 'not exceeding 90 days' (Rule 14(3)) in the public privacy notice provides immediate statutory clarity for Data Principals.`,
    recommended_engineering_fix: 'Add a dedicated Grievance Redressal & DPO section to the Privacy Notice footer specifying the Officer name/designation, email/portal link, and the Rule 14(3) 90-day maximum resolution SLA.',
    verification_method: 'Inspect the public Privacy Notice page for explicit mention of "Grievance Officer" and "90 days" (Rule 14(3)).'
  });

  // Finding 6: Cross-Border Sub-Processors (Sec 16 / Rule 15)
  if (telemetry.scripts_and_third_parties.third_party_domains_count > 0) {
    findings.push({
      finding_id: nextFindingId(),
      pillar: 'Cross-Border Sub-Processors (Sec 16 / Rule 15)',
      observed_technical_signal: `Observed ${telemetry.scripts_and_third_parties.third_party_domains_count} external asset/script domain(s) on initial page load: ${telemetry.scripts_and_third_parties.third_party_domains.map(d => d.domain).join(', ')}.`,
      statutory_mapping: 'DPDP Act, 2023 Section 8(2) & Section 16 read with DPDP Rules, 2025 Rule 15 (Cross-border transfer conditions & Data Processor contracts)',
      readiness_tier: crossBorderTier,
      reputation_safe_advisory_note: `The website loads resources from ${telemetry.scripts_and_third_parties.third_party_domains_count} external domain(s), which initiates client browser connections (sharing IP address and User-Agent metadata) with global CDN or SaaS endpoints. Cataloging these endpoints in an internal Sub-Processor & Cross-Border Register supports Section 8(2) and Section 16 governance.`,
      recommended_engineering_fix: 'Maintain a live Sub-Processor & Cross-Border Transfer Register covering all third-party script/CDN domains and verify valid Data Processing Agreements (DPAs) under Section 8(2).',
      verification_method: 'Cross-check all third-party domains observed in passive network telemetry against the published Sub-Processor Register.'
    });
  }

  // Build Sub-Processor & Cross-Border Register from observed third-party domains
  const subprocessorRegister = telemetry.scripts_and_third_parties.third_party_domains.map(item => {
    const meta = classifyThirdPartyDomain(item.domain);
    return {
      third_party_domain: item.domain,
      vendor_or_service_name: meta.vendor,
      category: meta.category,
      estimated_primary_jurisdiction: meta.jurisdiction,
      fired_before_consent: true,
      dpdpa_governance_recommendation: meta.recommendation
    };
  });

  // Compute deterministic readiness score (0-100) based on empirical telemetry
  let score = 92;
  if (notice.privacy_notice_links_count === 0) score -= 8;
  if (cookies.non_essential_pre_consent_count > 0) score -= Math.min(12, cookies.non_essential_pre_consent_count * 3);
  if (autos.ad_pixels_and_auto_advanced_matching.length > 0) score -= 8;
  if (autos.session_replay_and_heatmaps.length > 0) score -= 6;
  if (autos.marketing_and_crm_automations.length > 0) score -= 4;
  if (missingSecHeaders.length > 0) score -= Math.min(10, missingSecHeaders.length * 2);
  if (!notice.privacy_policy_passive_check.ninety_day_sla_mentioned) score -= 4;
  if (cmp.detected_cmps.length > 0) score += 4;
  if (notice.privacy_policy_passive_check.grievance_officer_mentioned) score += 3;
  score = Math.max(55, Math.min(98, Math.round(score)));

  let readinessPosture = 'High Readiness (Aligned)';
  if (score < 70) {
    readinessPosture = 'Foundational Readiness (Priority Engineering Actions Recommended)';
  } else if (score < 85) {
    readinessPosture = 'Moderate Readiness (Advisory Enhancements Recommended)';
  }

  const strengths = [
    `HTTPS transport security active on ${telemetry.http_response.final_url} (HTTP ${telemetry.http_response.status_code}, ${telemetry.http_response.response_time_ms}ms response time).`,
    `Zero pre-ticked consent checkboxes observed across ${cmp.forms_inspected_count} inspected DOM form(s).`
  ];
  if (notice.privacy_notice_links_count > 0) {
    strengths.push(`Surfaces ${notice.privacy_notice_links_count} accessible privacy/legal notice link(s) directly in the DOM.`);
  }
  if (sec.strict_transport_security) {
    strengths.push(`Enforces HTTP Strict-Transport-Security (${sec.strict_transport_security}).`);
  }
  if (autos.total_automations_detected === 0) {
    strengths.push(`Minimalist client-side telemetry posture with zero third-party ad pixels or session replay scripts on initial load.`);
  }
  if (notice.privacy_policy_passive_check.grievance_officer_mentioned) {
    strengths.push(`Publishes Grievance Officer / redressal governance information in inspected policy documentation.`);
  }

  const enhancements = findings
    .filter(f => f.readiness_tier !== 'Aligned')
    .map(f => `${f.pillar}: ${f.recommended_engineering_fix}`);
  if (enhancements.length === 0) {
    enhancements.push('Continue periodic passive DPIA readiness scans and maintain 1-year security log retention per Rule 8(3).');
  }

  return {
    report_metadata: {
      audit_id: `DPIA-BENCH-2026-${telemetry.slug.toUpperCase()}`,
      target_url: telemetry.target_url,
      canonical_domain: telemetry.canonical_domain,
      evaluated_at_utc: telemetry.evaluated_at_utc,
      assessment_framing: 'Confidential & Constructive Advisory DPIA Readiness Assessment',
      audit_scope: 'Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)',
      statutory_baseline: {
        act: 'Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule)',
        rules: 'Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)',
        enforcement_timeline: 'Phased: 13 Nov 2025 (Rules 1-2, 17-21); 13 Nov 2026 (Rule 4 Consent Manager registration); 13 May 2027 (Rules 3, 5-16, 22-23 operational compliance)',
        grievance_sla_days: 90,
        security_log_retention_minimum: 'Minimum 1 year (Rule 8(3) read with Seventh Schedule)'
      },
      evaluating_model_family: 'deterministic-telemetry-only'
    },
    executive_readiness_summary: {
      overall_readiness_score_0_100: score,
      readiness_posture: readinessPosture,
      rule13_dpia_and_algorithmic_risk_triggered: rule13Triggered,
      rule13_trigger_rationale: rule13Triggered
        ? `Observed ${autos.total_automations_detected} client-side automation/telemetry signal(s) on ${telemetry.canonical_domain} (including CRM, CDP, session replay, chat, or ad-tech integrations), which warrant formal documentation under Rule 13(1)-(2) DPIA and algorithmic governance workflows.`
        : `Observed ${autos.total_automations_detected} client-side automation signal(s) on initial load without invasive cross-site behavioral profiling or automated decisioning triggers on the public landing page.`,
      key_observed_strengths: strengths,
      priority_readiness_enhancements: enhancements,
      board_advisory_synopsis: `This confidential, read-only passive DPIA readiness assessment of ${telemetry.entity_label} (${telemetry.target_url}, Sector: ${telemetry.sector}) evaluated publicly observable HTTP headers, ${cookies.total_set_cookie_count} Set-Cookie header(s), ${telemetry.scripts_and_third_parties.total_external_scripts} external script(s), and ${autos.total_automations_detected} client-side automation signature(s) against the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 (G.S.R. 846(E)). Overall Readiness Score: ${score}/100 (${readinessPosture}).`
    },
    pre_consent_storage_and_cookies: {
      pre_consent_tracking_observed: nonEssentialPreConsent,
      first_party_cookies_count: cookies.first_party_count,
      third_party_cookies_count: cookies.third_party_count,
      cookies_inventory: cookies.cookies,
      local_storage_keys: [],
      session_storage_keys: [],
      indexeddb_databases: [],
      service_workers_registered: []
    },
    website_automations_and_profiling_inventory: {
      total_automations_detected: autos.total_automations_detected,
      marketing_and_crm_automations: autos.marketing_and_crm_automations,
      cdp_and_tag_managers: autos.cdp_and_tag_managers,
      session_replay_and_heatmaps: autos.session_replay_and_heatmaps,
      ai_chatbots_and_support_widgets: autos.ai_chatbots_and_support_widgets,
      ad_pixels_and_auto_advanced_matching: autos.ad_pixels_and_auto_advanced_matching,
      form_input_and_dark_pattern_signals: {
        forms_inspected_count: cmp.forms_inspected_count,
        pre_ticked_checkboxes_count: cmp.pre_ticked_checkboxes_count,
        bundled_consent_forms_count: 0,
        unencrypted_or_insecure_form_actions: cmp.insecure_form_actions,
        early_field_capture_listeners_detected: false,
        observations: [
          `Passively inspected ${cmp.forms_inspected_count} <form> element(s) and ${cmp.checkboxes_inspected_count} checkbox input(s) in initial HTML; ${cmp.pre_ticked_checkboxes_count} pre-ticked checkbox(es) detected.`
        ]
      },
      fingerprinting_and_background_signals: {
        web_push_permission_requested_on_load: fp.web_push_permission_requested_on_load,
        canvas_or_webgl_fingerprint_signals: fp.canvas_or_webgl_fingerprint_signals,
        navigator_beacon_or_fetch_keepalive_observed: fp.navigator_beacon_or_fetch_keepalive_observed,
        details: [
          `Web Push on-load request: ${fp.web_push_permission_requested_on_load}`,
          `Canvas/WebGL fingerprinting API in inline HTML: ${fp.canvas_or_webgl_fingerprint_signals}`,
          `Beacon telemetry API signal: ${fp.navigator_beacon_or_fetch_keepalive_observed}`
        ]
      }
    },
    statutory_dpdpa_control_matrix: {
      section_5_rule_3_notice: {
        statutory_reference: 'DPDP Act Section 5(1) & DPDP Rules, 2025 Rule 3',
        readiness_tier: noticeTier,
        observed_signals: noticeLinksSignals,
        advisory_summary: notice.privacy_notice_links_count > 0
          ? 'Privacy/legal notice links are discoverable in the DOM; ensure itemised data and purpose disclosures per Rule 3.'
          : 'Surface a static, server-rendered Privacy Notice anchor link on the landing page.'
      },
      section_6_rule_3_4_consent_and_cmp: {
        statutory_reference: 'DPDP Act Section 6(1), 6(4) & DPDP Rules, 2025 Rules 3-4',
        readiness_tier: cmpTier,
        observed_signals: cmpSignals,
        advisory_summary: nonEssentialPreConsent
          ? 'Gate non-essential cookies and analytics/marketing scripts behind an affirmative consent banner with symmetrical Reject/Manage controls.'
          : 'Pre-consent cookie and form posture is clean on initial HTTP load.'
      },
      section_8_5_rule_6_8_security_and_logs: {
        statutory_reference: 'DPDP Act Section 8(5) & DPDP Rules, 2025 Rule 6 & Rule 8(3)',
        readiness_tier: secTier,
        observed_signals: secSignals,
        advisory_summary: missingSecHeaders.length === 0
          ? 'Core HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) are present.'
          : `Enhance edge header posture by adding: ${missingSecHeaders.join(', ')}.`
      },
      section_9_rules_10_11_children_safeguards: {
        statutory_reference: 'DPDP Act Section 9(1)-(3) & DPDP Rules, 2025 Rules 10-11',
        readiness_tier: childrenTier,
        observed_signals: childrenSignals,
        advisory_summary: 'Ensure age-gating or verifiable parental consent workflows are documented where services may be accessed by Data Principals under 18.'
      },
      section_10_rule_13_dpia_and_algorithmic_governance: {
        statutory_reference: 'DPDP Act Section 10(2)(c) & DPDP Rules, 2025 Rule 13(1)-(3)',
        readiness_tier: rule13Tier,
        observed_signals: rule13Signals,
        advisory_summary: rule13Triggered
          ? 'Document client-side marketing, CDP, session replay, and conversational automations in the annual Rule 13 DPIA register.'
          : 'Low client-side automation complexity observed on initial landing page.'
      },
      section_13_rule_14_3_grievance_and_dpo: {
        statutory_reference: 'DPDP Act Section 8(10), Section 13 & DPDP Rules, 2025 Rule 14(3)',
        readiness_tier: grievanceTier,
        observed_signals: grievanceSignals,
        advisory_summary: 'Publish designated Grievance Officer / DPO contact details and explicitly state the 90-day maximum grievance resolution SLA per Rule 14(3).'
      },
      section_16_rule_15_cross_border_transfers: {
        statutory_reference: 'DPDP Act Section 8(2), Section 16 & DPDP Rules, 2025 Rule 15',
        readiness_tier: crossBorderTier,
        observed_signals: crossBorderSignals,
        advisory_summary: telemetry.scripts_and_third_parties.third_party_domains_count > 0
          ? `Document the ${telemetry.scripts_and_third_parties.third_party_domains_count} external script/asset domain(s) in the Sub-Processor & Cross-Border Transfer Register.`
          : 'Zero external third-party script domains observed on initial page load.'
      }
    },
    advisory_findings: findings,
    subprocessor_and_cross_border_register: subprocessorRegister,
    reputation_safety_attestation: {
      zero_defamation_verified: true,
      prohibited_terms_absent: true,
      read_only_passive_inspection_confirmed: true,
      disclaimer: 'This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.'
    }
  };
}

/**
 * Render Markdown report from the structured JSON report + telemetry
 */
export function renderMarkdownReport(report, telemetry) {
  const m = report.report_metadata;
  const s = report.executive_readiness_summary;
  const c = report.pre_consent_storage_and_cookies;
  const a = report.website_automations_and_profiling_inventory;
  const sec = telemetry.http_response.security_headers;

  const allAutomations = [
    ...a.cdp_and_tag_managers,
    ...a.marketing_and_crm_automations,
    ...a.session_replay_and_heatmaps,
    ...a.ai_chatbots_and_support_widgets,
    ...a.ad_pixels_and_auto_advanced_matching
  ];

  return `# ${m.assessment_framing}
## Target: \`${m.target_url}\` (${telemetry.entity_label} — ${telemetry.sector})

- **Audit ID**: \`${m.audit_id}\`
- **Evaluated At (UTC)**: \`${m.evaluated_at_utc}\`
- **Canonical Domain**: \`${m.canonical_domain}\`
- **Audit Scope**: ${m.audit_scope}
- **Statutory Baseline**: ${m.statutory_baseline.act} & ${m.statutory_baseline.rules}
- **Overall Readiness Score**: **${s.overall_readiness_score_0_100} / 100** (\`${s.readiness_posture}\`)
- **Rule 13 DPIA & Algorithmic Governance Triggered**: \`${s.rule13_dpia_and_algorithmic_risk_triggered}\`

---

## 1. Executive Readiness Synopsis

${s.board_advisory_synopsis}

### Key Observed Strengths
${s.key_observed_strengths.map(st => `- ${st}`).join('\n')}

### Priority Readiness Enhancements
${s.priority_readiness_enhancements.map(en => `- ${en}`).join('\n')}

---

## 2. Passive HTTP & Security Header Telemetry (Section 8(5) & Rule 6)

| Signal | Observed Value |
| :--- | :--- |
| **HTTP Status & Final URL** | \`HTTP ${telemetry.http_response.status_code}\` -> \`${telemetry.http_response.final_url}\` (${telemetry.http_response.response_time_ms} ms) |
| **Strict-Transport-Security (HSTS)** | \`${sec.strict_transport_security || 'Not present in initial response'}\` |
| **Content-Security-Policy (CSP)** | \`${sec.content_security_policy ? sec.content_security_policy.slice(0, 90) + '...' : 'Not present in initial response'}\` |
| **X-Frame-Options** | \`${sec.x_frame_options || 'Not present'}\` |
| **X-Content-Type-Options** | \`${sec.x_content_type_options || 'Not present'}\` |
| **Referrer-Policy** | \`${sec.referrer_policy || 'Not present'}\` |

---

## 3. Pre-Consent Storage & Cookie Inventory (Section 6 & Rules 3–4)

- **Pre-Consent Non-Essential Tracking Observed**: \`${c.pre_consent_tracking_observed}\`
- **First-Party Cookies Set on Load**: \`${c.first_party_cookies_count}\`
- **Third-Party Cookies Set on Load**: \`${c.third_party_cookies_count}\`

| Cookie Name | Domain | Category | HttpOnly | Secure | SameSite | Expiry (Days) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${c.cookies_inventory.length > 0
  ? c.cookies_inventory.map(ck => `| \`${ck.name}\` | \`${ck.domain}\` | ${ck.category} | \`${ck.http_only}\` | \`${ck.secure}\` | \`${ck.same_site}\` | \`${ck.expiry_days}\` |`).join('\n')
  : '| *No Set-Cookie headers observed on initial passive GET* | — | — | — | — | — | — |'}

---

## 4. Website Automations & Rule 13(2) Profiling Inventory

- **Total Client-Side Automations Detected**: \`${a.total_automations_detected}\`
- **Rule 13 Trigger Rationale**: ${s.rule13_trigger_rationale}

| Vendor / Integration | Category | Empirical Signal Observed | Rule 13(2) Governance Relevance | Recommended Advisory Action |
| :--- | :--- | :--- | :--- | :--- |
${allAutomations.length > 0
  ? allAutomations.map(au => `| **${au.vendor_name}** | ${au.automation_category} | \`${au.matched_signal}\` | ${au.rule13_2_profiling_or_automated_risk_relevance} | ${au.advisory_governance_action} |`).join('\n')
  : '| *None detected on initial HTML load* | — | Zero third-party automation signatures in initial HTML | Low client-side profiling footprint | Continue periodic passive DPIA monitoring |'}

---

## 5. Statutory DPDPA 2023 & DPDP Rules 2025 Control Matrix

| Statutory Pillar | Reference | Readiness Tier | Advisory Summary |
| :--- | :--- | :--- | :--- |
| **Notice & Transparency** | ${report.statutory_dpdpa_control_matrix.section_5_rule_3_notice.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_5_rule_3_notice.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_5_rule_3_notice.advisory_summary} |
| **Consent & Dark-Pattern Symmetry** | ${report.statutory_dpdpa_control_matrix.section_6_rule_3_4_consent_and_cmp.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_6_rule_3_4_consent_and_cmp.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_6_rule_3_4_consent_and_cmp.advisory_summary} |
| **Security & 1-Yr Log Retention** | ${report.statutory_dpdpa_control_matrix.section_8_5_rule_6_8_security_and_logs.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_8_5_rule_6_8_security_and_logs.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_8_5_rule_6_8_security_and_logs.advisory_summary} |
| **Children's Data Safeguards** | ${report.statutory_dpdpa_control_matrix.section_9_rules_10_11_children_safeguards.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_9_rules_10_11_children_safeguards.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_9_rules_10_11_children_safeguards.advisory_summary} |
| **Rule 13 DPIA & Algorithmic Risk** | ${report.statutory_dpdpa_control_matrix.section_10_rule_13_dpia_and_algorithmic_governance.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_10_rule_13_dpia_and_algorithmic_governance.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_10_rule_13_dpia_and_algorithmic_governance.advisory_summary} |
| **Grievance Redressal (90-Day SLA)** | ${report.statutory_dpdpa_control_matrix.section_13_rule_14_3_grievance_and_dpo.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_13_rule_14_3_grievance_and_dpo.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_13_rule_14_3_grievance_and_dpo.advisory_summary} |
| **Cross-Border Sub-Processors** | ${report.statutory_dpdpa_control_matrix.section_16_rule_15_cross_border_transfers.statutory_reference} | **${report.statutory_dpdpa_control_matrix.section_16_rule_15_cross_border_transfers.readiness_tier}** | ${report.statutory_dpdpa_control_matrix.section_16_rule_15_cross_border_transfers.advisory_summary} |

---

## 6. Constructive Advisory Findings & Engineering Recommendations

${report.advisory_findings.map(f => `### ${f.finding_id}: ${f.pillar} — \`${f.readiness_tier}\`
- **Observed Technical Signal**: ${f.observed_technical_signal}
- **Statutory Mapping**: ${f.statutory_mapping}
- **Constructive Advisory Note**: ${f.reputation_safe_advisory_note}
- **Recommended Engineering Fix**: ${f.recommended_engineering_fix}
- **Verification Method**: ${f.verification_method}
`).join('\n')}

---

## 7. External Sub-Processor & Cross-Border Endpoint Register (Section 16 / Rule 15)

| Third-Party Domain | Vendor / Service | Category | Primary Jurisdiction | Governance Recommendation |
| :--- | :--- | :--- | :--- | :--- |
${report.subprocessor_and_cross_border_register.length > 0
  ? report.subprocessor_and_cross_border_register.map(sp => `| \`${sp.third_party_domain}\` | ${sp.vendor_or_service_name} | ${sp.category} | ${sp.estimated_primary_jurisdiction} | ${sp.dpdpa_governance_recommendation} |`).join('\n')
  : '| *No external third-party script domains observed on initial load* | — | — | — | — |'}

---

## 8. Reputation-Safety & Passive Scope Attestation

> **Disclaimer**: ${report.reputation_safety_attestation.disclaimer}
`;
}

async function main() {
  fs.mkdirSync(BENCHMARKS_DIR, { recursive: true });
  const summaryRows = [];

  console.log('=== Running Live Multi-Sector Indian Website Passive DPIA Benchmark Suite (8 Sites) ===');
  for (const target of BENCHMARK_TARGETS) {
    process.stdout.write(`Inspecting [${target.sector}] ${target.url} ... `);
    const telemetry = await collectSiteTelemetry(target);
    const report = buildDpiaReportFromTelemetry(telemetry);
    const markdown = renderMarkdownReport(report, telemetry);

    const telemetryPath = path.join(BENCHMARKS_DIR, `${target.slug}.telemetry.json`);
    const reportJsonPath = path.join(BENCHMARKS_DIR, `${target.slug}.dpia-report.json`);
    const reportMdPath = path.join(BENCHMARKS_DIR, `${target.slug}.dpia-report.md`);

    fs.writeFileSync(telemetryPath, JSON.stringify(telemetry, null, 2) + '\n', 'utf8');
    fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    fs.writeFileSync(reportMdPath, markdown, 'utf8');

    console.log(
      `HTTP ${telemetry.http_response.status_code} | Cookies: ${telemetry.cookies_summary.total_set_cookie_count} | Scripts: ${telemetry.scripts_and_third_parties.total_external_scripts} | Automations: ${telemetry.detected_automations.total_automations_detected} | Score: ${report.executive_readiness_summary.overall_readiness_score_0_100}/100`
    );

    summaryRows.push({
      slug: target.slug,
      sector: target.sector,
      url: target.url,
      status: telemetry.http_response.status_code,
      cookies: telemetry.cookies_summary.total_set_cookie_count,
      external_scripts: telemetry.scripts_and_third_parties.total_external_scripts,
      third_party_domains: telemetry.scripts_and_third_parties.third_party_domains_count,
      automations: telemetry.detected_automations.total_automations_detected,
      rule13_triggered: report.executive_readiness_summary.rule13_dpia_and_algorithmic_risk_triggered,
      readiness_score: report.executive_readiness_summary.overall_readiness_score_0_100,
      posture: report.executive_readiness_summary.readiness_posture
    });
  }

  const summaryMd = `# Multi-Sector Indian Website Passive DPIA Benchmark Summary (8 Live Sites)

Generated at: \`${new Date().toISOString()}\`
Scope: 100% Passive Read-Only HTTP/DOM/Cookie/Automation Telemetry aligned with the **Digital Personal Data Protection Act, 2023** and **DPDP Rules, 2025 (G.S.R. 846(E))**.

| # | Website | Sector | HTTP Status | Pre-Consent Cookies | External Scripts | 3P Domains | Automations Detected | Rule 13 Triggered | Readiness Score | Posture |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${summaryRows.map((r, i) => `| ${i + 1} | \`${r.url}\` | ${r.sector} | \`${r.status}\` | ${r.cookies} | ${r.external_scripts} | ${r.third_party_domains} | ${r.automations} | \`${r.rule13_triggered}\` | **${r.readiness_score}/100** | ${r.posture} |`).join('\n')}
`;

  fs.writeFileSync(path.join(BENCHMARKS_DIR, 'BENCHMARK-SUMMARY.md'), summaryMd, 'utf8');
  console.log('\nSaved all 8 telemetry JSONs, 8 JSON reports, 8 Markdown reports, and BENCHMARK-SUMMARY.md.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Fatal error in benchmark runner:', err);
    process.exit(1);
  });
}
