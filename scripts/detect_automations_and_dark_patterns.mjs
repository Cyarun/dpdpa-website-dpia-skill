#!/usr/bin/env node
/**
 * Website Automation, AI-Agent, Session Replay & Dark-Pattern Fingerprint Detector
 * Aligned with the Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025 (G.S.R. 846(E))
 *
 * Passively inspects DOM HTML, script URLs, window globals, cookies, and network domains
 * against the 76-signature registry (`signatures/automation-tracker-registry.json`) and
 * outputs a deterministic, reputation-safe Automation & Dark-Pattern DPIA Inventory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_REGISTRY_PATH = path.resolve(
  __dirname,
  '../signatures/automation-tracker-registry.json'
);

const PROHIBITED_ACCUSATORY_TERMS = [
  'illegal',
  'illegally',
  'unlawful',
  'crime',
  'criminal',
  'guilty',
  'violator',
  'lawbreaker',
  'fraudulent',
  'malicious spyware',
  'extortion',
  'stealing data',
  'breach of law'
];

const CATEGORY_TO_SCHEMA_ENUM = {
  marketing_crm_automation: 'Marketing & CRM Automation',
  cdp_tag_managers: 'CDP & Event Routing',
  session_replay_heatmaps: 'Session Replay & Behavioral Heatmap',
  ai_chatbots_conversational_agents: 'AI Chatbot / Conversational Agent / Support Widget',
  ad_pixels_auto_advanced_matching: 'Ad Pixel / Auto-Advanced Matching / Retargeting',
  consent_management_platforms: 'Push / Background / Custom Automation',
  dark_patterns_and_fingerprinting: 'Push / Background / Custom Automation'
};

/**
 * Loads and parses the automation tracker signature registry.
 * @param {string} [registryPath]
 */
export function loadRegistry(registryPath = DEFAULT_REGISTRY_PATH) {
  const raw = fs.readFileSync(registryPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Normalizes cookie inputs (strings or objects) into a uniform list of cookie objects.
 */
function normalizeCookies(cookies = [], defaultPreConsent = true) {
  return cookies.map((c) => {
    if (typeof c === 'string') {
      const name = c.split('=')[0].trim();
      return { name, domain: '', set_before_consent: defaultPreConsent };
    }
    return {
      name: String(c.name || '').trim(),
      domain: String(c.domain || '').trim(),
      set_before_consent:
        typeof c.set_before_consent === 'boolean' ? c.set_before_consent : defaultPreConsent
    };
  });
}

/**
 * Extracts hostnames and normalized URLs from network request strings.
 */
function normalizeNetworkList(networkItems = []) {
  return networkItems.map((item) => {
    const raw = typeof item === 'string' ? item : String(item?.url || item?.domain || '');
    let hostname = raw.toLowerCase();
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        hostname = new URL(raw).hostname.toLowerCase();
      }
    } catch {
      // Keep raw lowercase if not a full URL
    }
    return { raw: raw.toLowerCase(), hostname };
  });
}

/**
 * Performs DOM-level inspection for forms, pre-ticked checkboxes, asymmetric consent banners,
 * insecure form actions, pre-submit listeners, fingerprinting, and background beacons.
 */
export function inspectDomDarkPatternsAndForms(html = '', scripts = []) {
  const htmlStr = String(html || '');
  const combinedCode = [htmlStr, ...scripts.map((s) => String(s || ''))].join('\n');

  // 1. Count <form> tags
  const formMatches = htmlStr.match(/<form\b[^>]*>[\s\S]*?<\/form>|<form\b[^>]*>/gi) || [];
  const formsInspectedCount = formMatches.length;

  // 2. Pre-ticked checkboxes (input type="checkbox" with checked attribute on consent/marketing/terms fields)
  const checkboxTags = htmlStr.match(/<input\b[^>]*type=["']?checkbox["']?[^>]*>/gi) || [];
  let preTickedCheckboxesCount = 0;
  for (const tag of checkboxTags) {
    const isChecked =
      /\bchecked\b/i.test(tag) || /\bdefaultChecked\b/i.test(tag);
    if (isChecked) {
      preTickedCheckboxesCount += 1;
    }
  }
  if (/defaultChecked\s*=\s*true/i.test(combinedCode) && preTickedCheckboxesCount === 0) {
    preTickedCheckboxesCount += 1;
  }

  // 3. Bundled consent forms (forms combining terms + marketing without separate checkbox or explicitly bundled text)
  let bundledConsentFormsCount = 0;
  const bundledRegex =
    /by\s+(submitting|clicking|continuing|registering|signing\s+up)[^.<]{0,120}(you\s+agree|consent)\s+to[^.<]{0,120}(marketing|promotional|newsletter|third[- ]party)/i;
  if (bundledRegex.test(htmlStr) || /data-bundled-consent=["']?true["']?/i.test(htmlStr)) {
    bundledConsentFormsCount += 1;
  }

  // 4. Unencrypted or insecure form actions (http:// on non-localhost)
  const unencryptedFormActions = [];
  const actionAttrRegex = /<form\b[^>]*\baction=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = actionAttrRegex.exec(htmlStr)) !== null) {
    const actionUrl = match[1].trim();
    if (
      actionUrl.toLowerCase().startsWith('http://') &&
      !actionUrl.toLowerCase().startsWith('http://localhost') &&
      !actionUrl.toLowerCase().startsWith('http://127.0.0.1')
    ) {
      unencryptedFormActions.push(actionUrl);
    }
  }

  // 5. Asymmetric consent banner detection (Accept button without Reject button in banner)
  let asymmetricConsentButtonsDetected = false;
  const bannerBlockRegex =
    /<(div|section|aside|footer)\b[^>]*(cookie|consent|gdpr|dpdp|privacy-banner)[^>]*>[\s\S]*?<\/\1>/gi;
  const bannerBlocks = htmlStr.match(bannerBlockRegex) || [];
  for (const block of bannerBlocks) {
    const hasAccept = /\b(accept|agree|allow\s+all|got\s+it|i\s+understand)\b/i.test(block);
    const hasReject = /\b(reject|decline|deny|refuse|necessary\s+only|essential\s+only)\b/i.test(block);
    if (hasAccept && !hasReject) {
      asymmetricConsentButtonsDetected = true;
    }
  }
  if (/accept-only-banner|only-accept-btn/i.test(htmlStr)) {
    asymmetricConsentButtonsDetected = true;
  }

  // 6. Early field capture listeners (pre-submit keystroke/blur/change on email/phone/input)
  const earlyFieldCaptureDetected =
    /hscollectedforms\.net/i.test(combinedCode) ||
    /addEventListener\s*\(\s*['"](blur|change|input|keyup)['"]/i.test(combinedCode) ||
    /<input\b[^>]*(type=["']?(email|tel|text)["']?)[^>]*\b(onblur|onchange|oninput|onkeyup)=/i.test(
      htmlStr
    );

  // 7. Web Push permission requested on load
  const webPushOnLoad =
    /Notification\.requestPermission\s*\(/i.test(combinedCode) ||
    /pushManager\.subscribe\s*\(/i.test(combinedCode) ||
    /OneSignal\.push\s*\(\s*\[\s*["']showNativePrompt["']/i.test(combinedCode);

  // 8. Canvas / WebGL / AudioContext fingerprinting signals
  const canvasOrWebglFingerprint =
    /toDataURL\s*\(/i.test(combinedCode) ||
    /WEBGL_debug_renderer_info/i.test(combinedCode) ||
    /OfflineAudioContext/i.test(combinedCode) ||
    /FingerprintJS|fpjscdn\.net|openfpcdn\.io|fingerprint2|ClientJS/i.test(combinedCode);

  // 9. Navigator sendBeacon / Service Worker / fetch keepalive
  const beaconOrKeepalive =
    /navigator\.sendBeacon\s*\(/i.test(combinedCode) ||
    /navigator\.serviceWorker\.register\s*\(/i.test(combinedCode) ||
    /keepalive\s*:\s*true/i.test(combinedCode);

  const observations = [];
  if (preTickedCheckboxesCount > 0) {
    observations.push(
      `Observed ${preTickedCheckboxesCount} pre-selected checkbox(es) in DOM; Section 6(1) requires affirmative opt-in action rather than default pre-ticked state.`
    );
  }
  if (bundledConsentFormsCount > 0) {
    observations.push(
      `Observed ${bundledConsentFormsCount} form(s) bundling marketing consent with core service submission; Section 6(1) read with Rule 3 requires itemized, unbundled consent.`
    );
  }
  if (asymmetricConsentButtonsDetected) {
    observations.push(
      `Observed consent banner with an 'Accept' action lacking an equal-prominence first-layer 'Reject Non-Essential' button (Section 6(1) & 6(4)).`
    );
  }
  if (unencryptedFormActions.length > 0) {
    observations.push(
      `Observed ${unencryptedFormActions.length} form action(s) submitting over unencrypted HTTP; Section 8(5) & Rule 6 mandate encryption in transit.`
    );
  }
  if (earlyFieldCaptureDetected) {
    observations.push(
      `Observed pre-submit input/blur/change listeners or form-scraping scripts capable of capturing personal data prior to explicit form submission.`
    );
  }

  const fingerprintDetails = [];
  if (webPushOnLoad) {
    fingerprintDetails.push(
      'Web Push Notification permission prompt (`Notification.requestPermission` / push SDK) invoked without prior two-step Rule 3 contextual notice.'
    );
  }
  if (canvasOrWebglFingerprint) {
    fingerprintDetails.push(
      'Browser/hardware fingerprinting primitives (`Canvas.toDataURL`, `WEBGL_debug_renderer_info`, `OfflineAudioContext`, or `FingerprintJS`) detected.'
    );
  }
  if (beaconOrKeepalive) {
    fingerprintDetails.push(
      'Background telemetry persistence (`navigator.sendBeacon`, `ServiceWorker`, or `fetch keepalive: true`) detected.'
    );
  }

  return {
    forms_inspected_count: formsInspectedCount,
    pre_ticked_checkboxes_count: preTickedCheckboxesCount,
    bundled_consent_forms_count: bundledConsentFormsCount,
    asymmetric_consent_buttons_detected: asymmetricConsentButtonsDetected,
    unencrypted_or_insecure_form_actions: unencryptedFormActions,
    early_field_capture_listeners_detected: earlyFieldCaptureDetected,
    observations,
    fingerprinting_and_background_signals: {
      web_push_permission_requested_on_load: webPushOnLoad,
      canvas_or_webgl_fingerprint_signals: canvasOrWebglFingerprint,
      navigator_beacon_or_fetch_keepalive_observed: beaconOrKeepalive,
      details: fingerprintDetails
    }
  };
}

/**
 * Validates that all generated strings adhere strictly to reputation-safe, non-defamatory framing.
 */
export function validateReputationSafety(payload) {
  const serialized = JSON.stringify(payload).toLowerCase();
  const prohibitedFound = [];
  for (const term of PROHIBITED_ACCUSATORY_TERMS) {
    const regex = new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(serialized)) {
      prohibitedFound.push(term);
    }
  }
  return {
    passed: prohibitedFound.length === 0,
    prohibited_terms_found: prohibitedFound
  };
}

/**
 * Main detector entry point.
 * @param {object} telemetry
 * @param {string} [telemetry.html]
 * @param {string[]} [telemetry.scripts]
 * @param {string[]} [telemetry.global_vars]
 * @param {Array<string|object>} [telemetry.cookies]
 * @param {Array<string|object>} [telemetry.network_domains]
 * @param {boolean} [telemetry.consent_granted]
 * @param {object} [options]
 */
export function detectAutomationsAndDarkPatterns(telemetry = {}, options = {}) {
  const registry = options.registry || loadRegistry(options.registryPath);
  const html = String(telemetry.html || telemetry.dom_html || '');
  const scripts = (telemetry.scripts || telemetry.script_urls || []).map((s) => String(s));
  const globalVars = new Set(
    (telemetry.global_vars || telemetry.window_globals || []).map((g) => String(g).trim())
  );
  const preConsentState = telemetry.consent_granted === true ? false : true;
  const cookies = normalizeCookies(telemetry.cookies || [], preConsentState);
  const networkList = normalizeNetworkList(
    telemetry.network_domains || telemetry.network_requests || []
  );

  const combinedTextCorpus = [html, ...scripts].join('\n');
  const combinedLowerCorpus = combinedTextCorpus.toLowerCase();

  const domInspection = inspectDomDarkPatternsAndForms(html, scripts);

  const detectedSignatures = [];
  const subprocessorMap = new Map();

  for (const sig of registry.signatures) {
    const matchedSignals = [];

    // 1. Check script_patterns against scripts array and HTML
    for (const pattern of sig.script_patterns || []) {
      const pLower = pattern.toLowerCase();
      if (combinedLowerCorpus.includes(pLower)) {
        matchedSignals.push(`script:${pattern}`);
      }
    }

    // 2. Check global_vars against window_globals or explicit window.<var> references in HTML/scripts
    for (const gVar of sig.global_vars || []) {
      const cleanVar = gVar.trim();
      if (globalVars.has(cleanVar)) {
        matchedSignals.push(`global:${cleanVar}`);
      } else {
        const escaped = cleanVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const inlineRegex = new RegExp(
          `(?:window\\.|\\b)${escaped}(?:\\s*=|\\s*\\(|\\.|\\b\\s*\\[)`,
          'i'
        );
        if (cleanVar.length >= 3 && inlineRegex.test(combinedTextCorpus)) {
          matchedSignals.push(`inline_global:${cleanVar}`);
        }
      }
    }

    // 3. Check cookie_patterns against cookies list
    for (const cPat of sig.cookie_patterns || []) {
      const cLower = cPat.toLowerCase();
      for (const cookie of cookies) {
        const nameLower = cookie.name.toLowerCase();
        if (
          nameLower === cLower ||
          (cLower.endsWith('_') && nameLower.startsWith(cLower)) ||
          (cLower.endsWith('-') && nameLower.startsWith(cLower)) ||
          nameLower.startsWith(cLower)
        ) {
          matchedSignals.push(`cookie:${cookie.name}`);
        }
      }
    }

    // 4. Check network_domains against networkList (strict hostname boundary match)
    for (const netDom of sig.network_domains || []) {
      const dLower = netDom.trim().toLowerCase();
      for (const netItem of networkList) {
        if (
          netItem.hostname === dLower ||
          netItem.hostname.endsWith(`.${dLower}`)
        ) {
          matchedSignals.push(`network:${netDom.trim()}`);
          break;
        }
      }
    }

    // 5. Check dom_patterns if defined on signature
    for (const domPat of sig.dom_patterns || []) {
      if (combinedLowerCorpus.includes(domPat.toLowerCase())) {
        matchedSignals.push(`dom:${domPat}`);
      }
    }

    // Special dark-pattern hooks tied to DOM heuristics
    if (sig.id === 'dp_pre_ticked_checkbox' && domInspection.pre_ticked_checkboxes_count > 0) {
      matchedSignals.push(`dom:pre_ticked_checkbox(${domInspection.pre_ticked_checkboxes_count})`);
    }
    if (
      sig.id === 'dp_asymmetric_consent_buttons' &&
      domInspection.asymmetric_consent_buttons_detected
    ) {
      matchedSignals.push('dom:asymmetric_accept_without_reject_button');
    }
    if (
      sig.id === 'dp_pre_submit_input_listeners' &&
      domInspection.early_field_capture_listeners_detected
    ) {
      matchedSignals.push('dom:pre_submit_input_listener');
    }
    if (
      sig.id === 'dp_web_push_auto_prompt' &&
      domInspection.fingerprinting_and_background_signals.web_push_permission_requested_on_load
    ) {
      matchedSignals.push('dom:web_push_requestPermission_on_load');
    }
    if (
      sig.id === 'dp_canvas_webgl_audio_fingerprint' &&
      domInspection.fingerprinting_and_background_signals.canvas_or_webgl_fingerprint_signals
    ) {
      matchedSignals.push('dom:canvas_webgl_audio_fingerprint');
    }
    if (
      sig.id === 'dp_service_worker_beacon_sync' &&
      domInspection.fingerprinting_and_background_signals.navigator_beacon_or_fetch_keepalive_observed
    ) {
      matchedSignals.push('dom:service_worker_or_sendBeacon');
    }

    if (matchedSignals.length > 0) {
      const uniqueSignals = Array.from(new Set(matchedSignals));
      detectedSignatures.push({
        id: sig.id,
        name: sig.name,
        category: sig.category,
        matched_signals: uniqueSignals,
        loaded_before_consent: preConsentState,
        estimated_primary_jurisdiction: sig.estimated_primary_jurisdiction || 'United States / Global Cloud',
        dpdpa_section: sig.dpdpa_section,
        dpdpa_rule: sig.dpdpa_rule,
        rule_13_2_algorithmic_risk: Boolean(sig.rule_13_2_algorithmic_risk),
        reputation_safe_observation: sig.reputation_safe_observation,
        constructive_remediation: sig.constructive_remediation
      });

      // Populate subprocessor register entry if third-party network domain exists
      if (sig.network_domains && sig.network_domains.length > 0) {
        const primaryDomain = sig.network_domains[0].trim();
        if (!subprocessorMap.has(primaryDomain)) {
          subprocessorMap.set(primaryDomain, {
            third_party_domain: primaryDomain,
            vendor_or_service_name: sig.name,
            category: CATEGORY_TO_SCHEMA_ENUM[sig.category] || sig.category,
            estimated_primary_jurisdiction:
              sig.estimated_primary_jurisdiction || 'United States / Global Cloud',
            fired_before_consent: preConsentState,
            dpdpa_governance_recommendation: sig.constructive_remediation
          });
        }
      }
    }
  }

  // Convert signature match to dpia-website-report.schema.json `automation_item`
  const toSchemaAutomationItem = (item) => ({
    vendor_name: item.name,
    automation_category: CATEGORY_TO_SCHEMA_ENUM[item.category],
    matched_signal: item.matched_signals.join(', '),
    loaded_before_consent: item.loaded_before_consent,
    rule13_2_profiling_or_automated_risk_relevance: item.rule_13_2_algorithmic_risk
      ? `Triggers Rule 13(2) & Section 10(2)(c)(ii) algorithmic/profiling evaluation (${item.dpdpa_section}; ${item.dpdpa_rule}): ${item.reputation_safe_observation}`
      : `Governed by ${item.dpdpa_section} and ${item.dpdpa_rule}: ${item.reputation_safe_observation}`,
    advisory_governance_action: item.constructive_remediation
  });

  const marketingAndCrm = detectedSignatures
    .filter((s) => s.category === 'marketing_crm_automation')
    .map(toSchemaAutomationItem);

  const cdpAndTagManagers = detectedSignatures
    .filter((s) => s.category === 'cdp_tag_managers')
    .map(toSchemaAutomationItem);

  const sessionReplayAndHeatmaps = detectedSignatures
    .filter((s) => s.category === 'session_replay_heatmaps')
    .map(toSchemaAutomationItem);

  const aiChatbotsAndSupport = detectedSignatures
    .filter((s) => s.category === 'ai_chatbots_conversational_agents')
    .map(toSchemaAutomationItem);

  const adPixelsAndMatching = detectedSignatures
    .filter((s) => s.category === 'ad_pixels_auto_advanced_matching')
    .map(toSchemaAutomationItem);

  const cmpDetected = detectedSignatures.filter(
    (s) => s.category === 'consent_management_platforms'
  );

  const darkPatternsDetected = detectedSignatures.filter(
    (s) => s.category === 'dark_patterns_and_fingerprinting'
  );

  const totalAutomationsDetected =
    marketingAndCrm.length +
    cdpAndTagManagers.length +
    sessionReplayAndHeatmaps.length +
    aiChatbotsAndSupport.length +
    adPixelsAndMatching.length;

  const algorithmicRiskItems = detectedSignatures.filter((s) => s.rule_13_2_algorithmic_risk);

  const schemaCompliantInventory = {
    total_automations_detected: totalAutomationsDetected,
    marketing_and_crm_automations: marketingAndCrm,
    cdp_and_tag_managers: cdpAndTagManagers,
    session_replay_and_heatmaps: sessionReplayAndHeatmaps,
    ai_chatbots_and_support_widgets: aiChatbotsAndSupport,
    ad_pixels_and_auto_advanced_matching: adPixelsAndMatching,
    form_input_and_dark_pattern_signals: {
      forms_inspected_count: domInspection.forms_inspected_count,
      pre_ticked_checkboxes_count: domInspection.pre_ticked_checkboxes_count,
      bundled_consent_forms_count: domInspection.bundled_consent_forms_count,
      unencrypted_or_insecure_form_actions: domInspection.unencrypted_or_insecure_form_actions,
      early_field_capture_listeners_detected: domInspection.early_field_capture_listeners_detected,
      observations: domInspection.observations
    },
    fingerprinting_and_background_signals: domInspection.fingerprinting_and_background_signals
  };

  const result = {
    detector_version: registry.registry_metadata.version,
    evaluated_at_utc: new Date().toISOString(),
    total_signatures_in_registry: registry.signatures.length,
    total_signatures_matched: detectedSignatures.length,
    website_automations_and_profiling_inventory: schemaCompliantInventory,
    detected_signatures: detectedSignatures,
    consent_management_platforms_detected: cmpDetected,
    dark_patterns_and_fingerprinting_detected: darkPatternsDetected,
    rule_13_2_assessment: {
      triggered: algorithmicRiskItems.length > 0,
      algorithmic_automations_count: algorithmicRiskItems.length,
      statutory_citation:
        'Section 10(2)(c)(ii) of the DPDP Act, 2023 read with Rule 13(1)-(3) of the DPDP Rules, 2025 (G.S.R. 846(E))',
      rationale:
        algorithmicRiskItems.length > 0
          ? `Observed ${algorithmicRiskItems.length} client-side automation/profiling/AI/replay signal(s) (${algorithmicRiskItems
              .slice(0, 6)
              .map((i) => i.name)
              .join('; ')}) that perform behavioral profiling, automated scoring, DOM session recording, or generative AI interaction warranting a Rule 13(2) algorithmic risk assessment.`
          : 'No client-side behavioral profiling, session replay, or conversational AI automations observed on the inspected page.'
    },
    subprocessor_and_cross_border_register: Array.from(subprocessorMap.values())
  };

  result.reputation_safety_check = validateReputationSafety(result);
  return result;
}

// CLI execution handler
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const inputArg = process.argv[2];
  let inputData = {};
  if (inputArg && fs.existsSync(inputArg)) {
    inputData = JSON.parse(fs.readFileSync(inputArg, 'utf-8'));
  }
  const output = detectAutomationsAndDarkPatterns(inputData);
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}
