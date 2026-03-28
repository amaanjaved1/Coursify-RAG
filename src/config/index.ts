import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT) || 3000;

export const config = {
  port,
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
} as const;
