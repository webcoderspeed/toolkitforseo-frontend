"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export default function AIContentDetector() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<null | {
    aiProbability: number
    humanProbability: number
    verdict: "AI-generated" | "Human-written" | "Possibly AI-generated"
    confidence: "high" | "medium" | "low"
  }>(null)

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

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock results
      const aiProb = Math.floor(Math.random() * 100)
      const humanProb = 100 - aiProb

      let verdict: "AI-generated" | "Human-written" | "Possibly AI-generated"
      let confidence: "high" | "medium" | "low"

      if (aiProb > 75) {
        verdict = "AI-generated"
        confidence = "high"
      } else if (aiProb > 60) {
        verdict = "Possibly AI-generated"
        confidence = "medium"
      } else if (aiProb > 40) {
        verdict = "Possibly AI-generated"
        confidence = "low"
      } else if (aiProb > 25) {
        verdict = "Human-written"
        confidence = "medium"
      } else {
        verdict = "Human-written"
        confidence = "high"
      }

      setResults({
        aiProbability: aiProb,
        humanProbability: humanProb,
        verdict,
        confidence,
      })

      setIsAnalyzing(false)

      toast({
        title: "Analysis complete",
        description: `Content analyzed with ${confidence} confidence.`,
      })
    }, 3000)
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

  const getVerdictColor = (verdict: "AI-generated" | "Human-written" | "Possibly AI-generated") => {
    switch (verdict) {
      case "AI-generated":
        return "text-red-600"
      case "Human-written":
        return "text-emerald-600"
      case "Possibly AI-generated":
        return "text-amber-600"
      default:
        return ""
    }
  }

  const getVerdictIcon = (verdict: "AI-generated" | "Human-written" | "Possibly AI-generated") => {
    switch (verdict) {
      case "AI-generated":
        return <Bot className="h-8 w-8 text-red-600" />
      case "Human-written":
        return <CheckCircle className="h-8 w-8 text-emerald-600" />
      case "Possibly AI-generated":
        return <AlertTriangle className="h-8 w-8 text-amber-600" />
      default:
        return null
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
                      {getVerdictIcon(results.verdict)}
                    </div>
                    <h3 className={`text-2xl font-bold ${getVerdictColor(results.verdict)}`}>{results.verdict}</h3>
                    <p className={`text-sm mt-1 ${getConfidenceColor(results.confidence)}`}>
                      {results.confidence.charAt(0).toUpperCase() + results.confidence.slice(1)} confidence
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI Probability</span>
                        <span className="font-medium">{results.aiProbability}%</span>
                      </div>
                      <Progress value={results.aiProbability} className="h-2 bg-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Human Probability</span>
                        <span className="font-medium">{results.humanProbability}%</span>
                      </div>
                      <Progress value={results.humanProbability} className="h-2 bg-slate-200" />
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
