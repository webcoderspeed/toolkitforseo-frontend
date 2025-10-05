'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Users, TrendingUp, Link, FileText, Target, BarChart3, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DomainMetrics {
  domain: string;
  estimatedTraffic: number;
  organicKeywords: number;
  backlinks: number;
  domainAuthority: number;
  topKeywords: string[];
  contentGaps: string[];
  strengths: string[];
  weaknesses: string[];
}

interface CompetitorAnalysisResult {
  targetDomain: string;
  competitors: DomainMetrics[];
  comparison: {
    trafficComparison: { domain: string; traffic: number; percentage: number }[];
    keywordGaps: string[];
    contentOpportunities: string[];
    backlinkOpportunities: string[];
  };
  recommendations: string[];
  lastUpdated: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function CompetitorAnalysisPage() {
  const [formData, setFormData] = useState({
    domain: '',
    competitors: [''],
    vendor: 'gemini'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addCompetitor = () => {
    if (formData.competitors.length < 5) {
      setFormData({
        ...formData,
        competitors: [...formData.competitors, '']
      });
    }
  };

  const removeCompetitor = (index: number) => {
    if (formData.competitors.length > 1) {
      const newCompetitors = formData.competitors.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        competitors: newCompetitors
      });
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = value;
    setFormData({
      ...formData,
      competitors: newCompetitors
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const validCompetitors = formData.competitors.filter(c => c.trim().length > 0);

      if (validCompetitors.length === 0) {
        throw new Error('Please enter at least one competitor');
      }

      const response = await fetch('/api/competitor-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: formData.domain,
          competitors: validCompetitors,
          vendor: formData.vendor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze competitors');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRadarData = () => {
    if (!result) return [];

    const targetMetrics = getTargetMetrics();
    const allDomains = [
      targetMetrics,
      ...result.competitors
    ];

    return [
      {
        metric: 'Traffic',
        ...Object.fromEntries(allDomains.map(d => [
          d.domain, 
          Math.min(100, (d.estimatedTraffic / Math.max(...allDomains.map(x => x.estimatedTraffic))) * 100)
        ]))
      },
      {
        metric: 'Keywords',
        ...Object.fromEntries(allDomains.map(d => [
          d.domain, 
          Math.min(100, (d.organicKeywords / Math.max(...allDomains.map(x => x.organicKeywords))) * 100)
        ]))
      },
      {
        metric: 'Backlinks',
        ...Object.fromEntries(allDomains.map(d => [
          d.domain, 
          Math.min(100, (d.backlinks / Math.max(...allDomains.map(x => x.backlinks))) * 100)
        ]))
      },
      {
        metric: 'Authority',
        ...Object.fromEntries(allDomains.map(d => [d.domain, d.domainAuthority]))
      }
    ];
  };

  const getTargetMetrics = (): DomainMetrics => {
    if (!result) return {} as DomainMetrics;
    
    // Find target domain metrics from traffic comparison
    const targetTraffic = result.comparison.trafficComparison.find(t => t.domain === result.targetDomain);
    
    return {
      domain: result.targetDomain,
      estimatedTraffic: targetTraffic?.traffic || 0,
      organicKeywords: 0, // This would come from the API response
      backlinks: 0,
      domainAuthority: 0,
      topKeywords: [],
      contentGaps: [],
      strengths: [],
      weaknesses: []
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competitor Analysis</h1>
        <p className="text-gray-600">
          Analyze your competitors' SEO strategies and discover opportunities to outrank them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Analyze Competitors
              </CardTitle>
              <CardDescription>
                Enter your domain and up to 5 competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="domain">Your Domain</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="yourdomain.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Competitors</Label>
                  <div className="space-y-2">
                    {formData.competitors.map((competitor, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="competitor.com"
                          value={competitor}
                          onChange={(e) => updateCompetitor(index, e.target.value)}
                          required={index === 0}
                        />
                        {formData.competitors.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeCompetitor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {formData.competitors.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCompetitor}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Competitor
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="vendor">AI Vendor</Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI GPT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Competitors...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analyze Competitors
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              {/* Traffic Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Comparison</CardTitle>
                  <CardDescription>
                    Estimated monthly organic traffic comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.comparison.trafficComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Traffic']} />
                        <Bar dataKey="traffic" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.competitors.map((competitor, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{competitor.domain}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Traffic</p>
                              <p className="font-semibold">{competitor.estimatedTraffic.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Keywords</p>
                              <p className="font-semibold">{competitor.organicKeywords.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Backlinks</p>
                              <p className="font-semibold">{competitor.backlinks.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Authority</p>
                              <p className="font-semibold">{competitor.domainAuthority}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-2">Strengths</p>
                            <div className="space-y-1">
                              {competitor.strengths.map((strength, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-red-600 mb-2">Weaknesses</p>
                            <div className="space-y-1">
                              {competitor.weaknesses.map((weakness, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {weakness}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="keywords">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Keyword Gaps
                        </CardTitle>
                        <CardDescription>
                          Keywords your competitors rank for but you don't
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.comparison.keywordGaps.map((keyword, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <p className="font-medium">{keyword}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Competitor Keywords</CardTitle>
                        <CardDescription>
                          Most valuable keywords from competitors
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {result.competitors.map((competitor, index) => (
                            <div key={index}>
                              <p className="font-medium text-sm mb-2">{competitor.domain}</p>
                              <div className="flex flex-wrap gap-1">
                                {competitor.topKeywords.slice(0, 3).map((keyword, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Content Opportunities
                        </CardTitle>
                        <CardDescription>
                          Content gaps you can exploit
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.comparison.contentOpportunities.map((opportunity, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <p className="text-sm">{opportunity}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link className="h-5 w-5" />
                          Backlink Opportunities
                        </CardTitle>
                        <CardDescription>
                          Link building opportunities identified
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.comparison.backlinkOpportunities.map((opportunity, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <p className="text-sm">{opportunity}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Strategic Recommendations
                      </CardTitle>
                      <CardDescription>
                        Actionable insights to improve your competitive position
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}