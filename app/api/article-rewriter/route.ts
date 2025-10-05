import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import { checkCredits, recordUsage } from '@/lib/credit-tracker';
import { auth } from '@clerk/nextjs/server';



interface ArticleRewriteResult {
  original_text: string;
  rewritten_text: string;
  rewrite_style: string;
  changes_made: string[];
  word_count: {
    original: number;
    rewritten: number;
  };
  readability_score: {
    original: number;
    rewritten: number;
  };
  improvements: string[];
  uniqueness_percentage: number;
}

interface ArticleRewriteRequest {
  text: string;
  style: 'formal' | 'casual' | 'academic' | 'creative' | 'professional';
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const creditCheck = await checkCredits({ toolName: 'article-rewriter' });
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { text, style, vendor } = await req.json() as ArticleRewriteRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const styleInstructions = {
      formal: "Use formal language, professional tone, and structured sentences. Avoid contractions and colloquialisms.",
      casual: "Use conversational tone, simple language, and relatable examples. Include contractions where appropriate.",
      academic: "Use scholarly language, complex sentence structures, and academic terminology. Include proper citations format.",
      creative: "Use imaginative language, varied sentence structures, and engaging storytelling elements.",
      professional: "Use business-appropriate language, clear communication, and industry-standard terminology."
    };

    const prompt = `
      You are an expert article rewriter. Rewrite the following article in ${style} style while maintaining the original meaning and key information.

      Original Article:
      ${text}

      Style Instructions: ${styleInstructions[style]}

      Return a JSON object with the following structure:
      {
        "original_text": "<original article text>",
        "rewritten_text": "<completely rewritten article>",
        "rewrite_style": "${style}",
        "changes_made": ["<change1>", "<change2>", "<change3>"],
        "word_count": {
          "original": <original word count>,
          "rewritten": <rewritten word count>
        },
        "readability_score": {
          "original": <score from 1-100>,
          "rewritten": <score from 1-100>
        },
        "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
        "uniqueness_percentage": <percentage of uniqueness from original>
      }

      Requirements:
      - Maintain the original meaning and key points
      - Ensure the rewritten text is completely unique
      - Improve readability and flow
      - Use appropriate vocabulary for the selected style
      - Make substantial changes to sentence structure
      - Preserve important facts and data
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: ArticleRewriteResult = outputParser(responseText);

    // Record usage for successful rewrite
    await recordUsage({ toolName: 'article-rewriter' });

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error rewriting article:", error);
    
    // Record failed usage
    try {
      await recordUsage({ toolName: 'article-rewriter', success: false });
    } catch (recordError) {
      console.error('Failed to record usage:', recordError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}