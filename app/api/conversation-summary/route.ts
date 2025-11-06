import { NextRequest, NextResponse } from "next/server";
import { processConversation, getSummaryOnly } from "@/lib/agents/manager/conversation-manager";

/**
 * POST /api/conversation-summary
 * Process conversation and optionally send email summary
 * 
 * Body:
 * - messages: Array of conversation messages
 * - toolsCalled: Array of tool names called during conversation
 * - recipientEmail: (optional) Email to send summary to
 * - previewOnly: (optional) If true, returns summary without sending email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, toolsCalled = [], recipientEmail, previewOnly = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Preview mode: return summary without sending email
    if (previewOnly) {
      const summary = await getSummaryOnly(messages, toolsCalled);
      return NextResponse.json({ summary, emailSent: false });
    }

    // Full processing mode: generate summary, score, and optionally send email
    const result = await processConversation(messages, toolsCalled, recipientEmail);

    return NextResponse.json({
      summary: result.summary,
      score: result.score,
      emailSent: result.emailSent,
      processingTime: result.processingTime,
    });
  } catch (error: any) {
    console.error("Error processing conversation summary:", error);
    return NextResponse.json(
      { error: "Failed to process conversation", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversation-summary
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "conversation-summary",
    agents: ["summary-agent", "scorer-agent", "guardrail-agent"],
    version: "1.0.0",
  });
}
