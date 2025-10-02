import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { API_KEY } from "@/constants";

if (!API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}

interface SentenceError {
  type: 'grammar' | 'punctuation' | 'spelling' | 'style' | 'clarity' | 'structure';
  message: string;
  suggestion: string;
  position: {
    start: number;
    end: number;
  };
  severity: 'low' | 'medium' | 'high';
}

interface SentenceCheckResult {
  original_sentence: string;
  corrected_sentence: string;
  errors: SentenceError[];
  improvements: string[];
  readability_score: number;
  complexity_level: 'simple' | 'moderate' | 'complex';
  word_count: number;
  character_count: number;
  suggestions: {
    clarity: string[];
    conciseness: string[];
    style: string[];
  };
  overall_score: number;
}

interface SentenceCheckRequest {
  sentence: string;
  check_type: 'grammar' | 'style' | 'clarity' | 'all';
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { sentence, check_type, vendor } = await req.json() as SentenceCheckRequest;

    if (!sentence) {
      return NextResponse.json({ error: "Sentence is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const checkTypeInstructions = {
      grammar: "Focus on grammatical errors, verb tenses, subject-verb agreement, and sentence structure.",
      style: "Focus on writing style, tone, word choice, and flow improvements.",
      clarity: "Focus on clarity, conciseness, and making the sentence easier to understand.",
      all: "Check for grammar, style, clarity, punctuation, spelling, and overall sentence quality."
    };

    const prompt = `
      You are an expert sentence checker and editor. Analyze the following sentence for errors and improvements.

      Sentence to check:
      ${sentence}

      Check Type: ${check_type}
      Instructions: ${checkTypeInstructions[check_type]}

      Return a JSON object with the following structure:
      {
        "original_sentence": "<original sentence>",
        "corrected_sentence": "<corrected and improved sentence>",
        "errors": [
          {
            "type": "<error type: grammar/punctuation/spelling/style/clarity/structure>",
            "message": "<description of the error>",
            "suggestion": "<suggested correction>",
            "position": {
              "start": <start character position>,
              "end": <end character position>
            },
            "severity": "<low/medium/high>"
          }
        ],
        "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
        "readability_score": <score from 0-100>,
        "complexity_level": "<simple/moderate/complex>",
        "word_count": <number of words>,
        "character_count": <number of characters>,
        "suggestions": {
          "clarity": ["<clarity suggestion1>", "<clarity suggestion2>"],
          "conciseness": ["<conciseness suggestion1>", "<conciseness suggestion2>"],
          "style": ["<style suggestion1>", "<style suggestion2>"]
        },
        "overall_score": <overall quality score from 0-100>
      }

      Requirements:
      - Identify all types of errors based on check_type
      - Provide specific, actionable suggestions
      - Calculate accurate position indices for errors
      - Assess readability and complexity
      - Offer alternative phrasings for improvement
    `;

    const responseText = await aiVendor.ask({
      api_key: API_KEY!,
      prompt,
    });

    const parsedResults: SentenceCheckResult = outputParser(responseText);

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error checking sentence:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}