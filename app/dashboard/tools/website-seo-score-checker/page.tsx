'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink, CheckCircle, AlertCircle, XCircle, TrendingUp, Globe, Search, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  };
}

export default function WebsiteSEOScoreChecker() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/website-seo-score-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          vendor: 'gemini'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze website SEO');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'text-green-600 bg-green-100';
      case 'B':
      case 'B+':
        return 'text-blue-600 bg-blue-100';
      case 'C':
      case 'C+':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'technical_seo':
        return <Zap className="h-5 w-5" />;
      case 'on_page_seo':
        return <Search className="h-5 w-5" />;
      case 'content_quality':
        return <Globe className="h-5 w-5" />;
      case 'user_experience':
        return <TrendingUp className="h-5 w-5" />;
      case 'mobile_optimization':
        return <Globe className="h-5 w-5" />;
      case 'page_speed':
        return <Zap className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'social_signals':
        return <Globe className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website SEO Score Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get a comprehensive SEO analysis of your website with detailed scores, issues, and actionable recommendations to improve your search engine rankings.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analyze Website SEO</CardTitle>
            <CardDescription>
              Enter your website URL to get a detailed SEO analysis and score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !url.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing SEO...
                  </>
                ) : (
                  'Analyze SEO Score'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Score Overview</CardTitle>
                <CardDescription>
                  Overall SEO performance for {result.url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.overall_score)}`}>
                      {result.overall_score}
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <Progress value={result.overall_score} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 px-4 py-2 rounded-lg ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </div>
                    <div className="text-sm text-gray-600">SEO Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Last Analyzed</div>
                    <div className="font-semibold">{result.last_analyzed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Metrics Breakdown</CardTitle>
                    <CardDescription>Detailed analysis of different SEO aspects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(result.metrics).map(([key, metric]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              {getMetricIcon(key)}
                              <h3 className="font-semibold ml-2 capitalize">
                                {key.replace('_', ' ')}
                              </h3>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                              {metric.score}/{metric.max_score}
                            </div>
                          </div>
                          <Progress value={(metric.score / metric.max_score) * 100} className="mb-3" />
                          <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                          {metric.recommendations.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {metric.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-1">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Issues</CardTitle>
                    <CardDescription>Identified problems and areas for improvement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.issues.map((issue, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start flex-1">
                              {getSeverityIcon(issue.severity)}
                              <div className="ml-3 flex-1">
                                <h3 className="font-semibold">{issue.issue}</h3>
                                <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                              </div>
                            </div>
                            {getSeverityBadge(issue.severity)}
                          </div>
                          <div className="ml-7 space-y-2">
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Impact:</h4>
                              <p className="text-sm text-gray-600">{issue.impact}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Recommendation:</h4>
                              <p className="text-sm text-gray-600">{issue.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Primary Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.keyword_analysis.primary_keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Density</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(result.keyword_analysis.keyword_density).map(([keyword, density]) => (
                          <div key={keyword} className="flex justify-between items-center">
                            <span className="text-sm">{keyword}</span>
                            <span className="font-semibold">{density}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Missing Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.keyword_analysis.missing_keywords.map((keyword, index) => (
                          <Badge key={index} className="bg-red-100 text-red-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.keyword_analysis.keyword_opportunities.map((keyword, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Analysis</CardTitle>
                    <CardDescription>How your SEO compares to competitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {result.competitor_analysis.map((competitor, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{competitor.domain}</h3>
                            <div className={`text-xl font-bold ${getScoreColor(competitor.seo_score)}`}>
                              {competitor.seo_score}/100
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-green-700 mb-2">Strengths</h4>
                              <ul className="text-sm space-y-1">
                                {competitor.strengths.map((strength, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <CheckCircle className="h-3 w-3 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-red-700 mb-2">Weaknesses</h4>
                              <ul className="text-sm space-y-1">
                                {competitor.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <XCircle className="h-3 w-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                                    <span>{weakness}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-blue-700 mb-2">Opportunities</h4>
                              <ul className="text-sm space-y-1">
                                {competitor.opportunities.map((opportunity, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <TrendingUp className="h-3 w-3 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
                                    <span>{opportunity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                    <CardDescription>Technical SEO information about your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Page Title</h4>
                          <p className="text-sm bg-gray-50 p-2 rounded">{result.technical_details.page_title}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Meta Description</h4>
                          <p className="text-sm bg-gray-50 p-2 rounded">{result.technical_details.meta_description}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">H1 Tags</h4>
                          <div className="space-y-1">
                            {result.technical_details.h1_tags.map((tag, index) => (
                              <p key={index} className="text-sm bg-gray-50 p-2 rounded">{tag}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.internal_links}</div>
                            <div className="text-xs text-gray-600">Internal Links</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.external_links}</div>
                            <div className="text-xs text-gray-600">External Links</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.images_without_alt}</div>
                            <div className="text-xs text-gray-600">Images w/o Alt</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.page_size}</div>
                            <div className="text-xs text-gray-600">Page Size</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">SSL Certificate</span>
                            {result.technical_details.ssl_certificate ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Mobile Friendly</span>
                            {result.technical_details.mobile_friendly ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Structured Data</span>
                            {result.technical_details.structured_data ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Load Time</span>
                            <span className="font-semibold">{result.technical_details.load_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Immediate Fixes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.immediate_fixes.map((fix, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-600">Short-term Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.short_term_improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <TrendingUp className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Long-term Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.long_term_strategy.map((strategy, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}