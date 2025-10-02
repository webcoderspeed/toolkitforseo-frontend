import { NextRequest, NextResponse } from "next/server";
import { AIVendorFactory } from "@/vendor_apis";
import { outputParser } from "@/lib/output-parser";
import { WebScraper } from "@/lib/web-scraper";
import { ValuableBacklinkResult } from "@/store/types/valuable-backlink-checker.types";
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";

interface ValuableBacklinkRequest {
  url: string;
  vendor: "gemini" | "openai";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let url: string = "";

  try {
    const body: ValuableBacklinkRequest = await request.json();
    const { url: requestUrl, vendor = "gemini" } = body;
    // Get vendor-specific API key
    const apiKey = vendor === "openai" ? OPENAI_API_KEY : GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: `${vendor.toUpperCase()} API key not configured` },
        { status: 500 }
      );
    }
    url = requestUrl;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json(
        { error: "URL is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Step 1: Scrape the target website to get real data
    console.log(`Analyzing backlink value for: ${url}`);
    const pageData = await WebScraper.scrapeWithCheerio(url);
    const linkAnalysis = await WebScraper.analyzeLinkStructure(url);

    // Step 2: Analyze domain and content quality
    const domain = new URL(url).hostname.replace("www.", "");
    const domainAge = Math.floor(Math.random() * 10) + 5; // Simulated domain age
    const hasSSL = url.startsWith("https://");

    // Step 3: Calculate metrics based on real data
    const contentQualityScore = Math.min(
      100,
      Math.max(
        20,
        pageData.wordCount / 50 + // Content length factor
          pageData.headings.h1.length * 5 + // Heading structure
          pageData.headings.h2.length * 3 +
          pageData.headings.h3.length * 2 +
          (hasSSL ? 10 : 0) + // SSL bonus
          (pageData.metaDescription ? 10 : 0) // Meta description bonus
      )
    );

    const linkQualityScore = Math.min(
      100,
      Math.max(
        20,
        (linkAnalysis.externalLinks > 0 ? 30 : 0) + // Has external links
          (linkAnalysis.internalLinks > 5
            ? 20
            : linkAnalysis.internalLinks * 4) + // Internal link structure
          (linkAnalysis.brokenLinks.length === 0
            ? 20
            : Math.max(0, 20 - linkAnalysis.brokenLinks.length * 5)) + // No broken links bonus
          Object.keys(linkAnalysis.linksByDomain).length * 2 // Domain diversity
      )
    );

    // Step 4: Simulate finding backlinks to this domain
    const simulatedBacklinks = await WebScraper.findBacklinks(domain, [
      `site:${domain}`,
      `"${domain}"`,
      `link:${domain}`,
    ]);

    // Step 5: Use AI to analyze the scraped data and provide insights
    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `
      You are a backlink analysis expert. I have scraped real data from a website and need you to analyze its backlink value.

      Website URL: ${url}
      Domain: ${domain}
      
      Real scraped data:
      - Page Title: ${pageData.title}
      - Meta Description: ${pageData.metaDescription || "Not provided"}
      - Content Word Count: ${pageData.wordCount}
      - Headings: H1(${pageData.headings.h1.length}), H2(${
      pageData.headings.h2.length
    }), H3(${pageData.headings.h3.length})
      - Internal Links: ${linkAnalysis.internalLinks}
      - External Links: ${linkAnalysis.externalLinks}
      - Broken Links: ${linkAnalysis.brokenLinks.length}
      - Has SSL: ${hasSSL}
      - Content Quality Score: ${Math.round(contentQualityScore)}
      - Link Quality Score: ${Math.round(linkQualityScore)}
      - Found Backlinks: ${simulatedBacklinks.length}

      Based on this real data, please provide a comprehensive backlink value analysis in the following JSON format:
      {
        "url": "${url}",
        "overallScore": <number between 1-100 based on all factors>,
        "metrics": {
          "domainAuthority": <estimate based on content quality and link profile>,
          "pageAuthority": <estimate based on page-specific factors>,
          "trustFlow": <estimate based on content quality and SSL>,
          "citationFlow": <estimate based on link structure>,
          "spamScore": <estimate based on content quality, 0-100 where lower is better>,
          "organicTraffic": <estimate based on content quality and word count>
        },
        "analysis": {
          "linkQuality": "<High|Medium|Low based on link analysis>",
          "contentRelevance": "<High|Medium|Low based on content analysis>",
          "domainTrust": "<High|Medium|Low based on SSL, content, structure>",
          "linkPlacement": "<Contextual|Sidebar|Footer|Navigation based on link distribution>",
          "anchorTextOptimization": "<Natural|Over-optimized|Under-optimized based on content analysis>"
        },
        "summary": {
          "strengths": [
            "<strength based on high word count: ${pageData.wordCount} words>",
            "<strength based on link structure>",
            "<strength based on technical factors>"
          ],
          "weaknesses": [
            "<weakness based on broken links: ${
              linkAnalysis.brokenLinks.length
            }>",
            "<weakness based on content gaps>",
            "<weakness based on technical issues>"
          ],
          "recommendations": [
            "<recommendation based on content analysis>",
            "<recommendation based on link structure>",
            "<recommendation based on technical improvements>"
          ]
        }
      }

      Analysis Guidelines:
      - Base scores on the actual scraped data provided
      - Consider content quality (word count, headings, meta description)
      - Factor in link structure and broken links
      - Account for technical factors like SSL
      - Provide realistic estimates based on observable data
      - Give specific recommendations based on identified weaknesses

      Return only the JSON object, no additional text or explanation.
    `;

    const response = await aiVendor.ask({
      prompt,
      api_key: apiKey,
    });

    const result = outputParser(response) as ValuableBacklinkResult;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in valuable backlink analysis:", error);

    // Fallback: return a basic analysis if scraping fails
    if (error instanceof Error && error.message.includes("Failed to scrape")) {
      return NextResponse.json({
        url,
        overallScore: 50,
        metrics: {
          domainAuthority: 40,
          pageAuthority: 35,
          trustFlow: 30,
          citationFlow: 25,
          spamScore: 20,
          organicTraffic: 1000,
        },
        analysis: {
          linkQuality: "Medium",
          contentRelevance: "Medium",
          domainTrust: "Medium",
          linkPlacement: "Contextual",
          anchorTextOptimization: "Natural",
        },
        summary: {
          strengths: [
            "Unable to analyze due to scraping limitations",
            "Manual analysis recommended",
            "Consider using alternative tools",
          ],
          weaknesses: [
            "Scraping failed - limited data available",
            "Cannot assess content quality",
            "Cannot verify link structure",
          ],
          recommendations: [
            "Perform manual website analysis",
            "Use specialized SEO tools for detailed metrics",
            "Check website accessibility and loading speed",
          ],
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to analyze valuable backlinks" },
      { status: 500 }
    );
  }
}
