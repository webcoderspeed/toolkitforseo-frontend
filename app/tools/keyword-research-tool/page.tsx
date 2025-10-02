"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, TrendingUp, Target } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/store";

interface KeywordData {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  related_keywords: string[];
}

interface KeywordResearchResult {
  primary_keyword: KeywordData;
  related_keywords: KeywordData[];
  long_tail_keywords: KeywordData[];
  questions: string[];
  suggestions: string[];
}

export default function KeywordResearchTool() {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | KeywordResearchResult>(null);

  const handleCheck = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Empty keyword",
        description: "Please enter a keyword to research.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data } = await api.post<KeywordResearchResult>(
        "/api/keyword-research",
        {
          keyword: keyword,
          vendor: 'gemini',
        }
      );

      setResults(data);

      toast({
        title: "Keyword research completed",
        description: `Research completed successfully for "${keyword}".`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to research keyword:", error);
      toast({
        title: "Keyword research failed",
        description:
          "An error occurred while researching the keyword. Please try again later.",
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

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "bg-green-100 text-green-800";
    if (difficulty <= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
            Keyword Research Tool
          </h1>
          <p className="text-slate-600">
            Discover high-value keywords and analyze search trends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Keyword Research
            </CardTitle>
            <CardDescription>
              Enter a keyword to discover related keywords, search volume, and competition data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter keyword (e.g., digital marketing)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                disabled={isChecking}
                className="flex-1"
              />
              <Button
                onClick={handleCheck}
                disabled={isChecking || !keyword.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isChecking ? "Researching..." : "Research"}
              </Button>
              {results && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Primary Keyword Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Primary Keyword Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Search Volume</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {results.primary_keyword.search_volume.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Difficulty</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-slate-900">
                        {results.primary_keyword.difficulty}
                      </div>
                      <Badge className={getDifficultyColor(results.primary_keyword.difficulty)}>
                        {results.primary_keyword.difficulty <= 30 ? "Easy" : 
                         results.primary_keyword.difficulty <= 60 ? "Medium" : "Hard"}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">CPC</div>
                    <div className="text-2xl font-bold text-slate-900">
                      ${results.primary_keyword.cpc.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Competition</div>
                    <Badge className={getCompetitionColor(results.primary_keyword.competition)}>
                      {results.primary_keyword.competition}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Related Keywords</CardTitle>
                <CardDescription>
                  Keywords related to your primary keyword
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Search Volume</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>CPC</TableHead>
                      <TableHead>Competition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.related_keywords.map((kw, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>{kw.search_volume.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(kw.difficulty)}>
                            {kw.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>${kw.cpc.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getCompetitionColor(kw.competition)}>
                            {kw.competition}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Long Tail Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Long Tail Keywords</CardTitle>
                <CardDescription>
                  Longer, more specific keyword phrases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Search Volume</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>CPC</TableHead>
                      <TableHead>Competition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.long_tail_keywords.map((kw, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>{kw.search_volume.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(kw.difficulty)}>
                            {kw.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>${kw.cpc.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getCompetitionColor(kw.competition)}>
                            {kw.competition}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Questions and Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question Keywords</CardTitle>
                  <CardDescription>
                    Questions people ask about your keyword
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.questions.map((question, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg">
                        {question}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keyword Suggestions</CardTitle>
                  <CardDescription>
                    Additional keyword ideas to explore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}