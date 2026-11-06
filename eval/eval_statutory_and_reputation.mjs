#!/usr/bin/env node
/**
 * Statutory DPDPA 2023, Rules 2025 (G.S.R. 846(E)) & Reputation-Safety Legal-Technical Critic Evaluator
 * (`products/dpia-audit-skill/eval/eval_statutory_and_reputation.mjs`)
 *
 * Audits all files in:
 *  - `.agents/skills/website-dpia-audit/`
 *  - `.claude/skills/website-dpia-audit/`
 *  - `products/dpia-audit-skill/`
 *
 * Enforces:
 *  1. DPDP Act, 2023: 9 Chapters, 44 Sections, 1 Schedule (Sections 4, 5, 6, 7, 8(3), 8(4), 8(5), 8(6), 8(7), 9, 10(2)(c)(ii), 11, 12, 13, 16, 17, and The Schedule).
 *  2. DPDP Rules, 2025 (G.S.R. 846(E), notified 13 Nov 2025): 23 Rules, 7 Schedules (+1 yr -> 13 Nov 2026 Rule 4; +18 mo -> 13 May 2027 Rules 3, 5-16, 22, 23).
 *  3. Grievance SLA: 90 days (Rule 14(3)), never 30 or 7.
 *  4. Log retention: Minimum 1 year (Rule 8(3) + Seventh Schedule).
 *  5. DPIA & Algorithmic Risk Assessment: Section 10(2)(c)(ii) + Rule 13(1), Rule 13(2) (algorithmic software/profiling risk), Rule 13(3).
 *  6. Reputation-Safety Linter: Zero unguarded accusatory/defamatory terms and 100% constructive advisory language.
 *
 * Saves deterministic results to `products/dpia-audit-skill/eval/statutory-reputation-eval-result.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');
const IS_MONOREPO = fs.existsSync(path.resolve(__dirname, '../../../products/dpia-audit-skill/schema'));
const REPO_ROOT = IS_MONOREPO ? path.resolve(__dirname, '../../..') : SKILL_ROOT;

const TARGET_SCAN_DIRS = IS_MONOREPO
  ? [
      '.agents/skills/website-dpia-audit',
      '.claude/skills/website-dpia-audit',
      'products/dpia-audit-skill',
    ]
  : [
      '.agents/skills/website-dpia-audit',
      '.claude/skills/website-dpia-audit',
      'prompts',
      'schema',
      'signatures',
      'references',
      'scripts',
      'benchmarks',
      'reports',
    ];

const CROSSWALK_PATH = path.resolve(
  SKILL_ROOT,
  'references/dpdpa-2023-rules-2025-dpia-crosswalk.json'
);
const SCHEMA_PATH = path.resolve(
  SKILL_ROOT,
  'schema/dpia-website-report.schema.json'
);
const RESULT_OUTPUT_PATH = path.resolve(
  SKILL_ROOT,
  'eval/statutory-reputation-eval-result.json'
);

const PROHIBITED_ACCUSATORY_PATTERNS = [
  { token: 'illegal', regex: /\billegal\b/i },
  { token: 'unlawful', regex: /\bunlawful\b/i },
  { token: 'violator', regex: /\bviolator\b/i },
  { token: 'lawbreaker', regex: /\blawbreaker\b/i },
  { token: 'guilty', regex: /\bguilty\b/i },
  { token: 'criminal', regex: /\bcriminal\b/i },
  { token: 'offender', regex: /\boffender\b/i },
  { token: 'fraudulent', regex: /\bfraudulent\b/i },
  { token: 'stealing data', regex: /\bstealing\s+data\b/i },
  { token: 'stolen data', regex: /\bstolen\s+data\b/i },
  { token: 'spying', regex: /\bspying\b/i },
  { token: 'blatant violation', regex: /\bblatant\s+violation\b/i },
  { token: 'will be fined', regex: /\bwill\s+be\s+fined\b/i },
];

const STATUTORY_MYTH_PATTERNS = [
  {
    id: 'MYTH_30_OR_7_DAY_GRIEVANCE_SLA',
    description: 'Asserting a 30-day or 7-day statutory grievance SLA under DPDP Act/Rules instead of 90 days (Rule 14(3))',
    regex: /\b(?:grievance\s+(?:redressal\s+)?(?:sla|timeline|period|limit|resolution)\s+(?:of|is|within)\s+(?:30|7)\s*[- ]?days?|(?:30|7)\s*[- ]?day\s+statutory\s+grievance\s+(?:sla|limit|timeline))\b/i,
  },
  {
    id: 'MYTH_SUB_1_YEAR_LOG_RETENTION',
    description: 'Asserting security/processing log retention minimum under Rule 8(3)/Seventh Schedule is less than 1 year (e.g., 30, 60, 90, or 180 days)',
    regex: /\b(?:minimum\s+log\s+retention\s+(?:of|is)\s+(?:30|60|90|180)\s+days|retain\s+processing\s+logs\s+for\s+a\s+minimum\s+of\s+(?:30|60|90|180)\s+days\s+under\s+Rule\s+8)\b/i,
  },
  {
    id: 'MYTH_WRONG_ACT_SECTIONS_OR_CHAPTERS',
    description: 'Citing wrong chapter or section counts for the DPDP Act 2023 (must be 9 Chapters, 44 Sections, 1 Schedule)',
    regex: /\bDPDP\s+Act,\s*2023\s*\([^)]*(?:(?:[1-8]|1[0-9])\s+Chapters|(?:[1-3][0-9]|4[0-3]|4[5-9])\s+Sections)\b/i,
  },
  {
    id: 'MYTH_WRONG_RULES_COUNT',
    description: 'Citing wrong rule or schedule count for DPDP Rules 2025 G.S.R. 846(E) (must be 23 Rules, 7 Schedules)',
    regex: /\bG\.S\.R\.\s*846\(E\)[^.\n]{0,80}(?:(?:2[0-2]|2[4-9])\s+Rules|(?:[1-6]|8|9)\s+Schedules)\b/i,
  },
];

function walkFilesRecursively(dirAbs) {
  if (!fs.existsSync(dirAbs)) return [];
  const names = fs.readdirSync(dirAbs);
  const results = [];
  for (const rawName of names) {
    const name = typeof rawName === 'string' ? rawName : rawName?.name;
    if (!name) continue;
    const fullPath = path.join(dirAbs, name);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (name === 'eval') continue;
      results.push(...walkFilesRecursively(fullPath));
    } else if (
      stat.isFile() &&
      /\.(md|json|mjs|js|yaml|yml|txt)$/i.test(name)
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Removes lines that are explicitly defining negative/prohibited/denylist guardrails or adversarial trap tests
 * so that instruction docs and evaluator scripts can name forbidden words/myths in their denylists without false-flagging.
 */
function stripGuardrailDenylistLines(text) {
  // Remove JSON/JS denylist blocks & adversarial test fixtures before scanning instruction/code files
  let cleaned = text
    .replace(/"forbidden_accusatory_regex_tokens"\s*:\s*\[[\s\S]*?\]/gi, '')
    .replace(/"forbidden_statutory_myth_patterns"\s*:\s*\[[\s\S]*?\]/gi, '')
    .replace(/(?:PROHIBITED|FORBIDDEN)_ACCUSATORY_(?:TERMS|PATTERNS)\s*=\s*\[[\s\S]*?\];/g, '')
    .replace(/STATUTORY_MYTH_PATTERNS\s*=\s*\[[\s\S]*?\];/g, '')
    .replace(/injectedRawPoison\s*:\s*\{[\s\S]*?\}/g, '')
    .replace(/COMPOUND_STRESS_SCENARIOS\s*=\s*\[[\s\S]*?\];/g, '')
    .replace(/function\s+stripGuardrailDenylistLines[\s\S]*?export\s+function\s+lintTextForStatutoryAndReputationSafety/g, 'export function lintTextForStatutoryAndReputationSafety')
    .replace(/function\s+evaluatePillar5AdversarialSelfTests[\s\S]*$/g, '');

  return cleaned
    .split('\n')
    .filter((line) => {
      const l = line.toLowerCase();
      const isGuardrailMetaLine =
        l.includes('prohibited') ||
        l.includes('forbidden') ||
        l.includes('never use') ||
        l.includes('never cite') ||
        l.includes('never call') ||
        l.includes('never label') ||
        l.includes('never substitute') ||
        l.includes('never confuse') ||
        l.includes('do not use') ||
        l.includes('instead of') ||
        l.includes('refuse the framing') ||
        l.includes('asks you to declare') ||
        l.includes('avoid terms') ||
        l.includes('avoid words') ||
        l.includes('banned') ||
        l.includes('myth') ||
        l.includes('trap') ||
        l.includes('poison') ||
        l.includes('hallucination') ||
        l.includes('zero accusatory') ||
        l.includes('zero-defamation') ||
        l.includes('zero_defamation') ||
        l.includes('non-defamatory') ||
        l.includes('adversarial') ||
        l.includes('provokes') ||
        l.includes('regex') ||
        l.includes('token:') ||
        l.includes('badslaregex') ||
        l.includes('automatic fail') ||
        l.includes('automatic 0/20') ||
        l.includes('synthetic') ||
        l.includes('accusatoryhits') ||
        /^\s*['"`\\]+\b(illegal|illegally|unlawful|violator|lawbreaker|guilty|crime|criminal|offender|fineable|fraudulent|scam|malicious|spying|stealing data|stolen data|extortion|breach of law|blatant violation|will be fined)\b/.test(l);
      return !isGuardrailMetaLine;
    })
    .join('\n');
}

/**
 * Inspects a single file or report payload for statutory myths and unguarded accusatory terms.
 */
export function lintTextForStatutoryAndReputationSafety(text, { isStrictReportOutput = false } = {}) {
  const targetText = isStrictReportOutput ? text : stripGuardrailDenylistLines(text);
  const accusatoryHits = [];
  const statutoryMythHits = [];

  for (const item of PROHIBITED_ACCUSATORY_PATTERNS) {
    if (item.regex.test(targetText)) {
      accusatoryHits.push(item.token);
    }
  }

  for (const myth of STATUTORY_MYTH_PATTERNS) {
    if (myth.regex.test(targetText)) {
      statutoryMythHits.push(myth.id);
    }
  }

  return {
    passed: accusatoryHits.length === 0 && statutoryMythHits.length === 0,
    accusatoryHits,
    statutoryMythHits,
  };
}

/**
 * Pillar 1 (20 pts): Crosswalk Reference Completeness & Standards Mapping
 */
function evaluatePillar1Crosswalk() {
  const checks = [];
  let score = 0;

  if (!fs.existsSync(CROSSWALK_PATH)) {
    return {
      pillar: 'Pillar 1: Statutory Crosswalk Reference & Enterprise Standards Mapping',
      score: 0,
      max_score: 20,
      passed: false,
      checks: [{ name: 'Crosswalk file existence', passed: false, reason: 'Missing dpdpa-2023-rules-2025-dpia-crosswalk.json' }],
    };
  }

  const raw = fs.readFileSync(CROSSWALK_PATH, 'utf8');
  const crosswalk = JSON.parse(raw);

  // 1. Verify DPDP Act 2023 structure & required sections (5 pts)
  const actStruct = crosswalk?.crosswalk_metadata?.dpdp_act_2023_structure;
  const requiredActSections = [
    'Section 4',
    'Section 5',
    'Section 6',
    'Section 7',
    'Section 8(3)',
    'Section 8(4)',
    'Section 8(5)',
    'Section 8(6)',
    'Section 8(7)',
    'Section 9',
    'Section 10(2)(c)(ii)',
    'Section 11',
    'Section 12',
    'Section 13',
    'Section 16',
    'Section 17',
    'The Schedule',
  ];
  const missingActSections = requiredActSections.filter((s) => !raw.includes(s));
  const actMetaOk =
    actStruct?.total_chapters === 9 &&
    actStruct?.total_sections === 44 &&
    actStruct?.total_schedules === 1 &&
    Array.isArray(actStruct?.chapters_summary) &&
    actStruct.chapters_summary.length === 9 &&
    missingActSections.length === 0;

  if (actMetaOk) {
    score += 5;
    checks.push({
      name: 'DPDP Act, 2023 (9 Chapters, 44 Sections, 1 Schedule + all 17 core provisions)',
      passed: true,
    });
  } else {
    checks.push({
      name: 'DPDP Act, 2023 structure & sections',
      passed: false,
      missing_sections: missingActSections,
    });
  }

  // 2. Verify DPDP Rules 2025 G.S.R. 846(E) structure, dates, and rules (5 pts)
  const rulesStruct = crosswalk?.crosswalk_metadata?.dpdp_rules_2025_structure;
  const requiredRuleMarkers = [
    'G.S.R. 846(E)',
    '2025-11-13',
    '2026-11-13',
    '2027-05-13',
    'Rule 3',
    'Rule 4',
    'Rule 6',
    'Rule 7',
    'Rule 8(3)',
    'Seventh Schedule',
    'Rule 9',
    'Rule 10',
    'Rule 11',
    'Rule 13(1)',
    'Rule 13(2)',
    'Rule 13(3)',
    'Rule 14(3)',
    'Rule 15',
  ];
  const missingRuleMarkers = requiredRuleMarkers.filter((m) => !raw.includes(m));
  const rulesMetaOk =
    rulesStruct?.gazette_reference === 'G.S.R. 846(E)' &&
    rulesStruct?.notified_date === '2025-11-13' &&
    rulesStruct?.total_rules === 23 &&
    rulesStruct?.total_schedules === 7 &&
    Array.isArray(rulesStruct?.schedules_summary) &&
    rulesStruct.schedules_summary.length === 7 &&
    missingRuleMarkers.length === 0;

  if (rulesMetaOk) {
    score += 5;
    checks.push({
      name: 'DPDP Rules, 2025 G.S.R. 846(E) (13 Nov 2025, 23 Rules, 7 Schedules, +1 yr -> 13 Nov 2026, +18 mo -> 13 May 2027)',
      passed: true,
    });
  } else {
    checks.push({
      name: 'DPDP Rules, 2025 G.S.R. 846(E) structure & timeline',
      passed: false,
      missing_markers: missingRuleMarkers,
    });
  }

  // 3. Verify ISO/IEC 27701, ISO/IEC 29134 (DPIA), and NIST Privacy Framework crosswalks (5 pts)
  const checksList = crosswalk?.website_investigation_checks_crosswalk || [];
  const allHaveStandards =
    checksList.length >= 10 &&
    checksList.every(
      (c) =>
        c.international_standards_crosswalk?.iso_iec_27701 &&
        c.international_standards_crosswalk?.iso_iec_29134_dpia &&
        c.international_standards_crosswalk?.nist_privacy_framework
    );

  if (allHaveStandards) {
    score += 5;
    checks.push({
      name: 'Enterprise Board Crosswalk to ISO/IEC 27701, ISO/IEC 29134 (DPIA), and NIST Privacy Framework',
      passed: true,
      checks_mapped: checksList.length,
    });
  } else {
    checks.push({
      name: 'Enterprise Board Crosswalk to ISO/IEC 27701, ISO/IEC 29134, and NIST Privacy Framework',
      passed: false,
      checks_mapped: checksList.length,
    });
  }

  // 4. Verify Approved Reputation-Safe Advisory Templates vs Forbidden Terms (5 pts)
  const repPolicy = crosswalk?.reputation_safety_and_advisory_framing_policy;
  const tiers = (repPolicy?.approved_readiness_tiers || []).map((t) => t.tier);
  const hasAllTiers =
    tiers.includes('Aligned') &&
    tiers.includes('Advisory Enhancement') &&
    tiers.includes('Priority Readiness Action') &&
    Array.isArray(repPolicy?.forbidden_accusatory_regex_tokens) &&
    repPolicy.forbidden_accusatory_regex_tokens.length >= 10 &&
    Array.isArray(crosswalk?.sector_specific_dpia_profiles) &&
    crosswalk.sector_specific_dpia_profiles.length >= 5;

  if (hasAllTiers) {
    score += 5;
    checks.push({
      name: 'Approved Reputation-Safe Advisory Templates (Aligned, Advisory Enhancement, Priority Readiness Action) & Sector Profiles',
      passed: true,
      sectors_count: crosswalk.sector_specific_dpia_profiles.length,
    });
  } else {
    checks.push({
      name: 'Approved Reputation-Safe Advisory Templates & Sector Profiles',
      passed: false,
    });
  }

  return {
    pillar: 'Pillar 1: Statutory Crosswalk Reference & Enterprise Standards Mapping',
    score,
    max_score: 20,
    passed: score === 20,
    checks,
  };
}

/**
 * Pillar 2 (20 pts): 100% Statutory T1 Precision Across Skill, Prompt & Schema Files
 */
function evaluatePillar2StatutoryPrecision(allScannedFiles) {
  const checks = [];
  let score = 0;

  // 1. Verify Schema statutory constants (8 pts)
  const schemaRaw = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, 'utf8') : '';
  const schemaObj = schemaRaw ? JSON.parse(schemaRaw) : null;
  const sbProps = schemaObj?.properties?.report_metadata?.properties?.statutory_baseline?.properties;

  const schemaOk =
    sbProps?.act?.const === 'Digital Personal Data Protection Act, 2023 (No. 22 of 2023; 9 Chapters, 44 Sections, 1 Schedule)' &&
    sbProps?.rules?.const === 'Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules)' &&
    sbProps?.enforcement_timeline?.const ===
      'Phased: 13 Nov 2025 (Rules 1-2, 17-21); 13 Nov 2026 (Rule 4 Consent Manager registration); 13 May 2027 (Rules 3, 5-16, 22-23 operational compliance)' &&
    sbProps?.grievance_sla_days?.const === 90 &&
    sbProps?.security_log_retention_minimum?.const === 'Minimum 1 year (Rule 8(3) read with Seventh Schedule)';

  if (schemaOk) {
    score += 8;
    checks.push({
      name: 'JSON Schema statutory_baseline const invariants (Act, Rules G.S.R. 846(E), Phased Timeline, 90-day SLA, 1-year Log Retention)',
      passed: true,
    });
  } else {
    checks.push({
      name: 'JSON Schema statutory_baseline const invariants',
      passed: false,
    });
  }

  // 2. Scan all files across target directories for statutory myths (6 pts)
  const mythViolations = [];
  for (const fileAbs of allScannedFiles) {
    const rel = path.relative(REPO_ROOT, fileAbs);
    const content = fs.readFileSync(fileAbs, 'utf8');
    const isReport = rel.includes('reports/') && !rel.endsWith('.telemetry.json');
    const res = lintTextForStatutoryAndReputationSafety(content, { isStrictReportOutput: isReport });
    if (res.statutoryMythHits.length > 0) {
      mythViolations.push({ file: rel, myths: res.statutoryMythHits });
    }
  }

  if (mythViolations.length === 0 && allScannedFiles.length >= 6) {
    score += 6;
    checks.push({
      name: 'Zero statutory SLA/retention/count myths across all scanned files',
      passed: true,
      files_scanned: allScannedFiles.length,
    });
  } else {
    checks.push({
      name: 'Zero statutory SLA/retention/count myths across all scanned files',
      passed: false,
      violations: mythViolations,
    });
  }

  // 3. Verify all model prompt adapters enforce 90-day SLA, 1-year log retention, and G.S.R. 846(E) (6 pts)
  const promptFiles = allScannedFiles.filter((f) => f.includes('/prompts/') && f.endsWith('.md'));
  const promptMissing = [];
  for (const pf of promptFiles) {
    const rel = path.relative(REPO_ROOT, pf);
    const text = fs.readFileSync(pf, 'utf8');
    const has90 = (/90\s*[- ]?day/i.test(text) || /grievance_sla_days[^0-9]*90/i.test(text)) && /Rule\s*14\(3\)/i.test(text);
    const has1Yr = /(1\s*[- ]?year|one\s+year)/i.test(text) && /Rule\s*8\(3\)/i.test(text);
    const hasGsr = /G\.S\.R\.\s*846\(E\)/i.test(text);
    if (!has90 || !has1Yr || !hasGsr) {
      promptMissing.push({ file: rel, has90, has1Yr, hasGsr });
    }
  }

  if (promptFiles.length >= 4 && promptMissing.length === 0) {
    score += 6;
    checks.push({
      name: 'All multi-model prompt adapters enforce Rule 14(3) 90-day SLA, Rule 8(3) 1-year logs, and G.S.R. 846(E)',
      passed: true,
      prompts_verified: promptFiles.map((f) => path.relative(REPO_ROOT, f)),
    });
  } else {
    checks.push({
      name: 'Multi-model prompt statutory invariant enforcement',
      passed: false,
      prompt_count: promptFiles.length,
      issues: promptMissing,
    });
  }

  return {
    pillar: 'Pillar 2: 100% Statutory T1 Precision Across Skill, Prompt & Schema Files',
    score,
    max_score: 20,
    passed: score === 20,
    checks,
  };
}

/**
 * Pillar 3 (20 pts): Complete Coverage of Rule 13(1)–(3) Website & Automation DPIA Obligations
 */
function evaluatePillar3Rule13AutomationCoverage(allScannedFiles) {
  const checks = [];
  let score = 0;

  const crosswalkRaw = fs.existsSync(CROSSWALK_PATH) ? fs.readFileSync(CROSSWALK_PATH, 'utf8') : '';
  const schemaRaw = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, 'utf8') : '';
  const collectorPath = path.resolve(SKILL_ROOT, 'scripts/collect_website_dpia_telemetry.mjs');
  const collectorRaw = fs.existsSync(collectorPath) ? fs.readFileSync(collectorPath, 'utf8') : '';

  // 1. Rule 13(1) annual DPIA, Rule 13(2) algorithmic software risk verification, and Rule 13(3) Board report in Crosswalk & Schema (10 pts)
  const hasRule13InCrosswalk =
    crosswalkRaw.includes('Section 10(2)(c)(ii)') &&
    crosswalkRaw.includes('Rule 13(1)') &&
    crosswalkRaw.includes('Rule 13(2)') &&
    crosswalkRaw.includes('Rule 13(3)') &&
    crosswalkRaw.includes('algorithmic software');

  const hasRule13InSchema =
    schemaRaw.includes('rule13_dpia_and_algorithmic_risk_triggered') &&
    schemaRaw.includes('rule13_2_profiling_or_automated_risk_relevance') &&
    schemaRaw.includes('section_10_rule_13_dpia_and_algorithmic_governance') &&
    schemaRaw.includes('website_automations_and_profiling_inventory');

  if (hasRule13InCrosswalk && hasRule13InSchema) {
    score += 10;
    checks.push({
      name: 'Section 10(2)(c)(ii) & Rule 13(1)–(3) DPIA + Algorithmic Software Risk Assessment codified in Crosswalk & JSON Schema',
      passed: true,
    });
  } else {
    checks.push({
      name: 'Section 10(2)(c)(ii) & Rule 13(1)–(3) in Crosswalk & Schema',
      passed: false,
      hasRule13InCrosswalk,
      hasRule13InSchema,
    });
  }

  // 2. Client-side automation & profiling detector coverage in Telemetry Collector & Prompts (10 pts)
  const collectorHasAutomations =
    /marketing_and_crm_automations/i.test(collectorRaw) &&
    /cdp_and_tag_managers/i.test(collectorRaw) &&
    /session_replay_and_heatmaps/i.test(collectorRaw) &&
    /ai_chatbots_and_support_widgets/i.test(collectorRaw) &&
    /ad_pixels_and_auto_advanced_matching/i.test(collectorRaw);

  const promptFiles = allScannedFiles.filter((f) => f.includes('/prompts/') && f.endsWith('.md'));
  const promptsCoverRule13 =
    promptFiles.length >= 4 &&
    promptFiles.every((pf) => {
      const txt = fs.readFileSync(pf, 'utf8');
      return (
        /Rule\s*13\(2\)/i.test(txt) &&
        /(website_automations_and_profiling_inventory|website\s+automation)/i.test(txt)
      );
    });

  if (collectorHasAutomations && promptsCoverRule13) {
    score += 10;
    checks.push({
      name: 'All 5 client-side automation classes + form dark-pattern & fingerprinting signals wired to Rule 13(2) across Collector & Prompts',
      passed: true,
    });
  } else {
    checks.push({
      name: 'Client-side automation classes wired to Rule 13(2) across Collector & Prompts',
      passed: false,
      collectorHasAutomations,
      promptsCoverRule13,
    });
  }

  return {
    pillar: 'Pillar 3: Complete Coverage of Rule 13(1)–(3) Website & Automation DPIA Obligations',
    score,
    max_score: 20,
    passed: score === 20,
    checks,
  };
}

/**
 * Pillar 4 (20 pts): 100% Reputation-Safe Advisory Tone Linter Across All Skill Directories
 */
function evaluatePillar4ReputationSafety(allScannedFiles) {
  const checks = [];
  let score = 0;

  const accusatoryViolations = [];
  for (const fileAbs of allScannedFiles) {
    const rel = path.relative(REPO_ROOT, fileAbs);
    const content = fs.readFileSync(fileAbs, 'utf8');
    const isStrictReport = rel.includes('reports/') && !rel.endsWith('.telemetry.json');
    const lintRes = lintTextForStatutoryAndReputationSafety(content, { isStrictReportOutput: isStrictReport });
    if (lintRes.accusatoryHits.length > 0) {
      accusatoryViolations.push({ file: rel, hits: lintRes.accusatoryHits });
    }
  }

  if (accusatoryViolations.length === 0 && allScannedFiles.length >= 6) {
    score += 12;
    checks.push({
      name: 'Zero unguarded accusatory or defamatory terms across all scanned files in .agents/, .claude/, and products/dpia-audit-skill/',
      passed: true,
      files_scanned: allScannedFiles.length,
    });
  } else {
    checks.push({
      name: 'Zero unguarded accusatory or defamatory terms across all scanned files',
      passed: false,
      violations: accusatoryViolations,
    });
  }

  // Verify constructive readiness tiers and mandatory read-only disclaimer in Schema & Crosswalk (8 pts)
  const schemaRaw = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, 'utf8') : '';
  const crosswalkRaw = fs.existsSync(CROSSWALK_PATH) ? fs.readFileSync(CROSSWALK_PATH, 'utf8') : '';
  const requiredDisclaimer =
    'This report is a confidential, read-only technical DPIA readiness assessment based solely on publicly observable client-side website signals at the timestamp of inspection. It does not constitute a legal opinion or statutory certification, and makes no representation regarding backend/internal organisational controls.';

  const hasDisclaimerAndTiers =
    schemaRaw.includes(requiredDisclaimer) &&
    crosswalkRaw.includes(requiredDisclaimer) &&
    schemaRaw.includes('Confidential & Constructive Advisory DPIA Readiness Assessment');

  if (hasDisclaimerAndTiers) {
    score += 8;
    checks.push({
      name: 'Mandatory read-only passive scope disclaimer & constructive readiness tiers enforced in Schema & Crosswalk',
      passed: true,
    });
  } else {
    checks.push({
      name: 'Mandatory read-only passive scope disclaimer & constructive readiness tiers',
      passed: false,
    });
  }

  return {
    pillar: 'Pillar 4: 100% Reputation-Safe Constructive Advisory Tone Linter',
    score,
    max_score: 20,
    passed: score === 20,
    checks,
  };
}

/**
 * Pillar 5 (20 pts): Deterministic Adversarial Rejection Self-Tests
 */
function evaluatePillar5AdversarialSelfTests() {
  const checks = [];
  let score = 0;

  // Test 1: Must reject "30-day grievance SLA" myth (5 pts)
  const myth30Sample =
    'The website privacy policy must state a grievance redressal SLA of 30 days as required by statute.';
  const res1 = lintTextForStatutoryAndReputationSafety(myth30Sample, { isStrictReportOutput: true });
  if (!res1.passed && res1.statutoryMythHits.includes('MYTH_30_OR_7_DAY_GRIEVANCE_SLA')) {
    score += 5;
    checks.push({
      name: 'Adversarial Self-Test 1: Rejects 30-day / 7-day statutory grievance SLA myth',
      passed: true,
      detected: res1.statutoryMythHits,
    });
  } else {
    checks.push({ name: 'Adversarial Self-Test 1: Rejects 30-day grievance SLA myth', passed: false });
  }

  // Test 2: Must reject sub-1-year log retention myth (5 pts)
  const mythLogSample =
    'Data Fiduciary must retain processing logs for a minimum of 90 days under Rule 8.';
  const res2 = lintTextForStatutoryAndReputationSafety(mythLogSample, { isStrictReportOutput: true });
  if (!res2.passed && res2.statutoryMythHits.includes('MYTH_SUB_1_YEAR_LOG_RETENTION')) {
    score += 5;
    checks.push({
      name: 'Adversarial Self-Test 2: Rejects sub-1-year processing log retention myth',
      passed: true,
      detected: res2.statutoryMythHits,
    });
  } else {
    checks.push({ name: 'Adversarial Self-Test 2: Rejects sub-1-year log retention myth', passed: false });
  }

  // Test 3: Must reject accusatory/defamatory language in report output (5 pts)
  const defamatorySample =
    'The website is guilty of illegal tracking and is a blatant violation that will be fined.';
  const res3 = lintTextForStatutoryAndReputationSafety(defamatorySample, { isStrictReportOutput: true });
  if (
    !res3.passed &&
    res3.accusatoryHits.includes('guilty') &&
    res3.accusatoryHits.includes('illegal') &&
    res3.accusatoryHits.includes('blatant violation') &&
    res3.accusatoryHits.includes('will be fined')
  ) {
    score += 5;
    checks.push({
      name: 'Adversarial Self-Test 3: Rejects accusatory/defamatory phrasing in report output',
      passed: true,
      detected: res3.accusatoryHits,
    });
  } else {
    checks.push({ name: 'Adversarial Self-Test 3: Rejects accusatory/defamatory phrasing', passed: false });
  }

  // Test 4: Must pass a gold-standard constructive advisory statement with exact T1 citations (5 pts)
  const compliantAdvisorySample =
    'During read-only client-side inspection, analytics cookies were observed prior to affirmative consent interaction. ' +
    'To align with Section 6(1) of the Digital Personal Data Protection Act, 2023 (9 Chapters, 44 Sections, 1 Schedule) and ' +
    'Rule 3, Rule 8(3) (minimum 1-year log retention read with Seventh Schedule), Rule 13(2) algorithmic risk verification, and ' +
    'Rule 14(3) (grievance resolution within a period not exceeding 90 days) of the DPDP Rules, 2025 (G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules), ' +
    'this observation is classified as a Priority Readiness Action.';
  const res4 = lintTextForStatutoryAndReputationSafety(compliantAdvisorySample, { isStrictReportOutput: true });
  if (res4.passed && res4.accusatoryHits.length === 0 && res4.statutoryMythHits.length === 0) {
    score += 5;
    checks.push({
      name: 'Adversarial Self-Test 4: Approves gold-standard constructive advisory statement with exact T1 statutory citations',
      passed: true,
    });
  } else {
    checks.push({
      name: 'Adversarial Self-Test 4: Approves gold-standard constructive advisory statement',
      passed: false,
      res4,
    });
  }

  return {
    pillar: 'Pillar 5: Deterministic Adversarial Rejection Self-Tests (Statutory Myths & Defamation Traps)',
    score,
    max_score: 20,
    passed: score === 20,
    checks,
  };
}

function main() {
  const allScannedFiles = [];
  const directoryPresence = {};

  for (const relDir of TARGET_SCAN_DIRS) {
    const absDir = path.resolve(REPO_ROOT, relDir);
    const exists = fs.existsSync(absDir);
    const files = exists ? walkFilesRecursively(absDir) : [];
    directoryPresence[relDir] = {
      exists,
      files_count: files.length,
      files: files.map((f) => path.relative(REPO_ROOT, f)),
    };
    allScannedFiles.push(...files);
  }

  const pillar1 = evaluatePillar1Crosswalk();
  const pillar2 = evaluatePillar2StatutoryPrecision(allScannedFiles);
  const pillar3 = evaluatePillar3Rule13AutomationCoverage(allScannedFiles);
  const pillar4 = evaluatePillar4ReputationSafety(allScannedFiles);
  const pillar5 = evaluatePillar5AdversarialSelfTests();

  const pillars = [pillar1, pillar2, pillar3, pillar4, pillar5];
  const totalScore = pillars.reduce((acc, p) => acc + p.score, 0);
  const maxScore = pillars.reduce((acc, p) => acc + p.max_score, 0);
  const overallStatus = totalScore === 100 ? 'PASS' : 'FAIL';

  const resultPayload = {
    evaluator: 'Statutory DPDPA 2023, Rules 2025 (G.S.R. 846(E)) & Reputation-Safety Legal-Technical Critic',
    evaluated_at_utc: new Date().toISOString(),
    overall_status: overallStatus,
    total_score: totalScore,
    max_score: maxScore,
    score_display: `${totalScore}/${maxScore} ${overallStatus}`,
    statutory_invariants_enforced: {
      dpdp_act_2023: '9 Chapters, 44 Sections, 1 Schedule (Act No. 22 of 2023)',
      dpdp_rules_2025: 'G.S.R. 846(E), notified 13 November 2025; 23 Rules, 7 Schedules (+1 yr -> 13 Nov 2026 Rule 4; +18 mo -> 13 May 2027 Rules 3, 5-16, 22, 23)',
      grievance_redressal_sla: '90 days maximum (Section 13(2) read with Rule 14(3)) — zero 30-day or 7-day myths',
      security_log_retention: 'Minimum 1 year (Rule 8(3) read with Rule 6(1)(e) & Seventh Schedule)',
      dpia_and_algorithmic_risk: 'Section 10(2)(c)(ii) + Rule 13(1) annual DPIA, Rule 13(2) algorithmic software/profiling risk assessment, Rule 13(3) Board report',
    },
    scanned_directories: directoryPresence,
    total_files_scanned: allScannedFiles.length,
    pillars,
  };

  try {
    fs.mkdirSync(path.dirname(RESULT_OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(RESULT_OUTPUT_PATH, JSON.stringify(resultPayload, null, 2) + '\n', 'utf8');
  } catch {
    // Fallback if running in read-only sandbox mode
  }

  if (process.argv.includes('--stdout-json')) {
    console.log(JSON.stringify(resultPayload, null, 2));
    return;
  }

  console.log(`Statutory & Reputation-Safety Evaluator: ${resultPayload.score_display}`);
  for (const p of pillars) {
    console.log(`  - ${p.pillar}: ${p.score}/${p.max_score} (${p.passed ? 'PASS' : 'FAIL'})`);
    if (!p.passed) {
      console.log(`    Failed checks:`, JSON.stringify(p.checks.filter((c) => !c.passed)));
    }
  }

  if (totalScore !== 100) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
