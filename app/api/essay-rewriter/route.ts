import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import { checkCredits, recordUsage } from '@/lib/credit-tracker';
import { auth } from '@clerk/nextjs/server';

interface EssayRewriteResult {
  original_text: string;
  rewritten_text: string;
  essay_type: string;
  academic_level: string;
  improvements: {
    structure: string[];
    content: string[];
    language: string[];
    citations: string[];
  };
  word_count: {
    original: number;
    rewritten: number;
  };
  readability_metrics: {
    grade_level: string;
    reading_ease: number;
    complexity_score: number;
  };
  plagiarism_risk: string;
  quality_score: number;
}

interface EssayRewriteRequest {
  text: string;
  essay_type: 'argumentative' | 'descriptive' | 'narrative' | 'expository' | 'persuasive' | 'analytical';
  academic_level: 'high_school' | 'undergraduate' | 'graduate' | 'professional';
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
    const creditCheck = await checkCredits({ toolName: 'essay-rewriter' });
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { text, essay_type, academic_level, vendor } = await req.json() as EssayRewriteRequest;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const essayTypeInstructions = {
      argumentative: "Present clear arguments with evidence, counterarguments, and logical reasoning.",
      descriptive: "Use vivid imagery, sensory details, and descriptive language to paint a clear picture.",
      narrative: "Tell a story with clear sequence, character development, and engaging plot.",
      expository: "Explain concepts clearly with facts, examples, and logical organization.",
      persuasive: "Convince readers with emotional appeals, logical arguments, and credible evidence.",
      analytical: "Break down complex topics, analyze components, and provide critical evaluation."
    };

    const academicLevelInstructions = {
      high_school: "Use clear, straightforward language appropriate for high school level. Simple sentence structures.",
      undergraduate: "Use college-level vocabulary and more complex sentence structures. Include academic references.",
      graduate: "Use advanced academic language, complex arguments, and scholarly tone. Include extensive citations.",
      professional: "Use professional terminology, industry-specific language, and expert-level analysis."
    };

    const prompt = `
      You are an expert essay rewriter specializing in academic writing. Rewrite the following essay to improve its quality while maintaining the original meaning and arguments.

      Original Essay:
      ${text}

      Essay Type: ${essay_type}
      Academic Level: ${academic_level}

      Essay Type Instructions: ${essayTypeInstructions[essay_type]}
      Academic Level Instructions: ${academicLevelInstructions[academic_level]}

      Return a JSON object with the following structure:
      {
        "original_text": "<original essay text>",
        "rewritten_text": "<completely rewritten essay>",
        "essay_type": "${essay_type}",
        "academic_level": "${academic_level}",
        "improvements": {
          "structure": ["<structural improvement1>", "<structural improvement2>"],
          "content": ["<content improvement1>", "<content improvement2>"],
          "language": ["<language improvement1>", "<language improvement2>"],
          "citations": ["<citation improvement1>", "<citation improvement2>"]
        },
        "word_count": {
          "original": <original word count>,
          "rewritten": <rewritten word count>
        },
        "readability_metrics": {
          "grade_level": "<appropriate grade level>",
          "reading_ease": <score from 0-100>,
          "complexity_score": <score from 1-10>
        },
        "plagiarism_risk": "<low/medium/high>",
        "quality_score": <score from 1-100>
      }

      Requirements:
      - Maintain the original thesis and main arguments
      - Improve essay structure and flow
      - Enhance vocabulary and sentence variety
      - Ensure proper academic formatting
      - Add transitional phrases for better coherence
      - Improve introduction and conclusion
      - Maintain appropriate tone for academic level
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: EssayRewriteResult = outputParser(responseText);

    // Record usage for successful processing
    await recordUsage({ toolName: 'essay-rewriter', success: true });

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error rewriting essay:", error);
    
    // Record usage for failed processing
    try {
      await recordUsage({ toolName: 'essay-rewriter', success: false });
    } catch (recordError) {
      console.error("Error recording usage:", recordError);
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}