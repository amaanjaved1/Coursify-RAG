export type IntentName =
  | "course_difficulty"
  | "grade_distribution"
  | "professor_rating"
  | "general_advice";

export type Complexity = "simple" | "complex";

export interface IntentEntities {
  courseCode?: string;
  professorName?: string;
}

export interface IntentResult {
  intent: IntentName;
  entities: IntentEntities;
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
