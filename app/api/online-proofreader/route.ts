import { NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";



interface ProofreadingError {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'word_choice';
  text: string;
  suggestion: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  position: {
    start: number;
    end: number;
  };
}

interface ProofreadingResult {
  original_text: string;
  corrected_text: string;
  errors: ProofreadingError[];
  corrections_made: number;
  improvement_score: number; // 0-100, how much the text was improved
  readability_score: {
    original: number;
    corrected: number;
  };
  word_count: {
    original: number;
    corrected: number;
  };
  suggestions: {
    grammar: string[];
    style: string[];
    clarity: string[];
  };
  overall_quality_score: number; // 0-100
}

interface ProofreadingRequest {
  text: string;
  settings: {
    grammar: boolean;
    spelling: boolean;
    punctuation: boolean;
    style: boolean;
    word_choice: boolean;
  };
  vendor: 'gemini' | 'openai';
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, settings, vendor } = await req.json() as ProofreadingRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    // Build check instructions based on settings
    const checkTypes = [];
    if (settings.grammar) checkTypes.push("grammar errors");
    if (settings.spelling) checkTypes.push("spelling mistakes");
    if (settings.punctuation) checkTypes.push("punctuation errors");
    if (settings.style) checkTypes.push("style improvements");
    if (settings.word_choice) checkTypes.push("word choice enhancements");

    const checkInstructions = checkTypes.length > 0 
      ? `Focus on: ${checkTypes.join(", ")}.`
      : "Perform a comprehensive proofreading check.";

    const prompt = `
      You are an expert proofreader and editor. Analyze the following text and provide comprehensive proofreading results.

      ${checkInstructions}

      Text to proofread:
      "${text}"

      Please provide your analysis in the following JSON format:
      {
        "original_text": "${text}",
        "corrected_text": "<corrected version of the text>",
        "errors": [
          {
            "type": "<grammar|spelling|punctuation|style|word_choice>",
            "text": "<the problematic text>",
            "suggestion": "<suggested correction>",
            "explanation": "<brief explanation of the error>",
            "severity": "<low|medium|high>",
            "position": {
              "start": <start character position>,
              "end": <end character position>
            }
          }
        ],
        "corrections_made": <number of corrections made>,
        "improvement_score": <score from 0-100 representing how much the text was improved>,
        "readability_score": {
          "original": <readability score 0-100 for original text>,
          "corrected": <readability score 0-100 for corrected text>
        },
        "word_count": {
          "original": <word count of original text>,
          "corrected": <word count of corrected text>
        },
        "suggestions": {
          "grammar": ["<grammar improvement suggestions>"],
          "style": ["<style improvement suggestions>"],
          "clarity": ["<clarity improvement suggestions>"]
        },
        "overall_quality_score": <overall quality score 0-100 for the corrected text>
      }

      Important:
      - Provide accurate character positions for errors
      - Be thorough in identifying all types of errors
      - Offer constructive suggestions for improvements
      - Ensure the corrected text maintains the original meaning
      - If no errors are found, return the original text as corrected_text with empty errors array
    `;

    const response = await aiVendor.ask({
      prompt,
      api_key: apiKey,
    });
    const result = outputParser(response) as ProofreadingResult;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in online proofreader API:", error);
    return NextResponse.json(
      { error: "Failed to proofread text" },
      { status: 500 }
    );
  }
}