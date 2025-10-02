import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";



interface KeyPoint {
  point: string;
  importance: number; // 1-10 scale
}

interface SummaryResult {
  original_text: string;
  summary: string;
  key_points: KeyPoint[];
  compression_ratio: number; // percentage of original length
  word_count: {
    original: number;
    summary: number;
  };
  reading_time: {
    original_minutes: number;
    summary_minutes: number;
  };
}

interface SummarizeRequest {
  text: string;
  length?: 'short' | 'medium' | 'long';
  style?: 'bullet_points' | 'paragraph' | 'abstract';
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, length, style, vendor } = await req.json() as SummarizeRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const summaryLength = length || 'medium';
    const summaryStyle = style || 'paragraph';

    let lengthInstructions = "";
    switch (summaryLength) {
      case 'short':
        lengthInstructions = "Create a very concise summary (10-20% of original length).";
        break;
      case 'long':
        lengthInstructions = "Create a comprehensive summary (40-60% of original length).";
        break;
      default:
        lengthInstructions = "Create a balanced summary (25-35% of original length).";
    }

    let styleInstructions = "";
    switch (summaryStyle) {
      case 'bullet_points':
        styleInstructions = "Format the summary as clear bullet points.";
        break;
      case 'abstract':
        styleInstructions = "Write in academic abstract style with structured sections.";
        break;
      default:
        styleInstructions = "Write in paragraph format with smooth transitions.";
    }

    const prompt = `
      You are an expert text summarization tool. Summarize the following text according to the specified parameters.

      Length: ${summaryLength}
      Style: ${summaryStyle}
      Length Instructions: ${lengthInstructions}
      Style Instructions: ${styleInstructions}

      Text to summarize:
      ${text}

      Return a JSON object with the following structure:
      {
        "original_text": "<original text>",
        "summary": "<summarized text>",
        "key_points": [
          {
            "point": "<key point>",
            "importance": <numeric score from 1 to 10>
          }
        ],
        "compression_ratio": <percentage of original length>,
        "word_count": {
          "original": <word count of original text>,
          "summary": <word count of summary>
        },
        "reading_time": {
          "original_minutes": <estimated reading time in minutes>,
          "summary_minutes": <estimated reading time in minutes>
        }
      }
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: SummaryResult = outputParser(responseText);

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error summarizing text:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}