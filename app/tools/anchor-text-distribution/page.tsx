"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Anchor, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { api } from "@/store/api" // Import the api instance

interface AnchorTextDistributionResponse {
  totalBacklinks: number
  anchorTextCategories: {
    category: string
    count: number
    percentage: number
    examples: string[]
  }[]
  topAnchorTexts: {
    text: string
    count: number
    percentage: number
  }[]
  diversityScore: number
}

export default function AnchorTextDistribution() {
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<null | AnchorTextDistributionResponse>(null) // Use the defined type

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a website URL to analyze.",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    let formattedUrl = url
    if (!url.match(/^(http|https):\/\//)) {
      formattedUrl = `https://${url}`
    }

    // More robust URL validation (optional, adjust regex as needed)
    try {
      new URL(formattedUrl) // Check if it's a valid URL structure
    } catch (_) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setResults(null) // Clear previous results

    try {
      // Make the API call
      const response = await api.post<{data:AnchorTextDistributionResponse}>(
        "/backlink-analysis/anchor-text-distribution",
        { url: formattedUrl } ,
        {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
      )
      setResults(response.data.data) 

      toast({
        title: "Analysis complete",
        description: `Analyzed anchor text distribution for ${response.data.data.totalBacklinks} backlinks.`,
      })
    } catch (error: any) {
      console.error("API Error:", error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to analyze anchor text distribution. Please try again."
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setResults(null) // Ensure results are cleared on error
    } finally {
      setIsAnalyzing(false) // Stop loading indicator regardless of success or failure
    }
  }

  const handleClear = () => {
    setUrl("")
    setResults(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Branded":
        return "bg-blue-500"
      case "Exact Match":
        return "bg-emerald-500"
      case "Partial Match":
        return "bg-teal-500"
      case "Generic":
        return "bg-amber-500"
      case "Naked URL":
        return "bg-purple-500"
      case "Image":
        return "bg-pink-500"
      default:
        return "bg-slate-500"
    }
  }

  const getDiversityScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-amber-600"
    return "text-red-600"
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
          <Anchor className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Anchor Text Distribution</h1>
          <p className="text-slate-600">Analyze the distribution of anchor texts in your backlink profile</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
          <CardDescription>Provide the URL of the website you want to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow"
              disabled={isAnalyzing} // Disable input while analyzing
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Anchor Texts"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-500">
            This tool analyzes the distribution of anchor texts in your backlink profile to help optimize your SEO
            strategy.
          </p>
        </CardFooter>
      </Card>

      {isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
          <h3 className="text-xl font-medium mb-2">Analyzing anchor text distribution</h3>
          <p className="text-slate-600 mb-6">This may take a few moments...</p>
          <div className="max-w-md mx-auto">
            <Progress value={Math.floor(Math.random() * 90) + 10} className="h-2" />
          </div>
        </motion.div>
      )}

      {results && !isAnalyzing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Anchor Text Categories</CardTitle>
                <CardDescription>Distribution by anchor text type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {results.anchorTextCategories.map((category, index) => (
                    <Badge key={index} variant="outline" className="bg-slate-50">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(category.category)} mr-1`}></div>
                      {category.category}: {category.percentage}%
                    </Badge>
                  ))}
                </div>

                <div className="space-y-4">
                  {results.anchorTextCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="font-medium">
                          {category.count} ({category.percentage}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-6 rounded-sm ${getCategoryColor(category.category)}`}></div>
                        <Progress value={category.percentage} className="h-6 rounded-sm" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {category.examples.map((example, i) => (
                          <Badge key={i} variant="outline" className="bg-slate-50 text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diversity Score</CardTitle>
                <CardDescription>Anchor text diversity rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center mb-4">
                    <div className={`text-3xl font-bold ${getDiversityScoreColor(results.diversityScore)}`}>
                      {results.diversityScore}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      {results.diversityScore >= 80
                        ? "Excellent"
                        : results.diversityScore >= 60
                          ? "Good"
                          : results.diversityScore >= 40
                            ? "Average"
                            : "Poor"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Anchor Text Diversity</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <p className="font-medium">What this means:</p>
                  <p className="text-slate-600">
                    {results.diversityScore >= 80
                      ? "Your anchor text profile is well-diversified, which is excellent for SEO."
                      : results.diversityScore >= 60
                        ? "Your anchor text diversity is good, but there's room for improvement."
                        : results.diversityScore >= 40
                          ? "Your anchor text profile needs more diversity to avoid over-optimization penalties."
                          : "Your anchor text profile lacks diversity, which may trigger over-optimization penalties."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Top Anchor Texts</CardTitle>
              <CardDescription>Most frequently used anchor texts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm font-medium text-slate-500">Anchor Text</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-slate-500">Count</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-slate-500">Percentage</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-slate-500">Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.topAnchorTexts.map((anchor, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">
                          <span className="text-sm font-medium">{anchor.text}</span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-sm">{anchor.count}</span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-sm">{anchor.percentage}%</span>
                        </td>
                        <td className="py-2 px-2 w-1/3">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${anchor.percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>How to improve your anchor text distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Diversify your anchor text profile</p>
                    <p className="text-sm text-slate-600">
                      Aim for a natural mix of branded, exact match, partial match, and generic anchor texts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Avoid over-optimization</p>
                    <p className="text-sm text-slate-600">
                      Too many exact match anchor texts can trigger search engine penalties. Keep them under 20% of your
                      total.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Focus on branded anchors</p>
                    <p className="text-sm text-slate-600">
                      Branded anchor texts are safe and effective. Aim for 30-40% of your anchor text profile to be
                      branded.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Reduce generic anchors</p>
                    <p className="text-sm text-slate-600">
                      Minimize the use of generic anchor texts like "click here" or "read more" as they provide little
                      SEO value.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleClear}>
              Analyze Another Website
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
