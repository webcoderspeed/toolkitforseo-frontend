import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import { checkCredits, recordUsage } from '@/lib/credit-tracker';
import { auth } from '@clerk/nextjs/server';



interface GrammarError {
  text: string;
  suggestion: string;
  type: string;
  position: {
    start: number;
    end: number;
  };
}

interface GrammarCheckResult {
  original_text: string;
  corrected_text: string;
  errors: GrammarError[];
  score: number; // 0-100, higher is better
}

interface GrammarCheckRequest {
  text: string;
  settings?: {
    check_type?: 'basic' | 'advanced' | 'academic';
  };
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
    const creditCheck = await checkCredits({ toolName: 'grammar-check' });
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { text, settings, vendor } = await req.json() as GrammarCheckRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const checkType = settings?.check_type || 'basic';
    
    let additionalInstructions = "";
    if (checkType === 'academic') {
      additionalInstructions = "Focus on academic writing standards, formal tone, and scholarly language conventions.";
    } else if (checkType === 'advanced') {
      additionalInstructions = "Perform comprehensive grammar checking including style, clarity, and advanced grammar rules.";
    } else {
      additionalInstructions = "Perform basic grammar, spelling, and punctuation checking.";
    }

    const prompt = `
      You are an expert grammar checker. Analyze the following text for grammar, spelling, and punctuation errors.

      Check Type: ${checkType}
      Additional Instructions: ${additionalInstructions}

      Text to analyze:
      ${text}

      Return a JSON object with the following structure:
      {
        "original_text": "<original text>",
        "corrected_text": "<corrected version of the text>",
        "score": <numeric score from 0 to 100 representing grammar quality>,
        "errors": [
          {
            "text": "<error text>",
            "suggestion": "<suggested correction>",
            "type": "<grammar/spelling/punctuation/style>",
            "position": {
              "start": <start position>,
              "end": <end position>
            }
          }
        ]
      }
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: GrammarCheckResult = outputParser(responseText);

    // Record usage for successful processing
    await recordUsage({ toolName: 'grammar-check', success: true });

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error checking grammar:", error);
    
    // Record usage for failed processing
    try {
      await recordUsage({ toolName: 'grammar-check', success: false });
    } catch (recordError) {
      console.error("Error recording usage:", recordError);
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}