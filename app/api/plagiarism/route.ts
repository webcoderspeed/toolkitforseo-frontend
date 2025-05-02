import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

interface PlagiarismResult {
  score: number;
  originalContent: number;
  plagiarizedContent: number;
  sources: { url: string; similarity: number }[];
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, model } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const genModel = genAI.getGenerativeModel({ model: MODEL_NAME });

    let prompt = `Analyze the following text for plagiarism and provide a score (0-100, 0 being no plagiarism, 100 being completely plagiarized), the percentage of original content, the percentage of plagiarized content, and a list of potential sources with similarity scores. \n\nText: ${text}\n\n`;

    if (model === "academic") {
      prompt += "Focus on academic sources and citations.";
    } else if (model === "thorough") {
      prompt += "Perform an extremely detailed analysis.";
    }

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const parsedResults: PlagiarismResult = parseGeminiResponse(responseText);

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error("Error checking plagiarism:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function parseGeminiResponse(responseText: string): PlagiarismResult {
  try {
    const scoreMatch = responseText.match(/Score: (\d+)%/);
    const originalMatch = responseText.match(/Original Content: (\d+)%/);
    const plagiarizedMatch = responseText.match(/Plagiarized Content: (\d+)%/);
    const sourcesMatch = responseText.match(/Sources:([\s\S]*)/);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const originalContent = originalMatch ? parseInt(originalMatch[1]) : 100;
    const plagiarizedContent = plagiarizedMatch ? parseInt(plagiarizedMatch[1]) : 0;

    let sources: { url: string; similarity: number }[] = [];
    if (sourcesMatch) {
      const sourcesText = sourcesMatch[1];
      const sourceLines = sourcesText.split('\n').filter(line => line.trim());
      sources = sourceLines.map(line => {
        const parts = line.split(' - ');
        return {
          url: parts[0].trim(),
          similarity: parseInt(parts[1]?.replace('% match', '') || '0'),
        };
      }).filter(source => source.url.startsWith("http"));
    }

    return {
      score,
      originalContent,
      plagiarizedContent,
      sources,
    };
  } catch (parseError) {
    console.error("Error parsing Gemini response:", parseError);
    return {
      score: 0,
      originalContent: 100,
      plagiarizedContent: 0,
      sources: [],
    };
  }
}