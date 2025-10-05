"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Globe, 
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface IndexStatus {
  url: string;
  is_indexed: boolean;
  index_status: string;
  last_crawled: string;
  last_indexed: string;
  crawl_status: string;
  indexability_issues: string[];
  mobile_usability: {
    status: string;
    issues: string[];
  };
  page_experience: {
    core_web_vitals: {
      lcp: number;
      fid: number;
      cls: number;
      status: string;
    };
    https: boolean;
    mobile_friendly: boolean;
  };
  structured_data: {
    valid_items: number;
    warnings: number;
    errors: number;
    types: string[];
  };
  sitemap_status: {
    found_in_sitemap: boolean;
    sitemap_url: string;
    submitted_urls: number;
  };
  recommendations: {
    priority: string;
    action: string;
    description: string;
  }[];
}

interface GoogleIndexResult {
  domain: string;
  total_pages_checked: number;
  indexed_pages: number;
  not_indexed_pages: number;
  indexing_rate: number;
  pages: IndexStatus[];
  domain_analysis: {
    domain_authority: number;
    crawl_budget: string;
    technical_health: string;
    content_quality: string;
  };
  recommendations: string[];
}

export default function GoogleIndexChecker() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GoogleIndexResult | null>(null);
  const [error, setError] = useState("");
  const [vendor, setVendor] = useState<'gemini' | 'openai'>('gemini');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/google-index-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim(), vendor }),
      });

      if (!response.ok) {
        throw new Error("Failed to check index status");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (isIndexed: boolean) => {
    return isIndexed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      indexed: "bg-green-100 text-green-800",
      "not-indexed": "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      blocked: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Database className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              Google Index Checker
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Check if your website pages are indexed by Google and get detailed insights about indexing status, crawl issues, and optimization recommendations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Check Index Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="Enter website URL (e.g., https://example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value as 'gemini' | 'openai')}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="openai">OpenAI</option>
                    </select>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Check Index
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Pages</p>
                      <p className="text-2xl font-bold text-slate-900">{result.total_pages_checked}</p>
                    </div>
                    <Globe className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Indexed Pages</p>
                      <p className="text-2xl font-bold text-green-600">{result.indexed_pages}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Not Indexed</p>
                      <p className="text-2xl font-bold text-red-600">{result.not_indexed_pages}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Indexing Rate</p>
                      <p className="text-2xl font-bold text-emerald-600">{result.indexing_rate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Tabs defaultValue="pages" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pages">Page Status</TabsTrigger>
                <TabsTrigger value="analysis">Domain Analysis</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="pages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Index Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.pages.map((page, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(page.is_indexed)}
                              <div>
                                <p className="font-medium text-slate-900 truncate max-w-md">
                                  {page.url}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusBadge(page.index_status)}
                                  <Badge variant="outline" className="text-xs">
                                    {page.crawl_status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600">Last Crawled: {page.last_crawled}</p>
                              <p className="text-slate-600">Last Indexed: {page.last_indexed}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Mobile Friendly: {page.page_experience.mobile_friendly ? "Yes" : "No"}</p>
                              <p className="text-slate-600">HTTPS: {page.page_experience.https ? "Yes" : "No"}</p>
                            </div>
                          </div>

                          {page.indexability_issues.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-red-600 mb-2">Issues:</p>
                              <div className="flex flex-wrap gap-1">
                                {page.indexability_issues.map((issue, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs">
                                    {issue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Domain Authority</p>
                          <p className="text-2xl font-bold text-slate-900">{result.domain_analysis.domain_authority}/100</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">Crawl Budget</p>
                          <Badge className="mt-1">{result.domain_analysis.crawl_budget}</Badge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Technical Health</p>
                          <Badge className="mt-1">{result.domain_analysis.technical_health}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">Content Quality</p>
                          <Badge className="mt-1">{result.domain_analysis.content_quality}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.pages.map((page, index) => (
                        page.indexability_issues.length > 0 && (
                          <div key={index} className="border-l-4 border-red-400 pl-4">
                            <p className="font-medium text-slate-900 mb-2">{page.url}</p>
                            <ul className="space-y-1">
                              {page.indexability_issues.map((issue, i) => (
                                <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                              <BarChart3 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{rec}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}