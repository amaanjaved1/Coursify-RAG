import type { AskRequestBody } from "../types";

export function parseAskBody(body: unknown): AskRequestBody {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid JSON body");
  }
  const q = (body as { query?: unknown }).query;
  if (typeof q !== "string" || !q.trim()) {
    throw new Error('Missing or invalid "query" string');
  }
  return { query: q.trim() };
}
