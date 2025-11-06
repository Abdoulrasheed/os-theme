import { geminiClient, GEMINI_MODEL, validateEnv } from "./config";
import { tools, toolExecutors } from "./tools";
import { validateUserInput } from "./manager/conversation-manager";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

validateEnv();

let conversationToolsCalled: string[] = [];

const SYSTEM_INSTRUCTIONS = `You are Abdul's AI representative - you ARE Abdul speaking directly to visitors.

Always speak in FIRST PERSON:
- Good: "I'm a senior software engineer..."
- Good: "I'd be happy to discuss..."
- Good: "My experience includes..."
- Avoid: "Abdul is...", "He has...", "Abdul would..."

TOOL USAGE:
Always use tools to get accurate, specific information. Never make up details about projects, skills, or experience.

When asked about:
- Open source: use get_opensource_contributions tool
- Skills: use assess_skills tool
- Projects: use showcase_portfolio or get_project_details tool
- Availability: use check_availability tool
- Contact: use get_contact_info tool

Your personality:
- Friendly, approachable, and professional
- Enthusiastic about technology and problem-solving
- Direct and honest - don't oversell
- Helpful and eager to connect
- Concise - keep responses 2-4 sentences unless details are needed

Your background (speak about this as YOUR experience):
- 10+ years as a Senior Software Engineer
- Active CPython contributor
- Expert in Python, C, JavaScript, TypeScript
- Strong in Django, React, React Native
- Passionate about scalable systems, TDD, and mentoring
- Built systems serving thousands of users
- Mentored 50+ developers

Guidelines:
1. Be conversational and natural
2. Use tools first for specific information, then summarize naturally
3. Show genuine interest in the visitor's needs
4. Keep responses concise (2-4 sentences) unless details are requested
5. Offer next steps when relevant
6. Redirect off-topic questions politely to your expertise
7. Always maintain first-person perspective
8. If asked for "something nice" or "a secret", share a fun fact briefly

Special requests handling:
- "Tell me something nice/interesting" - share a personal insight or fun fact
- "Tell me a secret" - share a quirky tech preference or interesting project detail
- "One more thing" - offer additional relevant information
- These are continuation signals, not goodbye signals

Let the tools provide the facts, you provide the personality and conversation.`;

export async function createChatCompletion(messages: ChatCompletionMessageParam[]) {
  try {
    const response = await geminiClient.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTIONS } as ChatCompletionMessageParam,
        ...messages
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response;
  } catch (error) {
    console.error("Error creating chat completion:", error);
    throw error;
  }
}

export async function processToolCalls(toolCalls: any[]) {
  const toolResults = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    const executor = toolExecutors[functionName];
    if (!executor) {
      toolResults.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify({ error: "Tool not found" })
      });
      continue;
    }

    try {
      const result = await executor(functionArgs);
      toolResults.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: typeof result === 'string' ? result : JSON.stringify(result)
      });
    } catch (error: any) {
      toolResults.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify({ error: error.message })
      });
    }
  }

  return toolResults;
}

export async function runAgent(
  userMessage: string, 
  conversationHistory: ChatCompletionMessageParam[] = []
) {
  const guardrailResult = await validateUserInput(userMessage);
  
  let systemHint = "";
  if (guardrailResult.action === "soft-redirect") {
    systemHint = "\n\nGently guide conversation back to professional topics if appropriate.";
  } else if (guardrailResult.action === "hard-redirect") {
    systemHint = "\n\nThis question is off-topic. Politely redirect to your professional expertise.";
  } else if (guardrailResult.action === "block") {
    return {
      message: "I appreciate your message, but I'm here to discuss my professional experience and projects. How can I help you with information about my work?",
      conversationHistory: [
        ...conversationHistory,
        { role: "user", content: userMessage },
        { role: "assistant", content: "I appreciate your message, but I'm here to discuss my professional experience and projects. How can I help you with information about my work?" }
      ] as ChatCompletionMessageParam[],
      toolsCalled: [],
    };
  }

  const messages: ChatCompletionMessageParam[] = [
    ...conversationHistory, 
    { role: "user", content: userMessage }
  ];

  const toolsCalled: string[] = [];

  let response = await createChatCompletion(messages);
  let choice = response.choices[0];

  while (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    for (const toolCall of choice.message.tool_calls) {
      const functionName = (toolCall as any).function?.name;
      if (functionName) {
        toolsCalled.push(functionName);
        conversationToolsCalled.push(functionName);
      }
    }

    messages.push(choice.message as ChatCompletionMessageParam);

    const toolResults = await processToolCalls(choice.message.tool_calls);
    messages.push(...toolResults as ChatCompletionMessageParam[]);

    response = await createChatCompletion(messages);
    choice = response.choices[0];
  }

  return {
    message: choice.message.content,
    conversationHistory: [
      ...messages,
      { role: "assistant", content: choice.message.content || "" } as ChatCompletionMessageParam
    ],
    toolsCalled,
    usage: response.usage
  };
}

export function getConversationToolsCalled(): string[] {
  return [...conversationToolsCalled];
}

export function resetConversationTools(): void {
  conversationToolsCalled = [];
}
