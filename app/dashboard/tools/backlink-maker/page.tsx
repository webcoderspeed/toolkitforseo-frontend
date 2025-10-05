'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink, Star, TrendingUp, Globe, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BacklinkOpportunity {
  domain: string;
  url: string;
  domain_authority: number;
  page_authority: number;
  spam_score: number;
  traffic_estimate: number;
  opportunity_type: string;
  difficulty: string;
  contact_info: {
    email?: string;
    contact_form?: string;
    social_media?: string[];
  };
  content_requirements: {
    type: string;
    word_count: number;
    topics: string[];
    guidelines: string[];
  };
  success_probability: number;
  estimated_timeline: string;
  notes: string;
}

interface BacklinkStrategy {
  domain: string;
  niche: string;
  target_keywords: string[];
  opportunities: BacklinkOpportunity[];
  strategy_summary: {
    total_opportunities: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    estimated_success_rate: number;
  };
  content_calendar: {
    week: string;
    content_type: string;
    target_sites: string[];
    keywords: string[];
    status: string;
  }[];
  outreach_templates: {
    type: string;
    subject: string;
    template: string;
    success_rate: number;
  }[];
  tracking_metrics: {
    metric: string;
    current_value: number;
    target_value: number;
    timeline: string;
  }[];
  recommendations: {
    immediate_actions: string[];
    long_term_strategy: string[];
    tools_needed: string[];
    budget_estimate: string;
  };
}

export default function BacklinkMaker() {
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacklinkStrategy | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/backlink-maker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain.trim(),
          keywords: keywords.trim(),
          vendor: 'gemini'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate backlink strategy');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOpportunityTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'guest_post':
        return <Users className="h-4 w-4" />;
      case 'resource_page':
        return <Globe className="h-4 w-4" />;
      case 'broken_link':
        return <AlertCircle className="h-4 w-4" />;
      case 'directory':
        return <Star className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (probability: number) => {
    if (probability >= 70) return <Badge className="bg-green-100 text-green-800">High Priority</Badge>;
    if (probability >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low Priority</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Backlink Maker Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate a comprehensive backlink building strategy with targeted opportunities, outreach templates, and actionable recommendations for your website.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Backlink Strategy</CardTitle>
            <CardDescription>
              Enter your domain and target keywords to get a personalized backlink building plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="domain">Your Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="keywords">Target Keywords (optional)</Label>
                <Input
                  id="keywords"
                  type="text"
                  placeholder="SEO tools, digital marketing, content optimization"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !domain.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Strategy...
                  </>
                ) : (
                  'Generate Backlink Strategy'
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
            {/* Strategy Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Overview</CardTitle>
                <CardDescription>Your personalized backlink building strategy for {result.domain}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.strategy_summary.total_opportunities}</div>
                    <div className="text-sm text-blue-700">Total Opportunities</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.strategy_summary.high_priority}</div>
                    <div className="text-sm text-green-700">High Priority</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{result.strategy_summary.medium_priority}</div>
                    <div className="text-sm text-yellow-700">Medium Priority</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{result.strategy_summary.estimated_success_rate}%</div>
                    <div className="text-sm text-purple-700">Success Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Niche: <span className="font-semibold">{result.niche}</span></span>
                    <span>Target Keywords: <span className="font-semibold">{result.target_keywords.join(', ')}</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="opportunities" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
                <TabsTrigger value="outreach">Outreach Templates</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Backlink Opportunities</CardTitle>
                    <CardDescription>Prioritized list of websites and strategies for link building</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {result.opportunities.map((opportunity, index) => (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                {getOpportunityTypeIcon(opportunity.opportunity_type)}
                                <h3 className="font-semibold text-lg ml-2">{opportunity.domain}</h3>
                                <Badge className={`ml-2 ${getDifficultyColor(opportunity.difficulty)}`}>
                                  {opportunity.difficulty}
                                </Badge>
                              </div>
                              <a 
                                href={opportunity.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center"
                              >
                                {opportunity.url}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                            {getPriorityBadge(opportunity.success_probability)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-gray-700">Authority Metrics</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Domain Authority:</span>
                                  <span className="font-semibold">{opportunity.domain_authority}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Page Authority:</span>
                                  <span className="font-semibold">{opportunity.page_authority}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Spam Score:</span>
                                  <span className={`font-semibold ${opportunity.spam_score < 30 ? 'text-green-600' : opportunity.spam_score < 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {opportunity.spam_score}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-gray-700">Opportunity Details</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Type:</span>
                                  <span className="font-semibold capitalize">{opportunity.opportunity_type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Success Rate:</span>
                                  <span className="font-semibold">{opportunity.success_probability}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Timeline:</span>
                                  <span className="font-semibold">{opportunity.estimated_timeline}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-gray-700">Content Requirements</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Type:</span>
                                  <span className="font-semibold">{opportunity.content_requirements.type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Word Count:</span>
                                  <span className="font-semibold">{opportunity.content_requirements.word_count}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Traffic:</span>
                                  <span className="font-semibold">{opportunity.traffic_estimate.toLocaleString()}/month</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Suggested Topics</h4>
                              <div className="flex flex-wrap gap-1">
                                {opportunity.content_requirements.topics.map((topic, topicIndex) => (
                                  <Badge key={topicIndex} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {opportunity.contact_info.email && (
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-1">Contact Information</h4>
                                <div className="text-sm space-y-1">
                                  {opportunity.contact_info.email && (
                                    <div>Email: <span className="font-medium">{opportunity.contact_info.email}</span></div>
                                  )}
                                  {opportunity.contact_info.contact_form && (
                                    <div>Contact Form: <a href={opportunity.contact_info.contact_form} className="text-blue-600 hover:underline">{opportunity.contact_info.contact_form}</a></div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Notes</h4>
                              <p className="text-sm text-gray-600">{opportunity.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Calendar</CardTitle>
                    <CardDescription>Planned content creation and outreach schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.content_calendar.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.week}</div>
                            <div className="text-sm text-gray-600">{item.content_type}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Targets: {item.target_sites.join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={item.status === 'planned' ? 'bg-blue-100 text-blue-800' : item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              Keywords: {item.keywords.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outreach" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Outreach Templates</CardTitle>
                    <CardDescription>Proven email templates for different outreach scenarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {result.outreach_templates.map((template, index) => (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg capitalize">{template.type.replace('_', ' ')}</h3>
                            <Badge className="bg-green-100 text-green-800">
                              {template.success_rate}% Success Rate
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Subject Line</h4>
                              <div className="p-3 bg-gray-50 rounded text-sm font-medium">
                                {template.subject}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Email Template</h4>
                              <div className="p-4 bg-gray-50 rounded text-sm whitespace-pre-line">
                                {template.template}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking Metrics</CardTitle>
                    <CardDescription>Key performance indicators to monitor your backlink building progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.tracking_metrics.map((metric, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{metric.metric}</h3>
                            <span className="text-sm text-gray-500">{metric.timeline}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Current: <span className="font-semibold">{metric.current_value.toLocaleString()}</span></span>
                              <span>Target: <span className="font-semibold">{metric.target_value.toLocaleString()}</span></span>
                            </div>
                            <Progress 
                              value={(metric.current_value / metric.target_value) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Immediate Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.immediate_actions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
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
                            <TrendingUp className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-purple-600">Tools Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.tools_needed.map((tool, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{tool}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">Budget Estimate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {result.recommendations.budget_estimate}
                      </div>
                      <p className="text-sm text-gray-600">
                        Estimated monthly budget for implementing this backlink strategy including tools, content creation, and outreach efforts.
                      </p>
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