'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Monitor, Smartphone, Zap, AlertCircle, CheckCircle, Clock, FileImage, Code, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function PageSpeedTest() {
  const [url, setUrl] = useState('');
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PageSpeedResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/page-speed-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          device_type: deviceType,
          vendor: 'gemini'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze page speed');
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
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Good</Badge>;
      case 'needs-improvement':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'images':
        return <FileImage className="h-5 w-5" />;
      case 'javascript':
      case 'js':
        return <Code className="h-5 w-5" />;
      case 'css':
        return <Code className="h-5 w-5" />;
      case 'fonts':
        return <Globe className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Speed Test Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your website's loading speed and performance. Get detailed insights and recommendations to improve your page speed and user experience.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Page Speed</CardTitle>
            <CardDescription>
              Enter your website URL and select device type to analyze performance
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
              <div>
                <Label>Device Type</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    type="button"
                    variant={deviceType === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setDeviceType('mobile')}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                  <Button
                    type="button"
                    variant={deviceType === 'desktop' ? 'default' : 'outline'}
                    onClick={() => setDeviceType('desktop')}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !url.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Page Speed...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Test Page Speed
                  </>
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
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Page speed analysis for {result.url} on {result.device_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.overall_score)}`}>
                      {result.overall_score}
                    </div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                    <Progress value={result.overall_score} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 px-4 py-2 rounded-lg ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </div>
                    <div className="text-sm text-gray-600">Performance Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Device Type</div>
                    <div className="flex items-center justify-center gap-2">
                      {result.device_type === 'mobile' ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                      <span className="font-semibold capitalize">{result.device_type}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Test Date</div>
                    <div className="font-semibold">{result.test_date}</div>
                  </div>
                </div>

                {/* Performance Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{result.comparison.industry_average}</div>
                    <div className="text-sm text-gray-600">Industry Average</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.comparison.your_score}</div>
                    <div className="text-sm text-gray-600">Your Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.comparison.top_performers}</div>
                    <div className="text-sm text-gray-600">Top Performers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Core Web Vitals & Performance Metrics</CardTitle>
                    <CardDescription>Key performance indicators that affect user experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(result.metrics).map(([key, metric]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 mr-2" />
                              <h3 className="font-semibold capitalize">
                                {metric.name}
                              </h3>
                            </div>
                            {getStatusIcon(metric.status)}
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-2xl font-bold">
                              {metric.value}{metric.unit}
                            </div>
                            <div className={`text-lg font-semibold ${getScoreColor(metric.score)}`}>
                              {metric.score}/100
                            </div>
                          </div>
                          <div className="mb-3">
                            {getStatusBadge(metric.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                          <div className="text-xs text-gray-500">
                            <div>Good: ≤ {metric.threshold.good}{metric.unit}</div>
                            <div>Poor: &gt; {metric.threshold.poor}{metric.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Opportunities</CardTitle>
                    <CardDescription>Optimization suggestions to improve page speed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.opportunities.map((opportunity, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{opportunity.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                            </div>
                            <div className="ml-4 text-right">
                              <Badge className={getImpactColor(opportunity.impact)}>
                                {opportunity.impact} impact
                              </Badge>
                              <div className="text-sm font-semibold mt-1 text-green-600">
                                Save {opportunity.savings}
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <Badge variant="outline">{opportunity.category}</Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {opportunity.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Breakdown</CardTitle>
                    <CardDescription>Analysis of different resource types and their impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.resource_breakdown.map((resource, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              {getResourceIcon(resource.type)}
                              <h3 className="font-semibold ml-2">{resource.type}</h3>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{resource.count} files</div>
                              <div className="text-sm text-gray-600">{resource.size}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Load Time: {resource.load_time}</span>
                            <span className="text-sm font-semibold">{resource.percentage}% of total</span>
                          </div>
                          <Progress value={resource.percentage} className="h-2" />
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
                    <CardDescription>Detailed technical information about your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.total_page_size}</div>
                            <div className="text-xs text-gray-600">Total Page Size</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.total_requests}</div>
                            <div className="text-xs text-gray-600">Total Requests</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.dom_elements}</div>
                            <div className="text-xs text-gray-600">DOM Elements</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{result.technical_details.server_response_time}</div>
                            <div className="text-xs text-gray-600">Server Response</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold">{result.technical_details.image_optimization}%</div>
                          <div className="text-xs text-gray-600">Image Optimization</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Compression Enabled</span>
                          {result.technical_details.compression_enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">CSS Minification</span>
                          {result.technical_details.css_minification ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">JS Minification</span>
                          {result.technical_details.js_minification ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Browser Caching</span>
                          {result.technical_details.browser_caching ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">CDN Usage</span>
                          {result.technical_details.cdn_usage ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
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
                      <CardTitle className="text-red-600">Critical Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.critical.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-600">Important Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.important.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Minor Optimizations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.minor.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
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