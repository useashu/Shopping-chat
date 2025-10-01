import { NextRequest, NextResponse } from 'next/server';
import { processChatMessage } from '@/lib/ai-agent';
import { checkRateLimit } from '@/lib/security';

/**
 * POST /api/chat
 * Main chat endpoint for AI agent interactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    // Validate request
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Basic rate limiting (in production, use Redis or similar)
    const clientIp = request.ip || 'unknown';
    if (!checkRateLimit(clientIp, 10, 1)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    // Validate message length
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long. Please keep it under 500 characters.' },
        { status: 400 }
      );
    }

    // Validate conversation history
    const history = conversationHistory || [];
    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: 'Invalid conversation history format' },
        { status: 400 }
      );
    }

    // Process with AI agent
    const response = await processChatMessage(message, history);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'I apologize for the technical issue. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send chat messages.' },
    { status: 405 }
  );
}