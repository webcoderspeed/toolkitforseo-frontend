import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";



interface ParaphraseResult {
  original_text: string;
  paraphrased_text: string;
  similarity_score: number; // 0-100, how similar to original
  readability_score: number; // 0-100, how readable the text is
  word_count: {
    original: number;
    paraphrased: number;
  };
}

interface ParaphraseRequest {
  text: string;
  style?: 'formal' | 'casual' | 'creative' | 'academic';
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, style, vendor } = await req.json() as ParaphraseRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const paraphraseStyle = style || 'formal';

    let styleInstructions = "";
    switch (paraphraseStyle) {
      case 'formal':
        styleInstructions = "Convert to formal, professional language suitable for business or academic contexts.";
        break;
      case 'casual':
        styleInstructions = "Use casual, conversational language that's easy to understand.";
        break;
      case 'creative':
        styleInstructions = "Use creative and varied language expressions while keeping the original meaning.";
        break;
      case 'academic':
        styleInstructions = "Use academic language with scholarly tone and precise terminology.";
        break;
      default:
        styleInstructions = "Provide a balanced paraphrase with appropriate changes to vocabulary and structure.";
    }

    const prompt = `
      You are an expert text paraphrasing tool. Paraphrase the following text according to the specified style.

      Style: ${paraphraseStyle}
      Style Instructions: ${styleInstructions}

      Text to paraphrase:
      ${text}

      Return a JSON object with the following structure:
      {
        "original_text": "<original text>",
        "paraphrased_text": "<paraphrased version of the text>",
        "similarity_score": <numeric score from 0 to 100 representing similarity to original>,
        "readability_score": <numeric score from 0 to 100 representing readability>,
        "word_count": {
          "original": <word count of original text>,
          "paraphrased": <word count of paraphrased text>
        }
      }
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: ParaphraseResult = outputParser(responseText);

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error paraphrasing text:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}