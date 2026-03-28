import type { Complexity, DataRequirements, Entities, Intent, IntentResult } from "../../types";

/**
 * Which backends each intent should use. SQL = structured stats; vector = opinions / RMP / Reddit.
 */
export const intentDataMap: Record<Intent, DataRequirements> = {
  course_difficulty: { needsSQL: true, needsVector: true },
  grade_distribution: { needsSQL: true, needsVector: false },
  professor_rating: { needsSQL: false, needsVector: true },
  course_reviews: { needsSQL: false, needsVector: true },
  comparison: { needsSQL: true, needsVector: true },
  general_advice: { needsSQL: false, needsVector: true },
};

const STANDARD_CODE_RE = /\b([A-Z]{3,4})\s?(\d{3})\b/g;

/**
 * Finds course codes in free text. Normalizes glued / lowercase forms (e.g. "cisc121" → "CISC 121").
 * Uses the spec pattern on an uppercased copy: /[A-Z]{3,4}\s?\d{3}/g
 */
export function extractCourseCodes(query: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (dept: string, num: string) => {
    const code = `${dept.toUpperCase()} ${num}`;
    if (!seen.has(code)) {
      seen.add(code);
      ordered.push(code);
    }
  };

  const upper = query.toUpperCase();
  let m: RegExpExecArray | null;
  const re = new RegExp(STANDARD_CODE_RE.source, "g");
  while ((m = re.exec(upper)) !== null) {
    push(m[1], m[2]);
  }

  return ordered;
}

/**
 * Light-touch professor name extraction (deterministic; not full NER).
 * Prefix matching is case-insensitive; captured names are case-sensitive so words like "good" are not absorbed.
 */
export function extractProfessorName(query: string): string | null {
  const prof = query.match(/\b(?:[Pp]rof(?:essor)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  if (prof?.[1]) return prof[1].trim();
  const titled = query.match(/\b(?:[Dd]r\.?)\s+([A-Z][a-z]+)\b/);
  if (titled?.[1]) return titled[1].trim();
  return null;
}

/**
 * Rule-based intent. Order matters: comparison is checked before grade/difficulty/etc.
 * "or" counts as comparison only when at least two course codes are present (avoids noise from "hard or easy").
 */
export function classifyIntent(normalizedLower: string, courseCodeCount: number): Intent {
  const hasVs = /\bvs\.?\b|\bversus\b/i.test(normalizedLower);
  const hasCompareWord =
    /\bcompare\b|\bcomparison\b|\bcomparing\b/i.test(normalizedLower);
  const orAsComparison = /\bor\b/i.test(normalizedLower) && courseCodeCount >= 2;

  if (hasVs || hasCompareWord || orAsComparison) {
    return "comparison";
  }

  // Broad program questions (no specific course code) — before "easy" would map to difficulty.
  if (
    courseCodeCount === 0 &&
    (/\belectives?\b/i.test(normalizedLower) ||
      /\bfirst\s+year\b/i.test(normalizedLower) ||
      /\bwhat\s+courses\b/i.test(normalizedLower))
  ) {
    return "general_advice";
  }

  // Structured grade / outcome stats (includes explicit fail-rate phrasing).
  if (
    /\b(average|grade|gpa|mark)\b/.test(normalizedLower) ||
    /\bfail\s+rate\b/i.test(normalizedLower)
  ) {
    return "grade_distribution";
  }
  if (/\b(hard|difficulty|easy|manageable)\b/.test(normalizedLower)) {
    return "course_difficulty";
  }
  if (/\b(prof|professor|teaching)\b/.test(normalizedLower)) {
    return "professor_rating";
  }
  if (/\b(reviews?|opinions?|think|say)\b/.test(normalizedLower)) {
    return "course_reviews";
  }

  return "general_advice";
}

/**
 * Length / multi-clause heuristic for downstream prompting or routing.
 */
export function detectComplexity(trimmedQuery: string): Complexity {
  const words = trimmedQuery.trim().split(/\s+/).filter(Boolean);
  if (words.length > 12) return "complex";
  if (/\band\b/i.test(trimmedQuery) || /\bor\b/i.test(trimmedQuery)) {
    return "complex";
  }
  return "simple";
}

function buildEntities(trimmed: string, codes: string[]): Entities {
  const entities: Entities = {};
  const prof = extractProfessorName(trimmed);

  if (codes.length === 1) {
    entities.course_code = codes[0];
  } else if (codes.length >= 2) {
    entities.course_codes = [...codes];
  }

  if (prof) {
    entities.professor_name = prof;
  } else {
    const nameOnly = trimmed.match(/\b(?:[Ii]s|[Ww]as)\s+([A-Z][a-z]+)\s+good\b/);
    if (nameOnly?.[1]) {
      entities.professor_name = nameOnly[1];
    }
  }

  return entities;
}

/**
 * End-to-end intent resolution: normalize → entities → intent → data flags → complexity.
 * Fully deterministic (no LLM).
 */
export function resolveIntent(query: string): IntentResult {
  const trimmed = query.trim();
  const normalizedLower = trimmed.toLowerCase();
  const codes = extractCourseCodes(trimmed);
  const intent = classifyIntent(normalizedLower, codes.length);
  const entities = buildEntities(trimmed, codes);
  const { needsSQL, needsVector } = intentDataMap[intent];

  return {
    intent,
    entities,
    needsSQL,
    needsVector,
    complexity: detectComplexity(trimmed),
  };
}
