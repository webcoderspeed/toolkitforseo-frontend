import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import { checkCredits, recordUsage } from '@/lib/credit-tracker';
import { auth } from '@clerk/nextjs/server';



interface SentenceRephrase {
  original_sentence: string;
  rephrased_sentence: string;
  style: string;
  changes_made: string[];
  improvement_type: string;
  readability_improvement: number;
}

interface SentenceRephraseResult {
  original_sentence: string;
  rephrase_options: SentenceRephrase[];
  best_option: SentenceRephrase;
  style_applied: string;
  word_count: {
    original: number;
    average_rephrased: number;
  };
  readability_scores: {
    original: number;
    best_rephrased: number;
  };
  suggestions: string[];
}

interface SentenceRephraseRequest {
  sentence: string;
  style: 'formal' | 'casual' | 'academic' | 'creative' | 'concise' | 'detailed';
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
    const creditCheck = await checkCredits({ toolName: 'sentence-rephraser' });
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { sentence, style, vendor } = await req.json() as SentenceRephraseRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!sentence) {
      return NextResponse.json({ error: "Sentence is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const styleInstructions = {
      formal: "Use formal language, professional tone, and structured phrasing. Avoid contractions.",
      casual: "Use conversational tone, simple language, and relaxed phrasing. Include contractions where natural.",
      academic: "Use scholarly language, precise terminology, and complex sentence structures.",
      creative: "Use imaginative language, varied sentence structures, and engaging expressions.",
      concise: "Make the sentence shorter and more direct while maintaining meaning.",
      detailed: "Expand the sentence with more descriptive language and additional context."
    };

    const prompt = `
      You are an expert sentence rephraser. Rephrase the following sentence in multiple ways using the ${style} style.

      Original Sentence:
      ${sentence}

      Style Instructions: ${styleInstructions[style]}

      Return a JSON object with the following structure:
      {
        "original_sentence": "<original sentence>",
        "rephrase_options": [
          {
            "original_sentence": "<original sentence>",
            "rephrased_sentence": "<rephrased version 1>",
            "style": "${style}",
            "changes_made": ["<change1>", "<change2>"],
            "improvement_type": "<type of improvement made>",
            "readability_improvement": <score from -10 to +10>
          },
          {
            "original_sentence": "<original sentence>",
            "rephrased_sentence": "<rephrased version 2>",
            "style": "${style}",
            "changes_made": ["<change1>", "<change2>"],
            "improvement_type": "<type of improvement made>",
            "readability_improvement": <score from -10 to +10>
          },
          {
            "original_sentence": "<original sentence>",
            "rephrased_sentence": "<rephrased version 3>",
            "style": "${style}",
            "changes_made": ["<change1>", "<change2>"],
            "improvement_type": "<type of improvement made>",
            "readability_improvement": <score from -10 to +10>
          }
        ],
        "best_option": {
          "original_sentence": "<original sentence>",
          "rephrased_sentence": "<best rephrased version>",
          "style": "${style}",
          "changes_made": ["<change1>", "<change2>"],
          "improvement_type": "<type of improvement made>",
          "readability_improvement": <score from -10 to +10>
        },
        "style_applied": "${style}",
        "word_count": {
          "original": <original word count>,
          "average_rephrased": <average word count of rephrased options>
        },
        "readability_scores": {
          "original": <score from 0-100>,
          "best_rephrased": <score from 0-100>
        },
        "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
      }

      Requirements:
      - Provide 3 different rephrasing options
      - Maintain the original meaning
      - Apply the specified style consistently
      - Identify the best option based on clarity and style
      - Explain what changes were made
      - Calculate readability improvements
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: SentenceRephraseResult = outputParser(responseText);

    // Record successful usage
    await recordUsage({ toolName: 'sentence-rephraser' });

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error rephrasing sentence:", error);
    
    // Record failed usage
    try {
      await recordUsage({ toolName: 'sentence-rephraser', success: false });
    } catch (recordError) {
      console.error("Error recording usage:", recordError);
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}