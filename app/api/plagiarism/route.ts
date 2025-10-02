import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";



interface PlagiarismResult {
  score: number;
  original_content: number;
  plagiarized_content: number;
  sources: { url: string; similarity: number }[];
}

interface PlagiarismCheckRequest {
  text: string;
  settings: {
    detection_model: string;
  };
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, settings, vendor } = (await req.json()) as PlagiarismCheckRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);  

    const prompt = `
       You are an expert plagiarism detection system. Analyze the following text and determine if any part of it appears to be plagiarized from online sources.

    Based on the provided detection_model, adjust the sensitivity and thoroughness of your analysis.

    Available detection_models:

    - Standard: A balanced approach, suitable for general plagiarism checks.
    - Academic: More sensitive and thorough, designed for academic content.
    - Thorough: The most rigorous analysis, checking for subtle similarities.

    Detection Model: ${settings?.detection_model ?? "Standard"}

    Text to analyze:

    ${text}

    Return a JSON object with the following structure:
    {
      "score": <a numeric score from 0 to 100 representing the overall likelihood of plagiarism>,
      "original_content": <a numeric value from 0 to 100 representing the percentage of original content>,
      "plagiarized_content": <a numeric value from 0 to 100 representing the percentage of plagiarized content>,
      "sources": [
        {
          "url": "<source URL that closely matches the plagiarized content>",
          "similarity": <percentage similarity to this source (0 to 100)>
        }
        // You may include multiple sources if applicable
      ]
    }
    `;

    const responseText = await aiVendor.ask({
      api_key: apiKey,
      prompt,
    });

    const parsedResults: PlagiarismResult = outputParser(responseText);

    return NextResponse.json(parsedResults);
  } catch (error) {
    console.error("Error checking plagiarism:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
