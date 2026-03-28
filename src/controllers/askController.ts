import type { Request, Response } from "express";
import { resolveIntent } from "../services/intent/intentService";
import { getCourseStats } from "../services/sql/sqlService";
import { searchSimilar } from "../services/vector/vectorService";
import { buildContext } from "../services/prompt/contextBuilder";
import { generateAnswer } from "../services/llm/llmService";
import { parseAskBody } from "../utils/validateAskBody";
import type { AskDebugPayload, AskResponseBody, IntentResult } from "../types";

function courseCodesForSql(resolved: IntentResult): string[] {
  if (resolved.entities.course_codes?.length) {
    return resolved.entities.course_codes;
  }
  if (resolved.entities.course_code) {
    return [resolved.entities.course_code];
  }
  return [];
}

async function fetchStructuredData(resolved: IntentResult): Promise<Record<string, unknown> | undefined> {
  if (!resolved.needsSQL) return undefined;

  const codes = courseCodesForSql(resolved);
  if (codes.length === 0) return undefined;

  const statsList = await Promise.all(codes.map((c) => getCourseStats(c)));
  if (codes.length === 1) {
    return { courseStats: statsList[0] };
  }
  return {
    courseStatsByCourse: Object.fromEntries(codes.map((c, i) => [c, statsList[i]])),
  };
}

export async function askHandler(req: Request, res: Response): Promise<void> {
  try {
    const { query } = parseAskBody(req.body);
    const intent = resolveIntent(query);

    const sqlPromise = fetchStructuredData(intent);
    const vectorPromise = intent.needsVector ? searchSimilar(query) : Promise.resolve([]);

    const [sqlData, vectorResults] = await Promise.all([sqlPromise, vectorPromise]);

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
