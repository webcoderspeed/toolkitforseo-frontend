import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { AIVendorFactory } from '@/vendor_apis';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from '@/constants';

interface SEOIssue {
  category: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  recommendation: string;
  impact: string;
}

interface SEOMetric {
  name: string;
  score: number;
  max_score: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  recommendations: string[];
}

interface CompetitorAnalysis {
  domain: string;
  seo_score: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface LighthouseResults {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    savings: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
  }>;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstMeaningfulPaint: number;
    speedIndex: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
  };
}

interface SEOAnalysisResult {
  url: string;
  overall_score: number;
  grade: string;
  last_analyzed: string;
  metrics: {
    technical_seo: SEOMetric;
    on_page_seo: SEOMetric;
    content_quality: SEOMetric;
    user_experience: SEOMetric;
    mobile_optimization: SEOMetric;
    page_speed: SEOMetric;
    security: SEOMetric;
    social_signals: SEOMetric;
  };
  issues: SEOIssue[];
  keyword_analysis: {
    primary_keywords: string[];
    keyword_density: { [key: string]: number };
    missing_keywords: string[];
    keyword_opportunities: string[];
  };
  competitor_analysis: CompetitorAnalysis[];
  recommendations: {
    immediate_fixes: string[];
    short_term_improvements: string[];
    long_term_strategy: string[];
  };
  technical_details: {
    page_title: string;
    meta_description: string;
    h1_tags: string[];
    h2_tags: string[];
    images_without_alt: number;
    internal_links: number;
    external_links: number;
    page_size: string;
    load_time: string;
    ssl_certificate: boolean;
    mobile_friendly: boolean;
    structured_data: boolean;
    page_speed_score: number;
    core_web_vitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  lighthouse_data?: LighthouseResults;
}

interface ScrapedData {
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  imagesWithoutAlt: number;
  totalImages: number;
  internalLinks: number;
  externalLinks: number;
  structuredData: boolean;
  wordCount: number;
  contentLength: number;
  hasSSL: boolean;
  responseTime: number;
  metaKeywords: string;
  canonicalUrl: string;
  robotsMeta: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  schemaMarkup: any[];
  headingStructure: { level: number; text: string }[];
  textContent: string;
}

async function runLighthouseAnalysis(url: string): Promise<LighthouseResults | null> {
  let browser = null;
  try {
    // Dynamic imports for better Next.js compatibility
    const puppeteer = await import('puppeteer');
    const lighthouse = await import('lighthouse');

    // Launch Puppeteer browser
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    // Run Lighthouse
    const result = await lighthouse.default(url, {
      port: parseInt(new URL(browser.wsEndpoint()).port),
      output: 'json',
      logLevel: 'error'
    });

    if (!result || !result.lhr) {
      throw new Error('Lighthouse analysis failed');
    }

    const lhr = result.lhr;

    // Extract Core Web Vitals
    const coreWebVitals = {
      lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
      fid: lhr.audits['max-potential-fid']?.numericValue || 0,
      cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      fcp: lhr.audits['first-contentful-paint']?.numericValue || 0,
      ttfb: lhr.audits['server-response-time']?.numericValue || 0
    };

    // Extract performance metrics
    const metrics = {
      firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue || 0,
      largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue || 0,
      firstMeaningfulPaint: lhr.audits['first-meaningful-paint']?.numericValue || 0,
      speedIndex: lhr.audits['speed-index']?.numericValue || 0,
      totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
      cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0
    };

    // Extract opportunities
    const opportunities = Object.values(lhr.audits)
      .filter((audit: any) => audit.details?.type === 'opportunity' && audit.score < 1)
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score || 0,
        savings: audit.details?.overallSavingsMs ? `${Math.round(audit.details.overallSavingsMs)}ms` : 'Unknown'
      }))
      .slice(0, 10);

    // Extract diagnostics
    const diagnostics = Object.values(lhr.audits)
      .filter((audit: any) => audit.details?.type === 'diagnostic' && audit.score < 1)
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score || 0
      }))
      .slice(0, 10);

    return {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      pwa: Math.round((lhr.categories.pwa?.score || 0) * 100),
      coreWebVitals,
      opportunities,
      diagnostics,
      metrics
    };

  } catch (error) {
    console.error('Lighthouse analysis error:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function scrapeWebsiteData(url: string): Promise<ScrapedData | null> {
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0; +https://example.com/bot)'
      }
    });
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic SEO data
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    
    // Extract heading structure
    const headingStructure: { level: number; text: string }[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const level = parseInt(el.tagName.substring(1));
      const text = $(el).text().trim();
      if (text) {
        headingStructure.push({ level, text });
      }
    });

    const h1Tags = $('h1').map((_, el) => $(el).text().trim()).get().filter(text => text);
    const h2Tags = $('h2').map((_, el) => $(el).text().trim()).get().filter(text => text);
    
    // Image analysis
    const imagesWithoutAlt = $('img:not([alt]), img[alt=""]').length;
    const totalImages = $('img').length;
    
    // Link analysis
    const hostname = new URL(url).hostname;
    const internalLinks = $(`a[href^="/"], a[href*="${hostname}"]`).length;
    const externalLinks = $('a[href^="http"]').not(`[href*="${hostname}"]`).length;
    
    // Check for structured data
    const structuredData = $('script[type="application/ld+json"]').length > 0 ||
                          $('[itemscope]').length > 0;

    // Extract schema markup
    const schemaMarkup: any[] = [];
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '{}');
        schemaMarkup.push(jsonData);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    // Extract Open Graph tags
    const ogTags: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, element) => {
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      if (property && content) {
        ogTags[property] = content;
      }
    });

    // Extract Twitter Card tags
    const twitterTags: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, element) => {
      const name = $(element).attr('name');
      const content = $(element).attr('content');
      if (name && content) {
        twitterTags[name] = content;
      }
    });

    // Content analysis
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      title,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      robotsMeta,
      h1Tags,
      h2Tags,
      headingStructure,
      imagesWithoutAlt,
      totalImages,
      internalLinks,
      externalLinks,
      structuredData,
      schemaMarkup,
      ogTags,
      twitterTags,
      wordCount,
      contentLength: textContent.length,
      hasSSL: url.startsWith('https://'),
      responseTime,
      textContent: textContent.substring(0, 2000) // Limit for analysis
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}

async function getPageSpeedData(url: string, apiKey: string): Promise<any> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`
    );

    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PageSpeed API error:', error);
    return null;
  }
}

async function checkMobileFriendly(url: string, apiKey: string): Promise<any> {
  try {
    const response = await fetch(
      `https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          requestScreenshot: false
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Mobile-Friendly API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mobile-Friendly API error:', error);
    return null;
  }
}

function analyzeKeywords(textContent: string): {
  primary_keywords: string[];
  keyword_density: { [key: string]: number };
} {
  const words = textContent.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const totalWords = words.length;
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const primary_keywords = sortedWords.slice(0, 5).map(([word]) => word);
  const keyword_density: { [key: string]: number } = {};
  
  sortedWords.forEach(([word, count]) => {
    keyword_density[word] = Math.round((count / totalWords) * 100 * 100) / 100;
  });

  return { primary_keywords, keyword_density };
}

export async function POST(request: NextRequest) {
  try {
    const { url, vendor = 'gemini' } = await request.json();
    
    // Get vendor-specific API key for AI analysis
    const aiApiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    const googleApiKey = GOOGLE_API_KEY;
    
    if (!aiApiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Step 1: Run comprehensive analysis in parallel
    const [scrapedData, lighthouseResults] = await Promise.all([
      scrapeWebsiteData(url),
      runLighthouseAnalysis(url)
    ]);
    
    if (!scrapedData) {
      return NextResponse.json(
        { error: 'Failed to analyze website. Please check if the URL is accessible.' },
        { status: 500 }
      );
    }

    // Step 2: Get additional data from Google APIs (if available) - fallback
    let pageSpeedData = null;
    let mobileFriendlyData = null;

    if (googleApiKey && !lighthouseResults) {
      // Only use Google APIs as fallback if Lighthouse failed
      try {
        [pageSpeedData, mobileFriendlyData] = await Promise.all([
          getPageSpeedData(url, googleApiKey),
          checkMobileFriendly(url, googleApiKey)
        ]);
      } catch (error) {
        console.error('Error fetching Google API data:', error);
      }
    }

    // Step 3: Analyze keywords
    const keywordAnalysis = analyzeKeywords(scrapedData.textContent);

    // Step 4: Prepare comprehensive data for AI analysis
    const analysisData = {
      url,
      scraped: scrapedData,
      lighthouse: lighthouseResults,
      pageSpeed: pageSpeedData ? {
        performance_score: pageSpeedData.lighthouseResult?.categories?.performance?.score * 100 || 0,
        accessibility_score: pageSpeedData.lighthouseResult?.categories?.accessibility?.score * 100 || 0,
        best_practices_score: pageSpeedData.lighthouseResult?.categories?.['best-practices']?.score * 100 || 0,
        seo_score: pageSpeedData.lighthouseResult?.categories?.seo?.score * 100 || 0,
        core_web_vitals: {
          lcp: pageSpeedData.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue || 0,
          fid: pageSpeedData.lighthouseResult?.audits?.['max-potential-fid']?.numericValue || 0,
          cls: pageSpeedData.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue || 0
        },
        opportunities: pageSpeedData.lighthouseResult?.audits ? Object.keys(pageSpeedData.lighthouseResult.audits)
          .filter(key => pageSpeedData.lighthouseResult.audits[key].score < 1)
          .slice(0, 5) : []
      } : null,
      mobileFriendly: mobileFriendlyData ? {
        is_mobile_friendly: mobileFriendlyData.mobileFriendliness === 'MOBILE_FRIENDLY',
        issues: mobileFriendlyData.mobileFriendlyIssues || []
      } : null,
      keywords: keywordAnalysis
    };

    // Step 5: Use AI for comprehensive analysis
    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `You are an expert SEO analyst. Analyze the following comprehensive website data and provide a detailed SEO analysis in JSON format:

WEBSITE DATA:
URL: ${url}
Title: "${scrapedData.title}" (${scrapedData.title.length} chars)
Meta Description: "${scrapedData.metaDescription}" (${scrapedData.metaDescription.length} chars)
Meta Keywords: "${scrapedData.metaKeywords}"
Canonical URL: "${scrapedData.canonicalUrl}"
Robots Meta: "${scrapedData.robotsMeta}"

HEADING STRUCTURE:
${scrapedData.headingStructure.map(h => `H${h.level}: ${h.text}`).slice(0, 10).join('\n')}

TECHNICAL DATA:
- H1 Tags: ${scrapedData.h1Tags.length} (${scrapedData.h1Tags.slice(0, 3).join(', ')})
- H2 Tags: ${scrapedData.h2Tags.length} (${scrapedData.h2Tags.slice(0, 3).join(', ')})
- Images: ${scrapedData.totalImages} total, ${scrapedData.imagesWithoutAlt} without alt text
- Links: ${scrapedData.internalLinks} internal, ${scrapedData.externalLinks} external
- Word Count: ${scrapedData.wordCount}
- SSL: ${scrapedData.hasSSL}
- Structured Data: ${scrapedData.structuredData}
- Schema Markup: ${scrapedData.schemaMarkup.length} scripts
- Response Time: ${scrapedData.responseTime}ms

OPEN GRAPH TAGS:
${Object.entries(scrapedData.ogTags).map(([key, value]) => `${key}: ${value}`).join('\n')}

TWITTER TAGS:
${Object.entries(scrapedData.twitterTags).map(([key, value]) => `${key}: ${value}`).join('\n')}

${lighthouseResults ? `
LIGHTHOUSE ANALYSIS (Local Analysis):
- Performance Score: ${lighthouseResults.performance}/100
- Accessibility Score: ${lighthouseResults.accessibility}/100
- Best Practices Score: ${lighthouseResults.bestPractices}/100
- SEO Score: ${lighthouseResults.seo}/100
- PWA Score: ${lighthouseResults.pwa}/100

CORE WEB VITALS (Lighthouse):
- LCP (Largest Contentful Paint): ${lighthouseResults.coreWebVitals.lcp}ms
- FID (First Input Delay): ${lighthouseResults.coreWebVitals.fid}ms
- CLS (Cumulative Layout Shift): ${lighthouseResults.coreWebVitals.cls}
- FCP (First Contentful Paint): ${lighthouseResults.coreWebVitals.fcp}ms
- TTFB (Time to First Byte): ${lighthouseResults.coreWebVitals.ttfb}ms

PERFORMANCE METRICS:
- First Contentful Paint: ${lighthouseResults.metrics.firstContentfulPaint}ms
- Largest Contentful Paint: ${lighthouseResults.metrics.largestContentfulPaint}ms
- Speed Index: ${lighthouseResults.metrics.speedIndex}ms
- Total Blocking Time: ${lighthouseResults.metrics.totalBlockingTime}ms
- Cumulative Layout Shift: ${lighthouseResults.metrics.cumulativeLayoutShift}

LIGHTHOUSE OPPORTUNITIES:
${lighthouseResults.opportunities.map(opp => `- ${opp.title}: ${opp.savings} savings`).join('\n')}

LIGHTHOUSE DIAGNOSTICS:
${lighthouseResults.diagnostics.map(diag => `- ${diag.title} (Score: ${diag.score})`).join('\n')}
` : pageSpeedData ? `
PAGE SPEED DATA (Google PageSpeed Insights - Fallback):
- Performance Score: ${analysisData.pageSpeed?.performance_score}/100
- Accessibility Score: ${analysisData.pageSpeed?.accessibility_score}/100
- Best Practices Score: ${analysisData.pageSpeed?.best_practices_score}/100
- SEO Score: ${analysisData.pageSpeed?.seo_score}/100
- Core Web Vitals:
  * LCP: ${analysisData.pageSpeed?.core_web_vitals.lcp}ms
  * FID: ${analysisData.pageSpeed?.core_web_vitals.fid}ms
  * CLS: ${analysisData.pageSpeed?.core_web_vitals.cls}
- Main Issues: ${analysisData.pageSpeed?.opportunities.join(', ')}
` : 'PERFORMANCE DATA: Not available (Lighthouse failed and Google API key not configured)'}

${mobileFriendlyData ? `
MOBILE FRIENDLINESS:
- Mobile Friendly: ${analysisData.mobileFriendly?.is_mobile_friendly}
- Issues: ${analysisData.mobileFriendly?.issues.map((issue: any) => issue.rule).join(', ') || 'None'}
` : 'MOBILE FRIENDLINESS: Not available (Google API key not configured)'}

KEYWORD ANALYSIS:
Primary Keywords: ${keywordAnalysis.primary_keywords.join(', ')}
Keyword Density: ${Object.entries(keywordAnalysis.keyword_density).slice(0, 5).map(([word, density]) => `${word}: ${density}%`).join(', ')}

Provide a comprehensive SEO analysis in this exact JSON format:

{
  "url": "${url}",
  "overall_score": <calculated score 0-100>,
  "grade": "<A+, A, B+, B, C+, C, D+, D, F>",
  "last_analyzed": "${new Date().toISOString()}",
  "metrics": {
    "technical_seo": {
      "name": "Technical SEO",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Technical aspects including title, meta, headings, and markup",
      "recommendations": ["specific actionable recommendations"]
    },
    "on_page_seo": {
      "name": "On-Page SEO",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Content optimization and on-page factors",
      "recommendations": ["specific actionable recommendations"]
    },
    "content_quality": {
      "name": "Content Quality",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Content length, quality, and keyword optimization",
      "recommendations": ["specific actionable recommendations"]
    },
    "user_experience": {
      "name": "User Experience",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "User experience and usability factors",
      "recommendations": ["specific actionable recommendations"]
    },
    "mobile_optimization": {
      "name": "Mobile Optimization",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Mobile-friendliness and responsive design",
      "recommendations": ["specific actionable recommendations"]
    },
    "page_speed": {
      "name": "Page Speed",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Page loading speed and Core Web Vitals",
      "recommendations": ["specific actionable recommendations"]
    },
    "security": {
      "name": "Security",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Website security including SSL and HTTPS",
      "recommendations": ["specific actionable recommendations"]
    },
    "social_signals": {
      "name": "Social Signals",
      "score": <0-100>,
      "max_score": 100,
      "status": "<good|warning|critical>",
      "description": "Social media integration and Open Graph tags",
      "recommendations": ["specific actionable recommendations"]
    }
  },
  "issues": [
    {
      "category": "category name",
      "issue": "specific issue description",
      "severity": "critical|warning|info",
      "description": "detailed description",
      "recommendation": "how to fix",
      "impact": "impact on SEO"
    }
  ],
  "keyword_analysis": {
    "primary_keywords": ${JSON.stringify(keywordAnalysis.primary_keywords)},
    "keyword_density": ${JSON.stringify(keywordAnalysis.keyword_density)},
    "missing_keywords": ["suggested keywords based on content"],
    "keyword_opportunities": ["keyword opportunities for improvement"]
  },
  "competitor_analysis": [],
  "recommendations": {
    "immediate_fixes": ["critical issues to fix immediately"],
    "short_term_improvements": ["improvements for next 1-3 months"],
    "long_term_strategy": ["strategic improvements for 3+ months"]
  },
  "technical_details": {
    "page_title": "${scrapedData.title}",
    "meta_description": "${scrapedData.metaDescription}",
    "h1_tags": ${JSON.stringify(scrapedData.h1Tags)},
    "h2_tags": ${JSON.stringify(scrapedData.h2Tags.slice(0, 5))},
    "images_without_alt": ${scrapedData.imagesWithoutAlt},
    "internal_links": ${scrapedData.internalLinks},
    "external_links": ${scrapedData.externalLinks},
    "page_size": "${Math.round(scrapedData.contentLength / 1024)}KB",
    "load_time": "${scrapedData.responseTime}ms",
    "ssl_certificate": ${scrapedData.hasSSL},
    "mobile_friendly": ${analysisData.mobileFriendly?.is_mobile_friendly ?? true},
    "structured_data": ${scrapedData.structuredData},
    "page_speed_score": ${lighthouseResults?.performance || analysisData.pageSpeed?.performance_score || 0},
    "core_web_vitals": {
      "lcp": ${lighthouseResults?.coreWebVitals.lcp || analysisData.pageSpeed?.core_web_vitals.lcp || 0},
      "fid": ${lighthouseResults?.coreWebVitals.fid || analysisData.pageSpeed?.core_web_vitals.fid || 0},
      "cls": ${lighthouseResults?.coreWebVitals.cls || analysisData.pageSpeed?.core_web_vitals.cls || 0}
    }
  }
}

ANALYSIS GUIDELINES:
- Prioritize Lighthouse data over Google PageSpeed API data when available
- Base scores on actual performance metrics from Lighthouse
- Use the detailed Core Web Vitals and performance metrics for accurate scoring
- Provide specific, actionable recommendations based on Lighthouse opportunities and diagnostics
- Consider the real performance data for realistic scoring
- Focus on improvements that will have the biggest impact on Core Web Vitals
- Use the actual scraped data to inform your analysis
- Be realistic about scores - perfect scores should be rare
- Prioritize recommendations by impact and difficulty`;

    try {
      const response = await aiVendor.ask({
        prompt,
        api_key: aiApiKey
      });

      // Try to parse AI response
      let analysisResult: SEOAnalysisResult;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
          // Add lighthouse data to the result
          if (lighthouseResults) {
            analysisResult.lighthouse_data = lighthouseResults;
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to basic analysis based on scraped data
        analysisResult = generateBasicAnalysis(scrapedData, analysisData, url, lighthouseResults);
      }

      return NextResponse.json(analysisResult);

    } catch (aiError) {
      console.error('AI vendor error:', aiError);
      // Fallback to basic analysis
      const fallbackResult = generateBasicAnalysis(scrapedData, analysisData, url, lighthouseResults);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error('Error in website SEO score checker:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website SEO' },
      { status: 500 }
    );
  }
}

function generateBasicAnalysis(
  scrapedData: ScrapedData, 
  analysisData: any, 
  url: string, 
  lighthouseResults?: LighthouseResults | null
): SEOAnalysisResult {
  // Calculate scores based on scraped data and Lighthouse results
  const titleScore = scrapedData.title ? 
    (scrapedData.title.length >= 30 && scrapedData.title.length <= 60 ? 100 : 70) : 0;
  
  const metaDescScore = scrapedData.metaDescription ? 
    (scrapedData.metaDescription.length >= 120 && scrapedData.metaDescription.length <= 160 ? 100 : 70) : 0;
  
  const h1Score = scrapedData.h1Tags.length === 1 ? 100 : 
                  scrapedData.h1Tags.length === 0 ? 0 : 50;
  
  const imageScore = scrapedData.totalImages === 0 ? 100 : 
                     Math.max(0, 100 - (scrapedData.imagesWithoutAlt / scrapedData.totalImages) * 100);
  
  const contentScore = scrapedData.wordCount >= 300 ? 
                       Math.min(100, scrapedData.wordCount / 10) : 
                       scrapedData.wordCount / 3;
  
  const sslScore = scrapedData.hasSSL ? 100 : 0;
  const structuredDataScore = scrapedData.structuredData ? 100 : 50;
  
  // Use Lighthouse scores if available, otherwise fallback
  const pageSpeedScore = lighthouseResults?.performance || 
                        analysisData.pageSpeed?.performance_score || 70;
  const accessibilityScore = lighthouseResults?.accessibility || 
                            analysisData.pageSpeed?.accessibility_score || 80;
  const bestPracticesScore = lighthouseResults?.bestPractices || 
                            analysisData.pageSpeed?.best_practices_score || 75;
  const lighthouseSeoScore = lighthouseResults?.seo || 
                            analysisData.pageSpeed?.seo_score || 80;
  
  const mobileScore = analysisData.mobileFriendly?.is_mobile_friendly !== false ? 90 : 50;
  
  // Calculate overall score with Lighthouse data priority
  const technicalSeoScore = Math.round((titleScore + metaDescScore + h1Score + structuredDataScore + lighthouseSeoScore) / 5);
  const onPageSeoScore = Math.round((contentScore + imageScore + accessibilityScore) / 3);
  const contentQualityScore = Math.round(contentScore);
  const userExperienceScore = Math.round((pageSpeedScore + mobileScore + bestPracticesScore) / 3);
  const mobileOptimizationScore = mobileScore;
  const securityScore = sslScore;
  const socialSignalsScore = Object.keys(scrapedData.ogTags).length > 0 ? 80 : 40;
  
  const overallScore = Math.round(
    (technicalSeoScore + onPageSeoScore + contentQualityScore + 
     userExperienceScore + mobileOptimizationScore + pageSpeedScore + 
     securityScore + socialSignalsScore) / 8
  );

  // Generate grade
  const grade = overallScore >= 90 ? 'A+' :
                overallScore >= 85 ? 'A' :
                overallScore >= 80 ? 'B+' :
                overallScore >= 75 ? 'B' :
                overallScore >= 70 ? 'C+' :
                overallScore >= 65 ? 'C' :
                overallScore >= 60 ? 'D+' :
                overallScore >= 50 ? 'D' : 'F';

  // Generate issues based on Lighthouse and scraped data
  const issues: SEOIssue[] = [];
  
  if (!scrapedData.title) {
    issues.push({
      category: 'Technical SEO',
      issue: 'Missing page title',
      severity: 'critical',
      description: 'The page does not have a title tag',
      recommendation: 'Add a descriptive title tag (50-60 characters)',
      impact: 'Critical for search engine rankings'
    });
  }
  
  if (!scrapedData.metaDescription) {
    issues.push({
      category: 'Technical SEO',
      issue: 'Missing meta description',
      severity: 'critical',
      description: 'The page does not have a meta description',
      recommendation: 'Add a compelling meta description (150-160 characters)',
      impact: 'Affects click-through rates from search results'
    });
  }
  
  if (scrapedData.h1Tags.length === 0) {
    issues.push({
      category: 'On-Page SEO',
      issue: 'Missing H1 tag',
      severity: 'critical',
      description: 'The page does not have an H1 heading',
      recommendation: 'Add a single, descriptive H1 tag',
      impact: 'Important for content structure and SEO'
    });
  }
  
  if (scrapedData.imagesWithoutAlt > 0) {
    issues.push({
      category: 'Accessibility',
      issue: `${scrapedData.imagesWithoutAlt} images without alt text`,
      severity: 'warning',
      description: 'Some images are missing alt attributes',
      recommendation: 'Add descriptive alt text to all images',
      impact: 'Affects accessibility and image SEO'
    });
  }
  
  if (!scrapedData.hasSSL) {
    issues.push({
      category: 'Security',
      issue: 'No SSL certificate',
      severity: 'critical',
      description: 'The website is not using HTTPS',
      recommendation: 'Install and configure SSL certificate',
      impact: 'Critical for security and search rankings'
    });
  }

  // Add Lighthouse-specific issues
  if (lighthouseResults) {
    if (lighthouseResults.coreWebVitals.lcp > 2500) {
      issues.push({
        category: 'Performance',
        issue: 'Poor Largest Contentful Paint',
        severity: 'warning',
        description: `LCP is ${lighthouseResults.coreWebVitals.lcp}ms (should be < 2.5s)`,
        recommendation: 'Optimize images, remove unused CSS, and improve server response time',
        impact: 'Affects user experience and Core Web Vitals score'
      });
    }
    
    if (lighthouseResults.coreWebVitals.cls > 0.1) {
      issues.push({
        category: 'Performance',
        issue: 'Poor Cumulative Layout Shift',
        severity: 'warning',
        description: `CLS is ${lighthouseResults.coreWebVitals.cls} (should be < 0.1)`,
        recommendation: 'Add size attributes to images and videos, avoid inserting content above existing content',
        impact: 'Affects user experience and Core Web Vitals score'
      });
    }
  }

  // Generate keyword analysis
  const keywords = analyzeKeywords(scrapedData.textContent);

  const result: SEOAnalysisResult = {
    url,
    overall_score: overallScore,
    grade,
    last_analyzed: new Date().toISOString(),
    metrics: {
      technical_seo: {
        name: 'Technical SEO',
        score: technicalSeoScore,
        max_score: 100,
        status: technicalSeoScore >= 80 ? 'good' : technicalSeoScore >= 60 ? 'warning' : 'critical',
        description: 'Technical aspects including title tags, meta descriptions, and heading structure',
        recommendations: [
          ...(titleScore < 100 ? ['Optimize title tag length and content'] : []),
          ...(metaDescScore < 100 ? ['Improve meta description'] : []),
          ...(h1Score < 100 ? ['Fix H1 tag structure'] : [])
        ]
      },
      on_page_seo: {
        name: 'On-Page SEO',
        score: onPageSeoScore,
        max_score: 100,
        status: onPageSeoScore >= 80 ? 'good' : onPageSeoScore >= 60 ? 'warning' : 'critical',
        description: 'Content quality and on-page optimization factors',
        recommendations: [
          ...(contentScore < 80 ? ['Increase content length and quality'] : []),
          ...(imageScore < 90 ? ['Add alt text to images'] : [])
        ]
      },
      content_quality: {
        name: 'Content Quality',
        score: contentQualityScore,
        max_score: 100,
        status: contentQualityScore >= 80 ? 'good' : contentQualityScore >= 60 ? 'warning' : 'critical',
        description: 'Quality and length of content on the page',
        recommendations: [
          ...(scrapedData.wordCount < 300 ? ['Add more comprehensive content'] : []),
          'Improve content structure and readability'
        ]
      },
      user_experience: {
        name: 'User Experience',
        score: userExperienceScore,
        max_score: 100,
        status: userExperienceScore >= 80 ? 'good' : userExperienceScore >= 60 ? 'warning' : 'critical',
        description: 'User experience factors including speed and mobile-friendliness',
        recommendations: [
          ...(pageSpeedScore < 80 ? ['Improve page loading speed'] : []),
          ...(mobileScore < 80 ? ['Optimize for mobile devices'] : [])
        ]
      },
      mobile_optimization: {
        name: 'Mobile Optimization',
        score: mobileOptimizationScore,
        max_score: 100,
        status: mobileOptimizationScore >= 80 ? 'good' : mobileOptimizationScore >= 60 ? 'warning' : 'critical',
        description: 'Mobile-friendliness and responsive design',
        recommendations: [
          ...(mobileScore < 90 ? ['Test and improve mobile responsiveness'] : [])
        ]
      },
      page_speed: {
        name: 'Page Speed',
        score: Math.round(pageSpeedScore),
        max_score: 100,
        status: pageSpeedScore >= 80 ? 'good' : pageSpeedScore >= 60 ? 'warning' : 'critical',
        description: 'Page loading speed and performance metrics',
        recommendations: lighthouseResults ? 
          lighthouseResults.opportunities.slice(0, 3).map(opp => opp.title) :
          [
            'Optimize images and media files',
            'Minimize CSS and JavaScript',
            'Use browser caching'
          ]
      },
      security: {
        name: 'Security',
        score: securityScore,
        max_score: 100,
        status: securityScore >= 80 ? 'good' : 'critical',
        description: 'Website security including SSL certificate',
        recommendations: securityScore < 100 ? ['Install SSL certificate', 'Ensure HTTPS redirect'] : ['Security is properly configured']
      },
      social_signals: {
        name: 'Social Signals',
        score: socialSignalsScore,
        max_score: 100,
        status: socialSignalsScore >= 80 ? 'good' : socialSignalsScore >= 60 ? 'warning' : 'critical',
        description: 'Social media integration and sharing capabilities',
        recommendations: [
          ...(Object.keys(scrapedData.ogTags).length === 0 ? ['Add Open Graph meta tags'] : []),
          ...(Object.keys(scrapedData.twitterTags).length === 0 ? ['Add Twitter Card meta tags'] : []),
          'Include social sharing buttons'
        ]
      }
    },
    issues,
    keyword_analysis: {
      primary_keywords: keywords.primary_keywords,
      keyword_density: keywords.keyword_density,
      missing_keywords: ['Add relevant keywords based on your content'],
      keyword_opportunities: ['Research long-tail keywords', 'Analyze competitor keywords']
    },
    competitor_analysis: [],
    recommendations: {
      immediate_fixes: [
        ...(titleScore === 0 ? ['Add a title tag'] : []),
        ...(metaDescScore === 0 ? ['Add meta description'] : []),
        ...(scrapedData.imagesWithoutAlt > 0 ? ['Add alt text to images'] : []),
        ...(!scrapedData.hasSSL ? ['Install SSL certificate'] : [])
      ],
      short_term_improvements: lighthouseResults ? 
        lighthouseResults.opportunities.slice(0, 5).map(opp => opp.title) :
        [
          'Optimize content length and quality',
          'Improve internal linking structure',
          'Add structured data markup',
          'Optimize page loading speed'
        ],
      long_term_strategy: [
        'Develop comprehensive content strategy',
        'Build quality backlinks',
        'Monitor and improve Core Web Vitals',
        'Regular SEO audits and optimizations'
      ]
    },
    technical_details: {
      page_title: scrapedData.title,
      meta_description: scrapedData.metaDescription,
      h1_tags: scrapedData.h1Tags,
      h2_tags: scrapedData.h2Tags.slice(0, 5),
      images_without_alt: scrapedData.imagesWithoutAlt,
      internal_links: scrapedData.internalLinks,
      external_links: scrapedData.externalLinks,
      page_size: `${Math.round(scrapedData.contentLength / 1024)}KB`,
      load_time: `${scrapedData.responseTime}ms`,
      ssl_certificate: scrapedData.hasSSL,
      mobile_friendly: analysisData.mobileFriendly?.is_mobile_friendly ?? true,
      structured_data: scrapedData.structuredData,
      page_speed_score: Math.round(pageSpeedScore),
      core_web_vitals: {
        lcp: lighthouseResults?.coreWebVitals.lcp || analysisData.pageSpeed?.core_web_vitals.lcp || 0,
        fid: lighthouseResults?.coreWebVitals.fid || analysisData.pageSpeed?.core_web_vitals.fid || 0,
        cls: lighthouseResults?.coreWebVitals.cls || analysisData.pageSpeed?.core_web_vitals.cls || 0
      }
    }
  };

  // Add lighthouse data if available
  if (lighthouseResults) {
    result.lighthouse_data = lighthouseResults;
  }

  return result;
}