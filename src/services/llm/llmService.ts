import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config";

const SYSTEM_PROMPT =
  "You are a helpful academic assistant. Use provided data. Do not hallucinate.";

export async function generateAnswer(prompt: string): Promise<string> {
  const key = config.geminiApiKey;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim();
}
