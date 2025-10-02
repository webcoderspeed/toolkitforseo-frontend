"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { GrammarCheckData, GrammarCheckResponse, GrammarResult } from "@/store/types";
import { api } from "@/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GrammarChecker() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | GrammarResult>(null);
  const [activeTab, setActiveTab] = useState("original");

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to check.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data } = await api.post<GrammarResult>('/api/grammar-check', {
        text,
        vendor: 'gemini',
      });

      setResults(data);
      setActiveTab("corrected");
      toast({
        title: "Grammar checked successfully",
        description: "Your text has been checked successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to check grammar", error);
      toast({
        title: "Failed to paraphrase text",
        description:
          "An error occurred while checking the grammar of text. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResults(null);
  };

  const getErrorTypeColor = (type: "grammar" | "spelling" | "punctuation" | "style") => {
    switch (type) {
      case "grammar":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "spelling":
        return "bg-red-100 text-red-800 border-red-200";
      case "punctuation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "style":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "";
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
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Free Grammar Checker
          </h1>
          <p className="text-slate-600">
            Check your text for grammar, spelling, and punctuation errors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter your text</CardTitle>
            <CardDescription>
              Paste your content below to check for grammar errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger
                  value="corrected"
                  disabled={!results?.corrected_text}
                >
                  Corrected
                </TabsTrigger>
              </TabsList>
              <TabsContent value="original" className="mt-0">
                <Textarea
                  placeholder="Enter or paste your text here..."
                  className="min-h-[300px] resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="corrected" className="mt-0">
                <Textarea
                  placeholder="Corrected content will appear here..."
                  className="min-h-[300px] resize-none"
                  value={results?.corrected_text}
                  readOnly
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-slate-500">
              {text.length} characters
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isChecking}
              >
                Clear
              </Button>
              <Button
                onClick={handleCheck}
                disabled={isChecking || !text.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Grammar"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>Grammar check results</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {results.grammar_score}/100
                  </div>
                  <div className="text-xs text-slate-500">Grammar Score</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                      Grammar
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800 border-red-200"
                    >
                      Spelling
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      Punctuation
                    </Badge>
                  </div>

                  {results.errors.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-medium">
                        Found {results.errors.length} issues:
                      </h3>
                      {results.errors.map((error, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 bg-slate-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge
                              variant="outline"
                              className={getErrorTypeColor(error.type)}
                            >
                              {error.type.charAt(0).toUpperCase() +
                                error.type.slice(1)}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <div className="text-sm font-medium">Original:</div>
                            <div className="text-sm bg-white p-2 rounded border border-slate-200 mt-1">
                              &quot;{error.text}&quot;
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Suggestion:
                            </div>
                            <div className="text-sm bg-white p-2 rounded border border-emerald-200 text-emerald-700 mt-1">
                              &quot;{error.suggestion}&quot;
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Check className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">No errors found!</h3>
                      <p className="text-slate-500">Your text looks good.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
