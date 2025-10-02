import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { GOOGLE_API_KEY, OPENAI_API_KEY } from "@/constants";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  score: number;
  status: 'good' | 'needs-improvement' | 'poor';
  description: string;
  threshold: {
    good: number;
    poor: number;
  };
}

interface Opportunity {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: string;
  category: string;
  recommendations: string[];
}

interface ResourceBreakdown {
  type: string;
  count: number;
  size: string;
  load_time: string;
  percentage: number;
}

interface PageSpeedResult {
  url: string;
  test_date: string;
  device_type: 'mobile' | 'desktop';
  overall_score: number;
  grade: string;
  metrics: {
    first_contentful_paint: PerformanceMetric;
    largest_contentful_paint: PerformanceMetric;
    first_input_delay: PerformanceMetric;
    cumulative_layout_shift: PerformanceMetric;
    speed_index: PerformanceMetric;
    time_to_interactive: PerformanceMetric;
  };
  opportunities: Opportunity[];
  resource_breakdown: ResourceBreakdown[];
  technical_details: {
    total_page_size: string;
    total_requests: number;
    dom_elements: number;
    server_response_time: string;
    compression_enabled: boolean;
    image_optimization: number;
    css_minification: boolean;
    js_minification: boolean;
    browser_caching: boolean;
    cdn_usage: boolean;
  };
  recommendations: {
    critical: string[];
    important: string[];
    minor: string[];
  };
  comparison: {
    industry_average: number;
    top_performers: number;
    your_score: number;
  };
}

async function getPageSpeedInsights(url: string, device: 'mobile' | 'desktop', apiKey: string) {
  try {
    const strategy = device === 'mobile' ? 'mobile' : 'desktop';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PageSpeed Insights API error:', error);
    return null;
  }
}

function parsePageSpeedData(data: any, url: string, device: 'mobile' | 'desktop') {
  const lighthouseResult = data.lighthouseResult;
  const audits = lighthouseResult.audits;
  const categories = lighthouseResult.categories;
  
  // Extract Core Web Vitals
  const fcp = audits['first-contentful-paint'];
  const lcp = audits['largest-contentful-paint'];
  const fid = audits['first-input-delay'] || audits['max-potential-fid'];
  const cls = audits['cumulative-layout-shift'];
  const si = audits['speed-index'];
  const tti = audits['interactive'];
  
  // Calculate overall score
  const performanceScore = Math.round((categories.performance?.score || 0) * 100);
  
  return {
    url,
    test_date: new Date().toISOString(),
    device_type: device,
    overall_score: performanceScore,
    grade: getGrade(performanceScore),
    raw_metrics: {
      fcp: fcp?.numericValue || 0,
      lcp: lcp?.numericValue || 0,
      fid: fid?.numericValue || 0,
      cls: cls?.numericValue || 0,
      si: si?.numericValue || 0,
      tti: tti?.numericValue || 0
    },
    opportunities: extractOpportunities(audits),
    diagnostics: extractDiagnostics(audits),
    performance_score: performanceScore,
    accessibility_score: Math.round((categories.accessibility?.score || 0) * 100),
    best_practices_score: Math.round((categories['best-practices']?.score || 0) * 100),
    seo_score: Math.round((categories.seo?.score || 0) * 100)
  };
}

function extractOpportunities(audits: any) {
  const opportunities = [];
  const opportunityAudits = [
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'duplicated-javascript',
    'legacy-javascript'
  ];
  
  for (const auditId of opportunityAudits) {
    const audit = audits[auditId];
    if (audit && audit.details && audit.details.overallSavingsMs > 0) {
      opportunities.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        savings_ms: audit.details.overallSavingsMs,
        savings_bytes: audit.details.overallSavingsBytes || 0
      });
    }
  }
  
  return opportunities;
}

function extractDiagnostics(audits: any) {
  const diagnostics = [];
  const diagnosticAudits = [
    'server-response-time',
    'dom-size',
    'critical-request-chains',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'uses-optimized-images',
    'uses-text-compression',
    'uses-responsive-images'
  ];
  
  for (const auditId of diagnosticAudits) {
    const audit = audits[auditId];
    if (audit) {
      diagnostics.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue
      });
    }
  }
  
  return diagnostics;
}

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getStatus(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export async function POST(request: NextRequest) {
  try {
    const { url, device_type = 'mobile', vendor = 'gemini' } = await request.json();
    
    // Get vendor-specific API key for AI refinement
    const aiApiKey = vendor === 'openai' ? OPENAI_API_KEY : GOOGLE_API_KEY;
    
    if (!aiApiKey) {
      return NextResponse.json({ error: `${vendor.toUpperCase()} API key not configured` }, { status: 500 });
    }

    // We need Google API key for PageSpeed Insights
    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'Google API key not configured for PageSpeed Insights' }, { status: 500 });
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

    // Step 1: Get real performance data from Google PageSpeed Insights
    const pageSpeedData = await getPageSpeedInsights(url, device_type, GOOGLE_API_KEY);
    
    if (!pageSpeedData) {
      return NextResponse.json(
        { error: 'Failed to analyze page speed. Please check if the URL is accessible.' },
        { status: 500 }
      );
    }

    // Step 2: Parse the PageSpeed data
    const parsedData = parsePageSpeedData(pageSpeedData, url, device_type);

    // Step 3: Use AI to refine analysis and provide enhanced recommendations
    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `Based on the following real PageSpeed Insights data, provide enhanced analysis and recommendations in JSON format:

REAL PAGESPEED DATA:
- URL: ${url}
- Device: ${device_type}
- Performance Score: ${parsedData.performance_score}/100
- Accessibility Score: ${parsedData.accessibility_score}/100
- Best Practices Score: ${parsedData.best_practices_score}/100
- SEO Score: ${parsedData.seo_score}/100

CORE WEB VITALS:
- First Contentful Paint: ${(parsedData.raw_metrics.fcp / 1000).toFixed(2)}s
- Largest Contentful Paint: ${(parsedData.raw_metrics.lcp / 1000).toFixed(2)}s
- First Input Delay: ${parsedData.raw_metrics.fid}ms
- Cumulative Layout Shift: ${parsedData.raw_metrics.cls.toFixed(3)}
- Speed Index: ${(parsedData.raw_metrics.si / 1000).toFixed(2)}s
- Time to Interactive: ${(parsedData.raw_metrics.tti / 1000).toFixed(2)}s

OPPORTUNITIES FOUND:
${JSON.stringify(parsedData.opportunities, null, 2)}

DIAGNOSTICS:
${JSON.stringify(parsedData.diagnostics, null, 2)}

Please provide enhanced analysis in this JSON format:

{
  "url": "${url}",
  "test_date": "${new Date().toISOString()}",
  "device_type": "${device_type}",
  "overall_score": ${parsedData.performance_score},
  "grade": "${parsedData.grade}",
  "metrics": {
    "first_contentful_paint": {
      "name": "First Contentful Paint",
      "value": ${(parsedData.raw_metrics.fcp / 1000).toFixed(2)},
      "unit": "s",
      "score": ${Math.round(100 - Math.min(100, (parsedData.raw_metrics.fcp / 1000 - 1.8) * 50))},
      "status": "${getStatus(parsedData.raw_metrics.fcp / 1000, { good: 1.8, poor: 3.0 })}",
      "description": "Time until the first text or image is painted",
      "threshold": { "good": 1.8, "poor": 3.0 }
    },
    "largest_contentful_paint": {
      "name": "Largest Contentful Paint",
      "value": ${(parsedData.raw_metrics.lcp / 1000).toFixed(2)},
      "unit": "s",
      "score": ${Math.round(100 - Math.min(100, (parsedData.raw_metrics.lcp / 1000 - 2.5) * 40))},
      "status": "${getStatus(parsedData.raw_metrics.lcp / 1000, { good: 2.5, poor: 4.0 })}",
      "description": "Time until the largest text or image is painted",
      "threshold": { "good": 2.5, "poor": 4.0 }
    },
    "first_input_delay": {
      "name": "First Input Delay",
      "value": ${parsedData.raw_metrics.fid},
      "unit": "ms",
      "score": ${Math.round(100 - Math.min(100, (parsedData.raw_metrics.fid - 100) * 0.5))},
      "status": "${getStatus(parsedData.raw_metrics.fid, { good: 100, poor: 300 })}",
      "description": "Time from when a user first interacts with your page to when the browser responds",
      "threshold": { "good": 100, "poor": 300 }
    },
    "cumulative_layout_shift": {
      "name": "Cumulative Layout Shift",
      "value": ${parsedData.raw_metrics.cls.toFixed(3)},
      "unit": "",
      "score": ${Math.round(100 - Math.min(100, (parsedData.raw_metrics.cls - 0.1) * 400))},
      "status": "${getStatus(parsedData.raw_metrics.cls, { good: 0.1, poor: 0.25 })}",
      "description": "Measures visual stability by quantifying unexpected layout shifts",
      "threshold": { "good": 0.1, "poor": 0.25 }
    },
    "speed_index": {
      "name": "Speed Index",
      "value": ${(parsedData.raw_metrics.si / 1000).toFixed(2)},
      "unit": "s",
      "score": ${Math.round(100 - Math.min(100, (parsedData.raw_metrics.si / 1000 - 3.4) * 30))},
      "status": "${getStatus(parsedData.raw_metrics.si / 1000, { good: 3.4, poor: 5.8 })}",
      "description": "How quickly the contents of a page are visibly populated",
      "threshold": { "good": 3.4, "poor": 5.8 }
    },
    "time_to_interactive": {
      "name": "Time to Interactive",
      "value": ${(parsedData.raw_metrics.tti / 1000).toFixed(2)},
      "unit": "s",
      "score": ${Math.round(100 - Math.min(100, (parsedData.raw_metrics.tti / 1000 - 3.8) * 25))},
      "status": "${getStatus(parsedData.raw_metrics.tti / 1000, { good: 3.8, poor: 7.3 })}",
      "description": "Time until the page becomes fully interactive",
      "threshold": { "good": 3.8, "poor": 7.3 }
    }
  },
  "opportunities": [
    // Enhanced opportunities based on real data with actionable recommendations
  ],
  "resource_breakdown": [
    // Estimated resource breakdown
  ],
  "technical_details": {
    "total_page_size": "Unknown",
    "total_requests": 0,
    "dom_elements": 0,
    "server_response_time": "Unknown",
    "compression_enabled": true,
    "image_optimization": 70,
    "css_minification": true,
    "js_minification": true,
    "browser_caching": true,
    "cdn_usage": false
  },
  "recommendations": {
    "critical": [
      // Based on real performance issues found
    ],
    "important": [
      // Based on opportunities for improvement
    ],
    "minor": [
      // Minor optimizations
    ]
  },
  "comparison": {
    "industry_average": 65,
    "top_performers": 90,
    "your_score": ${parsedData.performance_score}
  }
}

Focus on actionable recommendations based on the real performance data. Prioritize the most impactful optimizations.`;

    try {
      const response = await aiVendor.ask({
        prompt,
        api_key: aiApiKey
      });

      // Try to parse AI response
      let analysisResult: PageSpeedResult;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to basic analysis based on real data
        analysisResult = generateBasicPageSpeedAnalysis(parsedData, url, device_type);
      }

      return NextResponse.json(analysisResult);

    } catch (aiError) {
      console.error('AI vendor error:', aiError);
      // Fallback to basic analysis
      const fallbackResult = generateBasicPageSpeedAnalysis(parsedData, url, device_type);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error('Error in page speed test:', error);
    return NextResponse.json(
      { error: 'Failed to analyze page speed' },
      { status: 500 }
    );
  }
}

function generateBasicPageSpeedAnalysis(parsedData: any, url: string, device_type: 'mobile' | 'desktop'): PageSpeedResult {
  const fcpScore = Math.round(100 - Math.min(100, Math.max(0, (parsedData.raw_metrics.fcp / 1000 - 1.8) * 50)));
  const lcpScore = Math.round(100 - Math.min(100, Math.max(0, (parsedData.raw_metrics.lcp / 1000 - 2.5) * 40)));
  const fidScore = Math.round(100 - Math.min(100, Math.max(0, (parsedData.raw_metrics.fid - 100) * 0.5)));
  const clsScore = Math.round(100 - Math.min(100, Math.max(0, (parsedData.raw_metrics.cls - 0.1) * 400)));
  const siScore = Math.round(100 - Math.min(100, Math.max(0, (parsedData.raw_metrics.si / 1000 - 3.4) * 30)));
  const ttiScore = Math.round(100 - Math.min(100, Math.max(0, (parsedData.raw_metrics.tti / 1000 - 3.8) * 25)));

  return {
    url,
    test_date: new Date().toISOString(),
    device_type,
    overall_score: parsedData.performance_score,
    grade: parsedData.grade,
    metrics: {
      first_contentful_paint: {
        name: 'First Contentful Paint',
        value: parseFloat((parsedData.raw_metrics.fcp / 1000).toFixed(2)),
        unit: 's',
        score: fcpScore,
        status: getStatus(parsedData.raw_metrics.fcp / 1000, { good: 1.8, poor: 3.0 }),
        description: 'Time until the first text or image is painted',
        threshold: { good: 1.8, poor: 3.0 }
      },
      largest_contentful_paint: {
        name: 'Largest Contentful Paint',
        value: parseFloat((parsedData.raw_metrics.lcp / 1000).toFixed(2)),
        unit: 's',
        score: lcpScore,
        status: getStatus(parsedData.raw_metrics.lcp / 1000, { good: 2.5, poor: 4.0 }),
        description: 'Time until the largest text or image is painted',
        threshold: { good: 2.5, poor: 4.0 }
      },
      first_input_delay: {
        name: 'First Input Delay',
        value: parsedData.raw_metrics.fid,
        unit: 'ms',
        score: fidScore,
        status: getStatus(parsedData.raw_metrics.fid, { good: 100, poor: 300 }),
        description: 'Time from when a user first interacts with your page to when the browser responds',
        threshold: { good: 100, poor: 300 }
      },
      cumulative_layout_shift: {
        name: 'Cumulative Layout Shift',
        value: parseFloat(parsedData.raw_metrics.cls.toFixed(3)),
        unit: '',
        score: clsScore,
        status: getStatus(parsedData.raw_metrics.cls, { good: 0.1, poor: 0.25 }),
        description: 'Measures visual stability by quantifying unexpected layout shifts',
        threshold: { good: 0.1, poor: 0.25 }
      },
      speed_index: {
        name: 'Speed Index',
        value: parseFloat((parsedData.raw_metrics.si / 1000).toFixed(2)),
        unit: 's',
        score: siScore,
        status: getStatus(parsedData.raw_metrics.si / 1000, { good: 3.4, poor: 5.8 }),
        description: 'How quickly the contents of a page are visibly populated',
        threshold: { good: 3.4, poor: 5.8 }
      },
      time_to_interactive: {
        name: 'Time to Interactive',
        value: parseFloat((parsedData.raw_metrics.tti / 1000).toFixed(2)),
        unit: 's',
        score: ttiScore,
        status: getStatus(parsedData.raw_metrics.tti / 1000, { good: 3.8, poor: 7.3 }),
        description: 'Time until the page becomes fully interactive',
        threshold: { good: 3.8, poor: 7.3 }
      }
    },
    opportunities: parsedData.opportunities.map((opp: any) => ({
      title: opp.title,
      description: opp.description,
      impact: opp.savings_ms > 1000 ? 'high' : opp.savings_ms > 500 ? 'medium' : 'low',
      savings: `${(opp.savings_ms / 1000).toFixed(1)}s`,
      category: getCategoryFromId(opp.id),
      recommendations: getRecommendationsFromId(opp.id)
    })),
    resource_breakdown: [
      { type: 'Images', count: 0, size: 'Unknown', load_time: 'Unknown', percentage: 40 },
      { type: 'JavaScript', count: 0, size: 'Unknown', load_time: 'Unknown', percentage: 30 },
      { type: 'CSS', count: 0, size: 'Unknown', load_time: 'Unknown', percentage: 15 },
      { type: 'HTML', count: 0, size: 'Unknown', load_time: 'Unknown', percentage: 10 },
      { type: 'Other', count: 0, size: 'Unknown', load_time: 'Unknown', percentage: 5 }
    ],
    technical_details: {
      total_page_size: 'Unknown',
      total_requests: 0,
      dom_elements: 0,
      server_response_time: 'Unknown',
      compression_enabled: true,
      image_optimization: 70,
      css_minification: true,
      js_minification: true,
      browser_caching: true,
      cdn_usage: false
    },
    recommendations: {
      critical: parsedData.opportunities
        .filter((opp: any) => opp.savings_ms > 1000)
        .map((opp: any) => opp.title)
        .slice(0, 3),
      important: parsedData.opportunities
        .filter((opp: any) => opp.savings_ms > 500 && opp.savings_ms <= 1000)
        .map((opp: any) => opp.title)
        .slice(0, 3),
      minor: parsedData.opportunities
        .filter((opp: any) => opp.savings_ms <= 500)
        .map((opp: any) => opp.title)
        .slice(0, 3)
    },
    comparison: {
      industry_average: device_type === 'mobile' ? 65 : 75,
      top_performers: device_type === 'mobile' ? 85 : 90,
      your_score: parsedData.performance_score
    }
  };
}

function getCategoryFromId(id: string): string {
  if (id.includes('image')) return 'Images';
  if (id.includes('css')) return 'CSS';
  if (id.includes('javascript')) return 'JavaScript';
  if (id.includes('render-blocking')) return 'Rendering';
  return 'Performance';
}

function getRecommendationsFromId(id: string): string[] {
  const recommendations: { [key: string]: string[] } = {
    'unused-css-rules': ['Remove unused CSS rules', 'Use CSS tree shaking', 'Split CSS by pages'],
    'unused-javascript': ['Remove unused JavaScript', 'Use code splitting', 'Implement lazy loading'],
    'modern-image-formats': ['Use WebP format', 'Use AVIF for better compression', 'Implement responsive images'],
    'offscreen-images': ['Implement lazy loading', 'Use intersection observer', 'Defer off-screen images'],
    'render-blocking-resources': ['Inline critical CSS', 'Defer non-critical JavaScript', 'Use async/defer attributes'],
    'unminified-css': ['Minify CSS files', 'Use build tools for optimization', 'Remove comments and whitespace'],
    'unminified-javascript': ['Minify JavaScript files', 'Use build tools for optimization', 'Remove console logs']
  };
  
  return recommendations[id] || ['Optimize this resource', 'Follow best practices', 'Monitor performance impact'];
}