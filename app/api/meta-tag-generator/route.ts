import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";
import * as cheerio from 'cheerio';

interface MetaTagRequest {
  // For URL analysis mode
  url?: string;
  
  // For manual generation mode
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_url?: string;
  og_type?: string;
  og_site_name?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_site?: string;
  twitter_creator?: string;
  schema_type?: string;
  schema_data?: any;
  additional_tags?: Array<{
    name: string;
    content: string;
    property?: string;
  }>;
  vendor: 'gemini' | 'openai';
}

interface MetaTagResult {
  basic_meta: string;
  open_graph: string;
  twitter_cards: string;
  structured_data: string;
  complete_html: string;
  seo_score: number;
  recommendations: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
  preview: {
    google: {
      title: string;
      description: string;
      url: string;
    };
    facebook: {
      title: string;
      description: string;
      image: string;
    };
    twitter: {
      title: string;
      description: string;
      image: string;
    };
  };
  analysis?: {
    existing_meta: {
      title: string;
      description: string;
      keywords: string;
      robots: string;
      canonical: string;
      og_tags: Record<string, string>;
      twitter_tags: Record<string, string>;
      structured_data: any[];
    };
    issues: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
    missing_tags: string[];
  };
}

interface ScrapedMetaData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  og_tags: Record<string, string>;
  twitter_tags: Record<string, string>;
  structured_data: any[];
  additional_meta: Array<{name: string; content: string; property?: string}>;
  page_content: {
    headings: string[];
    text_content: string;
    images: string[];
  };
}

async function scrapeMetaTags(url: string): Promise<ScrapedMetaData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MetaTagGenerator/1.0; +https://example.com/bot)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic meta tags
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    const author = $('meta[name="author"]').attr('content') || '';
    const robots = $('meta[name="robots"]').attr('content') || 'index,follow';
    const canonical = $('link[rel="canonical"]').attr('href') || '';

    // Extract Open Graph tags
    const og_tags: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, element) => {
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      if (property && content) {
        og_tags[property] = content;
      }
    });

    // Extract Twitter Card tags
    const twitter_tags: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, element) => {
      const name = $(element).attr('name');
      const content = $(element).attr('content');
      if (name && content) {
        twitter_tags[name] = content;
      }
    });

    // Extract structured data
    const structured_data: any[] = [];
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '{}');
        structured_data.push(jsonData);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    // Extract additional meta tags
    const additional_meta: Array<{name: string; content: string; property?: string}> = [];
    $('meta').each((_, element) => {
      const name = $(element).attr('name');
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      
      if (content && (name || property)) {
        // Skip already processed tags
        if (name && ['description', 'keywords', 'author', 'robots'].includes(name)) return;
        if (property && (property.startsWith('og:') || property.startsWith('twitter:'))) return;
        
        additional_meta.push({
          name: name || '',
          content,
          property: property || undefined
        });
      }
    });

    // Extract page content for analysis
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text) headings.push(text);
    });

    const text_content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1000);
    
    const images: string[] = [];
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(src, url).href;
        images.push(absoluteUrl);
      }
    });

    return {
      title,
      description,
      keywords,
      author,
      robots,
      canonical,
      og_tags,
      twitter_tags,
      structured_data,
      additional_meta,
      page_content: {
        headings,
        text_content,
        images: images.slice(0, 10) // Limit to first 10 images
      }
    };

  } catch (error) {
    console.error('Error scraping meta tags:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function analyzeMetaTags(scrapedData: ScrapedMetaData): {
  issues: Array<{type: string; severity: string; message: string}>;
  missing_tags: string[];
  seo_score: number;
} {
  const issues: Array<{type: string; severity: string; message: string}> = [];
  const missing_tags: string[] = [];
  let score = 100;

  // Check title
  if (!scrapedData.title) {
    issues.push({
      type: 'Title',
      severity: 'critical',
      message: 'Missing page title'
    });
    missing_tags.push('title');
    score -= 20;
  } else if (scrapedData.title.length < 30) {
    issues.push({
      type: 'Title',
      severity: 'medium',
      message: 'Title is too short (less than 30 characters)'
    });
    score -= 10;
  } else if (scrapedData.title.length > 60) {
    issues.push({
      type: 'Title',
      severity: 'medium',
      message: 'Title is too long (more than 60 characters)'
    });
    score -= 10;
  }

  // Check description
  if (!scrapedData.description) {
    issues.push({
      type: 'Description',
      severity: 'critical',
      message: 'Missing meta description'
    });
    missing_tags.push('meta description');
    score -= 20;
  } else if (scrapedData.description.length < 120) {
    issues.push({
      type: 'Description',
      severity: 'medium',
      message: 'Meta description is too short (less than 120 characters)'
    });
    score -= 10;
  } else if (scrapedData.description.length > 160) {
    issues.push({
      type: 'Description',
      severity: 'medium',
      message: 'Meta description is too long (more than 160 characters)'
    });
    score -= 10;
  }

  // Check Open Graph tags
  if (!scrapedData.og_tags['og:title']) {
    missing_tags.push('og:title');
    score -= 5;
  }
  if (!scrapedData.og_tags['og:description']) {
    missing_tags.push('og:description');
    score -= 5;
  }
  if (!scrapedData.og_tags['og:image']) {
    missing_tags.push('og:image');
    score -= 10;
  }
  if (!scrapedData.og_tags['og:url']) {
    missing_tags.push('og:url');
    score -= 5;
  }

  // Check Twitter Card tags
  if (!scrapedData.twitter_tags['twitter:card']) {
    missing_tags.push('twitter:card');
    score -= 5;
  }
  if (!scrapedData.twitter_tags['twitter:title']) {
    missing_tags.push('twitter:title');
    score -= 5;
  }
  if (!scrapedData.twitter_tags['twitter:description']) {
    missing_tags.push('twitter:description');
    score -= 5;
  }

  // Check canonical URL
  if (!scrapedData.canonical) {
    missing_tags.push('canonical URL');
    score -= 5;
  }

  // Check structured data
  if (scrapedData.structured_data.length === 0) {
    missing_tags.push('structured data');
    score -= 10;
  }

  return {
    issues,
    missing_tags,
    seo_score: Math.max(0, score)
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json() as MetaTagRequest;
    const { vendor = 'gemini' } = data;

    // Get vendor-specific API key for AI enhancement
    const aiApiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!aiApiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    let scrapedData: ScrapedMetaData | null = null;
    let analysis: any = null;

    // Step 1: If URL is provided, scrape existing meta tags
    if (data.url) {
      try {
        scrapedData = await scrapeMetaTags(data.url);
        const analysisResult = analyzeMetaTags(scrapedData);
        
        analysis = {
          existing_meta: {
            title: scrapedData.title,
            description: scrapedData.description,
            keywords: scrapedData.keywords,
            robots: scrapedData.robots,
            canonical: scrapedData.canonical,
            og_tags: scrapedData.og_tags,
            twitter_tags: scrapedData.twitter_tags,
            structured_data: scrapedData.structured_data
          },
          issues: analysisResult.issues,
          missing_tags: analysisResult.missing_tags
        };
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to analyze URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    // Step 2: Prepare data for AI enhancement
    const inputData = scrapedData ? {
      // Use scraped data as base
      title: scrapedData.title,
      description: scrapedData.description,
      keywords: scrapedData.keywords,
      author: scrapedData.author,
      robots: scrapedData.robots,
      canonical: scrapedData.canonical,
      og_title: scrapedData.og_tags['og:title'] || scrapedData.title,
      og_description: scrapedData.og_tags['og:description'] || scrapedData.description,
      og_image: scrapedData.og_tags['og:image'] || '',
      og_url: scrapedData.og_tags['og:url'] || scrapedData.canonical,
      og_type: scrapedData.og_tags['og:type'] || 'website',
      og_site_name: scrapedData.og_tags['og:site_name'] || '',
      twitter_card: scrapedData.twitter_tags['twitter:card'] || 'summary_large_image',
      twitter_title: scrapedData.twitter_tags['twitter:title'] || scrapedData.title,
      twitter_description: scrapedData.twitter_tags['twitter:description'] || scrapedData.description,
      twitter_image: scrapedData.twitter_tags['twitter:image'] || scrapedData.og_tags['og:image'] || '',
      twitter_site: scrapedData.twitter_tags['twitter:site'] || '',
      twitter_creator: scrapedData.twitter_tags['twitter:creator'] || '',
      schema_type: scrapedData.structured_data[0]?.['@type'] || 'WebPage',
      page_content: scrapedData.page_content
    } : {
      // Use manual input data
      title: data.title || '',
      description: data.description || '',
      keywords: data.keywords || '',
      author: data.author || '',
      robots: data.robots || 'index,follow',
      canonical: data.canonical || '',
      og_title: data.og_title || data.title || '',
      og_description: data.og_description || data.description || '',
      og_image: data.og_image || '',
      og_url: data.og_url || '',
      og_type: data.og_type || 'website',
      og_site_name: data.og_site_name || '',
      twitter_card: data.twitter_card || 'summary_large_image',
      twitter_title: data.twitter_title || data.title || '',
      twitter_description: data.twitter_description || data.description || '',
      twitter_image: data.twitter_image || '',
      twitter_site: data.twitter_site || '',
      twitter_creator: data.twitter_creator || '',
      schema_type: data.schema_type || 'WebPage'
    };

    // Validate required fields
    if (!inputData.title || !inputData.description) {
      return NextResponse.json(
        { error: 'Title and description are required (either provided manually or extracted from URL)' },
        { status: 400 }
      );
    }

    // Step 3: Use AI to enhance and optimize meta tags
    const aiVendor = AIVendorFactory.createVendor(vendor);
    
    const prompt = `You are an expert SEO specialist and web developer. ${scrapedData ? 'Analyze and optimize the existing meta tags from this website' : 'Generate comprehensive meta tags'} based on the following information:

${scrapedData ? 'EXISTING META TAGS ANALYSIS:' : 'INPUT DATA:'}
Title: "${inputData.title}"
Description: "${inputData.description}"
Keywords: "${inputData.keywords}"
Author: "${inputData.author}"
Robots: "${inputData.robots}"
Canonical: "${inputData.canonical}"
OG Title: "${inputData.og_title}"
OG Description: "${inputData.og_description}"
OG Image: "${inputData.og_image}"
OG URL: "${inputData.og_url}"
OG Type: "${inputData.og_type}"
OG Site Name: "${inputData.og_site_name}"
Twitter Card: "${inputData.twitter_card}"
Twitter Title: "${inputData.twitter_title}"
Twitter Description: "${inputData.twitter_description}"
Twitter Image: "${inputData.twitter_image}"
Twitter Site: "${inputData.twitter_site}"
Twitter Creator: "${inputData.twitter_creator}"
Schema Type: "${inputData.schema_type}"

${scrapedData ? `
CURRENT ISSUES FOUND:
${JSON.stringify(analysis.issues, null, 2)}

MISSING TAGS:
${analysis.missing_tags.join(', ')}

PAGE CONTENT CONTEXT:
Headings: ${scrapedData.page_content.headings.slice(0, 5).join(', ')}
Content Preview: ${scrapedData.page_content.text_content.substring(0, 300)}...
` : ''}

Provide an optimized JSON response with the following structure:

{
  "basic_meta": "HTML string with optimized basic meta tags",
  "open_graph": "HTML string with optimized Open Graph meta tags",
  "twitter_cards": "HTML string with optimized Twitter Card meta tags",
  "structured_data": "Optimized JSON-LD structured data script tag",
  "complete_html": "Complete optimized HTML head section with all meta tags",
  "seo_score": <number 0-100 based on optimization level>,
  "recommendations": [
    {
      "type": "recommendation category",
      "message": "specific actionable recommendation",
      "priority": "critical|high|medium|low"
    }
  ],
  "preview": {
    "google": {
      "title": "optimized title for Google search results",
      "description": "optimized description for Google search results",
      "url": "display URL"
    },
    "facebook": {
      "title": "optimized Facebook share title",
      "description": "optimized Facebook share description",
      "image": "optimized Facebook share image URL"
    },
    "twitter": {
      "title": "optimized Twitter card title",
      "description": "optimized Twitter card description",
      "image": "optimized Twitter card image URL"
    }
  }
}

${scrapedData ? 'OPTIMIZATION FOCUS:' : 'GENERATION FOCUS:'}
- ${scrapedData ? 'Fix identified issues and improve existing meta tags' : 'Create comprehensive meta tags from scratch'}
- Ensure title is 50-60 characters and compelling
- Ensure meta description is 150-160 characters and engaging
- Optimize Open Graph tags for social sharing
- Optimize Twitter Card tags for Twitter sharing
- Generate appropriate JSON-LD structured data
- Include all essential meta tags (viewport, charset, etc.)
- Provide actionable SEO recommendations
- Ensure all tags are properly formatted and escaped
- ${scrapedData ? 'Leverage page content context for better optimization' : 'Use provided data effectively'}
- Focus on user engagement and click-through rates
- Ensure consistency across all meta tag types

Make sure all HTML is properly formatted and ready to use. The complete_html should include all optimized meta tags in a proper head section.`;

    try {
      const response = await aiVendor.ask({
        prompt,
        api_key: aiApiKey,
      });

      // Try to parse AI response
      let result: MetaTagResult;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          result = {
            ...parsedResult,
            analysis: analysis // Add analysis data if URL was provided
          };
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to basic generation
        result = generateBasicMetaTags(inputData, analysis);
      }

      return NextResponse.json(result);

    } catch (aiError) {
      console.error('AI vendor error:', aiError);
      // Fallback to basic generation
      const fallbackResult = generateBasicMetaTags(inputData, analysis);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error('Error in Meta Tag Generator API:', error);
    return NextResponse.json(
      { error: 'Failed to generate meta tags' },
      { status: 500 }
    );
  }
}

function generateBasicMetaTags(inputData: any, analysis: any): MetaTagResult {
  // Generate basic meta tags as fallback
  const basicMeta = `<!-- Basic Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${inputData.title}</title>
<meta name="description" content="${inputData.description}">
${inputData.keywords ? `<meta name="keywords" content="${inputData.keywords}">` : ''}
${inputData.author ? `<meta name="author" content="${inputData.author}">` : ''}
<meta name="robots" content="${inputData.robots}">
${inputData.canonical ? `<link rel="canonical" href="${inputData.canonical}">` : ''}`;

  const openGraph = `<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${inputData.og_title}">
<meta property="og:description" content="${inputData.og_description}">
<meta property="og:type" content="${inputData.og_type}">
${inputData.og_url ? `<meta property="og:url" content="${inputData.og_url}">` : ''}
${inputData.og_image ? `<meta property="og:image" content="${inputData.og_image}">` : ''}
${inputData.og_site_name ? `<meta property="og:site_name" content="${inputData.og_site_name}">` : ''}`;

  const twitterCards = `<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="${inputData.twitter_card}">
<meta name="twitter:title" content="${inputData.twitter_title}">
<meta name="twitter:description" content="${inputData.twitter_description}">
${inputData.twitter_image ? `<meta name="twitter:image" content="${inputData.twitter_image}">` : ''}
${inputData.twitter_site ? `<meta name="twitter:site" content="${inputData.twitter_site}">` : ''}
${inputData.twitter_creator ? `<meta name="twitter:creator" content="${inputData.twitter_creator}">` : ''}`;

  const structuredData = `<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "${inputData.schema_type}",
  "name": "${inputData.title}",
  "description": "${inputData.description}",
  ${inputData.og_url ? `"url": "${inputData.og_url}",` : ''}
  ${inputData.og_image ? `"image": "${inputData.og_image}",` : ''}
  ${inputData.author ? `"author": {"@type": "Person", "name": "${inputData.author}"},` : ''}
  "dateModified": "${new Date().toISOString()}"
}
</script>`;

  const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
${basicMeta}

${openGraph}

${twitterCards}

${structuredData}
</head>
<body>
  <!-- Your page content here -->
</body>
</html>`;

  // Calculate basic SEO score
  let seoScore = 70;
  if (inputData.title.length >= 30 && inputData.title.length <= 60) seoScore += 10;
  if (inputData.description.length >= 120 && inputData.description.length <= 160) seoScore += 10;
  if (inputData.og_image) seoScore += 5;
  if (inputData.canonical) seoScore += 5;

  const recommendations = [
    {
      type: "Title Optimization",
      message: "Consider adding your brand name to the title for better recognition",
      priority: "medium"
    },
    {
      type: "Image Optimization", 
      message: "Add high-quality images for Open Graph and Twitter cards",
      priority: "high"
    },
    {
      type: "Structured Data",
      message: "Consider adding more specific structured data based on your content type",
      priority: "medium"
    }
  ];

  return {
    basic_meta: basicMeta,
    open_graph: openGraph,
    twitter_cards: twitterCards,
    structured_data: structuredData,
    complete_html: completeHtml,
    seo_score: seoScore,
    recommendations,
    preview: {
      google: {
        title: inputData.title,
        description: inputData.description,
        url: inputData.canonical || inputData.og_url || "https://example.com"
      },
      facebook: {
        title: inputData.og_title,
        description: inputData.og_description,
        image: inputData.og_image || ""
      },
      twitter: {
        title: inputData.twitter_title,
        description: inputData.twitter_description,
        image: inputData.twitter_image || ""
      }
    },
    analysis: analysis
  };
}