/**
 * Chat API Endpoint
 * Handles chat messages and streams responses from the agent
 */

import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agents/main-agent";
import { validateUserInput } from "@/lib/agents/manager/conversation-manager";
import { sendEmail } from "@/lib/agents/email/sender";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs"; // Use Node.js runtime for OpenAI SDK

interface ChatRequest {
  message: string;
  conversationHistory?: ChatCompletionMessageParam[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Check guardrail for special messages
    const guardrailCheck = await validateUserInput(message);

    // Handle "message for Abdul" - send immediate notification
    if (guardrailCheck.action === "accept_and_notify") {
      console.log("MESSAGE FOR ABDUL detected - sending immediate notification");
      
      const urgentEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">URGENT: Message for You</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A visitor wants to send you a private message</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0;">Message Content:</h3>
            <p style="font-size: 16px; line-height: 1.6;">${message}</p>
          </div>

          ${guardrailCheck.isSensitive ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Contains Sensitive Information</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This message may contain passwords, secrets, or private data</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>Received: ${new Date().toLocaleString()}</p>
            <p>Intent: ${guardrailCheck.intent}</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: "abdulrasheedibrahim47@gmail.com",
        subject: `URGENT: Private Message from Portfolio Visitor${guardrailCheck.isSensitive ? ' (SENSITIVE)' : ''}`,
        html: urgentEmailHtml,
      });

      const agentResponse = "Got it! I've passed your message directly to Abdul. He'll see it right away. Is there anything else you'd like to know about his work in the meantime?";
      
      return NextResponse.json({
        message: agentResponse,
        conversationHistory: [
          ...conversationHistory,
          { role: "user", content: message },
          { role: "assistant", content: agentResponse }
        ],
        toolsCalled: ["urgent_notification"],
        usage: {}
      });
    }

    // Run the agent normally
    const result = await runAgent(message, conversationHistory);

    return NextResponse.json({
      message: result.message,
      conversationHistory: result.conversationHistory,
      toolsCalled: result.toolsCalled || [],
      usage: result.usage
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Check for specific error types
    if (error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid API key. Please check your GOOGLE_API_KEY environment variable." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An error occurred while processing your message" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
