'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BacklinkData {
  domain: string;
  total_backlinks: number;
  referring_domains: number;
  domain_authority: number;
  page_authority: number;
  spam_score: number;
  trust_flow: number;
  citation_flow: number;
  backlink_profile: {
    dofollow: number;
    nofollow: number;
    text_links: number;
    image_links: number;
    redirect_links: number;
  };
  top_backlinks: {
    source_url: string;
    source_domain: string;
    anchor_text: string;
    link_type: string;
    domain_authority: number;
    page_authority: number;
    spam_score: number;
    first_seen: string;
    last_seen: string;
  }[];
  anchor_text_distribution: {
    anchor_text: string;
    count: number;
    percentage: number;
    type: string;
  }[];
  link_quality_analysis: {
    high_quality: number;
    medium_quality: number;
    low_quality: number;
    toxic_links: number;
  };
  competitor_comparison: {
    domain: string;
    backlinks: number;
    referring_domains: number;
    domain_authority: number;
  }[];
  growth_trends: {
    month: string;
    new_backlinks: number;
    lost_backlinks: number;
    net_growth: number;
  }[];
  recommendations: {
    opportunities: string[];
    risks: string[];
    action_items: string[];
  };
}

export default function BacklinkChecker() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacklinkData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/backlink-checker', {
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
        throw new Error('Failed to analyze backlinks');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (type: string) => {
    switch (type) {
      case 'high_quality':
        return <Badge className="bg-green-100 text-green-800">High Quality</Badge>;
      case 'medium_quality':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Quality</Badge>;
      case 'low_quality':
        return <Badge className="bg-orange-100 text-orange-800">Low Quality</Badge>;
      case 'toxic_links':
        return <Badge className="bg-red-100 text-red-800">Toxic</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Backlink Checker Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your website's backlink profile, discover link opportunities, and monitor your link building progress with comprehensive backlink analysis.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>
              Enter the URL you want to analyze for backlinks
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
                    Analyzing Backlinks...
                  </>
                ) : (
                  'Analyze Backlinks'
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
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{result.total_backlinks.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total Backlinks</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{result.referring_domains.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Referring Domains</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className={`text-2xl font-bold ${getQualityColor(result.domain_authority)}`}>
                    {result.domain_authority}
                  </div>
                  <p className="text-sm text-gray-600">Domain Authority</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className={`text-2xl font-bold ${result.spam_score < 30 ? 'text-green-600' : result.spam_score < 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.spam_score}%
                  </div>
                  <p className="text-sm text-gray-600">Spam Score</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="backlinks">Top Backlinks</TabsTrigger>
                <TabsTrigger value="anchors">Anchor Text</TabsTrigger>
                <TabsTrigger value="quality">Link Quality</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Authority Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Domain Authority</span>
                          <span className="font-semibold">{result.domain_authority}</span>
                        </div>
                        <Progress value={result.domain_authority} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Page Authority</span>
                          <span className="font-semibold">{result.page_authority}</span>
                        </div>
                        <Progress value={result.page_authority} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Trust Flow</span>
                          <span className="font-semibold">{result.trust_flow}</span>
                        </div>
                        <Progress value={result.trust_flow} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Citation Flow</span>
                          <span className="font-semibold">{result.citation_flow}</span>
                        </div>
                        <Progress value={result.citation_flow} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Backlink Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>DoFollow Links</span>
                        <span className="font-semibold text-green-600">{result.backlink_profile.dofollow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NoFollow Links</span>
                        <span className="font-semibold text-gray-600">{result.backlink_profile.nofollow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Text Links</span>
                        <span className="font-semibold">{result.backlink_profile.text_links.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Image Links</span>
                        <span className="font-semibold">{result.backlink_profile.image_links.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Redirect Links</span>
                        <span className="font-semibold">{result.backlink_profile.redirect_links.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.growth_trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{trend.month}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +{trend.new_backlinks}
                            </div>
                            <div className="flex items-center text-red-600">
                              <TrendingDown className="h-4 w-4 mr-1" />
                              -{trend.lost_backlinks}
                            </div>
                            <div className={`font-semibold ${trend.net_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend.net_growth >= 0 ? '+' : ''}{trend.net_growth}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backlinks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Backlinks</CardTitle>
                    <CardDescription>Highest quality backlinks pointing to your domain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.top_backlinks.map((backlink, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <a 
                                href={backlink.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium flex items-center"
                              >
                                {backlink.source_domain}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                              <p className="text-sm text-gray-600 mt-1">
                                Anchor: "{backlink.anchor_text}"
                              </p>
                            </div>
                            <Badge variant={backlink.link_type === 'dofollow' ? 'default' : 'secondary'}>
                              {backlink.link_type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">DA:</span>
                              <span className={`ml-1 font-semibold ${getQualityColor(backlink.domain_authority)}`}>
                                {backlink.domain_authority}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">PA:</span>
                              <span className={`ml-1 font-semibold ${getQualityColor(backlink.page_authority)}`}>
                                {backlink.page_authority}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Spam:</span>
                              <span className={`ml-1 font-semibold ${backlink.spam_score < 30 ? 'text-green-600' : backlink.spam_score < 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {backlink.spam_score}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">First Seen:</span>
                              <span className="ml-1">{backlink.first_seen}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="anchors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Anchor Text Distribution</CardTitle>
                    <CardDescription>Analysis of anchor text used in backlinks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.anchor_text_distribution.map((anchor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium">{anchor.anchor_text}</span>
                            <Badge className="ml-2" variant="outline">{anchor.type}</Badge>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{anchor.count} links</span>
                            <span className="font-semibold">{anchor.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Link Quality Analysis</CardTitle>
                    <CardDescription>Distribution of link quality in your backlink profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{result.link_quality_analysis.high_quality}</div>
                        <div className="text-sm text-green-700">High Quality</div>
                        <CheckCircle className="h-6 w-6 text-green-600 mx-auto mt-2" />
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{result.link_quality_analysis.medium_quality}</div>
                        <div className="text-sm text-yellow-700">Medium Quality</div>
                        <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mt-2" />
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{result.link_quality_analysis.low_quality}</div>
                        <div className="text-sm text-orange-700">Low Quality</div>
                        <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mt-2" />
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{result.link_quality_analysis.toxic_links}</div>
                        <div className="text-sm text-red-700">Toxic Links</div>
                        <XCircle className="h-6 w-6 text-red-600 mx-auto mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Comparison</CardTitle>
                    <CardDescription>How your backlink profile compares to competitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.competitor_comparison.map((competitor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="font-medium">{competitor.domain}</div>
                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-semibold">{competitor.backlinks.toLocaleString()}</div>
                              <div className="text-gray-500">Backlinks</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{competitor.referring_domains.toLocaleString()}</div>
                              <div className="text-gray-500">Domains</div>
                            </div>
                            <div className="text-center">
                              <div className={`font-semibold ${getQualityColor(competitor.domain_authority)}`}>
                                {competitor.domain_authority}
                              </div>
                              <div className="text-gray-500">DA</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.opportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.risks.map((risk, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Action Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.action_items.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <div className="h-4 w-4 bg-blue-600 rounded-full mr-2 mt-0.5 flex-shrink-0"></div>
                            <span className="text-sm">{action}</span>
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