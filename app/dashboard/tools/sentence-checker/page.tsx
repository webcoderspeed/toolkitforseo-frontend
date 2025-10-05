"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/store/api"
import { SentenceCheckResult } from "@/store/types/sentence-checker.types"

export default function SentenceChecker() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [checkType, setCheckType] = useState("grammar")
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<SentenceCheckResult | null>(null)

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

    try {
      const response = await api.post('/api/sentence-checker', {
        sentence: text,
        check_type: checkType,
        vendor: 'gemini'
      })

      if (response.data.success) {
        setResults(response.data.data)
        toast({
          title: "Sentence check complete",
          description: "Your sentence has been analyzed successfully.",
        })
      } else {
        throw new Error('Failed to check sentence')
      }
    } catch (error) {
      console.error('Error checking sentence:', error)
      toast({
        title: "Error",
        description: "Failed to check sentence. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
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
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Check Type</label>
              <Select value={checkType} onValueChange={setCheckType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select check type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grammar">Grammar Check</SelectItem>
                  <SelectItem value="style">Style Check</SelectItem>
                  <SelectItem value="clarity">Clarity Check</SelectItem>
                  <SelectItem value="all">All Checks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sentence</label>
              <Textarea
                placeholder="Enter your sentence here..."
                className="min-h-[200px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
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
                  "Check Sentence"
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
                  <div className="text-2xl font-bold text-emerald-600">{results.overall_score}/100</div>
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
                    <div className="border rounded-md p-3 bg-slate-50">
                      <div className="mb-2">
                        <div className="text-sm font-medium">Original Sentence:</div>
                        <div className="text-sm bg-white p-2 rounded border border-slate-200 mt-1">
                          {results.original_sentence}
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-sm font-medium">Corrected Sentence:</div>
                        <div className="text-sm bg-white p-2 rounded border border-emerald-200 text-emerald-700 mt-1">
                          {results.corrected_sentence}
                        </div>
                      </div>
                      
                      {results.errors.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium">Errors Found:</div>
                          <div className="space-y-2 mt-1">
                            {results.errors.map((error, index) => (
                              <div key={index} className="bg-red-50 p-2 rounded border border-red-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                    {error.type}
                                  </Badge>
                                  <Badge variant="outline" className={`${
                                    error.severity === 'high' ? 'bg-red-100 text-red-800' :
                                    error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {error.severity}
                                  </Badge>
                                </div>
                                <div className="text-sm text-slate-700">{error.message}</div>
                                <div className="text-sm text-emerald-700 mt-1">
                                  <strong>Suggestion:</strong> {error.suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {results.improvements.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium">Improvements:</div>
                          <ul className="list-disc list-inside text-sm text-slate-700 mt-1 space-y-1">
                            {results.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-sm font-medium">Readability Score:</div>
                          <div className="text-lg font-bold text-blue-600">{results.readability_score}/100</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Complexity:</div>
                          <Badge variant="outline" className={`${
                            results.complexity_level === 'simple' ? 'bg-green-100 text-green-800' :
                            results.complexity_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {results.complexity_level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <div className="text-sm font-medium">Word Count:</div>
                          <div className="text-sm text-slate-600">{results.word_count}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Character Count:</div>
                          <div className="text-sm text-slate-600">{results.character_count}</div>
                        </div>
                      </div>
                      
                      {(results.suggestions.clarity.length > 0 || results.suggestions.conciseness.length > 0 || results.suggestions.style.length > 0) && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Additional Suggestions:</div>
                          <div className="space-y-3">
                            {results.suggestions.clarity.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-blue-700">Clarity:</div>
                                <ul className="list-disc list-inside text-sm text-slate-700 mt-1 space-y-1">
                                  {results.suggestions.clarity.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {results.suggestions.conciseness.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-green-700">Conciseness:</div>
                                <ul className="list-disc list-inside text-sm text-slate-700 mt-1 space-y-1">
                                  {results.suggestions.conciseness.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {results.suggestions.style.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-purple-700">Style:</div>
                                <ul className="list-disc list-inside text-sm text-slate-700 mt-1 space-y-1">
                                  {results.suggestions.style.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
