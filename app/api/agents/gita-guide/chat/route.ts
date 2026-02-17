import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting (use session ID or user ID in production)
    const identifier = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'anonymous';

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { question, user_level = 'beginner', context = null } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question is too long. Please keep it under 500 characters.' },
        { status: 400 }
      );
    }

    // Path to the Python agent (process.cwd() is /Volumes/External/AIAgents when running Next.js)
    const agentPath = path.join(process.cwd(), 'agents', 'gita-guide', 'agent.py');

    // Prepare arguments
    const args = [
      agentPath,
      '--question', question,
    ];

    // Add optional context
    if (context && context.trim().length > 0) {
      args.push('--context', context.substring(0, 1000)); // Limit context length
    }

    // Execute the Python agent
    const pythonProcess = spawn('python3', args);

    let stdout = '';
    let stderr = '';

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Wait for process to complete
    const result = await new Promise<string>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python process stderr:', stderr);
          reject(new Error(`Agent process exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });

      // Timeout after 90 seconds (PostgreSQL queries + LLM calls take time)
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Agent execution timed out'));
      }, 90000);
    });

    // Find the JSON output file path from stdout
    const outputMatch = result.match(/Output saved to: (.+\.json)/);
    if (!outputMatch) {
      throw new Error('Could not find output file path in agent response');
    }

    const outputPath = outputMatch[1].trim();

    // Read the output file
    const fs = require('fs').promises;
    const outputData = await fs.readFile(outputPath, 'utf8');
    const agentOutput = JSON.parse(outputData);

    // Format response for the chat interface
    const response = {
      answer: {
        teaching: agentOutput.output_result.answer,
        executive_summary: agentOutput.output_result.executive_summary,
        explanation: agentOutput.output_result.explanation,
        verse_references: agentOutput.output_result.relevant_verses.map((verse: any) => ({
          chapter: verse.chapter,
          verse: verse.verse_number,
          sanskrit_text: verse.sanskrit_text,
          transliteration: verse.transliteration,
          translation: verse.english_translation,
          relevance: verse.relevance_to_question
        })),
        related_topics: agentOutput.output_result.related_topics,
        suggested_questions: agentOutput.output_result.suggested_next_questions
      },
      execution_time_ms: agentOutput.output_result.execution_trace.reduce(
        (sum: number, step: any) => sum + (step.duration_ms || 0),
        0
      )
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in gita-guide chat endpoint:', error);

    return NextResponse.json(
      {
        error: 'Failed to process your question. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
