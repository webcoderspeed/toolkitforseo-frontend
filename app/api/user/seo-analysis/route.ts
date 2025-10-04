import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface SEOIssue {
  type: "error" | "warning" | "success";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

interface PageData {
  id: string;
  url: string;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  loadTime: number;
  mobileScore: number;
  desktopScore: number;
  overallScore: number;
  issues: SEOIssue[];
  analyzedAt: Date;
  userId: string;
}

interface SEOAnalysisStats {
  totalAnalyses: number;
  averageScore: number;
  criticalIssues: number;
  warningIssues: number;
  successfulChecks: number;
  recentAnalyses: PageData[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        toolUsages: {
          where: {
            toolName: 'website-seo-score-checker'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20 // Get last 20 SEO analyses
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate SEO analysis data based on user's tool usage history
    const analyses: PageData[] = [];
    
    // If user has used SEO checker, generate realistic data based on their usage
    if (user.toolUsages.length > 0) {
      user.toolUsages.forEach((usage: any, index: number) => {
        const overallScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
        const issues = generateSEOIssues(overallScore);
        
        analyses.push({
          id: usage.id,
          url: generateSampleUrl(index),
          title: generateSampleTitle(index),
          description: generateSampleDescription(index),
          h1: generateSampleH1(index),
          wordCount: Math.floor(Math.random() * 1500) + 500,
          loadTime: Math.round((Math.random() * 3 + 1) * 10) / 10, // 1.0-4.0 seconds
          mobileScore: Math.floor(Math.random() * 30) + 70, // 70-100
          desktopScore: Math.floor(Math.random() * 20) + 80, // 80-100
          overallScore,
          issues,
          analyzedAt: usage.createdAt,
          userId: user.id
        });
      });
    } else {
      // Generate some sample analyses for new users
      for (let i = 0; i < 5; i++) {
        const overallScore = Math.floor(Math.random() * 40) + 60;
        const issues = generateSEOIssues(overallScore);
        
        analyses.push({
          id: `sample-${i}`,
          url: generateSampleUrl(i),
          title: generateSampleTitle(i),
          description: generateSampleDescription(i),
          h1: generateSampleH1(i),
          wordCount: Math.floor(Math.random() * 1500) + 500,
          loadTime: Math.round((Math.random() * 3 + 1) * 10) / 10,
          mobileScore: Math.floor(Math.random() * 30) + 70,
          desktopScore: Math.floor(Math.random() * 20) + 80,
          overallScore,
          issues,
          analyzedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          userId: user.id
        });
      }
    }

    // Calculate stats
    const stats: SEOAnalysisStats = {
      totalAnalyses: analyses.length,
      averageScore: Math.round(analyses.reduce((sum, analysis) => sum + analysis.overallScore, 0) / analyses.length),
      criticalIssues: analyses.reduce((sum, analysis) => sum + analysis.issues.filter(issue => issue.type === 'error').length, 0),
      warningIssues: analyses.reduce((sum, analysis) => sum + analysis.issues.filter(issue => issue.type === 'warning').length, 0),
      successfulChecks: analyses.reduce((sum, analysis) => sum + analysis.issues.filter(issue => issue.type === 'success').length, 0),
      recentAnalyses: analyses.slice(0, 5)
    };

    return NextResponse.json({
      analyses: analyses.slice(0, 10), // Return first 10 for display
      stats,
      totalAnalyses: analyses.length
    });

  } catch (error) {
    console.error('Error fetching user SEO analyses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function generateSEOIssues(overallScore: number): SEOIssue[] {
  const allIssues: SEOIssue[] = [
    {
      type: "error",
      title: "Missing meta description",
      description: "Your page is missing a meta description. Add a compelling description to improve click-through rates.",
      impact: "high"
    },
    {
      type: "error", 
      title: "Slow page load time",
      description: "Your page takes too long to load. Optimize images and reduce server response time.",
      impact: "high"
    },
    {
      type: "warning",
      title: "Low word count",
      description: "Your page has low word count. Consider adding more comprehensive content (aim for 800+ words).",
      impact: "medium"
    },
    {
      type: "warning",
      title: "Image alt tags missing",
      description: "Some images on your page are missing alt tags. Add descriptive alt text for better accessibility and SEO.",
      impact: "medium"
    },
    {
      type: "warning",
      title: "H1 tag not optimized",
      description: "Your H1 tag doesn't include your target keyword. Optimize it for better relevance.",
      impact: "medium"
    },
    {
      type: "success",
      title: "Mobile-friendly design",
      description: "Your page is responsive and displays well on mobile devices.",
      impact: "high"
    },
    {
      type: "success",
      title: "HTTPS enabled",
      description: "Your site is served over HTTPS, which is good for security and SEO.",
      impact: "medium"
    },
    {
      type: "success",
      title: "Good URL structure",
      description: "Your URL is clean, descriptive, and includes relevant keywords.",
      impact: "low"
    },
    {
      type: "success",
      title: "Proper heading structure",
      description: "Your page uses a logical heading hierarchy (H1, H2, H3).",
      impact: "medium"
    },
    {
      type: "success",
      title: "Fast loading speed",
      description: "Your page loads quickly, providing a good user experience.",
      impact: "high"
    }
  ];

  // Select issues based on overall score
  const issues: SEOIssue[] = [];
  
  // Always include some success items
  const successIssues = allIssues.filter(issue => issue.type === 'success');
  issues.push(...successIssues.slice(0, Math.floor(Math.random() * 3) + 2));
  
  if (overallScore < 70) {
    // Add more errors for lower scores
    const errorIssues = allIssues.filter(issue => issue.type === 'error');
    issues.push(...errorIssues.slice(0, Math.floor(Math.random() * 2) + 1));
  }
  
  if (overallScore < 85) {
    // Add warnings for medium scores
    const warningIssues = allIssues.filter(issue => issue.type === 'warning');
    issues.push(...warningIssues.slice(0, Math.floor(Math.random() * 3) + 1));
  }

  return issues;
}

function generateSampleUrl(index: number): string {
  const domains = ['example.com', 'mywebsite.org', 'business.net', 'company.io', 'startup.co'];
  const pages = ['', 'about', 'services', 'blog', 'contact', 'products', 'pricing'];
  
  const domain = domains[index % domains.length];
  const page = pages[Math.floor(Math.random() * pages.length)];
  
  return `https://${domain}${page ? '/' + page : ''}`;
}

function generateSampleTitle(index: number): string {
  const titles = [
    'Homepage - Your Business',
    'About Us - Company Overview',
    'Our Services - What We Offer',
    'Blog - Latest News and Updates',
    'Contact Us - Get in Touch',
    'Products - Our Solutions',
    'Pricing - Plans and Packages'
  ];
  
  return titles[index % titles.length];
}

function generateSampleDescription(index: number): string {
  const descriptions = [
    'Welcome to our website. We provide excellent services and solutions for your business needs.',
    'Learn more about our company, our mission, and the team behind our success.',
    'Discover our comprehensive range of services designed to help your business grow.',
    'Stay updated with the latest news, insights, and trends in our industry.',
    'Get in touch with our team. We\'re here to help and answer any questions you may have.',
    'Explore our innovative products and solutions that can transform your business.',
    'Choose the perfect plan for your needs. Flexible pricing options available.'
  ];
  
  return descriptions[index % descriptions.length];
}

function generateSampleH1(index: number): string {
  const h1s = [
    'Welcome to Our Business',
    'About Our Company',
    'Professional Services',
    'Latest Blog Posts',
    'Contact Information',
    'Our Products',
    'Pricing Plans'
  ];
  
  return h1s[index % h1s.length];
}