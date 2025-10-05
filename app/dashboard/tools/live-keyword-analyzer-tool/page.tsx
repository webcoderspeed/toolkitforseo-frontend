'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, TrendingUp, Target, BarChart3, Globe, Clock, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  seasonal_data: {
    month: string;
    volume: number;
    trend: string;
  }[];
  related_keywords: {
    keyword: string;
    volume: number;
    difficulty: number;
    relevance: number;
  }[];
  serp_features: string[];
  intent_analysis: {
    primary_intent: string;
    intent_distribution: {
      informational: number;
      commercial: number;
      transactional: number;
      navigational: number;
    };
  };
  opportunity_score: number;
  ranking_difficulty: {
    content_requirement: string;
    backlink_requirement: string;
    domain_authority_needed: number;
    time_to_rank: string;
  };
  market_analysis: {
    market_size: string;
    growth_potential: string;
    competition_density: string;
    monetization_potential: string;
  };
  recommendations: {
    content_type: string[];
    target_audience: string[];
    content_length: string;
    optimization_tips: string[];
  };
}

export default function LiveKeywordAnalyzerTool() {
  const [keyword, setKeyword] = useState('');
  const [vendor, setVendor] = useState<'gemini' | 'openai'>('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KeywordMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/live-keyword-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          vendor,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze keyword');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'bg-green-500';
    if (difficulty <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'rising': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Live Keyword Analyzer Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get real-time keyword analysis with comprehensive metrics, trends, and actionable insights for your SEO strategy.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Live Keyword Analysis
            </CardTitle>
            <CardDescription>
              Enter a keyword to get instant analysis with search volume, difficulty, trends, and optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Target Keyword</Label>
              <Input
                id="keyword"
                placeholder="e.g., digital marketing, best laptops 2024"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">AI Vendor</Label>
              <Select value={vendor} onValueChange={(value: 'gemini' | 'openai') => setVendor(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading || !keyword.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Keyword...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Keyword
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.search_volume.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Monthly Searches</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{result.keyword_difficulty}/100</div>
                    <div className="text-sm text-gray-600">Keyword Difficulty</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${result.cpc.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Cost Per Click</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getOpportunityColor(result.opportunity_score)}`}>
                      {result.opportunity_score}/100
                    </div>
                    <div className="text-sm text-gray-600">Opportunity Score</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">{result.competition}</Badge>
                    <div className="text-sm text-gray-600">Competition Level</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className={getTrendColor(result.trend)}>
                      {result.trend}
                    </Badge>
                    <div className="text-sm text-gray-600">Trend Direction</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{result.intent_analysis.primary_intent}</Badge>
                    <div className="text-sm text-gray-600">Primary Intent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Seasonal Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {result.seasonal_data.map((data, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-sm">{data.month}</div>
                      <div className="text-lg font-bold">{data.volume.toLocaleString()}</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTrendColor(data.trend)}`}
                      >
                        {data.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Intent Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Search Intent Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.intent_analysis.intent_distribution).map(([intent, percentage]) => (
                    <div key={intent} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{intent}</span>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SERP Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SERP Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.serp_features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Related Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.related_keywords.map((relatedKeyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{relatedKeyword.keyword}</div>
                        <div className="text-sm text-gray-600">
                          Volume: {relatedKeyword.volume.toLocaleString()} | 
                          Difficulty: {relatedKeyword.difficulty}/100 | 
                          Relevance: {relatedKeyword.relevance}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getDifficultyColor(relatedKeyword.difficulty)}`}
                            style={{ width: `${relatedKeyword.difficulty}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ranking Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ranking Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Content Requirements</h3>
                      <p className="text-gray-600">{result.ranking_difficulty.content_requirement}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Backlink Requirements</h3>
                      <p className="text-gray-600">{result.ranking_difficulty.backlink_requirement}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Domain Authority Needed</h3>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.ranking_difficulty.domain_authority_needed}+
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Estimated Time to Rank</h3>
                      <p className="text-gray-600">{result.ranking_difficulty.time_to_rank}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-600">{result.market_analysis.market_size}</div>
                    <div className="text-sm text-gray-600">Market Size</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-600">{result.market_analysis.growth_potential}</div>
                    <div className="text-sm text-gray-600">Growth Potential</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="font-semibold text-yellow-600">{result.market_analysis.competition_density}</div>
                    <div className="text-sm text-gray-600">Competition Density</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-600">{result.market_analysis.monetization_potential}</div>
                    <div className="text-sm text-gray-600">Monetization Potential</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-600">Content Strategy</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Content Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.recommendations.content_type.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Target Audience:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.recommendations.target_audience.map((audience, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Recommended Length:</span>
                        <span className="ml-2 text-gray-600">{result.recommendations.content_length}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600">Optimization Tips</h3>
                    <ul className="space-y-1">
                      {result.recommendations.optimization_tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}