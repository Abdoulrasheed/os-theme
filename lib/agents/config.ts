import OpenAI from "openai";

export const MODEL_PROVIDER = (process.env.MODEL_PROVIDER || "openai").toLowerCase();

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

function createClient() {
  if (MODEL_PROVIDER === "gemini") {
    return new OpenAI({
      baseURL: GEMINI_BASE_URL,
      apiKey: process.env.GOOGLE_API_KEY!,
    });
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

export const GEMINI_MODEL = MODEL_PROVIDER === "openai" ? "gpt-4o-mini" : "gemini-2.0-flash-exp";
export const geminiClient = createClient();

export const AGENT_CONFIG = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
};

export function validateEnv() {
  const required = MODEL_PROVIDER === "gemini" 
    ? ["GOOGLE_API_KEY"]
    : ["OPENAI_API_KEY"];
  
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${MODEL_PROVIDER}: ${missing.join(", ")}\n` +
      "Please add the required API key to your .env file.\n" +
      `Current provider: ${MODEL_PROVIDER} (set MODEL_PROVIDER=openai or MODEL_PROVIDER=gemini to change)`
    );
  }
}
