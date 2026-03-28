import type { IntentResult } from "../../types";

export interface ContextBuilderInput {
  userQuery: string;
  intent: IntentResult;
  sqlData: unknown;
  vectorResults: string[];
}

export function buildContext(input: ContextBuilderInput): string {
  const structured =
    input.sqlData === undefined || input.sqlData === null
      ? "(No structured rows for this query.)"
      : JSON.stringify(input.sqlData, null, 2);

  const opinions =
    input.vectorResults.length === 0
      ? "(No student opinion snippets retrieved.)"
      : input.vectorResults.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return `User Question:
${input.userQuery}

Detected intent: ${input.intent.intent}
Entities: ${JSON.stringify(input.intent.entities)}
Complexity: ${input.intent.complexity}

Structured Data:
${structured}

Student Opinions:
${opinions}

Instructions:
Answer using only the structured data and student opinions above when they are relevant. If data is missing, say so briefly and give general study advice without inventing statistics or ratings.`;
}
