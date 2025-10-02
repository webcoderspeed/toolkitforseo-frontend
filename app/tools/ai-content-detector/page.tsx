"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { api } from "@/store/api"
import { AIContentDetectionResult } from "@/store/types/ai-content-detector.types"

export default function AIContentDetector() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AIContentDetectionResult | null>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      })
      return
    }

    if (text.split(" ").length < 50) {
      toast({
        title: "Text too short",
        description: "Please enter at least 50 words for accurate detection.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await api.post('/api/ai-content-detector', {
        text,
        vendor: 'gemini'
      })

      setResults(response.data)

      toast({
        title: "Analysis complete",
        description: "Content has been analyzed successfully.",
      })
    } catch (error) {
      console.error('Error analyzing content:', error)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setText("")
    setResults(null)
  }

  const getConfidenceColor = (confidence: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high":
        return "text-emerald-600"
      case "medium":
        return "text-amber-600"
      case "low":
        return "text-slate-600"
      default:
        return ""
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "ai_generated":
        return "text-red-600"
      case "human_written":
        return "text-green-600"
      case "possibly_ai_generated":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "ai_generated":
        return <Bot className="h-5 w-5 text-red-600" />
      case "human_written":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "possibly_ai_generated":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Bot className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Content Detector</h1>
          <p className="text-slate-600">Check if content was written by AI or a human</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Enter your text</CardTitle>
              <CardDescription>Paste content to analyze (minimum 50 words recommended)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter or paste text here to analyze..."
                className="min-h-[300px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-500">
                {text.split(" ").length} words / {text.length} characters
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear} disabled={isAnalyzing}>
                  Clear
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !text.trim() || text.split(" ").length < 50}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Content"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>About This Tool</CardTitle>
              <CardDescription>How our AI content detector works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Our AI content detector uses advanced machine learning algorithms to analyze text patterns and determine
                if content was likely written by AI or a human.
              </p>
              <p>
                For best results, provide at least 300 words of text. The tool analyzes various linguistic features
                including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sentence structure and complexity</li>
                <li>Vocabulary diversity and usage</li>
                <li>Stylistic patterns and consistency</li>
                <li>Natural language flow</li>
              </ul>
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
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI content detection results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-full mb-2">
                      {getVerdictIcon(results.ai_probability > 70 ? "ai_generated" : results.ai_probability > 30 ? "possibly_ai_generated" : "human_written")}
                    </div>
                    <h3 className={`text-2xl font-bold ${getVerdictColor(results.ai_probability > 70 ? "ai_generated" : results.ai_probability > 30 ? "possibly_ai_generated" : "human_written")}`}>
                      {results.ai_probability > 70 ? "AI Generated" : results.ai_probability > 30 ? "Possibly AI Generated" : "Human Written"}
                    </h3>
                    <p className={`text-sm mt-1 ${getConfidenceColor(results.ai_probability > 70 ? "high" : results.ai_probability > 30 ? "medium" : "low")}`}>
                      {results.ai_probability > 70 ? "High" : results.ai_probability > 30 ? "Medium" : "Low"} confidence
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI Probability</span>
                        <span className="font-medium">{results.ai_probability}%</span>
                      </div>
                      <Progress value={results.ai_probability} className="h-2 bg-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Human Probability</span>
                        <span className="font-medium">{results.human_probability}%</span>
                      </div>
                      <Progress value={results.human_probability} className="h-2 bg-slate-200" />
                    </div>

                    {/* Additional Analysis */}
                    <div className="mt-6 space-y-4">
                      <h4 className="text-lg font-semibold">Detailed Analysis</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Sentence Structure</h5>
                          <p className="text-sm text-muted-foreground">{results.analysis.sentence_structure}</p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Vocabulary Complexity</h5>
                          <p className="text-sm text-muted-foreground">{results.analysis.vocabulary_complexity}</p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Writing Style</h5>
                          <p className="text-sm text-muted-foreground">{results.analysis.writing_style}</p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Repetition Patterns</h5>
                          <p className="text-sm text-muted-foreground">{results.analysis.repetition_patterns}</p>
                        </div>
                      </div>

                      {results.detected_patterns.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">Detected AI Patterns</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {results.detected_patterns.map((pattern, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {pattern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-sm mb-1 text-blue-800">Recommendation</h5>
                        <p className="text-sm text-blue-700">{results.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
