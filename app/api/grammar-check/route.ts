import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";



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

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error checking grammar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}