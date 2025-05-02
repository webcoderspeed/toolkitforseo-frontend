"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { api } from "@/store";

interface IValuableBacklinkChecker {
  totalBacklinks: number;
  valuableBacklinks: number;
  backlinksAnalyzed: {
    url: string;
    domain: string;
    domainAuthority: number;
    pageAuthority: number;
    doFollow: boolean;
    status: "valuable" | "moderate" | "low-value";
    metrics: {
      traffic: number;
      relevance: number;
      trustFlow: number;
      citationFlow: number;
    };
  }[];
  summary: {
    valuableCount: number;
    moderateCount: number;
    lowValueCount: number;
    doFollowCount: number;
    noFollowCount: number;
    averageDomainAuthority: number;
  };
}

export default function ValuableBacklinkChecker() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | IValuableBacklinkChecker>(null);

  const handleCheck = async () => {
    if (!url.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a website URL to check.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    let formattedUrl = url;
    if (!url.match(/^(http|https):\/\//)) {
      formattedUrl = `https://${url}`;
    }

    if (
      !formattedUrl.match(
        /^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/
      )
    ) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid domain name",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data } = await api.post<{ data: IValuableBacklinkChecker }>(
        `backlink-analysis/valuable-backlink-checker`,
        {
          url: formattedUrl,
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      setResults(data.data);
      setIsChecking(false);

      toast({
        title: "Backlink analysis complete",
        description: `Found ${data.data.summary.valuableCount} valuable backlinks out of ${data.data.backlinksAnalyzed.length} analyzed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while checking backlinks.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    setResults(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valuable":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "moderate":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low-value":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valuable":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "moderate":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case "low-value":
        return <XCircle className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getMetricColor = (value: number, max = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return "text-emerald-600";
    if (percentage >= 40) return "text-blue-600";
    return "text-amber-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Valuable Backlink Checker
          </h1>
          <p className="text-slate-600">
            Identify your most valuable backlinks
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
          <CardDescription>
            Provide the URL of the website you want to check
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow"
            />
            <Button
              onClick={handleCheck}
              disabled={isChecking || !url.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Find Valuable Backlinks"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-500">
            This tool analyzes your backlinks and identifies the most valuable
            ones based on domain authority, page authority, and other metrics.
          </p>
        </CardFooter>
      </Card>

      {isChecking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
          <h3 className="text-xl font-medium mb-2">Analyzing backlinks</h3>
          <p className="text-slate-600 mb-6">This may take a few moments...</p>
          <div className="max-w-md mx-auto">
            <Progress
              value={Math.floor(Math.random() * 90) + 10}
              className="h-2"
            />
          </div>
        </motion.div>
      )}

      {results && !isChecking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Valuable Backlinks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {results.summary.valuableCount}
                  </div>
                  <p className="text-sm text-slate-500">High-value backlinks</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average DA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.summary.averageDomainAuthority}
                  </div>
                  <p className="text-sm text-slate-500">
                    Average domain authority
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">DoFollow Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {results.summary.doFollowCount}
                  </div>
                  <p className="text-sm text-slate-500">
                    Links passing link juice
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Backlink Quality Distribution</CardTitle>
              <CardDescription>
                Overview of your backlink quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-100" />
                  <span>{results.summary.valuableCount} Valuable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-100" />
                  <span>{results.summary.moderateCount} Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-100" />
                  <span>{results.summary.lowValueCount} Low-Value</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-100" />
                  <span>{results.summary.doFollowCount} DoFollow</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span>{results.summary.noFollowCount} NoFollow</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Analyzed Backlinks</h2>
            <Button variant="outline" onClick={handleClear}>
              Clear Results
            </Button>
          </div>

          <div className="space-y-4">
            {results.backlinksAnalyzed.map((link, index) => (
              <Card
                key={index}
                className={`border ${getStatusColor(link.status)}`}
              >
                <CardContent className="py-4 px-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-3 md:mb-0">
                      <div className="text-lg font-medium text-slate-800">
                        {link.domain}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.url.substring(0, 50)}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(link.status)}
                      <span className="text-sm font-medium capitalize">
                        {link.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                    <div>
                      <strong className={getMetricColor(link.domainAuthority)}>
                        DA:
                      </strong>{" "}
                      {link.domainAuthority}
                    </div>
                    <div>
                      <strong className={getMetricColor(link.pageAuthority)}>
                        PA:
                      </strong>{" "}
                      {link.pageAuthority}
                    </div>
                    <div>
                      <strong
                        className={getMetricColor(link.metrics.trustFlow)}
                      >
                        Trust Flow:
                      </strong>{" "}
                      {link.metrics.trustFlow}
                    </div>
                    <div>
                      <strong
                        className={getMetricColor(link.metrics.citationFlow)}
                      >
                        Citation Flow:
                      </strong>{" "}
                      {link.metrics.citationFlow}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
