import { geminiClient, GEMINI_MODEL } from "../config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const EMAIL_COMPOSER_INSTRUCTIONS = `You are an email composer specializing in creating clear, concise HTML emails for conversation summaries.

Your task is to take conversation analysis data and create a simple, well-formatted HTML email.

Guidelines:
1. Keep it simple and clean - no fancy designs
2. Use clear headings and sections
3. Make important information stand out (scores, interest level)
4. Include the full conversation transcript
5. Be professional but not overly formal

Structure:
- Subject line (clear and informative)
- Quality score/category (prominent)
- Executive summary
- Key topics
- Tools used (if any)
- Recommended action
- Full transcript

Keep the HTML clean and readable in email clients.`;;

interface EmailComposerInput {
  executiveSummary: string;
  keyTopics: string[];
  interestLevel: string;
  toolsCalled: string[];
  recommendedAction: string;
  score: number;
  category: string;
  conversationLength: number;
  fullTranscript: Array<{ role: string; content: string; timestamp?: Date }>;
}

export async function composeEmail(data: EmailComposerInput): Promise<{
  subject: string;
  html: string;
}> {
  const prompt = `Create a simple HTML email for this conversation summary:

QUALITY SCORE: ${data.score}/10 (${data.category})
INTEREST LEVEL: ${data.interestLevel}

EXECUTIVE SUMMARY:
${data.executiveSummary}

KEY TOPICS:
${data.keyTopics.map((t) => `- ${t}`).join("\n")}

TOOLS CALLED: ${data.toolsCalled.join(", ") || "None"}

RECOMMENDED ACTION:
${data.recommendedAction}

FULL TRANSCRIPT (${data.conversationLength} messages):
${data.fullTranscript
  .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n\n")}

Generate:
1. SUBJECT LINE (one line, clear and informative)
2. HTML EMAIL BODY (simple, clean HTML)

Format your response as:
SUBJECT: [subject line here]

HTML:
[html content here]`;

  try {
    const response = await geminiClient.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: EMAIL_COMPOSER_INSTRUCTIONS } as ChatCompletionMessageParam,
        { role: "user", content: prompt } as ChatCompletionMessageParam,
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "";

    // Extract subject and HTML
    const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?=\n|$)/i);
    const htmlMatch = content.match(/HTML:\s*([\s\S]+)/i);

    const subject = subjectMatch
      ? subjectMatch[1].trim()
      : `Portfolio Chat Summary - Score: ${data.score}/10`;

    const html = htmlMatch
      ? htmlMatch[1].trim()
      : generateFallbackHTML(data);

    return {
      subject,
      html: cleanHTML(html),
    };
  } catch (error) {
    console.error("Error composing email:", error);
    return {
      subject: `Portfolio Chat Summary - Score: ${data.score}/10`,
      html: generateFallbackHTML(data),
    };
  }
}

function cleanHTML(html: string): string {
  // Remove markdown code blocks if present
  return html
    .replace(/```html\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

function generateFallbackHTML(data: EmailComposerInput): string {
  const scoreColor = data.score >= 7 ? "#10b981" : data.score >= 4 ? "#f59e0b" : "#6b7280";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    .score { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .score-value { font-size: 24px; font-weight: bold; color: ${scoreColor}; }
    .section { margin: 20px 0; }
    ul { padding-left: 20px; }
    .transcript { background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; }
    .message { padding: 10px; margin: 8px 0; border-left: 3px solid #e5e7eb; }
    .message.user { border-left-color: #3b82f6; }
    .message.assistant { border-left-color: #6b7280; }
    .role { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #6b7280; }
  </style>
</head>
<body>
  <h2>Portfolio Chat Summary</h2>
  
  <div class="score">
    <div class="score-value">${data.score}/10 - ${data.category.toUpperCase()}</div>
    <div>Interest Level: <strong>${data.interestLevel.toUpperCase()}</strong></div>
  </div>

  <div class="section">
    <h3>Summary</h3>
    <p>${data.executiveSummary}</p>
  </div>

  <div class="section">
    <h3>Key Topics</h3>
    <ul>
      ${data.keyTopics.map((topic) => `<li>${topic}</li>`).join("")}
    </ul>
  </div>

  ${
    data.toolsCalled.length > 0
      ? `
  <div class="section">
    <h3>Tools Used</h3>
    <p>${data.toolsCalled.join(", ")}</p>
  </div>
  `
      : ""
  }

  <div class="section">
    <h3>Recommended Action</h3>
    <p>${data.recommendedAction}</p>
  </div>

  <div class="transcript">
    <h3>Full Transcript (${data.conversationLength} messages)</h3>
    ${data.fullTranscript
      .map(
        (msg) => `
      <div class="message ${msg.role}">
        <div class="role">${msg.role}</div>
        <div>${msg.content}</div>
      </div>
    `
      )
      .join("")}
  </div>

  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
    Auto-generated by your AI Portfolio Assistant
  </p>
</body>
</html>
  `.trim();
}
