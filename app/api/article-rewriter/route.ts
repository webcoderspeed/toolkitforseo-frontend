import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { API_KEY } from "@/constants";

if (!API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}

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
    const { text, style, vendor } = await req.json() as ArticleRewriteRequest;

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
      api_key: API_KEY!,
      prompt,
    });

    const parsedResults: ArticleRewriteResult = outputParser(responseText);

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error rewriting article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}