import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { outputParser } from '@/lib/output-parser';
import { WebScraper } from '@/lib/web-scraper';
import { IWebsiteLinkCountChecker } from '@/store/types/website-link-count-checker.types';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import { checkCredits, recordUsage } from '@/lib/credit-tracker';
import { auth } from '@clerk/nextjs/server';

interface WebsiteLinkCountRequest {
  url: string;
  vendor: 'gemini' | 'openai';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const creditCheck = await checkCredits({ toolName: 'website-link-count-checker' });
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { url, vendor } = await req.json() as WebsiteLinkCountRequest;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    

    // Step 1: Scrape the website to get real link data
    console.log(`Scraping website: ${url}`);
    const linkAnalysis = await WebScraper.analyzeLinkStructure(url);

    // Step 2: Get top external domains
    const topExternalDomains = Object.entries(linkAnalysis.linksByDomain)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    // Step 3: Get top internal paths
    const topInternalPaths = Object.entries(linkAnalysis.linksByPath)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    // Step 4: Format link distribution
    const linkDistribution = [
      { category: 'Navigation', count: linkAnalysis.linkDistribution.navigation },
      { category: 'Content', count: linkAnalysis.linkDistribution.content },
      { category: 'Footer', count: linkAnalysis.linkDistribution.footer },
      { category: 'Sidebar', count: linkAnalysis.linkDistribution.sidebar },
    ];

    // Step 5: Use AI to enhance the analysis with insights
    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `
      You are a website link analysis expert. I have scraped a website and gathered real link data. Please provide additional insights and validate the analysis.

      Website URL: ${url}
      
      Real scraped data:
      - Total Links: ${linkAnalysis.totalLinks}
      - Internal Links: ${linkAnalysis.internalLinks}
      - External Links: ${linkAnalysis.externalLinks}
      - Broken Links Found: ${linkAnalysis.brokenLinks.length}
      - Top External Domains: ${JSON.stringify(topExternalDomains)}
      - Top Internal Paths: ${JSON.stringify(topInternalPaths)}
      - Link Distribution: ${JSON.stringify(linkDistribution)}

      Please return a JSON object with the exact same structure but with any necessary corrections or insights:
      {
        "totalLinks": ${linkAnalysis.totalLinks},
        "internalLinks": ${linkAnalysis.internalLinks},
        "externalLinks": ${linkAnalysis.externalLinks},
        "brokenLinks": ${linkAnalysis.brokenLinks.length},
        "topExternalDomains": ${JSON.stringify(topExternalDomains)},
        "topInternalPaths": ${JSON.stringify(topInternalPaths)},
        "linkDistribution": ${JSON.stringify(linkDistribution)}
      }

      Return only the JSON object, no additional text or explanation.
    `;

    const response = await aiVendor.ask({
      prompt,
      api_key: apiKey,
    });

    const result = outputParser(response) as IWebsiteLinkCountChecker;

    // Record usage for successful analysis
    await recordUsage({ toolName: 'website-link-count-checker' });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in website link count analysis:', error);
    
    // Fallback: return a basic analysis if scraping fails
    if (error instanceof Error && error.message.includes('Failed to scrape')) {
      // Record usage for fallback analysis
      await recordUsage({ toolName: 'website-link-count-checker' });

      return NextResponse.json({
        totalLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        brokenLinks: 0,
        topExternalDomains: [],
        topInternalPaths: [],
        linkDistribution: [
          { category: 'Navigation', count: 0 },
          { category: 'Content', count: 0 },
          { category: 'Footer', count: 0 },
          { category: 'Sidebar', count: 0 },
        ]
      });
    }

    // Record failed usage
    try {
      await recordUsage({ toolName: 'website-link-count-checker', success: false });
    } catch (recordError) {
      console.error('Failed to record usage:', recordError);
    }

    return NextResponse.json(
      { error: 'Failed to analyze website links' },
      { status: 500 }
    );
  }
}