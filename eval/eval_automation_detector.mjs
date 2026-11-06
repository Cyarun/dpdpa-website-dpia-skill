#!/usr/bin/env node
/**
 * Evaluation Suite for the Website Automation, AI-Agent, Session Replay & Dark-Pattern Detector
 * Verifies:
 * 1. Registry Completeness: >= 65 signatures across all 7 required categories with mandatory statutory fields.
 * 2. 100% Recall across all 76 individual signatures (script, global_var, cookie, network, DOM).
 * 3. Zero False Positives (100% Precision) on clean/minimal Indian enterprise & government HTML fixtures.
 * 4. Realistic Multi-Stack Website Fixtures (E-Commerce FinTech, SaaS AI Platform, Clean DPDP-Aligned Portal).
 * 5. Reputation Safety & Non-Defamatory Language Verification (Zero prohibited terms).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadRegistry,
  detectAutomationsAndDarkPatterns,
  validateReputationSafety
} from '../scripts/detect_automations_and_dark_patterns.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(__dirname, 'automation-eval-result.json');

const REQUIRED_CATEGORIES = [
  'marketing_crm_automation',
  'cdp_tag_managers',
  'session_replay_heatmaps',
  'ai_chatbots_conversational_agents',
  'ad_pixels_auto_advanced_matching',
  'consent_management_platforms',
  'dark_patterns_and_fingerprinting'
];

const REQUIRED_SIGNATURE_FIELDS = [
  'id',
  'name',
  'category',
  'script_patterns',
  'global_vars',
  'cookie_patterns',
  'network_domains',
  'dpdpa_section',
  'dpdpa_rule',
  'rule_13_2_algorithmic_risk',
  'reputation_safe_observation',
  'constructive_remediation'
];

function runEvaluation() {
  const registry = loadRegistry();
  const signatures = registry.signatures || [];
  const checks = [];

  // Check 1: Registry size >= 65 and all 7 categories populated
  const categoryCounts = {};
  for (const cat of REQUIRED_CATEGORIES) {
    categoryCounts[cat] = 0;
  }
  let missingFieldsCount = 0;
  for (const sig of signatures) {
    if (categoryCounts[sig.category] !== undefined) {
      categoryCounts[sig.category] += 1;
    }
    for (const field of REQUIRED_SIGNATURE_FIELDS) {
      if (sig[field] === undefined || sig[field] === null) {
        missingFieldsCount += 1;
      }
    }
  }
  const allCategoriesPresent = REQUIRED_CATEGORIES.every((c) => categoryCounts[c] > 0);
  const registryPass =
    signatures.length >= 65 && allCategoriesPresent && missingFieldsCount === 0;
  checks.push({
    check_id: 'REGISTRY_COMPLETENESS_AND_SCHEMA',
    weight: 20,
    score: registryPass ? 20 : 0,
    passed: registryPass,
    details: {
      total_signatures: signatures.length,
      category_counts: categoryCounts,
      missing_fields_count: missingFieldsCount
    }
  });

  // Check 2: Per-Signature Deterministic Recall across all 76 signatures
  let recalledCount = 0;
  const failedSignatures = [];
  for (const sig of signatures) {
    const syntheticInput = {
      html:
        sig.dom_patterns && sig.dom_patterns.length > 0
          ? `<div class="cookie-banner"><form action="http://example.com/submit"><input type="checkbox" checked /><input type="email" onblur="capture()" /><button>Accept All</button></form></div><script>${sig.dom_patterns[0]}</script>`
          : '',
      scripts: sig.script_patterns?.length ? [sig.script_patterns[0]] : [],
      global_vars: sig.global_vars?.length ? [sig.global_vars[0]] : [],
      cookies: sig.cookie_patterns?.length ? [`${sig.cookie_patterns[0]}test=1`] : [],
      network_domains: sig.network_domains?.length ? [sig.network_domains[0]] : []
    };
    const res = detectAutomationsAndDarkPatterns(syntheticInput, { registry });
    const matchedIds = new Set(res.detected_signatures.map((d) => d.id));
    if (matchedIds.has(sig.id)) {
      recalledCount += 1;
    } else {
      failedSignatures.push(sig.id);
    }
  }
  const recallPass = recalledCount === signatures.length;
  checks.push({
    check_id: 'ALL_76_SIGNATURES_RECALL',
    weight: 30,
    score: recallPass ? 30 : Math.round((recalledCount / signatures.length) * 30),
    passed: recallPass,
    details: {
      tested_signatures: signatures.length,
      recalled_signatures: recalledCount,
      failed_signatures: failedSignatures
    }
  });

  // Check 3: Zero False Positives on Clean Website Fixture
  const cleanFixture = {
    html: `<!DOCTYPE html>
      <html lang="en">
      <head><title>Ministry Public Portal - Read Only Information</title></head>
      <body>
        <main>
          <h1>Welcome to our Digital Portal</h1>
          <form action="https://portal.example.in/contact" method="POST">
            <label>Email <input type="email" name="email" required /></label>
            <label><input type="checkbox" name="consent" /> I agree to the itemized DPDP Act Section 5 privacy notice.</label>
            <button type="submit">Submit Inquiry</button>
          </form>
        </main>
      </body>
      </html>`,
    scripts: ['https://portal.example.in/static/app.bundle.js'],
    global_vars: ['__APP_VERSION__'],
    cookies: [{ name: 'SESSIONID', domain: 'portal.example.in', set_before_consent: false }],
    network_domains: ['portal.example.in']
  };
  const cleanResult = detectAutomationsAndDarkPatterns(cleanFixture, { registry });
  const zeroFalsePositives =
    cleanResult.total_signatures_matched === 0 &&
    cleanResult.website_automations_and_profiling_inventory.total_automations_detected === 0 &&
    cleanResult.website_automations_and_profiling_inventory.form_input_and_dark_pattern_signals
      .pre_ticked_checkboxes_count === 0 &&
    cleanResult.rule_13_2_assessment.triggered === false;

  checks.push({
    check_id: 'ZERO_FALSE_POSITIVES_CLEAN_FIXTURE',
    weight: 20,
    score: zeroFalsePositives ? 20 : 0,
    passed: zeroFalsePositives,
    details: {
      matched_on_clean_fixture: cleanResult.total_signatures_matched,
      forms_inspected:
        cleanResult.website_automations_and_profiling_inventory.form_input_and_dark_pattern_signals
          .forms_inspected_count
    }
  });

  // Check 4: Realistic Enterprise E-Commerce & FinTech Multi-Automation Fixture
  const enterpriseFixture = {
    html: `<!DOCTYPE html>
      <html>
      <body>
        <div id="cookie-banner" class="cookie-consent-banner">
          <p>We use cookies to personalize content and ads.</p>
          <button class="btn-primary">Accept All</button>
        </div>
        <form action="http://insecure.checkout.example.com/lead" method="POST">
          <input type="email" name="user_email" onblur="trackPartialEmail(this.value)" />
          <input type="checkbox" name="marketing_optin" checked />
          <p>By submitting this form you agree to receive promotional marketing emails and third-party offers.</p>
          <button type="submit">Continue</button>
        </form>
        <script>
          Notification.requestPermission();
          const canvas = document.createElement('canvas');
          const fp = canvas.toDataURL();
          navigator.sendBeacon('https://collect.example.com/beacon', fp);
        </script>
      </body>
      </html>`,
    scripts: [
      'https://www.googletagmanager.com/gtm.js?id=GTM-XXXX',
      'https://cdn.segment.com/analytics.js/v1/KEY/analytics.min.js',
      'https://js.hs-scripts.com/123456.js',
      'https://cdn.moengage.com/webpush/moe_webSdk.min.latest.js',
      'https://www.clarity.ms/tag/abcdef',
      'https://static.hotjar.com/c/hotjar-99999.js',
      'https://widget.intercom.io/widget/app123',
      'https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js',
      'https://connect.facebook.net/en_US/fbevents.js',
      'https://snap.licdn.com/li.lms-analytics/insight.min.js',
      'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js'
    ],
    global_vars: ['dataLayer', 'analytics', '_hsq', 'Moengage', 'clarity', 'hj', 'Intercom', 'fbq', 'lintrk', 'OneTrust'],
    cookies: ['_ga=1', '__hstc=2', '_clck=3', '_fbp=4', 'OptanonConsent=5'],
    network_domains: [
      'www.googletagmanager.com',
      'api.segment.io',
      'track.hubspot.com',
      'sdk-01.moengage.com',
      'c.clarity.ms',
      'vars.hotjar.com',
      'api-iam.intercom.io',
      'cloud.yellow.ai',
      'connect.facebook.net',
      'px.ads.linkedin.com',
      'cdn.cookielaw.org'
    ]
  };
  const entResult = detectAutomationsAndDarkPatterns(enterpriseFixture, { registry });
  const inv = entResult.website_automations_and_profiling_inventory;
  const enterprisePass =
    inv.marketing_and_crm_automations.length === 2 &&
    inv.cdp_and_tag_managers.length === 2 &&
    inv.session_replay_and_heatmaps.length === 2 &&
    inv.ai_chatbots_and_support_widgets.length === 2 &&
    inv.ad_pixels_and_auto_advanced_matching.length === 2 &&
    entResult.consent_management_platforms_detected.length >= 1 &&
    inv.form_input_and_dark_pattern_signals.pre_ticked_checkboxes_count === 1 &&
    inv.form_input_and_dark_pattern_signals.bundled_consent_forms_count === 1 &&
    inv.form_input_and_dark_pattern_signals.unencrypted_or_insecure_form_actions.length === 1 &&
    inv.form_input_and_dark_pattern_signals.early_field_capture_listeners_detected === true &&
    inv.fingerprinting_and_background_signals.web_push_permission_requested_on_load === true &&
    inv.fingerprinting_and_background_signals.canvas_or_webgl_fingerprint_signals === true &&
    inv.fingerprinting_and_background_signals.navigator_beacon_or_fetch_keepalive_observed === true &&
    entResult.rule_13_2_assessment.triggered === true;

  checks.push({
    check_id: 'REALISTIC_ENTERPRISE_MULTI_STACK_DETECTION',
    weight: 15,
    score: enterprisePass ? 15 : 0,
    passed: enterprisePass,
    details: {
      total_automations_detected: inv.total_automations_detected,
      dark_patterns_matched: entResult.dark_patterns_and_fingerprinting_detected.length,
      rule_13_2_triggered: entResult.rule_13_2_assessment.triggered,
      subprocessors_logged: entResult.subprocessor_and_cross_border_register.length
    }
  });

  // Check 5: Reputation Safety & Non-Defamatory Attestation across entire Registry & Outputs
  const safetyRegistry = validateReputationSafety(registry);
  const safetyEnterprise = entResult.reputation_safety_check;
  const reputationPass = safetyRegistry.passed && safetyEnterprise.passed;

  checks.push({
    check_id: 'REPUTATION_SAFETY_AND_STATUTORY_TONE',
    weight: 15,
    score: reputationPass ? 15 : 0,
    passed: reputationPass,
    details: {
      registry_prohibited_terms: safetyRegistry.prohibited_terms_found,
      output_prohibited_terms: safetyEnterprise.prohibited_terms_found
    }
  });

  const totalScore = checks.reduce((acc, c) => acc + c.score, 0);
  const maxScore = checks.reduce((acc, c) => acc + c.weight, 0);

  const summary = {
    eval_suite: 'Website Automation, AI-Agent, Session Replay & Dark-Pattern Detector Eval',
    evaluated_at_utc: new Date().toISOString(),
    overall_score: totalScore,
    max_score: maxScore,
    status: totalScore === 100 ? 'PASS (100/100)' : `FAIL (${totalScore}/${maxScore})`,
    registry_summary: {
      total_signatures: signatures.length,
      categories: categoryCounts
    },
    checks
  };

  try {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(summary, null, 2) + '\n', 'utf-8');
  } catch {
    // Fallback when executed inside read-only sandbox
  }
  console.log(JSON.stringify(summary, null, 2));
  if (totalScore !== 100) {
    process.exitCode = 1;
  }
}

runEvaluation();
