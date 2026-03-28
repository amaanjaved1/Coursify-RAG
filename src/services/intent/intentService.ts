import type { Complexity, IntentEntities, IntentName, IntentResult } from "../../types";

const COURSE_CODE_RE = /\b([A-Z]{3,4})\s?(\d{3})\b/g;

function extractCourseCodes(query: string): string[] {
  const codes: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(COURSE_CODE_RE.source, COURSE_CODE_RE.flags);
  while ((m = re.exec(query)) !== null) {
    codes.push(`${m[1]} ${m[2]}`);
  }
  return [...new Set(codes)];
}

function extractProfessorName(query: string): string | undefined {
  const prof = query.match(/\b(?:prof|professor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (prof?.[1]) return prof[1].trim();
  const titled = query.match(/\b(?:Dr\.|Dr)\s+([A-Z][a-z]+)/i);
  if (titled?.[1]) return titled[1].trim();
  return undefined;
}

function inferComplexity(query: string, courseCodes: string[]): Complexity {
  if (query.length > 200) return "complex";
  if (courseCodes.length > 1) return "complex";
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length > 40) return "complex";
  return "simple";
}

function pickIntent(lower: string): IntentName {
  const difficultyHints = /\b(hard|difficult|difficulty|easy|tough|rigor|workload)\b/;
  const gradeHints = /\b(average|grade|gpa|curve|distribution|median)\b/;
  const profHints = /\b(prof|professor|teacher|instructor|rating|rate my prof|ratemyprof)\b/;

  if (difficultyHints.test(lower) && !gradeHints.test(lower)) return "course_difficulty";
  if (gradeHints.test(lower)) return "grade_distribution";
  if (profHints.test(lower)) return "professor_rating";
  return "general_advice";
}

export function resolveIntent(query: string): IntentResult {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const courseCodes = extractCourseCodes(trimmed);
  const intent = pickIntent(lower);

  const entities: IntentEntities = {};
  if (courseCodes[0]) entities.courseCode = courseCodes[0];
  const prof = extractProfessorName(trimmed);
  if (prof) entities.professorName = prof;

  if (intent === "professor_rating" && !entities.professorName) {
    const nameOnly = trimmed.match(/\b(?:is|was)\s+([A-Z][a-z]+)\s+good\b/i);
    if (nameOnly?.[1]) entities.professorName = nameOnly[1];
  }

  return {
    intent,
    entities,
    complexity: inferComplexity(trimmed, courseCodes),
  };
}
