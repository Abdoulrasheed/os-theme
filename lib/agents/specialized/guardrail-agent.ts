import { geminiClient, GEMINI_MODEL } from "../config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const GUARDRAIL_INSTRUCTIONS = `You are a content moderation and relevance analyzer for a professional portfolio chat.

Your role is to evaluate incoming messages for:

1. SAFETY: Flag harmful, abusive, or inappropriate content
2. RELEVANCE: Determine if the message relates to Abdul's portfolio, skills, experience, or professional services
3. INTENT: Classify the user's intent

RELEVANCE SCALE (0-10):
10: Highly relevant (asking about specific projects, skills, availability, scheduling)
7-9: Relevant (general questions about experience, technologies)
4-6: Somewhat relevant (tangentially related to tech/career)
1-3: Low relevance (off-topic but not harmful)
0: Completely irrelevant or inappropriate

INTENT CATEGORIES:
- professional_inquiry: Asking about work, skills, experience
- job_opportunity: Recruiting, hiring, contract work
- collaboration: Partnership or project collaboration
- learning: Seeking advice or mentorship
- social: Casual conversation
- message_for_abdul: User wants to send a private message/note to Abdul (passwords, secrets, personal info)
- spam: Promotional or irrelevant content
- harmful: Inappropriate or abusive content

SPECIAL HANDLING - Messages for Abdul:
If the user says things like:
- "Tell Abdul that..."
- "Let Abdul know..."
- "Pass this message to Abdul..."
- "My password is..."
- "Here's some sensitive info..."
- "I want to share something private..."

Mark as intent: "message_for_abdul" and action: "accept_and_notify"
These should be captured and sent to Abdul via email immediately.

Respond with:
1. Relevance score (0-10)
2. Intent category
3. Action (allow/soft-redirect/hard-redirect/block/accept_and_notify)
4. Suggested response (if redirect needed)
5. Is sensitive (true if contains passwords, secrets, private info)`;

interface GuardrailResult {
  relevanceScore: number;
  intent: string;
  action: "allow" | "soft-redirect" | "hard-redirect" | "block" | "accept_and_notify";
  suggestedResponse?: string;
  flagged: boolean;
  isSensitive?: boolean;
  reason?: string;
}

export async function checkInputGuardrail(userMessage: string): Promise<GuardrailResult> {
  const prompt = `Analyze this user message:

MESSAGE: "${userMessage}"

Provide:
1. Relevance Score (0-10): How relevant is this to Abdul's portfolio?
2. Intent: What is the user trying to do?
3. Action: Should we allow, soft-redirect, hard-redirect, or block?
4. Suggested Response: If redirecting, what should the agent say?`;

  try {
    const response = await geminiClient.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: GUARDRAIL_INSTRUCTIONS } as ChatCompletionMessageParam,
        { role: "user", content: prompt } as ChatCompletionMessageParam,
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const analysisText = response.choices[0].message.content || "";

    const scoreMatch = analysisText.match(/relevance score[:\s]*(\d+)/i);
    const relevanceScore = scoreMatch ? parseInt(scoreMatch[1], 10) : analyzeFallback(userMessage).relevanceScore;

    const intentMatch = analysisText.match(/intent[:\s]*([a-z_]+)/i);
    const intent = intentMatch ? intentMatch[1] : "professional_inquiry";

    const actionMatch = analysisText.match(/action[:\s]*(allow|soft-redirect|hard-redirect|block|accept_and_notify)/i);
    const action = (actionMatch?.[1] as GuardrailResult["action"]) || determineAction(relevanceScore, userMessage);

    const sensitiveMatch = analysisText.match(/is sensitive[:\s]*(true|false)/i);
    const isSensitive = sensitiveMatch?.[1] === "true" || checkIfSensitive(userMessage);

    const suggestedMatch = analysisText.match(/suggested response[:\s]*(.*?)(?=\n\n|$)/i);
    const suggestedResponse = suggestedMatch?.[1]?.trim();

    return {
      relevanceScore: Math.min(10, Math.max(0, relevanceScore)),
      intent,
      action,
      isSensitive,
      suggestedResponse: action !== "allow" && action !== "accept_and_notify" ? suggestedResponse : undefined,
      flagged: action === "block",
      reason: action === "block" ? "Content flagged as inappropriate or spam" : undefined,
    };
  } catch (error) {
    console.error("Guardrail check error:", error);
    return analyzeFallback(userMessage);
  }
}

function determineAction(relevanceScore: number, message: string): GuardrailResult["action"] {
  // Check for message-for-abdul patterns
  if (checkIfMessageForAbdul(message)) {
    return "accept_and_notify";
  }
  
  if (relevanceScore >= 7) return "allow";
  if (relevanceScore >= 4) return "soft-redirect";
  if (relevanceScore >= 1) return "hard-redirect";
  return "block";
}

function checkIfMessageForAbdul(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const messagePatterns = [
    "tell abdul",
    "let abdul know",
    "pass this to abdul",
    "give abdul",
    "message for abdul",
    "abdul should know",
  ];
  
  return messagePatterns.some(pattern => lowerMessage.includes(pattern));
}

function checkIfSensitive(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const sensitiveKeywords = [
    "password",
    "secret",
    "private",
    "confidential",
    "sensitive",
    "don't share",
    "between us",
  ];
  
  return sensitiveKeywords.some(keyword => lowerMessage.includes(keyword));
}

function analyzeFallback(userMessage: string): GuardrailResult {
  const lowerMessage = userMessage.toLowerCase();

  const harmfulKeywords = ["hack", "exploit", "illegal", "abuse"];
  const isHarmful = harmfulKeywords.some((keyword) => lowerMessage.includes(keyword));

  if (isHarmful) {
    return {
      relevanceScore: 0,
      intent: "harmful",
      action: "block",
      flagged: true,
      reason: "Content flagged as potentially harmful",
    };
  }

  const professionalKeywords = [
    "experience",
    "project",
    "skill",
    "work",
    "hire",
    "available",
    "contact",
    "resume",
    "portfolio",
  ];
  const relevantCount = professionalKeywords.filter((keyword) => lowerMessage.includes(keyword)).length;

  const relevanceScore = Math.min(10, relevantCount * 2 + 3);

  return {
    relevanceScore,
    intent: "professional_inquiry",
    action: determineAction(relevanceScore, userMessage),
    flagged: false,
  };
}
