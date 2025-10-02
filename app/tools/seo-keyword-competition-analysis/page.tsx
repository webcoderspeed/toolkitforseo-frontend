'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, TrendingUp, Target, BarChart3, Globe, Users, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CompetitorData {
  domain: string;
  title: string;
  meta_description: string;
  content_length: number;
  domain_authority: number;
  page_authority: number;
  backlinks: number;
  social_signals: number;
  estimated_traffic: number;
  keyword_density: number;
  content_quality_score: number;
  technical_seo_score: number;
  user_experience_score: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface CompetitionAnalysis {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  competition_level: string;
  cpc: number;
  top_competitors: CompetitorData[];
  market_insights: {
    average_content_length: number;
    average_domain_authority: number;
    average_backlinks: number;
    content_gaps: string[];
    ranking_factors: string[];
  };
  recommendations: {
    content_strategy: string[];
    technical_improvements: string[];
    link_building: string[];
    competitive_advantages: string[];
  };
  difficulty_breakdown: {
    content_competition: number;
    domain_authority_barrier: number;
    backlink_requirement: number;
    technical_complexity: number;
  };
}

export default function SEOKeywordCompetitionAnalysisTool() {
  const [keyword, setKeyword] = useState('');
  const [vendor, setVendor] = useState<'gemini' | 'openai'>('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompetitionAnalysis | null>(null);
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
      const response = await fetch('/api/seo-keyword-competition-analysis', {
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
        throw new Error('Failed to analyze keyword competition');
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

  const getCompetitionLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SEO Keyword Competition Analysis Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze keyword competition, discover top competitors, and get strategic insights to outrank your competition in search results.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keyword Competition Analysis
            </CardTitle>
            <CardDescription>
              Enter a keyword to analyze the competitive landscape and get strategic recommendations
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
                  Analyzing Competition...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Competition
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
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Competition Overview
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
                    <Badge className={getCompetitionLevelColor(result.competition_level)}>
                      {result.competition_level} Competition
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Competition Difficulty Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.difficulty_breakdown).map(([factor, score]) => (
                    <div key={factor} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{factor.replace('_', ' ')}</span>
                        <span className="font-semibold">{score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getDifficultyColor(score)}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Competitors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Competitors Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.top_competitors.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{competitor.domain}</h3>
                          <p className="text-gray-600 text-sm">{competitor.title}</p>
                        </div>
                        <Badge variant="outline">Rank #{index + 1}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{competitor.domain_authority}</div>
                          <div className="text-xs text-gray-500">Domain Authority</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{competitor.backlinks.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Backlinks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{competitor.content_length.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Content Length</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{competitor.estimated_traffic.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Est. Traffic</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                          <ul className="text-sm space-y-1">
                            {competitor.strengths.map((strength, i) => (
                              <li key={i} className="text-gray-600">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Weaknesses</h4>
                          <ul className="text-sm space-y-1">
                            {competitor.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-gray-600">• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-600 mb-2">Opportunities</h4>
                          <ul className="text-sm space-y-1">
                            {competitor.opportunities.map((opportunity, i) => (
                              <li key={i} className="text-gray-600">• {opportunity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Market Averages</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Content Length:</span>
                        <span className="font-medium">{result.market_insights.average_content_length.toLocaleString()} words</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domain Authority:</span>
                        <span className="font-medium">{result.market_insights.average_domain_authority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backlinks:</span>
                        <span className="font-medium">{result.market_insights.average_backlinks.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Key Ranking Factors</h3>
                    <div className="space-y-1">
                      {result.market_insights.ranking_factors.map((factor, index) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-1">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Content Gaps Identified</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.market_insights.content_gaps.map((gap, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{gap}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-600">Content Strategy</h3>
                    <ul className="space-y-2">
                      {result.recommendations.content_strategy.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600">Technical Improvements</h3>
                    <ul className="space-y-2">
                      {result.recommendations.technical_improvements.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-purple-600">Link Building</h3>
                    <ul className="space-y-2">
                      {result.recommendations.link_building.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-orange-600">Competitive Advantages</h3>
                    <ul className="space-y-2">
                      {result.recommendations.competitive_advantages.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">• {rec}</li>
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