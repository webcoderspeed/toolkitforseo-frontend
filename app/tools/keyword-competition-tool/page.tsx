"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeywordResearchData, KeywordResearchResponse } from "@/store/types";
import { api } from "@/store";

export default function KeywordCompetitionTool() {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | KeywordResearchData>(null);

  const handleCheck = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Empty keyword",
        description: "Please enter a keyword to check.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data } = await api.post<KeywordResearchData>(
        "/api/keyword-competition",
        {
          keyword: keyword,
          vendor: 'gemini',
        }
      );

      setResults(data);

      toast({
        title: "Keyword research completed",
        description: `Results fetched successfully${(data?.keywords ?? [])?.length ? ` (${(data?.keywords ?? []).length} competitors found)` : ""}.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to check keyword research:", error);
      toast({
        title: "Keyword research failed",
        description:
          "An error occurred while fetching keyword data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setKeyword("");
    setResults(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Keyword Competition Tool
          </h1>
          <p className="text-slate-600">
            Analyze keyword competition and search volume
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter your keyword</CardTitle>
            <CardDescription>
              Enter a keyword to check its competition and search volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Button
                onClick={handleCheck}
                disabled={isChecking || !keyword.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Competition"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isChecking}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Competing Pages</CardTitle>
                <CardDescription>
                  Keyword competition and related metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Keyword Overlap</TableHead>
                      <TableHead>Competitor's Keywords</TableHead>
                      <TableHead>Common Keywords</TableHead>
                      <TableHead>Share</TableHead>
                      <TableHead>Target Keywords</TableHead>
                      <TableHead>DR</TableHead>
                      <TableHead>Traffic</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.keywords.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <a
                            href={item.url}
                            className="truncate w-32 sm:w-80 md:w-full lg:max-w-32 overflow-hidden text-ellipsis whitespace-nowrap block hover:text-blue-600"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.url}
                          </a>
                        </TableCell>
                        <TableCell>{item.keyword_overlap}</TableCell>
                        <TableCell>{item.competitors_keywords}</TableCell>
                        <TableCell>{item.common_keywords}</TableCell>
                        <TableCell>{item.share}</TableCell>
                        <TableCell>{item.target_keywords}</TableCell>
                        <TableCell>{item.dr}</TableCell>
                        <TableCell>{item.traffic}</TableCell>
                        <TableCell>{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
