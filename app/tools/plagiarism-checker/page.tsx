"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  PlagiarismCheckerData,
  PlagiarismCheckerResponse,
} from "@/store/types";

export default function PlagiarismChecker() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [model, setModel] = useState("standard");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<null | PlagiarismCheckerData>(null);

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data } = await api.post<PlagiarismCheckerResponse>(
        `text-and-content/plagiarism-check`,
        {
          text,
          model: "gemini-2.0-flash",
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      setResults(data.data);
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
    setText("");
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
          <FileSearch className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Plagiarism Checker
          </h1>
          <p className="text-slate-600">
            Check your content for plagiarism with our AI-powered tool
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Enter your text</CardTitle>
              <CardDescription>
                Paste your content below to check for plagiarism
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter or paste your text here..."
                className="min-h-[300px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
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
                    "Check Plagiarism"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure the plagiarism check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Detection Model</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="thorough">Thorough</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {model === "standard" &&
                    "Standard detection for general content"}
                  {model === "academic" &&
                    "Enhanced detection for academic papers"}
                  {model === "thorough" &&
                    "Deep analysis with highest accuracy"}
                </p>
              </div>
            </CardContent>
          </Card>

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>Plagiarism check results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-full mb-2">
                      {results.score < 20 ? (
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold">
                      {results.score}% Plagiarized
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {results.score < 20
                        ? "Your content is mostly original"
                        : "Your content contains significant plagiarism"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Original Content</span>
                      <span className="font-medium">
                        {results.original_content}%
                      </span>
                    </div>
                    <Progress
                      value={results.original_content}
                      className="h-2 bg-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plagiarized Content</span>
                      <span className="font-medium">
                        {results.plagiarized_content}%
                      </span>
                    </div>
                    <Progress
                      value={results.plagiarized_content}
                      className="h-2 bg-slate-200"
                    />
                  </div>

                  {results.sources.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-medium text-sm">Potential Sources</h4>
                      <ul className="space-y-2">
                        {results.sources.map((source, index) => (
                          <li
                            key={index}
                            className="text-xs bg-slate-50 p-2 rounded flex justify-between"
                          >
                            <span className="truncate">
                              <a
                                href={source.url}
                                className="truncate w-32 sm:w-80 md:w-full lg:max-w-32 overflow-hidden text-ellipsis whitespace-nowrap block hover:text-blue-600"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {source.url}
                              </a>
                            </span>
                            <span className="font-medium">
                              {source.similarity}% match
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
