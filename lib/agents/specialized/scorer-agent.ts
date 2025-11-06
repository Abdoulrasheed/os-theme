/**
 * Scorer Agent
 * Specialized agent for scoring conversation quality and lead value
 */

import { geminiClient, GEMINI_MODEL } from "../config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { geminiClient, GEMINI_MODEL } from "../config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SCORER_INSTRUCTIONS = `Evaluate portfolio conversations and assign quality scores.;

interface ScoringResult {
  score: number;
  category: "high-value" | "medium-value" | "low-value";
  reasoning: string;
  signals: string[];
}

export async function scoreConversation(
  messages: Array<{ role: string; content: string }>,
  toolsCalled: string[]
): Promise<ScoringResult> {
  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const prompt = `Score this conversation from 0-10 for lead quality:

CONVERSATION:
${conversationText}

TOOLS CALLED: ${toolsCalled.join(", ") || "None"}

Provide:
1. Score (0-10)
2. Category (high-value/medium-value/low-value)
3. Reasoning (2-3 sentences)
4. Key Signals (list positive or negative indicators you noticed)`;

  try {
    const response = await geminiClient.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: SCORER_INSTRUCTIONS } as ChatCompletionMessageParam,
        { role: "user", content: prompt } as ChatCompletionMessageParam,
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const scoreText = response.choices[0].message.content || "";
    
    const scoreMatch = scoreText.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : calculateFallbackScore(messages, toolsCalled);

    const category = score >= 7 ? "high-value" : score >= 4 ? "medium-value" : "low-value";

    return {
      score: Math.min(10, Math.max(0, score)),
      category,
      reasoning: extractReasoning(scoreText),
      signals: extractSignals(scoreText, toolsCalled),
    };
  } catch (error) {
    console.error("Error scoring conversation:", error);
    return calculateFallbackScore(messages, toolsCalled);
  }
}

function extractReasoning(text: string): string {
  const reasoningMatch = text.match(/reasoning[:\s]*(.*?)(?=key signals|$)/i);
  return reasoningMatch
    ? reasoningMatch[1].trim()
    : "Conversation analyzed based on engagement level and topics discussed.";
}

function extractSignals(text: string, toolsCalled: string[]): string[] {
  const signalsMatch = text.match(/key signals[:\s]*(.*?)$/i);
  const signals = signalsMatch
    ? signalsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^[-\d.]\s*/, "").trim())
        .filter((item) => item.length > 0)
    : [];

  if (toolsCalled.length > 0) {
    signals.push(`Called ${toolsCalled.length} tool(s): ${toolsCalled.join(", ")}`);
  }

  return signals.length > 0 ? signals : ["Standard conversation flow"];
}

function calculateFallbackScore(
  messages: Array<{ role: string; content: string }>,
  toolsCalled: string[]
): ScoringResult {
  let score = 5;

  const messageCount = messages.filter((m) => m.role === "user").length;
  if (messageCount > 5) score += 1;
  if (messageCount > 8) score += 1;

  const highValueTools = ["schedule_meeting", "check_availability", "get_contact_info"];
  const calledHighValueTool = toolsCalled.some((tool) => highValueTools.includes(tool));
  if (calledHighValueTool) score += 2;

  if (toolsCalled.length > 3) score += 1;

  const conversationText = messages.map((m) => m.content.toLowerCase()).join(" ");
  if (conversationText.includes("hire") || conversationText.includes("available")) score += 1;
  if (conversationText.includes("meeting") || conversationText.includes("schedule")) score += 1;
  if (conversationText.includes("contract") || conversationText.includes("project")) score += 1;

  if (messageCount === 1) score -= 2;

  const finalScore = Math.min(10, Math.max(0, score));
  const category = finalScore >= 7 ? "high-value" : finalScore >= 4 ? "medium-value" : "low-value";

  return {
    score: finalScore,
    category,
    reasoning: `Calculated based on ${messageCount} messages and ${toolsCalled.length} tool calls.`,
    signals: toolsCalled.length > 0 ? toolsCalled : ["Basic interaction"],
  };
}
