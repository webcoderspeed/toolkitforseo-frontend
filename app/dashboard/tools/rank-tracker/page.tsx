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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, TrendingDown, Minus, Eye, Search, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface KeywordRanking {
  keyword: string;
  position: number | null;
  url: string | null;
  searchVolume: number | null;
  difficulty: number | null;
  trend: 'up' | 'down' | 'stable' | 'new';
  previousPosition: number | null;
  change: number;
}

interface RankTrackerResult {
  domain: string;
  location: string;
  device: string;
  totalKeywords: number;
  averagePosition: number;
  topRankings: number;
  rankings: KeywordRanking[];
  lastUpdated: string;
  visibility: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RankTrackerPage() {
  const [formData, setFormData] = useState({
    keywords: '',
    domain: '',
    location: 'United States',
    device: 'desktop',
    vendor: 'gemini'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankTrackerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const keywordList = formData.keywords
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywordList.length === 0) {
        throw new Error('Please enter at least one keyword');
      }

      const response = await fetch('/api/rank-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywordList,
          domain: formData.domain,
          location: formData.location,
          device: formData.device,
          vendor: formData.vendor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track rankings');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'stable':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  const getPositionData = () => {
    if (!result) return [];
    
    const positionRanges = [
      { name: '1-3', count: 0, color: '#22c55e' },
      { name: '4-10', count: 0, color: '#3b82f6' },
      { name: '11-20', count: 0, color: '#f59e0b' },
      { name: '21-50', count: 0, color: '#ef4444' },
      { name: '51+', count: 0, color: '#6b7280' },
      { name: 'Not Ranked', count: 0, color: '#374151' }
    ];

    result.rankings.forEach(ranking => {
      if (!ranking.position) {
        positionRanges[5].count++;
      } else if (ranking.position <= 3) {
        positionRanges[0].count++;
      } else if (ranking.position <= 10) {
        positionRanges[1].count++;
      } else if (ranking.position <= 20) {
        positionRanges[2].count++;
      } else if (ranking.position <= 50) {
        positionRanges[3].count++;
      } else {
        positionRanges[4].count++;
      }
    });

    return positionRanges;
  };

  const getVolumeData = () => {
    if (!result) return [];
    
    return result.rankings
      .filter(r => r.searchVolume)
      .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
      .slice(0, 10)
      .map(r => ({
        keyword: r.keyword.length > 15 ? r.keyword.substring(0, 15) + '...' : r.keyword,
        volume: r.searchVolume,
        position: r.position || 0
      }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rank Tracker</h1>
        <p className="text-gray-600">
          Track your keyword rankings across search engines and monitor your SEO performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Rankings
              </CardTitle>
              <CardDescription>
                Enter your keywords and domain to track rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (one per line)</Label>
                  <Textarea
                    id="keywords"
                    placeholder="seo tools&#10;keyword research&#10;rank tracker"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="device">Device</Label>
                    <Select value={formData.device} onValueChange={(value) => setFormData({ ...formData, device: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
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
                      Tracking Rankings...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Track Rankings
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
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{result.totalKeywords}</div>
                    <p className="text-xs text-muted-foreground">Total Keywords</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{result.averagePosition}</div>
                    <p className="text-xs text-muted-foreground">Avg Position</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{result.topRankings}</div>
                    <p className="text-xs text-muted-foreground">Top 10 Rankings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{result.visibility.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Visibility Score</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="rankings" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rankings">Rankings</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                  <TabsTrigger value="volume">Search Volume</TabsTrigger>
                </TabsList>

                <TabsContent value="rankings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Rankings</CardTitle>
                      <CardDescription>
                        Current positions for {result.domain} in {result.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.rankings.map((ranking, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{ranking.keyword}</span>
                                {getTrendIcon(ranking.trend)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Volume: {ranking.searchVolume?.toLocaleString() || 'N/A'} | 
                                Difficulty: {ranking.difficulty || 'N/A'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {ranking.position ? `#${ranking.position}` : 'Not Ranked'}
                              </div>
                              {ranking.change !== 0 && (
                                <div className={`text-sm ${getTrendColor(ranking.trend)}`}>
                                  {ranking.change > 0 ? '+' : ''}{ranking.change}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="distribution">
                  <Card>
                    <CardHeader>
                      <CardTitle>Position Distribution</CardTitle>
                      <CardDescription>
                        How your keywords are distributed across ranking positions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPositionData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, count }) => `${name}: ${count}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {getPositionData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="volume">
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Volume Analysis</CardTitle>
                      <CardDescription>
                        Keywords with highest search volume and their positions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getVolumeData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="keyword" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="volume" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
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