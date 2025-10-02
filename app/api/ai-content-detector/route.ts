import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { API_KEY } from "@/constants";

if (!API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}

interface AIContentDetectionResult {
  original_text: string;
  ai_probability: number; // 0-100, probability that content is AI-generated
  human_probability: number; // 0-100, probability that content is human-written
  confidence_score: number; // 0-100, confidence in the detection
  detected_patterns: string[]; // Array of AI writing patterns detected
  analysis: {
    sentence_structure: string; // Analysis of sentence patterns
    vocabulary_complexity: string; // Analysis of word choice
    writing_style: string; // Analysis of overall style
    repetition_patterns: string; // Analysis of repetitive elements
  };
  recommendation: string; // Recommendation based on analysis
}

interface AIContentDetectionRequest {
  text: string;
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, vendor } = await req.json() as AIContentDetectionRequest;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `
      You are an expert AI content detection tool. Analyze the following text to determine if it was written by AI or humans.

      Text to analyze:
      ${text}

      Return a JSON object with the following structure:
      {
        "original_text": "<original text>",
        "ai_probability": <numeric score from 0 to 100 representing probability of AI generation>,
        "human_probability": <numeric score from 0 to 100 representing probability of human writing>,
        "confidence_score": <numeric score from 0 to 100 representing confidence in detection>,
        "detected_patterns": ["<pattern1>", "<pattern2>", "<pattern3>"],
        "analysis": {
          "sentence_structure": "<analysis of sentence patterns and complexity>",
          "vocabulary_complexity": "<analysis of word choice and vocabulary>",
          "writing_style": "<analysis of overall writing style>",
          "repetition_patterns": "<analysis of repetitive elements>"
        },
        "recommendation": "<recommendation based on the analysis>"
      }

      Consider these factors in your analysis:
      - Sentence structure and complexity
      - Vocabulary usage and repetition
      - Writing flow and coherence
      - Common AI writing patterns
      - Human-like inconsistencies and errors
      - Emotional expression and personal touches
    `;

    const responseText = await aiVendor.ask({
      api_key: API_KEY!,
      prompt,
    });

    const parsedResults: AIContentDetectionResult = outputParser(responseText);

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error detecting AI content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}