#!/usr/bin/env node
/**
 * Automated Grounding, Zero-Hallucination & Reputation-Safety Evaluator
 * for the 8-Site Multi-Sector Indian Website Passive DPIA Benchmark Suite.
 *
 * Grades each of the 8 benchmark website reports on a 100-point rubric:
 *   1. Evidence Grounding (20 pts)
 *   2. Zero Hallucinations & Schema Fidelity (20 pts)
 *   3. Website Automation & Dark-Pattern Detection Accuracy (20 pts)
 *   4. Statutory Mapping (DPDPA 2023 & DPDP Rules 2025 G.S.R. 846(E)) (20 pts)
 *   5. Reputation-Safe Advisory Tone & Disclaimer Integrity (20 pts)
 *
 * Writes scorecard to: products/dpia-audit-skill/eval/live-benchmarks-eval-result.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BENCHMARK_TARGETS } from '../scripts/run_multi_sector_benchmarks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');
const BENCHMARKS_DIR = path.join(SKILL_ROOT, 'benchmarks');
const SCHEMA_PATH = path.join(SKILL_ROOT, 'schema', 'dpia-website-report.schema.json');
const OUTPUT_PATH = path.join(__dirname, 'live-benchmarks-eval-result.json');

const PROHIBITED_REPUTATION_TERMS = [
  /\billegal\b/i,
  /\bviolates\b/i,
  /\bviolation\b/i,
  /\bnon-compliant\b/i,
  /\blawbreaker\b/i,
  /\bguilty\b/i,
  /\bbreach of law\b/i,
  /\bunlawful\b/i,
  /\bcriminal\b/i,
  /\bpenalized\b/i,
  /\bfined\b/i,
  /\bsued\b/i,
  /\bnegligent\b/i,
  /\bmalicious\b/i,
  /\bfraudulent\b/i,
  /\bdeceptive\b/i
];

function evaluateSiteBenchmark(target, schema) {
  const slug = target.slug;
  const telemetryPath = path.join(BENCHMARKS_DIR, `${slug}.telemetry.json`);
  const reportJsonPath = path.join(BENCHMARKS_DIR, `${slug}.dpia-report.json`);
  const reportMdPath = path.join(BENCHMARKS_DIR, `${slug}.dpia-report.md`);

  const issues = [];

  if (!fs.existsSync(telemetryPath) || !fs.existsSync(reportJsonPath) || !fs.existsSync(reportMdPath)) {
    return {
      slug,
      url: target.url,
      sector: target.sector,
      total_score: 0,
      rubric_breakdown: {
        evidence_grounding_20: 0,
        zero_hallucinations_20: 0,
        automation_detection_20: 0,
        statutory_mapping_20: 0,
        reputation_safe_tone_20: 0
      },
      passed: false,
      issues: ['Missing telemetry, JSON report, or Markdown report file.']
    };
  }

  const telemetry = JSON.parse(fs.readFileSync(telemetryPath, 'utf8'));
  const report = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'));
  const markdown = fs.readFileSync(reportMdPath, 'utf8');

  // 1. Evidence Grounding (20 pts)
  let groundingScore = 20;
  if (report.report_metadata.target_url !== telemetry.target_url) {
    groundingScore -= 5;
    issues.push('target_url mismatch between telemetry and report.');
  }
  if (report.report_metadata.canonical_domain !== telemetry.canonical_domain) {
    groundingScore -= 5;
    issues.push('canonical_domain mismatch between telemetry and report.');
  }
  if (report.pre_consent_storage_and_cookies.first_party_cookies_count !== telemetry.cookies_summary.first_party_count) {
    groundingScore -= 5;
    issues.push('first_party_cookies_count does not match telemetry.');
  }
  if (report.pre_consent_storage_and_cookies.third_party_cookies_count !== telemetry.cookies_summary.third_party_count) {
    groundingScore -= 5;
    issues.push('third_party_cookies_count does not match telemetry.');
  }
  for (const finding of report.advisory_findings || []) {
    if (!finding.observed_technical_signal || finding.observed_technical_signal.trim().length < 15) {
      groundingScore -= 4;
      issues.push(`Finding ${finding.finding_id} lacks concrete observed_technical_signal.`);
    }
  }
  groundingScore = Math.max(0, groundingScore);

  // 2. Zero Hallucinations & Schema Fidelity (20 pts)
  let zeroHallucinationScore = 20;
  for (const reqKey of schema.required || []) {
    if (!(reqKey in report)) {
      zeroHallucinationScore -= 4;
      issues.push(`Missing required top-level schema key: ${reqKey}`);
    }
  }
  // Verify every cookie in report exists in raw telemetry
  const telemetryCookieNames = new Set((telemetry.cookies_summary.cookies || []).map(c => c.name));
  for (const ck of report.pre_consent_storage_and_cookies.cookies_inventory || []) {
    if (!telemetryCookieNames.has(ck.name)) {
      zeroHallucinationScore -= 5;
      issues.push(`Hallucinated cookie in report not present in telemetry: ${ck.name}`);
    }
  }
  // Verify every third-party domain in subprocessor register exists in raw telemetry
  const telemetry3pDomains = new Set((telemetry.scripts_and_third_parties.third_party_domains || []).map(d => d.domain));
  for (const sp of report.subprocessor_and_cross_border_register || []) {
    if (!telemetry3pDomains.has(sp.third_party_domain)) {
      zeroHallucinationScore -= 5;
      issues.push(`Hallucinated third-party domain in subprocessor register: ${sp.third_party_domain}`);
    }
  }
  zeroHallucinationScore = Math.max(0, zeroHallucinationScore);

  // 3. Automation & Dark-Pattern Detection Accuracy (20 pts)
  let automationScore = 20;
  const inv = report.website_automations_and_profiling_inventory;
  const telAuto = telemetry.detected_automations;
  if (!inv || inv.total_automations_detected !== telAuto.total_automations_detected) {
    automationScore -= 6;
    issues.push('total_automations_detected mismatch between telemetry and report inventory.');
  }
  const sumCategories =
    (inv.marketing_and_crm_automations?.length || 0) +
    (inv.cdp_and_tag_managers?.length || 0) +
    (inv.session_replay_and_heatmaps?.length || 0) +
    (inv.ai_chatbots_and_support_widgets?.length || 0) +
    (inv.ad_pixels_and_auto_advanced_matching?.length || 0);
  if (sumCategories !== inv.total_automations_detected) {
    automationScore -= 6;
    issues.push('Sum of automation category arrays does not equal total_automations_detected.');
  }
  if (inv.form_input_and_dark_pattern_signals.forms_inspected_count !== telemetry.consent_and_dark_pattern_signals.forms_inspected_count) {
    automationScore -= 4;
    issues.push('forms_inspected_count mismatch with telemetry.');
  }
  if (inv.form_input_and_dark_pattern_signals.pre_ticked_checkboxes_count !== telemetry.consent_and_dark_pattern_signals.pre_ticked_checkboxes_count) {
    automationScore -= 4;
    issues.push('pre_ticked_checkboxes_count mismatch with telemetry.');
  }
  automationScore = Math.max(0, automationScore);

  // 4. Statutory Mapping (DPDPA 2023 & DPDP Rules 2025 G.S.R. 846(E)) (20 pts)
  let statutoryScore = 20;
  const base = report.report_metadata?.statutory_baseline;
  if (!base || base.grievance_sla_days !== 90) {
    statutoryScore -= 5;
    issues.push('Statutory baseline must specify grievance_sla_days === 90 (Rule 14(3)).');
  }
  if (!base?.rules?.includes('G.S.R. 846(E)')) {
    statutoryScore -= 5;
    issues.push('Statutory baseline must cite G.S.R. 846(E) for DPDP Rules, 2025.');
  }
  const requiredPillars = [
    'section_5_rule_3_notice',
    'section_6_rule_3_4_consent_and_cmp',
    'section_8_5_rule_6_8_security_and_logs',
    'section_9_rules_10_11_children_safeguards',
    'section_10_rule_13_dpia_and_algorithmic_governance',
    'section_13_rule_14_3_grievance_and_dpo',
    'section_16_rule_15_cross_border_transfers'
  ];
  for (const pKey of requiredPillars) {
    if (!report.statutory_dpdpa_control_matrix?.[pKey]?.statutory_reference) {
      statutoryScore -= 3;
      issues.push(`Missing statutory_dpdpa_control_matrix pillar: ${pKey}`);
    }
  }
  statutoryScore = Math.max(0, statutoryScore);

  // 5. Reputation-Safe Advisory Tone & Disclaimer Integrity (20 pts)
  let reputationScore = 20;
  const serializedCombined = JSON.stringify(report) + '\n' + markdown;
  for (const pat of PROHIBITED_REPUTATION_TERMS) {
    const m = serializedCombined.match(pat);
    if (m) {
      reputationScore -= 5;
      issues.push(`Prohibited accusatory/defamatory term detected: "${m[0]}"`);
    }
  }
  if (report.report_metadata.assessment_framing !== 'Confidential & Constructive Advisory DPIA Readiness Assessment') {
    reputationScore -= 5;
    issues.push('Invalid assessment_framing.');
  }
  if (
    !report.reputation_safety_attestation?.zero_defamation_verified ||
    !report.reputation_safety_attestation?.prohibited_terms_absent ||
    !report.reputation_safety_attestation?.read_only_passive_inspection_confirmed
  ) {
    reputationScore -= 5;
    issues.push('Incomplete reputation_safety_attestation flags.');
  }
  reputationScore = Math.max(0, reputationScore);

  const totalScore = groundingScore + zeroHallucinationScore + automationScore + statutoryScore + reputationScore;

  return {
    slug,
    url: target.url,
    sector: target.sector,
    http_status: telemetry.http_response.status_code,
    cookies_observed: telemetry.cookies_summary.total_set_cookie_count,
    external_scripts_observed: telemetry.scripts_and_third_parties.total_external_scripts,
    third_party_domains_observed: telemetry.scripts_and_third_parties.third_party_domains_count,
    automations_detected: telemetry.detected_automations.total_automations_detected,
    dpia_readiness_score: report.executive_readiness_summary.overall_readiness_score_0_100,
    readiness_posture: report.executive_readiness_summary.readiness_posture,
    eval_score_100: totalScore,
    rubric_breakdown: {
      evidence_grounding_20: groundingScore,
      zero_hallucinations_20: zeroHallucinationScore,
      automation_detection_20: automationScore,
      statutory_mapping_20: statutoryScore,
      reputation_safe_tone_20: reputationScore
    },
    passed: totalScore === 100 && issues.length === 0,
    issues
  };
}

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const siteResults = BENCHMARK_TARGETS.map(target => evaluateSiteBenchmark(target, schema));
  const avgScore = Math.round(
    (siteResults.reduce((acc, r) => acc + r.eval_score_100, 0) / siteResults.length) * 100
  ) / 100;
  const allPassed = siteResults.every(r => r.passed);

  const scorecard = {
    suite: 'Live Multi-Sector Indian Website Passive DPIA Benchmark Suite (8 Websites)',
    evaluated_at_utc: new Date().toISOString(),
    total_sites_evaluated: siteResults.length,
    overall_eval_score_100: avgScore,
    all_sites_passed_100_percent: allPassed,
    rubric_weights: {
      evidence_grounding: 20,
      zero_hallucinations: 20,
      automation_detection: 20,
      statutory_mapping: 20,
      reputation_safe_tone: 20
    },
    site_evaluations: siteResults
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(scorecard, null, 2) + '\n', 'utf8');

  console.log('=== Live Multi-Sector DPIA Benchmark Evaluation Scorecard ===');
  for (const r of siteResults) {
    console.log(
      `[${r.passed ? 'PASS' : 'FAIL'}] ${r.slug.padEnd(20)} | Eval: ${r.eval_score_100}/100 | DPIA Readiness: ${r.dpia_readiness_score}/100 | HTTP ${r.http_status} | Cookies: ${r.cookies_observed} | Automations: ${r.automations_detected}`
    );
    if (r.issues.length > 0) {
      console.log(`       Issues: ${r.issues.join('; ')}`);
    }
  }
  console.log(`\nOverall Benchmark Eval Score: ${avgScore}/100 (All Passed: ${allPassed})`);
  console.log(`Scorecard written to: ${OUTPUT_PATH}`);

  if (!allPassed) {
    process.exit(1);
  }
}

main();
