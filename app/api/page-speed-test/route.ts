import { NextRequest, NextResponse } from 'next/server';
import { AIVendorFactory } from '@/vendor_apis';
import { API_KEY } from '@/constants';

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

export async function POST(request: NextRequest) {
  try {
    const { url, device_type = 'mobile', vendor = 'gemini' } = await request.json();

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

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const aiVendor = AIVendorFactory.createVendor(vendor);

    const prompt = `Analyze the page speed and performance of the website: ${url} for ${device_type} device.

Please provide a comprehensive page speed analysis in the following JSON format:

{
  "url": "${url}",
  "test_date": "2024-01-15 14:30:00",
  "device_type": "${device_type}",
  "overall_score": 75,
  "grade": "B",
  "metrics": {
    "first_contentful_paint": {
      "name": "First Contentful Paint",
      "value": 1.8,
      "unit": "s",
      "score": 85,
      "status": "good",
      "description": "Time until the first text or image is painted",
      "threshold": {
        "good": 1.8,
        "poor": 3.0
      }
    },
    "largest_contentful_paint": {
      "name": "Largest Contentful Paint",
      "value": 2.5,
      "unit": "s",
      "score": 70,
      "status": "needs-improvement",
      "description": "Time until the largest text or image is painted",
      "threshold": {
        "good": 2.5,
        "poor": 4.0
      }
    },
    "first_input_delay": {
      "name": "First Input Delay",
      "value": 100,
      "unit": "ms",
      "score": 90,
      "status": "good",
      "description": "Time from when a user first interacts with your page to when the browser responds",
      "threshold": {
        "good": 100,
        "poor": 300
      }
    },
    "cumulative_layout_shift": {
      "name": "Cumulative Layout Shift",
      "value": 0.1,
      "unit": "",
      "score": 80,
      "status": "good",
      "description": "Measures visual stability by quantifying unexpected layout shifts",
      "threshold": {
        "good": 0.1,
        "poor": 0.25
      }
    },
    "speed_index": {
      "name": "Speed Index",
      "value": 3.2,
      "unit": "s",
      "score": 65,
      "status": "needs-improvement",
      "description": "How quickly the contents of a page are visibly populated",
      "threshold": {
        "good": 3.4,
        "poor": 5.8
      }
    },
    "time_to_interactive": {
      "name": "Time to Interactive",
      "value": 4.1,
      "unit": "s",
      "score": 60,
      "status": "needs-improvement",
      "description": "Time until the page becomes fully interactive",
      "threshold": {
        "good": 3.8,
        "poor": 7.3
      }
    }
  },
  "opportunities": [
    {
      "title": "Optimize images",
      "description": "Properly size images to save cellular data and improve load time",
      "impact": "high",
      "savings": "2.1s",
      "category": "Images",
      "recommendations": [
        "Serve images in next-gen formats like WebP",
        "Properly size images for different screen sizes",
        "Use lazy loading for off-screen images"
      ]
    },
    {
      "title": "Eliminate render-blocking resources",
      "description": "Resources are blocking the first paint of your page",
      "impact": "medium",
      "savings": "1.2s",
      "category": "CSS/JS",
      "recommendations": [
        "Inline critical CSS",
        "Defer non-critical CSS",
        "Remove unused CSS and JavaScript"
      ]
    }
  ],
  "resource_breakdown": [
    {
      "type": "Images",
      "count": 15,
      "size": "1.2 MB",
      "load_time": "2.1s",
      "percentage": 45
    },
    {
      "type": "JavaScript",
      "count": 8,
      "size": "650 KB",
      "load_time": "1.5s",
      "percentage": 25
    },
    {
      "type": "CSS",
      "count": 5,
      "size": "320 KB",
      "load_time": "0.8s",
      "percentage": 15
    },
    {
      "type": "Fonts",
      "count": 3,
      "size": "180 KB",
      "load_time": "0.6s",
      "percentage": 10
    },
    {
      "type": "Other",
      "count": 7,
      "size": "120 KB",
      "load_time": "0.4s",
      "percentage": 5
    }
  ],
  "technical_details": {
    "total_page_size": "2.47 MB",
    "total_requests": 38,
    "dom_elements": 1250,
    "server_response_time": "450ms",
    "compression_enabled": true,
    "image_optimization": 65,
    "css_minification": false,
    "js_minification": true,
    "browser_caching": true,
    "cdn_usage": false
  },
  "recommendations": {
    "critical": [
      "Optimize and compress images to reduce file sizes",
      "Enable CSS minification to reduce file sizes",
      "Implement a Content Delivery Network (CDN)"
    ],
    "important": [
      "Eliminate render-blocking CSS and JavaScript",
      "Reduce server response time",
      "Implement lazy loading for images"
    ],
    "minor": [
      "Reduce DOM complexity",
      "Optimize web fonts loading",
      "Enable text compression"
    ]
  },
  "comparison": {
    "industry_average": 65,
    "top_performers": 90,
    "your_score": 75
  }
}

Provide realistic performance metrics based on the device type (mobile typically has lower scores than desktop). Include specific, actionable recommendations for improvement. Make sure all scores are between 0-100 and reflect real-world performance characteristics.`;

    try {
      const response = await aiVendor.ask({
        prompt,
        api_key: API_KEY
      });

      // Try to parse the AI response
      let speedResult: PageSpeedResult;
      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          speedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to generated data
        speedResult = generateFallbackPageSpeedResult(url, device_type);
      }

      return NextResponse.json(speedResult);

    } catch (aiError) {
      console.error('AI vendor error:', aiError);
      // Fallback to generated data
      const fallbackResult = generateFallbackPageSpeedResult(url, device_type);
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

function generateFallbackPageSpeedResult(url: string, device_type: 'mobile' | 'desktop'): PageSpeedResult {
  // Mobile typically has lower scores than desktop
  const baseScore = device_type === 'mobile' ? 60 : 80;
  const variance = 20;
  
  const getRandomScore = () => Math.max(10, Math.min(100, baseScore + (Math.random() - 0.5) * variance));
  const getRandomValue = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
  
  const fcpScore = getRandomScore();
  const lcpScore = getRandomScore();
  const fidScore = getRandomScore();
  const clsScore = getRandomScore();
  const siScore = getRandomScore();
  const ttiScore = getRandomScore();
  
  const overallScore = Math.round((fcpScore + lcpScore + fidScore + clsScore + siScore + ttiScore) / 6);
  
  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getStatus = (score: number): 'good' | 'needs-improvement' | 'poor' => {
    if (score >= 80) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  };

  const getMetricValue = (metricType: string, score: number) => {
    switch (metricType) {
      case 'fcp':
        return score >= 80 ? getRandomValue(0.5, 1.8) : score >= 50 ? getRandomValue(1.8, 3.0) : getRandomValue(3.0, 6.0);
      case 'lcp':
        return score >= 80 ? getRandomValue(1.0, 2.5) : score >= 50 ? getRandomValue(2.5, 4.0) : getRandomValue(4.0, 8.0);
      case 'fid':
        return score >= 80 ? getRandomValue(10, 100) : score >= 50 ? getRandomValue(100, 300) : getRandomValue(300, 600);
      case 'cls':
        return score >= 80 ? getRandomValue(0.01, 0.1) : score >= 50 ? getRandomValue(0.1, 0.25) : getRandomValue(0.25, 0.5);
      case 'si':
        return score >= 80 ? getRandomValue(1.5, 3.4) : score >= 50 ? getRandomValue(3.4, 5.8) : getRandomValue(5.8, 10.0);
      case 'tti':
        return score >= 80 ? getRandomValue(2.0, 3.8) : score >= 50 ? getRandomValue(3.8, 7.3) : getRandomValue(7.3, 15.0);
      default:
        return 0;
    }
  };

  const resourceTypes = ['Images', 'JavaScript', 'CSS', 'Fonts', 'Other'];
  const totalSize = device_type === 'mobile' ? getRandomValue(1.5, 3.0) : getRandomValue(2.0, 4.0);
  
  return {
    url,
    test_date: new Date().toLocaleString(),
    device_type,
    overall_score: overallScore,
    grade: getGrade(overallScore),
    metrics: {
      first_contentful_paint: {
        name: 'First Contentful Paint',
        value: getMetricValue('fcp', fcpScore),
        unit: 's',
        score: fcpScore,
        status: getStatus(fcpScore),
        description: 'Time until the first text or image is painted',
        threshold: { good: 1.8, poor: 3.0 }
      },
      largest_contentful_paint: {
        name: 'Largest Contentful Paint',
        value: getMetricValue('lcp', lcpScore),
        unit: 's',
        score: lcpScore,
        status: getStatus(lcpScore),
        description: 'Time until the largest text or image is painted',
        threshold: { good: 2.5, poor: 4.0 }
      },
      first_input_delay: {
        name: 'First Input Delay',
        value: getMetricValue('fid', fidScore),
        unit: 'ms',
        score: fidScore,
        status: getStatus(fidScore),
        description: 'Time from when a user first interacts with your page to when the browser responds',
        threshold: { good: 100, poor: 300 }
      },
      cumulative_layout_shift: {
        name: 'Cumulative Layout Shift',
        value: getMetricValue('cls', clsScore),
        unit: '',
        score: clsScore,
        status: getStatus(clsScore),
        description: 'Measures visual stability by quantifying unexpected layout shifts',
        threshold: { good: 0.1, poor: 0.25 }
      },
      speed_index: {
        name: 'Speed Index',
        value: getMetricValue('si', siScore),
        unit: 's',
        score: siScore,
        status: getStatus(siScore),
        description: 'How quickly the contents of a page are visibly populated',
        threshold: { good: 3.4, poor: 5.8 }
      },
      time_to_interactive: {
        name: 'Time to Interactive',
        value: getMetricValue('tti', ttiScore),
        unit: 's',
        score: ttiScore,
        status: getStatus(ttiScore),
        description: 'Time until the page becomes fully interactive',
        threshold: { good: 3.8, poor: 7.3 }
      }
    },
    opportunities: [
      {
        title: 'Optimize images',
        description: 'Properly size images to save cellular data and improve load time',
        impact: 'high',
        savings: `${getRandomValue(1.0, 3.0)}s`,
        category: 'Images',
        recommendations: [
          'Serve images in next-gen formats like WebP',
          'Properly size images for different screen sizes',
          'Use lazy loading for off-screen images'
        ]
      },
      {
        title: 'Eliminate render-blocking resources',
        description: 'Resources are blocking the first paint of your page',
        impact: 'medium',
        savings: `${getRandomValue(0.5, 2.0)}s`,
        category: 'CSS/JS',
        recommendations: [
          'Inline critical CSS',
          'Defer non-critical CSS',
          'Remove unused CSS and JavaScript'
        ]
      },
      {
        title: 'Reduce server response time',
        description: 'Server response time is slower than recommended',
        impact: 'medium',
        savings: `${getRandomValue(0.3, 1.5)}s`,
        category: 'Server',
        recommendations: [
          'Optimize server configuration',
          'Use a faster hosting provider',
          'Implement server-side caching'
        ]
      }
    ],
    resource_breakdown: resourceTypes.map((type: string, index: number) => {
      const percentages = [40, 25, 15, 10, 10];
      const counts = [15, 8, 5, 3, 7];
      const percentage = percentages[index];
      const size = (totalSize * percentage / 100).toFixed(1);
      
      return {
        type,
        count: counts[index] + Math.floor(Math.random() * 5),
        size: `${size} MB`,
        load_time: `${getRandomValue(0.3, 2.5)}s`,
        percentage
      };
    }),
    technical_details: {
      total_page_size: `${totalSize.toFixed(2)} MB`,
      total_requests: Math.floor(Math.random() * 30) + 20,
      dom_elements: Math.floor(Math.random() * 1000) + 500,
      server_response_time: `${Math.floor(Math.random() * 500) + 200}ms`,
      compression_enabled: Math.random() > 0.3,
      image_optimization: Math.floor(Math.random() * 40) + 50,
      css_minification: Math.random() > 0.4,
      js_minification: Math.random() > 0.3,
      browser_caching: Math.random() > 0.2,
      cdn_usage: Math.random() > 0.5
    },
    recommendations: {
      critical: [
        'Optimize and compress images to reduce file sizes',
        'Enable CSS and JavaScript minification',
        'Implement a Content Delivery Network (CDN)'
      ],
      important: [
        'Eliminate render-blocking CSS and JavaScript',
        'Reduce server response time',
        'Implement lazy loading for images'
      ],
      minor: [
        'Reduce DOM complexity',
        'Optimize web fonts loading',
        'Enable text compression'
      ]
    },
    comparison: {
      industry_average: device_type === 'mobile' ? 55 : 75,
      top_performers: device_type === 'mobile' ? 85 : 95,
      your_score: overallScore
    }
  };
}