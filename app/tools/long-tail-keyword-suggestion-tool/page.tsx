"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowUpRight, Target, TrendingUp } from "lucide-react";
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

interface LongTailKeyword {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  intent: string;
  word_count: number;
  opportunity_score: number;
}

interface LongTailKeywordResult {
  seed_keyword: string;
  total_suggestions: number;
  long_tail_keywords: LongTailKeyword[];
  question_based: LongTailKeyword[];
  location_based: LongTailKeyword[];
  commercial_intent: LongTailKeyword[];
  informational_intent: LongTailKeyword[];
}

export default function LongTailKeywordSuggestionTool() {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | LongTailKeywordResult>(null);

  const handleCheck = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Empty keyword",
        description: "Please enter a keyword to generate long tail suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data } = await api.post<LongTailKeywordResult>(
        "/api/long-tail-keyword-suggestion",
        {
          keyword: keyword,
          vendor: 'gemini',
        }
      );

      setResults(data);

      toast({
        title: "Long tail keywords generated",
        description: `Found ${data.total_suggestions} long tail keyword suggestions for "${keyword}".`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to generate long tail keywords:", error);
      toast({
        title: "Generation failed",
        description:
          "An error occurred while generating long tail keywords. Please try again later.",
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

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case "commercial": return "bg-blue-100 text-blue-800";
      case "informational": return "bg-purple-100 text-purple-800";
      case "navigational": return "bg-orange-100 text-orange-800";
      case "transactional": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderKeywordTable = (keywords: LongTailKeyword[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {keywords.length} keywords found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Opportunity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate" title={kw.keyword}>
                    {kw.keyword}
                  </div>
                  <div className="text-xs text-slate-500">
                    {kw.word_count} words
                  </div>
                </TableCell>
                <TableCell>{kw.search_volume.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(kw.difficulty)}>
                    {kw.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>${kw.cpc.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getIntentColor(kw.intent)}>
                    {kw.intent}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getOpportunityColor(kw.opportunity_score)}>
                    {kw.opportunity_score}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <ArrowUpRight className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Long Tail Keyword Suggestion Tool
          </h1>
          <p className="text-slate-600">
            Discover specific, low-competition long tail keywords
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Long Tail Keyword Generator
            </CardTitle>
            <CardDescription>
              Enter a seed keyword to generate specific long tail keyword variations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter seed keyword (e.g., digital marketing)"
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
                  <ArrowUpRight className="h-4 w-4" />
                )}
                {isChecking ? "Generating..." : "Generate"}
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
            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Long Tail Keyword Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Seed Keyword</div>
                    <div className="text-lg font-bold text-slate-900">
                      {results.seed_keyword}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Total Suggestions</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {results.total_suggestions}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Question Based</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {results.question_based.length}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Commercial Intent</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {results.commercial_intent.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Long Tail Keywords */}
            {renderKeywordTable(results.long_tail_keywords, "All Long Tail Keywords")}

            {/* Question Based Keywords */}
            {results.question_based.length > 0 && 
              renderKeywordTable(results.question_based, "Question-Based Keywords")}

            {/* Location Based Keywords */}
            {results.location_based.length > 0 && 
              renderKeywordTable(results.location_based, "Location-Based Keywords")}

            {/* Commercial Intent Keywords */}
            {results.commercial_intent.length > 0 && 
              renderKeywordTable(results.commercial_intent, "Commercial Intent Keywords")}

            {/* Informational Intent Keywords */}
            {results.informational_intent.length > 0 && 
              renderKeywordTable(results.informational_intent, "Informational Intent Keywords")}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}