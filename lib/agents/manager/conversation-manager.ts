import { generateConversationSummary } from "../specialized/summary-agent";
import { scoreConversation } from "../specialized/scorer-agent";
import { checkInputGuardrail } from "../specialized/guardrail-agent";
import { composeEmail } from "../specialized/email-composer-agent";
import { sendEmail } from "../email/sender";

interface ConversationMessage {
  role: string;
  content: string;
  timestamp?: Date;
}

interface ProcessedConversation {
  summary: {
    executiveSummary: string;
    keyTopics: string[];
    interestLevel: "high" | "medium" | "low";
    toolsCalled: string[];
    recommendedAction: string;
    conversationLength: number;
  };
  score: {
    score: number;
    category: "high-value" | "medium-value" | "low-value";
    reasoning: string;
    signals: string[];
  };
  emailSent: boolean;
  processingTime: number;
}

export async function processConversation(
  messages: ConversationMessage[],
  toolsCalled: string[] = [],
  recipientEmail?: string
): Promise<ProcessedConversation> {
  const startTime = Date.now();

  // Run summary and scoring in parallel to save time
  const [summary, score] = await Promise.all([
    generateConversationSummary(messages, toolsCalled),
    scoreConversation(messages, toolsCalled),
  ]);

  let emailSent = false;
  if (recipientEmail) {
    const combinedData = {
      ...summary,
      score: score.score,
      category: score.category,
      fullTranscript: messages,
    };

    const emailContent = await composeEmail(combinedData);
    
    emailSent = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }

  const processingTime = Date.now() - startTime;

  return {
    summary,
    score,
    emailSent,
    processingTime,
  };
}

export async function validateUserInput(userMessage: string) {
  const result = await checkInputGuardrail(userMessage);
  return result;
}

export async function getSummaryOnly(
  messages: ConversationMessage[],
  toolsCalled: string[] = []
) {
  // Run both AI calls in parallel
  const [summary, score] = await Promise.all([
    generateConversationSummary(messages, toolsCalled),
    scoreConversation(messages, toolsCalled),
  ]);

  return {
    ...summary,
    score: score.score,
    category: score.category,
    reasoning: score.reasoning,
    signals: score.signals,
  };
}
