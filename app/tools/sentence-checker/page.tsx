"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function SentenceChecker() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<null | {
    sentences: {
      text: string
      issues: {
        type: "grammar" | "structure" | "clarity" | "none"
        description: string
        suggestion: string
      }[]
    }[]
    score: number
  }>(null)

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to check.",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Split text into sentences (simple split by period for demo)
      const sentences = text
        .split(".")
        .filter((s) => s.trim().length > 0)
        .map((s) => s.trim() + ".")

      // Mock sentence check results
      const mockResults = {
        sentences: sentences.map((sentence) => {
          // Randomly decide if sentence has issues
          const hasIssue = Math.random() > 0.5

          if (!hasIssue) {
            return {
              text: sentence,
              issues: [
                {
                  type: "none" as const,
                  description: "No issues found",
                  suggestion: "",
                },
              ],
            }
          }

          // Random issue type
          const issueTypes = ["grammar", "structure", "clarity"] as const
          const type = issueTypes[Math.floor(Math.random() * issueTypes.length)]

          let description = ""
          let suggestion = ""

          switch (type) {
            case "grammar":
              description = "Grammatical error in sentence structure"
              suggestion = "Revised sentence with correct grammar"
              break
            case "structure":
              description = "Sentence is too complex or run-on"
              suggestion = "Split into two clearer sentences"
              break
            case "clarity":
              description = "Meaning is unclear or ambiguous"
              suggestion = "More precise wording for clarity"
              break
          }

          return {
            text: sentence,
            issues: [
              {
                type,
                description,
                suggestion,
              },
            ],
          }
        }),
        score: Math.floor(Math.random() * 30) + 70, // Score between 70-100
      }

      setResults(mockResults)
      setIsChecking(false)

      toast({
        title: "Sentence check complete",
        description: `Analyzed ${mockResults.sentences.length} sentences.`,
      })
    }, 3000)
  }

  const handleClear = () => {
    setText("")
    setResults(null)
  }

  const getIssueTypeColor = (type: "grammar" | "structure" | "clarity" | "none") => {
    switch (type) {
      case "grammar":
        return "bg-red-100 text-red-800 border-red-200"
      case "structure":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "clarity":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "none":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return ""
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sentence Checker</h1>
          <p className="text-slate-600">Analyze your sentences for grammar, structure, and clarity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter your text</CardTitle>
            <CardDescription>Paste your content below to check each sentence</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter or paste your text here..."
              className="min-h-[200px] resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-slate-500">{text.length} characters</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClear} disabled={isChecking}>
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
                  "Check Sentences"
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
                  <CardDescription>Sentence analysis results</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">{results.score}/100</div>
                  <div className="text-xs text-slate-500">Overall Score</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Grammar
                    </Badge>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Structure
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Clarity
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      No Issues
                    </Badge>
                  </div>

                  <div className="space-y-4 mt-4">
                    <h3 className="font-medium">Sentence Analysis:</h3>
                    {results.sentences.map((sentence, index) => (
                      <div key={index} className="border rounded-md p-3 bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={getIssueTypeColor(sentence.issues[0].type)}>
                            {sentence.issues[0].type === "none"
                              ? "No Issues"
                              : sentence.issues[0].type.charAt(0).toUpperCase() + sentence.issues[0].type.slice(1)}
                          </Badge>
                          <span className="text-xs text-slate-500">Sentence {index + 1}</span>
                        </div>
                        <div className="mb-2">
                          <div className="text-sm font-medium">Original:</div>
                          <div className="text-sm bg-white p-2 rounded border border-slate-200 mt-1">
                            {sentence.text}
                          </div>
                        </div>
                        {sentence.issues[0].type !== "none" && (
                          <>
                            <div className="mb-2">
                              <div className="text-sm font-medium">Issue:</div>
                              <div className="text-sm text-slate-700 mt-1">{sentence.issues[0].description}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Suggestion:</div>
                              <div className="text-sm bg-white p-2 rounded border border-emerald-200 text-emerald-700 mt-1">
                                {sentence.issues[0].suggestion}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
