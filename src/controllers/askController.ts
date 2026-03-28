import type { Request, Response } from "express";
import { resolveIntent } from "../services/intent/intentService";
import { getCourseStats, getProfessorRatings } from "../services/sql/sqlService";
import { searchSimilar } from "../services/vector/vectorService";
import { buildContext } from "../services/prompt/contextBuilder";
import { generateAnswer } from "../services/llm/llmService";
import { parseAskBody } from "../utils/validateAskBody";
import type { AskDebugPayload, AskResponseBody } from "../types";

function needsCourseStats(intent: string): boolean {
  return intent === "course_difficulty" || intent === "grade_distribution";
}

export async function askHandler(req: Request, res: Response): Promise<void> {
  try {
    const { query } = parseAskBody(req.body);
    const intent = resolveIntent(query);

    const sqlPromise = (async () => {
      const out: Record<string, unknown> = {};
      if (needsCourseStats(intent.intent) && intent.entities.courseCode) {
        out.courseStats = await getCourseStats(intent.entities.courseCode);
      }
      if (intent.intent === "professor_rating" && intent.entities.professorName) {
        out.professorRatings = await getProfessorRatings(intent.entities.professorName);
      }
      return Object.keys(out).length ? out : undefined;
    })();

    const [vectorResults, sqlData] = await Promise.all([searchSimilar(query), sqlPromise]);

    const prompt = buildContext({
      userQuery: query,
      intent,
      sqlData,
      vectorResults,
    });

    const answer = await generateAnswer(prompt);

    const includeDebug = req.query.debug === "1";
    const payload: AskResponseBody = { answer };
    if (includeDebug) {
      const debug: AskDebugPayload = {
        intent,
        sqlSnippet: sqlData,
        vectorPreview: vectorResults,
      };
      payload.debug = debug;
    }

    res.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    const status = message.includes("Invalid") || message.includes("Missing") ? 400 : 500;
    res.status(status).json({ error: message });
  }
}
