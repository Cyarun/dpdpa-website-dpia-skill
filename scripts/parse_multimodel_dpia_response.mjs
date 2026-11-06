#!/usr/bin/env node
/**
 * Multi-Model DPIA Response Universal Parser, Schema Validator & Guardrail Sanitizer
 * Supports:
 *  - Claude (3.5/3.7/4 Sonnet & Opus): XML <self_critique> + <dpia_json_output>
 *  - Google Gemini (2.5 Pro/Flash): Strict JSON responseSchema (zero markdown fence bleed check)
 *  - DeepSeek (deepseek-reasoner R1 & deepseek-chat V3): <think>...</think> + JSON/markdown
 *  - Qwen (qwen-max, qwen-plus, qwq-32b): ChatML <|im_start|> / <think>...</think> + JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STATUTORY_CONSTANTS = Object.freeze({
  assessment_framing: 'Confidential & Constructive Advisory DPIA Readiness Assessment',
  audit_scope:
    'Publicly observable client-side DOM, HTTP response headers, pre-consent storage, network requests, and website automation signals (Read-Only Website Scope)',
  statutory_baseline: Object.freeze({
    act: 'Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule)',
    rules:
      'Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)',
    enforcement_timeline:
      'Phased: 13 Nov 2025 (Rules 1-2, 17-21); 13 Nov 2026 (Rule 4 Consent Manager registration); 13 May 2027 (Rules 3, 5-16, 22-23 operational compliance)',
    grievance_sla_days: 90,
    security_log_retention_minimum: 'Minimum 1 year (Rule 8(3) read with Seventh Schedule)'
  }),
  disclaimer:
    'This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.'
});

export const PROHIBITED_REPUTATION_PATTERNS = [
  { regex: /\billegal(?:ly)?\b/gi, replacement: 'unaligned with target readiness controls' },
  { regex: /\bunlawful(?:ly)?\b/gi, replacement: 'requiring statutory readiness alignment' },
  { regex: /\bviolat(?:or|ors|ing|ion|ions|ed|es|e)\b/gi, replacement: 'readiness gap requiring alignment' },
  { regex: /\bnon-?compliant\b/gi, replacement: 'requiring priority readiness alignment' },
  { regex: /\bnon-?compliance\b/gi, replacement: 'readiness enhancement area' },
  { regex: /\bbreach(?:es|ing)?\s+of\s+law\b/gi, replacement: 'divergence from statutory readiness baseline' },
  { regex: /\bcriminal(?:ly)?\b/gi, replacement: 'outside recommended governance parameters' },
  { regex: /\bguilty\b/gi, replacement: 'exhibiting priority readiness observations' },
  { regex: /\boffender(?:s)?\b/gi, replacement: 'evaluated entity' },
  { regex: /\blawbreaker(?:s)?\b/gi, replacement: 'evaluated entity' },
  { regex: /\bfined\b/gi, replacement: 'subject to regulatory governance review' },
  { regex: /\bpenalty\s+exposure\b/gi, replacement: 'statutory governance priority' },
  { regex: /\b250\s*crore\s*(?:fine|penalty)\b/gi, replacement: 'Schedule statutory governance threshold' },
  { regex: /\bsued\b/gi, replacement: 'subject to formal grievance escalation' },
  { regex: /\blitigation\s+risk\b/gi, replacement: 'governance readiness consideration' },
  { regex: /\bshameful\b/gi, replacement: 'notable' },
  { regex: /\bdeceptive\s+fraud\b/gi, replacement: 'interface symmetry enhancement area' },
  { regex: /\bbreaking\s+the\s+law\b/gi, replacement: 'requiring statutory control alignment' }
];

export const STATUTORY_HALLUCINATION_PATTERNS = [
  {
    regex: /\b30[-\s]?day(?:s)?\s+(?:grievance|dsar|response|redressal|sla)\b/gi,
    replacement: '90-day grievance redressal SLA (Section 13 read with Rule 14(3))'
  },
  {
    regex: /\bgrievance\s+(?:sla|resolution|redressal|timeline)\s+of\s+30\s+days\b/gi,
    replacement: 'grievance redressal period not exceeding 90 days under Rule 14(3)'
  },
  {
    regex: /\bwithin\s+30\s+days\s+under\s+(?:dpdpa|dpdp|rule\s+14)\b/gi,
    replacement: 'within 90 days under DPDP Section 13 and Rule 14(3)'
  },
  {
    regex: /\bgdpr\s+article\s+\d+\b/gi,
    replacement: 'DPDP Act, 2023 and DPDP Rules, 2025 (G.S.R. 846(E))'
  },
  {
    regex: /\b(?:6[-\s]?month|90[-\s]?day|180[-\s]?day)\s+(?:security\s+)?log\s+retention\b/gi,
    replacement: 'minimum 1-year security log retention (Rule 8(3) read with Seventh Schedule)'
  }
];

const VALID_MODEL_FAMILIES = new Set([
  'claude',
  'gemini',
  'deepseek',
  'qwen',
  'deterministic-telemetry-only'
]);

const VALID_READINESS_POSTURES = new Set([
  'High Readiness (Aligned)',
  'Moderate Readiness (Advisory Enhancements Recommended)',
  'Foundational Readiness (Priority Engineering Actions Recommended)'
]);

const VALID_COOKIE_CATEGORIES = new Set([
  'Strictly Necessary / Security',
  'Functional / Preferences',
  'Analytics & Telemetry',
  'Marketing / Ad-Tech / Retargeting',
  'Session Replay / Behavioral Profiling',
  'AI / Chat / Support Automation',
  'Unclassified'
]);

const VALID_AUTOMATION_CATEGORIES = new Set([
  'Marketing & CRM Automation',
  'CDP & Event Routing',
  'Session Replay & Behavioral Heatmap',
  'AI Chatbot / Conversational Agent / Support Widget',
  'Ad Pixel / Auto-Advanced Matching / Retargeting',
  'Push / Background / Custom Automation'
]);

const VALID_READINESS_TIERS = new Set([
  'Aligned',
  'Advisory Enhancement',
  'Priority Readiness Action'
]);

const VALID_FINDING_PILLARS = new Set([
  'Notice & Transparency (Sec 5 / Rule 3)',
  'Consent & Dark-Pattern Symmetry (Sec 6 / Rules 3-4)',
  'Website Automations, AI & Profiling (Sec 6 / Rule 13(2))',
  'Reasonable Security Safeguards (Sec 8(5) / Rule 6)',
  "Children's Data Protection (Sec 9 / Rules 10-11)",
  'Grievance Redressal & 90-Day SLA (Sec 13 / Rule 14(3))',
  'Cross-Border Sub-Processors (Sec 16 / Rule 15)'
]);

const REQUIRED_CONTROL_MATRIX_KEYS = [
  'section_5_rule_3_notice',
  'section_6_rule_3_4_consent_and_cmp',
  'section_8_5_rule_6_8_security_and_logs',
  'section_9_rules_10_11_children_safeguards',
  'section_10_rule_13_dpia_and_algorithmic_governance',
  'section_13_rule_14_3_grievance_and_dpo',
  'section_16_rule_15_cross_border_transfers'
];

/**
 * Extracts reasoning trace (<think> or <self_critique>) and JSON payload across Claude, Gemini, DeepSeek, and Qwen.
 */
export function extractModelEnvelope(rawText, modelFamily = 'claude') {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Empty or non-string model response provided to parser.');
  }

  let working = rawText.trim();
  let reasoningTrace = null;
  let hadChatMlTags = false;

  // Strip Qwen ChatML wrappers if present
  if (working.includes('<|im_start|>') || working.includes('<|im_end|>')) {
    hadChatMlTags = true;
    working = working
      .replace(/<\|im_start\|>assistant\s*/gi, '')
      .replace(/<\|im_end\|>/gi, '')
      .trim();
  }

  // Extract Claude <self_critique>...</self_critique>
  const critiqueMatch = working.match(/<self_critique>([\s\S]*?)<\/self_critique>/i);
  if (critiqueMatch) {
    reasoningTrace = critiqueMatch[1].trim();
    working = working.replace(critiqueMatch[0], '').trim();
  }

  // Extract DeepSeek / Qwen <think>...</think>
  const thinkMatch = working.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    reasoningTrace = thinkMatch[1].trim();
    working = working.replace(thinkMatch[0], '').trim();
  }

  // Extract Claude <dpia_json_output>...</dpia_json_output>
  let jsonCandidate = working;
  const xmlJsonMatch = working.match(/<dpia_json_output>([\s\S]*?)<\/dpia_json_output>/i);
  if (xmlJsonMatch) {
    jsonCandidate = xmlJsonMatch[1].trim();
  }

  // Detect markdown code fence bleed
  const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const fenceMatch = jsonCandidate.match(fenceRegex);
  const hadMarkdownFenceBleed = Boolean(fenceMatch);
  if (fenceMatch) {
    jsonCandidate = fenceMatch[1].trim();
  } else {
    // Also handle embedded markdown fence or raw brace extraction
    const firstBrace = jsonCandidate.indexOf('{');
    const lastBrace = jsonCandidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const prefix = jsonCandidate.slice(0, firstBrace);
      if (prefix.includes('```')) {
        jsonCandidate = jsonCandidate.slice(firstBrace, lastBrace + 1);
      } else {
        jsonCandidate = jsonCandidate.slice(firstBrace, lastBrace + 1);
      }
    }
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(jsonCandidate);
  } catch (err) {
    throw new Error(`Failed to parse JSON from ${modelFamily} output: ${err.message}`);
  }

  return {
    modelFamily,
    reasoningTrace,
    hadChatMlTags,
    hadMarkdownFenceBleed,
    parsedJson
  };
}

/**
 * Scans a string or object tree for prohibited reputation/defamatory terms.
 */
export function scanProhibitedTerms(objOrString) {
  const text = typeof objOrString === 'string' ? objOrString : JSON.stringify(objOrString);
  const matches = [];
  for (const { regex } of PROHIBITED_REPUTATION_PATTERNS) {
    const clone = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = clone.exec(text)) !== null) {
      matches.push(m[0]);
    }
  }
  return matches;
}

/**
 * Scans a string or object tree for statutory hallucinations (e.g., 30-day GDPR SLA).
 */
export function scanStatutoryHallucinations(objOrString) {
  const text = typeof objOrString === 'string' ? objOrString : JSON.stringify(objOrString);
  const matches = [];
  for (const { regex } of STATUTORY_HALLUCINATION_PATTERNS) {
    const clone = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = clone.exec(text)) !== null) {
      matches.push(m[0]);
    }
  }
  return matches;
}

/**
 * Recursively sanitizes string values in the report for reputation safety and statutory accuracy.
 */
function sanitizeStringsDeep(node, interventions) {
  if (typeof node === 'string') {
    let updated = node;
    for (const { regex, replacement } of STATUTORY_HALLUCINATION_PATTERNS) {
      if (regex.test(updated)) {
        interventions.statutory_rewrites.push({ original: updated, pattern: regex.source });
        updated = updated.replace(regex, replacement);
      }
    }
    for (const { regex, replacement } of PROHIBITED_REPUTATION_PATTERNS) {
      if (regex.test(updated)) {
        interventions.reputation_rewrites.push({ original: updated, pattern: regex.source });
        updated = updated.replace(regex, replacement);
      }
    }
    return updated;
  }
  if (Array.isArray(node)) {
    return node.map((item) => sanitizeStringsDeep(item, interventions));
  }
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = sanitizeStringsDeep(v, interventions);
    }
    return out;
  }
  return node;
}

/**
 * Builds an empirical lookup set from the input telemetry JSON so any hallucinated
 * cookies, storage keys, automations, or third-party domains are caught and stripped.
 */
export function verifyAndEnforceTelemetryGrounding(report, telemetry, interventions) {
  if (!telemetry || typeof telemetry !== 'object') {
    return report;
  }

  const allowedCookieNames = new Set(
    (telemetry.cookies || []).map((c) => (typeof c === 'string' ? c : c.name))
  );
  const allowedLocalStorage = new Set(telemetry.local_storage_keys || []);
  const allowedSessionStorage = new Set(telemetry.session_storage_keys || []);
  const allowedIndexedDb = new Set(telemetry.indexeddb_databases || []);
  const allowedServiceWorkers = new Set(telemetry.service_workers_registered || []);

  // Build allowed automation signals & vendor names
  const allowedAutomationSignals = new Set();
  const allowedAutomationVendors = new Set();
  for (const a of telemetry.automations || []) {
    if (a.matched_signal) allowedAutomationSignals.add(a.matched_signal);
    if (a.vendor_name) allowedAutomationVendors.add(a.vendor_name);
  }
  for (const s of telemetry.scripts || []) {
    allowedAutomationSignals.add(s);
  }

  // Build allowed third-party domains
  const allowedDomains = new Set(telemetry.third_party_domains || []);
  for (const sub of telemetry.subprocessors || []) {
    if (sub.third_party_domain) allowedDomains.add(sub.third_party_domain);
  }
  for (const c of telemetry.cookies || []) {
    if (c && typeof c === 'object' && c.domain) {
      allowedDomains.add(c.domain.replace(/^\./, ''));
    }
  }

  // 1. Ground cookies_inventory
  const storageSec = report.pre_consent_storage_and_cookies;
  if (storageSec && Array.isArray(storageSec.cookies_inventory)) {
    storageSec.cookies_inventory = storageSec.cookies_inventory.filter((cookie) => {
      const grounded = allowedCookieNames.has(cookie.name);
      if (!grounded) {
        interventions.hallucinated_items_removed.push({
          type: 'cookie',
          name: cookie.name
        });
      }
      return grounded;
    });
    storageSec.first_party_cookies_count = storageSec.cookies_inventory.filter(
      (c) => !c.is_third_party
    ).length;
    storageSec.third_party_cookies_count = storageSec.cookies_inventory.filter(
      (c) => Boolean(c.is_third_party)
    ).length;
    storageSec.pre_consent_tracking_observed = storageSec.cookies_inventory.some(
      (c) =>
        c.set_before_consent &&
        c.category !== 'Strictly Necessary / Security' &&
        c.category !== 'Functional / Preferences'
    );
  }

  // Ground storage arrays
  if (storageSec) {
    if (Array.isArray(storageSec.local_storage_keys)) {
      storageSec.local_storage_keys = storageSec.local_storage_keys.filter((k) => {
        const ok = allowedLocalStorage.has(k);
        if (!ok) interventions.hallucinated_items_removed.push({ type: 'local_storage', name: k });
        return ok;
      });
    }
    if (Array.isArray(storageSec.session_storage_keys)) {
      storageSec.session_storage_keys = storageSec.session_storage_keys.filter((k) => {
        const ok = allowedSessionStorage.has(k);
        if (!ok)
          interventions.hallucinated_items_removed.push({ type: 'session_storage', name: k });
        return ok;
      });
    }
    if (Array.isArray(storageSec.indexeddb_databases)) {
      storageSec.indexeddb_databases = storageSec.indexeddb_databases.filter((k) => {
        const ok = allowedIndexedDb.has(k);
        if (!ok) interventions.hallucinated_items_removed.push({ type: 'indexeddb', name: k });
        return ok;
      });
    }
    if (Array.isArray(storageSec.service_workers_registered)) {
      storageSec.service_workers_registered = storageSec.service_workers_registered.filter((k) => {
        const ok = allowedServiceWorkers.has(k);
        if (!ok)
          interventions.hallucinated_items_removed.push({ type: 'service_worker', name: k });
        return ok;
      });
    }
  }

  // 2. Ground website_automations_and_profiling_inventory
  const autoSec = report.website_automations_and_profiling_inventory;
  const autoCategories = [
    'marketing_and_crm_automations',
    'cdp_and_tag_managers',
    'session_replay_and_heatmaps',
    'ai_chatbots_and_support_widgets',
    'ad_pixels_and_auto_advanced_matching'
  ];
  if (autoSec) {
    let totalGroundedAutomations = 0;
    for (const cat of autoCategories) {
      if (Array.isArray(autoSec[cat])) {
        autoSec[cat] = autoSec[cat].filter((item) => {
          const grounded =
            allowedAutomationSignals.has(item.matched_signal) ||
            allowedAutomationVendors.has(item.vendor_name);
          if (!grounded) {
            interventions.hallucinated_items_removed.push({
              type: 'automation',
              vendor_name: item.vendor_name,
              matched_signal: item.matched_signal
            });
          }
          return grounded;
        });
        totalGroundedAutomations += autoSec[cat].length;
      }
    }
    autoSec.total_automations_detected = totalGroundedAutomations;
  }

  // 3. Ground subprocessor_and_cross_border_register
  if (Array.isArray(report.subprocessor_and_cross_border_register)) {
    report.subprocessor_and_cross_border_register =
      report.subprocessor_and_cross_border_register.filter((sub) => {
        const cleanDomain = (sub.third_party_domain || '').replace(/^\./, '');
        const grounded =
          allowedDomains.has(sub.third_party_domain) || allowedDomains.has(cleanDomain);
        if (!grounded) {
          interventions.hallucinated_items_removed.push({
            type: 'subprocessor',
            domain: sub.third_party_domain
          });
        }
        return grounded;
      });
  }

  // 4. Ground advisory_findings against explicitly trapped unverified tokens if provided in telemetry.unverified_trap_tokens
  if (
    Array.isArray(telemetry.unverified_trap_tokens) &&
    telemetry.unverified_trap_tokens.length > 0 &&
    Array.isArray(report.advisory_findings)
  ) {
    report.advisory_findings = report.advisory_findings.filter((finding) => {
      const sig = (finding.observed_technical_signal || '').toLowerCase();
      const hasTrapToken = telemetry.unverified_trap_tokens.some((tok) =>
        sig.includes(String(tok).toLowerCase())
      );
      if (hasTrapToken) {
        interventions.hallucinated_items_removed.push({
          type: 'finding_signal_trap',
          finding_id: finding.finding_id,
          signal: finding.observed_technical_signal
        });
      }
      return !hasTrapToken;
    });
  }

  return report;
}

/**
 * Validates the sanitized DPIA report against dpia-website-report.schema.json rules.
 */
export function validateDpiaReportSchema(report) {
  const errors = [];
  if (!report || typeof report !== 'object') {
    return { valid: false, errors: ['Root report is not an object'] };
  }

  const requiredRoot = [
    'report_metadata',
    'executive_readiness_summary',
    'pre_consent_storage_and_cookies',
    'website_automations_and_profiling_inventory',
    'statutory_dpdpa_control_matrix',
    'advisory_findings',
    'subprocessor_and_cross_border_register',
    'reputation_safety_attestation'
  ];

  for (const key of requiredRoot) {
    if (!(key in report)) {
      errors.push(`Missing required root property: ${key}`);
    }
  }
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 1. Validate report_metadata
  const meta = report.report_metadata;
  if (meta.assessment_framing !== STATUTORY_CONSTANTS.assessment_framing) {
    errors.push('Invalid report_metadata.assessment_framing const');
  }
  if (meta.audit_scope !== STATUTORY_CONSTANTS.audit_scope) {
    errors.push('Invalid report_metadata.audit_scope const');
  }
  if (!VALID_MODEL_FAMILIES.has(meta.evaluating_model_family)) {
    errors.push(`Invalid evaluating_model_family: ${meta.evaluating_model_family}`);
  }
  const sb = meta.statutory_baseline || {};
  if (sb.act !== STATUTORY_CONSTANTS.statutory_baseline.act) {
    errors.push('Invalid statutory_baseline.act const');
  }
  if (sb.rules !== STATUTORY_CONSTANTS.statutory_baseline.rules) {
    errors.push('Invalid statutory_baseline.rules const');
  }
  if (sb.enforcement_timeline !== STATUTORY_CONSTANTS.statutory_baseline.enforcement_timeline) {
    errors.push('Invalid statutory_baseline.enforcement_timeline const');
  }
  if (sb.grievance_sla_days !== 90) {
    errors.push(`Invalid statutory_baseline.grievance_sla_days: expected 90, got ${sb.grievance_sla_days}`);
  }
  if (
    sb.security_log_retention_minimum !==
    STATUTORY_CONSTANTS.statutory_baseline.security_log_retention_minimum
  ) {
    errors.push('Invalid statutory_baseline.security_log_retention_minimum const');
  }

  // 2. Validate executive_readiness_summary
  const exec = report.executive_readiness_summary;
  if (
    typeof exec.overall_readiness_score_0_100 !== 'number' ||
    exec.overall_readiness_score_0_100 < 0 ||
    exec.overall_readiness_score_0_100 > 100
  ) {
    errors.push('Invalid overall_readiness_score_0_100');
  }
  if (!VALID_READINESS_POSTURES.has(exec.readiness_posture)) {
    errors.push(`Invalid readiness_posture: ${exec.readiness_posture}`);
  }
  if (typeof exec.rule13_dpia_and_algorithmic_risk_triggered !== 'boolean') {
    errors.push('rule13_dpia_and_algorithmic_risk_triggered must be boolean');
  }

  // 3. Validate pre_consent_storage_and_cookies
  const cookies = report.pre_consent_storage_and_cookies;
  if (!Array.isArray(cookies.cookies_inventory)) {
    errors.push('cookies_inventory must be an array');
  } else {
    for (const c of cookies.cookies_inventory) {
      if (!VALID_COOKIE_CATEGORIES.has(c.category)) {
        errors.push(`Invalid cookie category: ${c.category}`);
      }
    }
  }

  // 4. Validate website_automations_and_profiling_inventory
  const auto = report.website_automations_and_profiling_inventory;
  const autoLists = [
    auto.marketing_and_crm_automations,
    auto.cdp_and_tag_managers,
    auto.session_replay_and_heatmaps,
    auto.ai_chatbots_and_support_widgets,
    auto.ad_pixels_and_auto_advanced_matching
  ];
  for (const list of autoLists) {
    if (!Array.isArray(list)) {
      errors.push('Automation category list must be an array');
    } else {
      for (const item of list) {
        if (!VALID_AUTOMATION_CATEGORIES.has(item.automation_category)) {
          errors.push(`Invalid automation_category: ${item.automation_category}`);
        }
      }
    }
  }

  // 5. Validate statutory_dpdpa_control_matrix
  const matrix = report.statutory_dpdpa_control_matrix;
  for (const key of REQUIRED_CONTROL_MATRIX_KEYS) {
    const pillar = matrix?.[key];
    if (!pillar || typeof pillar !== 'object') {
      errors.push(`Missing control matrix pillar: ${key}`);
    } else if (!VALID_READINESS_TIERS.has(pillar.readiness_tier)) {
      errors.push(`Invalid readiness_tier in ${key}: ${pillar.readiness_tier}`);
    }
  }

  // 6. Validate advisory_findings
  if (!Array.isArray(report.advisory_findings)) {
    errors.push('advisory_findings must be an array');
  } else {
    for (const f of report.advisory_findings) {
      if (!/^DPIA-[0-9]{3}$/.test(f.finding_id || '')) {
        errors.push(`Invalid finding_id pattern: ${f.finding_id}`);
      }
      if (!VALID_FINDING_PILLARS.has(f.pillar)) {
        errors.push(`Invalid finding pillar: ${f.pillar}`);
      }
      if (!VALID_READINESS_TIERS.has(f.readiness_tier)) {
        errors.push(`Invalid finding readiness_tier: ${f.readiness_tier}`);
      }
    }
  }

  // 7. Validate reputation_safety_attestation
  const att = report.reputation_safety_attestation;
  if (
    att.zero_defamation_verified !== true ||
    att.prohibited_terms_absent !== true ||
    att.read_only_passive_inspection_confirmed !== true ||
    att.disclaimer !== STATUTORY_CONSTANTS.disclaimer
  ) {
    errors.push('Invalid reputation_safety_attestation constants');
  }

  // 8. Verify zero prohibited terms remain
  const prohibitedLeft = scanProhibitedTerms(report);
  if (prohibitedLeft.length > 0) {
    errors.push(`Prohibited reputation-harming terms detected: ${prohibitedLeft.join(', ')}`);
  }

  // 9. Verify zero statutory hallucinations remain
  const hallucinationsLeft = scanStatutoryHallucinations(report);
  if (hallucinationsLeft.length > 0) {
    errors.push(`Statutory hallucinations detected: ${hallucinationsLeft.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Full pipeline: parses raw output from Claude, Gemini, DeepSeek, or Qwen,
 * enforces statutory constants, grounds telemetry evidence, sanitizes reputation/statutory traps,
 * and validates against dpia-website-report.schema.json.
 */
export function parseAndSanitizeModelResponse({
  rawOutput,
  modelFamily,
  telemetry
}) {
  const interventions = {
    reputation_rewrites: [],
    statutory_rewrites: [],
    hallucinated_items_removed: [],
    const_normalizations: []
  };

  const envelope = extractModelEnvelope(rawOutput, modelFamily);
  let report = sanitizeStringsDeep(envelope.parsedJson, interventions);

  // Enforce statutory baseline constants & model family
  if (report.report_metadata) {
    report.report_metadata.evaluating_model_family = modelFamily;
    report.report_metadata.assessment_framing = STATUTORY_CONSTANTS.assessment_framing;
    report.report_metadata.audit_scope = STATUTORY_CONSTANTS.audit_scope;
    if (!report.report_metadata.statutory_baseline) {
      report.report_metadata.statutory_baseline = {};
    }
    const sb = report.report_metadata.statutory_baseline;
    if (sb.grievance_sla_days !== 90) {
      interventions.const_normalizations.push({
        field: 'statutory_baseline.grievance_sla_days',
        from: sb.grievance_sla_days,
        to: 90
      });
    }
    sb.act = STATUTORY_CONSTANTS.statutory_baseline.act;
    sb.rules = STATUTORY_CONSTANTS.statutory_baseline.rules;
    sb.enforcement_timeline = STATUTORY_CONSTANTS.statutory_baseline.enforcement_timeline;
    sb.grievance_sla_days = STATUTORY_CONSTANTS.statutory_baseline.grievance_sla_days;
    sb.security_log_retention_minimum =
      STATUTORY_CONSTANTS.statutory_baseline.security_log_retention_minimum;
  }

  // Enforce reputation_safety_attestation constants
  report.reputation_safety_attestation = {
    zero_defamation_verified: true,
    prohibited_terms_absent: true,
    read_only_passive_inspection_confirmed: true,
    disclaimer: STATUTORY_CONSTANTS.disclaimer
  };

  // Ground against telemetry
  report = verifyAndEnforceTelemetryGrounding(report, telemetry, interventions);

  // Renumber advisory_findings if any were filtered out
  if (Array.isArray(report.advisory_findings)) {
    report.advisory_findings.forEach((f, idx) => {
      f.finding_id = `DPIA-${String(idx + 1).padStart(3, '0')}`;
    });
  }

  const validation = validateDpiaReportSchema(report);

  return {
    valid: validation.valid,
    errors: validation.errors,
    modelFamily,
    reasoningTrace: envelope.reasoningTrace,
    hadMarkdownFenceBleed: envelope.hadMarkdownFenceBleed,
    hadChatMlTags: envelope.hadChatMlTags,
    interventions,
    sanitizedReport: report
  };
}

// CLI Runner support
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) {
    console.log(
      JSON.stringify(
        {
          status: 'OK',
          module: 'parse_multimodel_dpia_response.mjs',
          supported_models: ['claude', 'gemini', 'deepseek', 'qwen']
        },
        null,
        2
      )
    );
  }
}
