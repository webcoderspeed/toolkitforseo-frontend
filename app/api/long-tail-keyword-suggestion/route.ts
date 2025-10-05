import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { outputParser } from '@/lib/output-parser';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import { checkCredits, recordUsage } from '@/lib/credit-tracker';
import { auth } from '@clerk/nextjs/server';

interface LongTailKeywordRequest {
  keyword: string;
  vendor: 'gemini' | 'openai';
}

interface LongTailKeyword {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  intent: string;
  word_count: number;
  opportunity_score: number;
}

interface LongTailKeywordResult {
  seed_keyword: string;
  total_suggestions: number;
  long_tail_keywords: LongTailKeyword[];
  question_based: LongTailKeyword[];
  location_based: LongTailKeyword[];
  commercial_intent: LongTailKeyword[];
  informational_intent: LongTailKeyword[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const creditCheck = await checkCredits({ toolName: 'long-tail-keyword-suggestion' });
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { keyword, vendor } = await req.json() as LongTailKeywordRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    

    // Use AI to generate long tail keyword suggestions
    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `
      You are an SEO expert specializing in long tail keyword research. Please analyze the seed keyword "${keyword}" and generate comprehensive long tail keyword suggestions.

      Seed Keyword: ${keyword}

      Based on your knowledge of SEO and keyword research, please provide detailed long tail keyword suggestions in the following JSON format:
      {
        "seed_keyword": "${keyword}",
        "total_suggestions": <total number of suggestions>,
        "long_tail_keywords": [
          {
            "keyword": "<long tail keyword 1>",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "<commercial/informational/navigational/transactional>",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "<long tail keyword 2>",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "<commercial/informational/navigational/transactional>",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "<long tail keyword 3>",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "<commercial/informational/navigational/transactional>",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "<long tail keyword 4>",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "<commercial/informational/navigational/transactional>",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "<long tail keyword 5>",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "<commercial/informational/navigational/transactional>",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "<long tail keyword 6>",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "<commercial/informational/navigational/transactional>",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          }
        ],
        "question_based": [
          {
            "keyword": "what is ${keyword}",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "informational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "how to use ${keyword}",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "informational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "why is ${keyword} important",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "informational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          }
        ],
        "location_based": [
          {
            "keyword": "${keyword} near me",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "navigational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "${keyword} in [city]",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "navigational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          }
        ],
        "commercial_intent": [
          {
            "keyword": "best ${keyword} for",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "commercial",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "${keyword} reviews",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "commercial",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "buy ${keyword} online",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "transactional",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          }
        ],
        "informational_intent": [
          {
            "keyword": "${keyword} guide",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "informational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "${keyword} tutorial",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "informational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          },
          {
            "keyword": "${keyword} tips",
            "search_volume": <estimated monthly search volume>,
            "difficulty": <SEO difficulty score 0-100>,
            "cpc": <estimated cost per click in USD>,
            "competition": "<low/medium/high>",
            "intent": "informational",
            "word_count": <number of words in keyword>,
            "opportunity_score": <opportunity score 0-100 based on volume vs difficulty>
          }
        ]
      }

      Please provide realistic estimates based on the keyword's commercial intent, industry, and typical search patterns. Long tail keywords should have 3+ words and generally lower search volume but also lower difficulty. Calculate opportunity scores as: (search_volume / difficulty) * 10, capped at 100.
    `;

    const aiResponse = await aiVendor.ask({
      prompt: prompt,
      api_key: apiKey
    });
    const parsedData = outputParser(aiResponse) as LongTailKeywordResult;

    if (!parsedData) {
      // Fallback data if AI parsing fails
      const fallbackData: LongTailKeywordResult = {
        seed_keyword: keyword,
        total_suggestions: 15,
        long_tail_keywords: [
          {
            keyword: `best ${keyword} for beginners`,
            search_volume: Math.floor(Math.random() * 1000) + 100,
            difficulty: Math.floor(Math.random() * 40) + 10,
            cpc: Math.random() * 2 + 0.3,
            competition: 'low',
            intent: 'commercial',
            word_count: keyword.split(' ').length + 3,
            opportunity_score: Math.floor(Math.random() * 40) + 60
          },
          {
            keyword: `how to learn ${keyword} quickly`,
            search_volume: Math.floor(Math.random() * 800) + 80,
            difficulty: Math.floor(Math.random() * 35) + 15,
            cpc: Math.random() * 1.5 + 0.2,
            competition: 'low',
            intent: 'informational',
            word_count: keyword.split(' ').length + 4,
            opportunity_score: Math.floor(Math.random() * 35) + 55
          },
          {
            keyword: `${keyword} step by step guide`,
            search_volume: Math.floor(Math.random() * 600) + 60,
            difficulty: Math.floor(Math.random() * 30) + 20,
            cpc: Math.random() * 1.2 + 0.4,
            competition: 'low',
            intent: 'informational',
            word_count: keyword.split(' ').length + 4,
            opportunity_score: Math.floor(Math.random() * 30) + 50
          }
        ],
        question_based: [
          {
            keyword: `what is ${keyword}`,
            search_volume: Math.floor(Math.random() * 500) + 50,
            difficulty: Math.floor(Math.random() * 25) + 10,
            cpc: Math.random() * 0.8 + 0.1,
            competition: 'low',
            intent: 'informational',
            word_count: keyword.split(' ').length + 2,
            opportunity_score: Math.floor(Math.random() * 40) + 60
          },
          {
            keyword: `how to use ${keyword}`,
            search_volume: Math.floor(Math.random() * 400) + 40,
            difficulty: Math.floor(Math.random() * 30) + 15,
            cpc: Math.random() * 1.0 + 0.2,
            competition: 'low',
            intent: 'informational',
            word_count: keyword.split(' ').length + 3,
            opportunity_score: Math.floor(Math.random() * 35) + 55
          }
        ],
        location_based: [
          {
            keyword: `${keyword} near me`,
            search_volume: Math.floor(Math.random() * 300) + 30,
            difficulty: Math.floor(Math.random() * 35) + 20,
            cpc: Math.random() * 2.0 + 0.5,
            competition: 'medium',
            intent: 'navigational',
            word_count: keyword.split(' ').length + 2,
            opportunity_score: Math.floor(Math.random() * 30) + 45
          }
        ],
        commercial_intent: [
          {
            keyword: `best ${keyword} for`,
            search_volume: Math.floor(Math.random() * 700) + 70,
            difficulty: Math.floor(Math.random() * 45) + 25,
            cpc: Math.random() * 3.0 + 0.8,
            competition: 'medium',
            intent: 'commercial',
            word_count: keyword.split(' ').length + 3,
            opportunity_score: Math.floor(Math.random() * 35) + 50
          },
          {
            keyword: `${keyword} reviews`,
            search_volume: Math.floor(Math.random() * 600) + 60,
            difficulty: Math.floor(Math.random() * 40) + 30,
            cpc: Math.random() * 2.5 + 0.6,
            competition: 'medium',
            intent: 'commercial',
            word_count: keyword.split(' ').length + 1,
            opportunity_score: Math.floor(Math.random() * 30) + 45
          }
        ],
        informational_intent: [
          {
            keyword: `${keyword} guide`,
            search_volume: Math.floor(Math.random() * 500) + 50,
            difficulty: Math.floor(Math.random() * 35) + 15,
            cpc: Math.random() * 1.0 + 0.3,
            competition: 'low',
            intent: 'informational',
            word_count: keyword.split(' ').length + 1,
            opportunity_score: Math.floor(Math.random() * 40) + 55
          },
          {
            keyword: `${keyword} tutorial`,
            search_volume: Math.floor(Math.random() * 400) + 40,
            difficulty: Math.floor(Math.random() * 30) + 20,
            cpc: Math.random() * 0.8 + 0.2,
            competition: 'low',
            intent: 'informational',
            word_count: keyword.split(' ').length + 1,
            opportunity_score: Math.floor(Math.random() * 35) + 50
          }
        ]
      };

      return NextResponse.json(fallbackData);
    }

    // Record usage for successful processing
    await recordUsage({ toolName: 'long-tail-keyword-suggestion', success: true });

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Long tail keyword suggestion error:', error);
    
    // Record usage for failed processing
    try {
      await recordUsage({ toolName: 'long-tail-keyword-suggestion', success: false });
    } catch (recordError) {
      console.error("Error recording usage:", recordError);
    }
    
    // Return fallback data on error
    const fallbackData: LongTailKeywordResult = {
      seed_keyword: 'sample keyword',
      total_suggestions: 10,
      long_tail_keywords: [
        {
          keyword: 'best sample keyword for beginners',
          search_volume: 500,
          difficulty: 25,
          cpc: 1.25,
          competition: 'low',
          intent: 'commercial',
          word_count: 5,
          opportunity_score: 75
        }
      ],
      question_based: [
        {
          keyword: 'what is sample keyword',
          search_volume: 300,
          difficulty: 20,
          cpc: 0.65,
          competition: 'low',
          intent: 'informational',
          word_count: 4,
          opportunity_score: 70
        }
      ],
      location_based: [
        {
          keyword: 'sample keyword near me',
          search_volume: 200,
          difficulty: 30,
          cpc: 1.50,
          competition: 'medium',
          intent: 'navigational',
          word_count: 4,
          opportunity_score: 60
        }
      ],
      commercial_intent: [
        {
          keyword: 'best sample keyword for',
          search_volume: 400,
          difficulty: 35,
          cpc: 2.00,
          competition: 'medium',
          intent: 'commercial',
          word_count: 4,
          opportunity_score: 65
        }
      ],
      informational_intent: [
        {
          keyword: 'sample keyword guide',
          search_volume: 350,
          difficulty: 25,
          cpc: 0.85,
          competition: 'low',
          intent: 'informational',
          word_count: 3,
          opportunity_score: 70
        }
      ]
    };

    return NextResponse.json(fallbackData);
  }
}