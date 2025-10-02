import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { outputParser } from '@/lib/output-parser';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";

interface MetaTagRequest {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  og_type: string;
  og_site_name: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  twitter_site: string;
  twitter_creator: string;
  schema_type: string;
  schema_data: any;
  additional_tags: Array<{
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
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json() as MetaTagRequest;
    const { vendor = 'gemini' } = data;
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    

    const aiVendor = AIVendorFactory.createVendor(vendor);
    
    const prompt = `You are an expert SEO specialist and web developer. Generate comprehensive meta tags based on the following information:

Title: "${data.title}"
Description: "${data.description}"
Keywords: "${data.keywords}"
Author: "${data.author}"
Robots: "${data.robots}"
Canonical: "${data.canonical}"
OG Title: "${data.og_title}"
OG Description: "${data.og_description}"
OG Image: "${data.og_image}"
OG URL: "${data.og_url}"
OG Type: "${data.og_type}"
OG Site Name: "${data.og_site_name}"
Twitter Card: "${data.twitter_card}"
Twitter Title: "${data.twitter_title}"
Twitter Description: "${data.twitter_description}"
Twitter Image: "${data.twitter_image}"
Twitter Site: "${data.twitter_site}"
Twitter Creator: "${data.twitter_creator}"
Schema Type: "${data.schema_type}"

Provide a detailed JSON response with the following structure:

{
  "basic_meta": "HTML string with basic meta tags",
  "open_graph": "HTML string with Open Graph meta tags",
  "twitter_cards": "HTML string with Twitter Card meta tags",
  "structured_data": "JSON-LD structured data script tag",
  "complete_html": "Complete HTML head section with all meta tags",
  "seo_score": <number 0-100>,
  "recommendations": [
    {
      "type": "recommendation category",
      "message": "specific recommendation",
      "priority": "high|medium|low"
    }
  ],
  "preview": {
    "google": {
      "title": "how it appears in Google search",
      "description": "how description appears in Google search",
      "url": "display URL"
    },
    "facebook": {
      "title": "Facebook share title",
      "description": "Facebook share description",
      "image": "Facebook share image URL"
    },
    "twitter": {
      "title": "Twitter card title",
      "description": "Twitter card description",
      "image": "Twitter card image URL"
    }
  }
}

Generate optimized meta tags following these SEO best practices:
- Title should be 50-60 characters
- Meta description should be 150-160 characters
- Include proper Open Graph tags for social sharing
- Include Twitter Card tags for Twitter sharing
- Generate appropriate JSON-LD structured data
- Include viewport, charset, and other essential meta tags
- Provide SEO score based on completeness and optimization
- Give specific recommendations for improvement
- Ensure all tags are properly formatted and escaped
- Include canonical URL if provided
- Add robots meta tag with appropriate directives
- Include author meta tag if provided
- Add keywords meta tag if provided (though less important for modern SEO)

Make sure all HTML is properly formatted and ready to use. The complete_html should include all meta tags in a proper head section.`;

    try {
      const response = await aiVendor.ask({
        prompt,
        api_key: apiKey,
      });

      const parsedResult = outputParser(response) as MetaTagResult;
      
      if (parsedResult) {
        return NextResponse.json(parsedResult);
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Generate fallback meta tags
      const basicMeta = `<!-- Basic Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<meta name="description" content="${data.description}">
${data.keywords ? `<meta name="keywords" content="${data.keywords}">` : ''}
${data.author ? `<meta name="author" content="${data.author}">` : ''}
<meta name="robots" content="${data.robots}">
${data.canonical ? `<link rel="canonical" href="${data.canonical}">` : ''}`;

      const openGraph = `<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${data.og_title || data.title}">
<meta property="og:description" content="${data.og_description || data.description}">
<meta property="og:type" content="${data.og_type}">
${data.og_url ? `<meta property="og:url" content="${data.og_url}">` : ''}
${data.og_image ? `<meta property="og:image" content="${data.og_image}">` : ''}
${data.og_site_name ? `<meta property="og:site_name" content="${data.og_site_name}">` : ''}`;

      const twitterCards = `<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="${data.twitter_card}">
<meta name="twitter:title" content="${data.twitter_title || data.title}">
<meta name="twitter:description" content="${data.twitter_description || data.description}">
${data.twitter_image ? `<meta name="twitter:image" content="${data.twitter_image}">` : ''}
${data.twitter_site ? `<meta name="twitter:site" content="${data.twitter_site}">` : ''}
${data.twitter_creator ? `<meta name="twitter:creator" content="${data.twitter_creator}">` : ''}`;

      const structuredData = `<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "${data.schema_type}",
  "name": "${data.title}",
  "description": "${data.description}",
  ${data.og_url ? `"url": "${data.og_url}",` : ''}
  ${data.og_image ? `"image": "${data.og_image}",` : ''}
  ${data.author ? `"author": {"@type": "Person", "name": "${data.author}"},` : ''}
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

      const fallbackData: MetaTagResult = {
        basic_meta: basicMeta,
        open_graph: openGraph,
        twitter_cards: twitterCards,
        structured_data: structuredData,
        complete_html: completeHtml,
        seo_score: 75,
        recommendations: [
          {
            type: "Title Optimization",
            message: "Consider adding your brand name to the title for better recognition",
            priority: "medium"
          },
          {
            type: "Image Optimization",
            message: "Add Open Graph and Twitter images for better social sharing",
            priority: "high"
          },
          {
            type: "Structured Data",
            message: "Consider adding more specific structured data based on your content type",
            priority: "medium"
          }
        ],
        preview: {
          google: {
            title: data.title,
            description: data.description,
            url: data.canonical || data.og_url || "https://example.com"
          },
          facebook: {
            title: data.og_title || data.title,
            description: data.og_description || data.description,
            image: data.og_image || ""
          },
          twitter: {
            title: data.twitter_title || data.title,
            description: data.twitter_description || data.description,
            image: data.twitter_image || ""
          }
        }
      };

      return NextResponse.json(fallbackData);
    }
  } catch (error) {
    console.error('Error in Meta Tag Generator API:', error);
    return NextResponse.json(
      { error: 'Failed to generate meta tags' },
      { status: 500 }
    );
  }
}