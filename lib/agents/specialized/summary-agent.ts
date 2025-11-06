/**
 * Summary Agent
 * Specialized agent for generating conversation summaries
 */

import { geminiClient, GEMINI_MODEL } from "../config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SUMMARY_INSTRUCTIONS = `Analyze portfolio chat conversations and create executive summaries.`;

interface ConversationMessage {
  role: string;
  content: string;
  timestamp?: Date;
}

interface SummaryResult {
  executiveSummary: string;
  keyTopics: string[];
  interestLevel: "high" | "medium" | "low";
  toolsCalled: string[];
  recommendedAction: string;
  conversationLength: number;
  duration?: number;
}

export async function generateConversationSummary(
  messages: ConversationMessage[],
  toolsCalled: string[] = []
): Promise<SummaryResult> {
  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content || ''}`)
    .join("\n\n");

  const prompt = `Analyze this conversation and provide a structured summary:

CONVERSATION:
${conversationText}

TOOLS CALLED: ${toolsCalled.join(", ") || "None"}

Provide:
1. Executive Summary (2-3 sentences about what the visitor wanted)
2. Key Topics (list 3-5 main topics discussed)
3. Interest Level (high/medium/low based on question depth and engagement)
4. Recommended Action (what Abdul should do next)`;

  try {
    const response = await geminiClient.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: SUMMARY_INSTRUCTIONS } as ChatCompletionMessageParam,
        { role: "user", content: prompt } as ChatCompletionMessageParam,
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const summaryText = response.choices[0].message.content || "";

    const executiveSummary = extractSection(summaryText, "Executive Summary", "Key Topics");
    const keyTopics = extractListItems(summaryText, "Key Topics", "Interest Level");
    const interestLevelText = extractSection(summaryText, "Interest Level", "Recommended Action");
    const recommendedAction = extractSection(summaryText, "Recommended Action", null);

    const interestLevel = determineInterestLevel(interestLevelText, toolsCalled, messages.length);

    return {
      executiveSummary: executiveSummary.trim() || "Visitor inquired about portfolio and experience.",
      keyTopics: keyTopics.length > 0 ? keyTopics : ["General inquiry"],
      interestLevel,
      toolsCalled,
      recommendedAction: recommendedAction.trim() || "Monitor for follow-up questions.",
      conversationLength: messages.length,
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    
    return {
      executiveSummary: "Conversation summary generation failed. Please review full transcript.",
      keyTopics: ["Error in summary generation"],
      interestLevel: "medium",
      toolsCalled,
      recommendedAction: "Review conversation manually.",
      conversationLength: messages.length,
    };
  }
}

function extractSection(text: string, startMarker: string, endMarker: string | null): string {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return "";

  const contentStart = startIndex + startMarker.length;
  const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;

  return text.substring(contentStart, endIndex > -1 ? endIndex : text.length).trim();
}

function extractListItems(text: string, startMarker: string, endMarker: string): string[] {
  const section = extractSection(text, startMarker, endMarker);
  return section
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().match(/^\d+\./))
    .map((line) => line.replace(/^[-\d.]\s*/, "").trim())
    .filter((item) => item.length > 0);
}

function determineInterestLevel(
  levelText: string,
  toolsCalled: string[],
  messageCount: number
): "high" | "medium" | "low" {
  const lowerText = levelText.toLowerCase();

  const highSignals = [
    "high",
    "very interested",
    "eager",
    "availability",
    "schedule",
    "meeting",
    "contract",
    "hire",
  ];
  const lowSignals = ["low", "browsing", "casual", "brief", "quick"];

  const hasHighSignal = highSignals.some((signal) => lowerText.includes(signal));
  const hasLowSignal = lowSignals.some((signal) => lowerText.includes(signal));

  const highValueTools = ["schedule_meeting", "check_availability", "get_contact_info"];
  const calledHighValueTool = toolsCalled.some((tool) => highValueTools.includes(tool));

  if (hasHighSignal || calledHighValueTool || messageCount > 8) {
    return "high";
  } else if (hasLowSignal || messageCount < 3) {
    return "low";
  } else {
    return "medium";
  }
}
