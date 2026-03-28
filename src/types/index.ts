export type Intent =
  | "course_difficulty"
  | "grade_distribution"
  | "professor_rating"
  | "course_reviews"
  | "comparison"
  | "general_advice";

export type Complexity = "simple" | "complex";

/** Extracted slots from the user query (snake_case per API contract). */
export type Entities = {
  course_code?: string;
  /** Populated when comparing multiple courses (e.g. vs / or between two codes). */
  course_codes?: string[];
  professor_name?: string;
};

export type DataRequirements = {
  needsSQL: boolean;
  needsVector: boolean;
};

/** Full routing output from `resolveIntent` — drives SQL / vector fetches. */
export interface IntentResult {
  intent: Intent;
  entities: Entities;
  needsSQL: boolean;
  needsVector: boolean;
  complexity: Complexity;
}

export interface AskRequestBody {
  query: string;
}

export interface AskDebugPayload {
  intent: IntentResult;
  sqlSnippet?: unknown;
  vectorPreview: string[];
}

export interface AskResponseBody {
  answer: string;
  debug?: AskDebugPayload;
}

export interface CourseStats {
  average: string;
  failRate: number;
  sampleSize: number;
}

export interface ProfessorRating {
  name: string;
  overall: number;
  difficulty: number;
  wouldTakeAgain: number;
  sampleSize: number;
}
