"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Loader2, ExternalLink, LinkIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/store";
import {
  IWebsiteLinkCountChecker,
  IWebsiteLinkCountCheckerResponse,
} from "@/store/types";

export default function WebsiteLinkCountChecker() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | IWebsiteLinkCountChecker>(null);

  const handleCheck = async () => {
    if (!url.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a website URL to check.",
        variant: "destructive",
      });
      return;
    }

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
      const { data } = await api.post<IWebsiteLinkCountCheckerResponse>(
        `backlink-analysis/website-link-count-checker`,
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
        title: "Link count check complete",
        description: `Found ${data.data.totalLinks} links on your website.`,
      });

    } catch (error) {
      console.error("Failed to check plagiarism:", error);
      toast({
        title: "Failed to check plagiarism",
        description:
          "An error occurred while checking for plagiarism. Please try again later.",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Website Link Count Checker
          </h1>
          <p className="text-slate-600">Analyze all links on your website</p>
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
                "Count Links"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-500">
            This tool counts and analyzes all links on your website, including
            internal and external links.
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
          <h3 className="text-xl font-medium mb-2">Analyzing website links</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {results.totalLinks}
                  </div>
                  <p className="text-sm text-slate-500">Total Links</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {results.internalLinks}
                  </div>
                  <p className="text-sm text-slate-500">Internal Links</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.externalLinks}
                  </div>
                  <p className="text-sm text-slate-500">External Links</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {results.brokenLinks}
                  </div>
                  <p className="text-sm text-slate-500">Broken Links</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Link Distribution</CardTitle>
                <CardDescription>
                  Where links are located on your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.linkDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <Progress
                      value={(item.count / results.totalLinks) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Link Types</CardTitle>
                <CardDescription>Breakdown of link categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full border-8 border-slate-100 relative mb-6">
                    <div
                      className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-emerald-500"
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((results.internalLinks / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}% ${50 + 50 * Math.sin((results.internalLinks / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}%)`,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.7)",
                      }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-blue-500"
                      style={{
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((results.internalLinks / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}% ${50 + 50 * Math.sin((results.internalLinks / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}%, ${50 + 50 * Math.cos(((results.internalLinks + results.externalLinks) / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}% ${50 + 50 * Math.sin(((results.internalLinks + results.externalLinks) / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}%)`,
                        borderColor: "transparent",
                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                      }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-red-500"
                      style={{
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(((results.internalLinks + results.externalLinks) / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}% ${50 + 50 * Math.sin(((results.internalLinks + results.externalLinks) / results.totalLinks) * 2 * Math.PI + Math.PI / 2)}%, ${50 + 50 * Math.cos(2 * Math.PI + Math.PI / 2)}% ${50 + 50 * Math.sin(2 * Math.PI + Math.PI / 2)}%)`,
                        borderColor: "transparent",
                        backgroundColor: "rgba(239, 68, 68, 0.7)",
                      }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm">Internal</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">External</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Broken</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Top External Domains</CardTitle>
                <CardDescription>Most linked external websites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.topExternalDomains
                    .slice(0, 5)
                    .map((domain, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{domain.domain}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-800 border-blue-200"
                        >
                          {domain.count} links
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Internal Pages</CardTitle>
                <CardDescription>Most linked internal pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.topInternalPaths.slice(0, 5).map((path, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">{path.path}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-800 border-emerald-200"
                      >
                        {path.count} links
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleClear}>
              Check Another Website
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
