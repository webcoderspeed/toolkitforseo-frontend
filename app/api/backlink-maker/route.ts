import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { outputParser } from '@/lib/output-parser';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const { domain, keywords, vendor = 'gemini' } = await request.json();
    // Get vendor-specific API key
    const apiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    

    const aiVendor = AIVendorFactory.createVendor(vendor);
    
    const prompt = `You are an expert SEO and link building strategist. Analyze the domain "${domain}" and create a comprehensive backlink building strategy.

${keywords ? `Focus on these target keywords: ${keywords}` : ''}

Provide a detailed JSON response with the following structure:

{
  "domain": "${domain}",
  "niche": "identified industry/niche",
  "target_keywords": ["keyword1", "keyword2", "keyword3"],
  "opportunities": [
    {
      "domain": "example.com",
      "url": "https://example.com/resource-page",
      "domain_authority": 65,
      "page_authority": 45,
      "spam_score": 15,
      "traffic_estimate": 25000,
      "opportunity_type": "guest_post|resource_page|broken_link|directory|skyscraper",
      "difficulty": "easy|medium|hard",
      "contact_info": {
        "email": "editor@example.com",
        "contact_form": "https://example.com/contact",
        "social_media": ["@example_twitter"]
      },
      "content_requirements": {
        "type": "guest post|resource|infographic|tool",
        "word_count": 1500,
        "topics": ["topic1", "topic2"],
        "guidelines": ["guideline1", "guideline2"]
      },
      "success_probability": 75,
      "estimated_timeline": "2-4 weeks",
      "notes": "Specific notes about this opportunity"
    }
  ],
  "strategy_summary": {
    "total_opportunities": 15,
    "high_priority": 5,
    "medium_priority": 7,
    "low_priority": 3,
    "estimated_success_rate": 65
  },
  "content_calendar": [
    {
      "week": "Week 1-2",
      "content_type": "Guest Post",
      "target_sites": ["site1.com", "site2.com"],
      "keywords": ["keyword1", "keyword2"],
      "status": "planned|in_progress|completed"
    }
  ],
  "outreach_templates": [
    {
      "type": "guest_post",
      "subject": "Guest Post Proposal: [Topic] for [Website]",
      "template": "Hi [Name],\\n\\nI hope this email finds you well. I'm [Your Name] from [Your Company], and I've been following [Website] for some time now.\\n\\nI noticed your recent article on [Topic] and found it incredibly insightful. I'd love to contribute a guest post that would provide additional value to your readers.\\n\\nI'm thinking of writing about [Specific Topic] which would complement your existing content perfectly. Here's a brief outline:\\n\\n- Point 1\\n- Point 2\\n- Point 3\\n\\nI've previously written for [Other Publications] and can provide samples of my work. Would you be interested in this collaboration?\\n\\nBest regards,\\n[Your Name]",
      "success_rate": 25
    }
  ],
  "tracking_metrics": [
    {
      "metric": "Total Backlinks",
      "current_value": 150,
      "target_value": 300,
      "timeline": "6 months"
    }
  ],
  "recommendations": {
    "immediate_actions": [
      "Create high-quality content assets",
      "Set up outreach tracking system",
      "Research competitor backlink profiles"
    ],
    "long_term_strategy": [
      "Build relationships with industry influencers",
      "Create linkable assets regularly",
      "Monitor brand mentions for link opportunities"
    ],
    "tools_needed": [
      "Ahrefs or SEMrush for backlink analysis",
      "Outreach management tool",
      "Content creation tools"
    ],
    "budget_estimate": "$2,000-5,000/month"
  }
}

Provide at least 10-15 realistic backlink opportunities with detailed information. Focus on opportunities that are actually achievable for the given domain and niche. Include a mix of difficulty levels and opportunity types.`;

    try {
      const response = await aiVendor.ask({
        prompt: prompt,
        api_key: apiKey
      });

      const parsedResult = outputParser(response) as any;
      
      if (!parsedResult || typeof parsedResult !== 'object') {
        throw new Error('Invalid response format from AI');
      }

      return NextResponse.json(parsedResult);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback data
      const fallbackData = {
        domain: domain,
        niche: "Digital Marketing",
        target_keywords: keywords ? keywords.split(',').map((k: string) => k.trim()).slice(0, 5) : ["SEO", "digital marketing", "content marketing", "link building", "online marketing"],
        opportunities: [
          {
            domain: "marketingland.com",
            url: "https://marketingland.com/write-for-us",
            domain_authority: 78,
            page_authority: 65,
            spam_score: 12,
            traffic_estimate: 150000,
            opportunity_type: "guest_post",
            difficulty: "medium",
            contact_info: {
              email: "editor@marketingland.com",
              contact_form: "https://marketingland.com/contact",
              social_media: ["@marketingland"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 2000,
              topics: ["SEO trends", "digital marketing strategies", "content optimization"],
              guidelines: ["Original content only", "Include data and examples", "No promotional content"]
            },
            success_probability: 65,
            estimated_timeline: "3-4 weeks",
            notes: "High-authority site with strict editorial guidelines. Focus on data-driven content."
          },
          {
            domain: "searchengineland.com",
            url: "https://searchengineland.com/contribute",
            domain_authority: 82,
            page_authority: 70,
            spam_score: 8,
            traffic_estimate: 200000,
            opportunity_type: "guest_post",
            difficulty: "hard",
            contact_info: {
              email: "editorial@searchengineland.com",
              contact_form: "https://searchengineland.com/contact-us",
              social_media: ["@sengineland"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 2500,
              topics: ["search engine optimization", "PPC advertising", "search marketing"],
              guidelines: ["Expert-level content", "Industry insights", "Case studies preferred"]
            },
            success_probability: 35,
            estimated_timeline: "4-6 weeks",
            notes: "Premium publication requiring expert-level content and industry credentials."
          },
          {
            domain: "contentmarketinginstitute.com",
            url: "https://contentmarketinginstitute.com/resources",
            domain_authority: 75,
            page_authority: 55,
            spam_score: 15,
            traffic_estimate: 120000,
            opportunity_type: "resource_page",
            difficulty: "easy",
            contact_info: {
              email: "info@contentmarketinginstitute.com",
              contact_form: "https://contentmarketinginstitute.com/contact",
              social_media: ["@CMIContent"]
            },
            content_requirements: {
              type: "resource",
              word_count: 500,
              topics: ["content marketing tools", "marketing resources", "industry guides"],
              guidelines: ["High-quality resources only", "Must provide value", "No direct competitors"]
            },
            success_probability: 80,
            estimated_timeline: "1-2 weeks",
            notes: "Resource page with regular updates. Good opportunity for tool listings."
          },
          {
            domain: "moz.com",
            url: "https://moz.com/community",
            domain_authority: 91,
            page_authority: 75,
            spam_score: 5,
            traffic_estimate: 300000,
            opportunity_type: "guest_post",
            difficulty: "hard",
            contact_info: {
              email: "community@moz.com",
              contact_form: "https://moz.com/contact",
              social_media: ["@Moz"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 3000,
              topics: ["SEO research", "link building", "technical SEO", "local SEO"],
              guidelines: ["Original research required", "Data-driven insights", "Expert author credentials"]
            },
            success_probability: 25,
            estimated_timeline: "6-8 weeks",
            notes: "Top-tier SEO publication. Requires exceptional content and industry expertise."
          },
          {
            domain: "hubspot.com",
            url: "https://blog.hubspot.com/marketing/guest-blogging",
            domain_authority: 95,
            page_authority: 80,
            spam_score: 3,
            traffic_estimate: 500000,
            opportunity_type: "guest_post",
            difficulty: "hard",
            contact_info: {
              email: "blog@hubspot.com",
              contact_form: "https://www.hubspot.com/contact-us",
              social_media: ["@HubSpot"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 2500,
              topics: ["inbound marketing", "sales enablement", "marketing automation"],
              guidelines: ["Actionable advice", "Include examples", "Professional writing quality"]
            },
            success_probability: 20,
            estimated_timeline: "8-12 weeks",
            notes: "Premium marketing blog with very selective acceptance criteria."
          },
          {
            domain: "socialmediaexaminer.com",
            url: "https://www.socialmediaexaminer.com/write-for-social-media-examiner",
            domain_authority: 79,
            page_authority: 68,
            spam_score: 10,
            traffic_estimate: 180000,
            opportunity_type: "guest_post",
            difficulty: "medium",
            contact_info: {
              email: "editorial@socialmediaexaminer.com",
              contact_form: "https://www.socialmediaexaminer.com/contact",
              social_media: ["@SMExaminer"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 2000,
              topics: ["social media marketing", "content strategy", "social media tools"],
              guidelines: ["How-to format preferred", "Include screenshots", "Actionable tips"]
            },
            success_probability: 55,
            estimated_timeline: "3-5 weeks",
            notes: "Active guest posting program with clear guidelines and regular publication."
          },
          {
            domain: "copyblogger.com",
            url: "https://copyblogger.com/guest-author-program",
            domain_authority: 77,
            page_authority: 62,
            spam_score: 12,
            traffic_estimate: 140000,
            opportunity_type: "guest_post",
            difficulty: "medium",
            contact_info: {
              email: "guest@copyblogger.com",
              contact_form: "https://copyblogger.com/contact",
              social_media: ["@Copyblogger"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 1800,
              topics: ["copywriting", "content marketing", "email marketing", "conversion optimization"],
              guidelines: ["Educational content", "No promotional material", "Expert insights"]
            },
            success_probability: 60,
            estimated_timeline: "2-4 weeks",
            notes: "Well-established content marketing blog with active guest author program."
          },
          {
            domain: "neilpatel.com",
            url: "https://neilpatel.com/blog",
            domain_authority: 85,
            page_authority: 72,
            spam_score: 8,
            traffic_estimate: 250000,
            opportunity_type: "guest_post",
            difficulty: "hard",
            contact_info: {
              email: "team@neilpatel.com",
              contact_form: "https://neilpatel.com/contact",
              social_media: ["@neilpatel"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 2200,
              topics: ["digital marketing", "SEO", "growth hacking", "analytics"],
              guidelines: ["Data-driven content", "Case studies", "Actionable strategies"]
            },
            success_probability: 30,
            estimated_timeline: "4-6 weeks",
            notes: "High-traffic marketing blog by industry expert. Requires exceptional content quality."
          },
          {
            domain: "searchenginejournal.com",
            url: "https://www.searchenginejournal.com/write-for-us",
            domain_authority: 80,
            page_authority: 65,
            spam_score: 9,
            traffic_estimate: 190000,
            opportunity_type: "guest_post",
            difficulty: "medium",
            contact_info: {
              email: "editor@searchenginejournal.com",
              contact_form: "https://www.searchenginejournal.com/contact",
              social_media: ["@sejournal"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 2000,
              topics: ["SEO", "PPC", "social media", "content marketing"],
              guidelines: ["Industry expertise required", "Original insights", "Professional quality"]
            },
            success_probability: 50,
            estimated_timeline: "3-4 weeks",
            notes: "Established SEO publication with regular guest posting opportunities."
          },
          {
            domain: "quicksprout.com",
            url: "https://www.quicksprout.com/guest-posting",
            domain_authority: 73,
            page_authority: 58,
            spam_score: 14,
            traffic_estimate: 110000,
            opportunity_type: "guest_post",
            difficulty: "easy",
            contact_info: {
              email: "guest@quicksprout.com",
              contact_form: "https://www.quicksprout.com/contact",
              social_media: ["@quicksprout"]
            },
            content_requirements: {
              type: "guest post",
              word_count: 1500,
              topics: ["entrepreneurship", "marketing", "business growth", "startups"],
              guidelines: ["Practical advice", "Personal experiences", "Actionable tips"]
            },
            success_probability: 75,
            estimated_timeline: "2-3 weeks",
            notes: "Business and marketing blog with active guest posting program and quick response times."
          }
        ],
        strategy_summary: {
          total_opportunities: 10,
          high_priority: 3,
          medium_priority: 5,
          low_priority: 2,
          estimated_success_rate: 52
        },
        content_calendar: [
          {
            week: "Week 1-2",
            content_type: "Resource Page Submissions",
            target_sites: ["contentmarketinginstitute.com", "quicksprout.com"],
            keywords: ["marketing tools", "SEO resources"],
            status: "planned"
          },
          {
            week: "Week 3-4",
            content_type: "Guest Post Outreach",
            target_sites: ["copyblogger.com", "socialmediaexaminer.com"],
            keywords: ["content marketing", "social media"],
            status: "planned"
          },
          {
            week: "Week 5-6",
            content_type: "High-Authority Pitches",
            target_sites: ["searchenginejournal.com", "marketingland.com"],
            keywords: ["SEO", "digital marketing"],
            status: "planned"
          },
          {
            week: "Week 7-8",
            content_type: "Premium Publications",
            target_sites: ["moz.com", "neilpatel.com"],
            keywords: ["advanced SEO", "growth hacking"],
            status: "planned"
          }
        ],
        outreach_templates: [
          {
            type: "guest_post",
            subject: "Guest Post Proposal: [Topic] for [Website]",
            template: "Hi [Name],\n\nI hope this email finds you well. I'm [Your Name] from [Your Company], and I've been following [Website] for some time now.\n\nI noticed your recent article on [Topic] and found it incredibly insightful. I'd love to contribute a guest post that would provide additional value to your readers.\n\nI'm thinking of writing about [Specific Topic] which would complement your existing content perfectly. Here's a brief outline:\n\n- Point 1\n- Point 2\n- Point 3\n\nI've previously written for [Other Publications] and can provide samples of my work. Would you be interested in this collaboration?\n\nBest regards,\n[Your Name]",
            success_rate: 25
          },
          {
            type: "resource_page",
            subject: "Resource Suggestion for [Page Title]",
            template: "Hi [Name],\n\nI came across your excellent resource page on [Topic] at [URL] and found it incredibly helpful.\n\nI noticed you've curated some fantastic tools and resources. I thought you might be interested in [Your Resource/Tool], which [Brief Description of Value].\n\nHere's why I think it would be a great addition to your page:\n\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\nYou can check it out at [Your URL]. If you think it would be valuable for your audience, I'd be honored to have it included.\n\nThanks for maintaining such a valuable resource!\n\nBest,\n[Your Name]",
            success_rate: 35
          },
          {
            type: "broken_link",
            subject: "Broken Link Found on [Page Title]",
            template: "Hi [Name],\n\nI was browsing your excellent article on [Topic] at [URL] and noticed that one of the links appears to be broken.\n\nThe link to [Broken Link Description] (pointing to [Broken URL]) returns a 404 error.\n\nI actually have a similar resource that might serve as a good replacement: [Your URL]. It covers [Brief Description] and would provide similar value to your readers.\n\nWould you consider updating the link? I'd be happy to help in any way.\n\nThanks for the great content!\n\nBest regards,\n[Your Name]",
            success_rate: 45
          }
        ],
        tracking_metrics: [
          {
            metric: "Total Backlinks",
            current_value: 150,
            target_value: 300,
            timeline: "6 months"
          },
          {
            metric: "Referring Domains",
            current_value: 85,
            target_value: 150,
            timeline: "6 months"
          },
          {
            metric: "Domain Authority",
            current_value: 35,
            target_value: 45,
            timeline: "12 months"
          },
          {
            metric: "Organic Traffic",
            current_value: 5000,
            target_value: 15000,
            timeline: "9 months"
          },
          {
            metric: "Guest Posts Published",
            current_value: 0,
            target_value: 24,
            timeline: "6 months"
          }
        ],
        recommendations: {
          immediate_actions: [
            "Create high-quality content assets (infographics, guides, tools)",
            "Set up outreach tracking system using CRM or spreadsheet",
            "Research competitor backlink profiles for additional opportunities",
            "Develop author bio and portfolio of published work",
            "Create email templates for different outreach scenarios"
          ],
          long_term_strategy: [
            "Build relationships with industry influencers and editors",
            "Create linkable assets regularly (monthly reports, studies)",
            "Monitor brand mentions for unlinked mention opportunities",
            "Develop thought leadership through speaking and podcasts",
            "Build internal linking structure to support new backlinks"
          ],
          tools_needed: [
            "Ahrefs or SEMrush for backlink analysis and prospecting",
            "Outreach management tool (Pitchbox, BuzzStream, or Mailshake)",
            "Content creation tools (Canva, Adobe Creative Suite)",
            "Email finder tools (Hunter.io, Voila Norbert)",
            "Link monitoring tools (Google Search Console, Ahrefs Alerts)"
          ],
          budget_estimate: "$2,000-5,000/month"
        }
      };

      return NextResponse.json(fallbackData);
    }
  } catch (error) {
    console.error('Error in backlink-maker API:', error);
    return NextResponse.json(
      { error: 'Failed to generate backlink strategy' },
      { status: 500 }
    );
  }
}