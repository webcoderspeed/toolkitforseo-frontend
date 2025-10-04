"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart2,
  Globe,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  LinkIcon,
  ImageIcon,
  Zap,
  Clock,
  Smartphone,
  Monitor,
  Info,
  Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface SEOIssue {
  type: "error" | "warning" | "success"
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

interface PageData {
  id: string
  url: string
  title: string
  description: string
  h1: string
  wordCount: number
  loadTime: number
  mobileScore: number
  desktopScore: number
  overallScore: number
  issues: SEOIssue[]
  analyzedAt: Date
  userId: string
}

interface SEOAnalysisStats {
  totalAnalyses: number
  averageScore: number
  criticalIssues: number
  warningIssues: number
  successfulChecks: number
  recentAnalyses: PageData[]
}

export default function SEOAnalysisPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [overallScore, setOverallScore] = useState(0)
  const [historicalAnalyses, setHistoricalAnalyses] = useState<PageData[]>([])
  const [analysisStats, setAnalysisStats] = useState<SEOAnalysisStats | null>(null)

  // Load historical analyses when component mounts
  useEffect(() => {
    const loadHistoricalAnalyses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/seo-analysis')
        if (response.ok) {
          const data = await response.json()
          setHistoricalAnalyses(data.analyses || [])
          setAnalysisStats(data.stats || null)
        }
      } catch (error) {
        console.error('Error loading historical analyses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistoricalAnalyses()
  }, [])

  const handleAnalyze = async () => {
    if (!url.trim() || !url.includes(".")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Call the real SEO analysis API
      const response = await fetch('/api/website-seo-score-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.startsWith("http") ? url : `https://${url}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Transform API response to match our PageData interface
        const analysisData: PageData = {
          id: `analysis-${Date.now()}`,
          url: result.url || url,
          title: result.scrapedData?.title || "Website Analysis",
          description: result.scrapedData?.description || "",
          h1: result.scrapedData?.h1 || "",
          wordCount: result.scrapedData?.wordCount || 0,
          loadTime: result.lighthouseResults?.performance?.loadTime || 0,
          mobileScore: result.lighthouseResults?.performance?.mobileScore || 0,
          desktopScore: result.lighthouseResults?.performance?.desktopScore || 0,
          overallScore: result.overallScore || 0,
          issues: result.issues || [],
          analyzedAt: new Date(),
          userId: 'current-user'
        }

        setOverallScore(result.overallScore || 0)
        setPageData(analysisData)
        
        toast({
          title: "Analysis Complete",
          description: `SEO analysis completed with a score of ${result.overallScore || 0}/100`,
        })

        // Refresh historical analyses
        const historyResponse = await fetch('/api/user/seo-analysis')
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          setHistoricalAnalyses(historyData.analyses || [])
          setAnalysisStats(historyData.stats || null)
        }
      } else {
        // Fallback to sample data if API fails
        const fallbackData: PageData = {
          id: `sample-${Date.now()}`,
          url: url.startsWith("http") ? url : `https://${url}`,
          title: "Sample Analysis - API Unavailable",
          description: "This is sample data as the API is currently unavailable.",
          h1: "Sample Website Analysis",
          wordCount: 500,
          loadTime: 2.5,
          mobileScore: 75,
          desktopScore: 85,
          overallScore: 78,
          issues: [
            {
              type: "warning",
              title: "Using sample data",
              description: "This analysis uses sample data. Please try again later for real results.",
              impact: "low"
            }
          ],
          analyzedAt: new Date(),
          userId: 'current-user'
        }

        setOverallScore(78)
        setPageData(fallbackData)
        
        toast({
          title: "Sample Analysis",
          description: "Showing sample data. Please try again later for real analysis.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('SEO analysis error:', error)
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAnalyze()
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "success":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-none">High Impact</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border-none">Medium Impact</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800 border-none">Low Impact</Badge>
      default:
        return null
    }
  }

  const handleExportReport = (reportType = "full") => {
    if (!pageData) return

    // Create CSV content
    let csvContent = ""

    if (reportType === "full") {
      csvContent = "URL,Title,Description,H1,Word Count,Load Time,Mobile Score,Desktop Score\n"
      csvContent += `"${pageData.url}","${pageData.title}","${pageData.description}","${pageData.h1}",${pageData.wordCount},${pageData.loadTime},${pageData.mobileScore},${pageData.desktopScore}\n\n`

      csvContent += "Issues\nType,Title,Description,Impact\n"
      pageData.issues.forEach((issue) => {
        csvContent += `"${issue.type}","${issue.title}","${issue.description}","${issue.impact}"\n`
      })
    } else if (reportType === "performance") {
      csvContent = "URL,Load Time,Mobile Score,Desktop Score\n"
      csvContent += `"${pageData.url}",${pageData.loadTime},${pageData.mobileScore},${pageData.desktopScore}\n\n`

      csvContent += "Performance Issues\n"
      const performanceIssues = pageData.issues.filter(
        (issue) =>
          issue.title.includes("load time") ||
          issue.title.includes("speed") ||
          issue.description.includes("speed") ||
          issue.description.includes("performance"),
      )

      csvContent += "Type,Title,Description,Impact\n"
      performanceIssues.forEach((issue) => {
        csvContent += `"${issue.type}","${issue.title}","${issue.description}","${issue.impact}"\n`
      })
    }

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob)

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `seo_analysis_${reportType}_${new Date().toISOString().split("T")[0]}.csv`)

    // Append the link to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Report downloaded",
      description: `Your ${reportType} SEO report has been exported as CSV.`,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">SEO Analysis</h1>
        <p className="text-slate-600">Analyze your website and get actionable SEO recommendations</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Website Analyzer</CardTitle>
          <CardDescription>Enter a URL to analyze its SEO performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Enter website URL (e.g., example.com)"
                className="pl-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Website"
              )}
            </Button>
          </div>

          {!pageData && !isAnalyzing && (
            <div className="mt-8 text-center py-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Enter a URL to get started</h3>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                Our AI-powered tool will analyze your website and provide actionable SEO recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {pageData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24">
                      <circle
                        className="text-slate-200"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className={`${
                          overallScore >= 70
                            ? "text-emerald-500"
                            : overallScore >= 50
                              ? "text-amber-500"
                              : "text-red-500"
                        }`}
                        strokeWidth="5"
                        strokeDasharray={`${overallScore * 2.83}, 283`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <span
                      className={`absolute text-2xl font-bold ${
                        overallScore >= 70 ? "text-emerald-700" : overallScore >= 50 ? "text-amber-700" : "text-red-700"
                      }`}
                    >
                      {overallScore}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mt-2">Overall Score</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-red-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {pageData.issues.filter((issue) => issue.type === "error").length}
                  </h3>
                  <p className="text-sm text-slate-600">Critical Issues</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-amber-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {pageData.issues.filter((issue) => issue.type === "warning").length}
                  </h3>
                  <p className="text-sm text-slate-600">Warnings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-emerald-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {pageData.issues.filter((issue) => issue.type === "success").length}
                  </h3>
                  <p className="text-sm text-slate-600">Passed Checks</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Technical</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Page Information</CardTitle>
                  <CardDescription>Basic information about the analyzed page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-500">URL</div>
                        <div className="flex items-center gap-2 text-slate-900 break-all">
                          <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <a
                            href={pageData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-emerald-600"
                          >
                            {pageData.url}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-500">Page Title</div>
                        <div className="flex items-center gap-2 text-slate-900">
                          <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{pageData.title}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-500">Meta Description</div>
                        <div className="flex items-center gap-2 text-slate-900">
                          <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{pageData.description || "No meta description found"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-500">H1 Heading</div>
                        <div className="flex items-center gap-2 text-slate-900">
                          <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{pageData.h1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Issues</CardTitle>
                  <CardDescription>Issues found during the analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pageData.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)} flex gap-4`}>
                        <div className="flex-shrink-0 mt-1">{getIssueIcon(issue.type)}</div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h4 className="font-medium">{issue.title}</h4>
                            {getImpactBadge(issue.impact)}
                          </div>
                          <p className="text-sm mt-1">{issue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => handleExportReport("full")}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Content Analysis</CardTitle>
                  <CardDescription>Analysis of your page content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="bg-blue-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold">{pageData.wordCount}</h3>
                            <p className="text-sm text-slate-600">Word Count</p>
                            <Badge
                              className={
                                pageData.wordCount > 600
                                  ? "bg-emerald-100 text-emerald-800 mt-2"
                                  : "bg-amber-100 text-amber-800 mt-2"
                              }
                            >
                              {pageData.wordCount > 600 ? "Good" : "Needs Improvement"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="bg-purple-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                              <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold">1</h3>
                            <p className="text-sm text-slate-600">H1 Tags</p>
                            <Badge className="bg-emerald-100 text-emerald-800 mt-2">Good</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="bg-amber-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                              <ImageIcon className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold">3</h3>
                            <p className="text-sm text-slate-600">Images without Alt Text</p>
                            <Badge className="bg-amber-100 text-amber-800 mt-2">Needs Improvement</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Content Recommendations</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Increase content length</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Your page has 320 words, which is below the recommended minimum of 600 words for good SEO
                              performance. Consider expanding your content with more valuable information.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Add alt text to images</p>
                            <p className="text-sm text-slate-600 mt-1">
                              3 images on your page are missing alt text. Add descriptive alt attributes to improve
                              accessibility and SEO.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Optimize H1 tag</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Your H1 tag &quot;Welcome to Our Website&quot; is generic. Make it more descriptive and
                              include your target keywords.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                  <CardDescription>Analysis of keywords on your page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">No target keyword detected</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            We couldn&apos;t detect a clear target keyword for your page. Consider optimizing your
                            content around a specific keyword to improve your SEO performance.
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium">Detected Keywords</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">website</span>
                          <Badge className="bg-blue-100 text-blue-800">8 times</Badge>
                        </div>
                        <Progress value={80} className="h-1.5 mt-2" />
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">services</span>
                          <Badge className="bg-blue-100 text-blue-800">5 times</Badge>
                        </div>
                        <Progress value={50} className="h-1.5 mt-2" />
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">company</span>
                          <Badge className="bg-blue-100 text-blue-800">4 times</Badge>
                        </div>
                        <Progress value={40} className="h-1.5 mt-2" />
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">about</span>
                          <Badge className="bg-blue-100 text-blue-800">3 times</Badge>
                        </div>
                        <Progress value={30} className="h-1.5 mt-2" />
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">contact</span>
                          <Badge className="bg-blue-100 text-blue-800">3 times</Badge>
                        </div>
                        <Progress value={30} className="h-1.5 mt-2" />
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">products</span>
                          <Badge className="bg-blue-100 text-blue-800">2 times</Badge>
                        </div>
                        <Progress value={20} className="h-1.5 mt-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Technical SEO</CardTitle>
                  <CardDescription>Technical aspects of your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">HTTPS</h3>
                            <p className="text-sm text-slate-500">Secure connection</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-full">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Meta Description</h3>
                            <p className="text-sm text-slate-500">Missing</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Mobile Friendly</h3>
                            <p className="text-sm text-slate-500">Responsive design</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Technical Issues</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-red-100 p-1 rounded-full mt-0.5">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">Missing meta description</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Your page is missing a meta description. Add a compelling description to improve
                              click-through rates.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">Missing structured data</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Your page doesn't use structured data (Schema.org). Adding structured data can help search
                              engines understand your content better.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">Missing canonical tag</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Your page doesn't have a canonical tag. This can lead to duplicate content issues.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Links Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-5 w-5 text-slate-400" />
                              <h4 className="font-medium">Internal Links</h4>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">12 links</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-2">Your page has a good number of internal links.</p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-5 w-5 text-slate-400" />
                              <h4 className="font-medium">External Links</h4>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">3 links</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-2">
                            Your page has a few external links to authoritative sources.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile Friendliness</CardTitle>
                  <CardDescription>How well your site performs on mobile devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Smartphone className="h-5 w-5 text-slate-400" />
                          <h3 className="font-medium">Mobile Score</h3>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span
                                className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                  pageData.mobileScore >= 70
                                    ? "bg-emerald-100 text-emerald-800"
                                    : pageData.mobileScore >= 50
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {pageData.mobileScore}/100
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                            <div
                              style={{ width: `${pageData.mobileScore}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                pageData.mobileScore >= 70
                                  ? "bg-emerald-500"
                                  : pageData.mobileScore >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-3 mt-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-sm">Viewport is properly configured</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-sm">Content is sized to viewport</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <p className="text-sm">Touch elements are too close together</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Monitor className="h-5 w-5 text-slate-400" />
                          <h3 className="font-medium">Desktop Score</h3>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span
                                className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                  pageData.desktopScore >= 70
                                    ? "bg-emerald-100 text-emerald-800"
                                    : pageData.desktopScore >= 50
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {pageData.desktopScore}/100
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                            <div
                              style={{ width: `${pageData.desktopScore}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                pageData.desktopScore >= 70
                                  ? "bg-emerald-500"
                                  : pageData.desktopScore >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-3 mt-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-sm">Page is well-structured</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-sm">Text is readable</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-sm">Links have appropriate spacing</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Page Speed</CardTitle>
                  <CardDescription>Analysis of your page loading performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-4">Load Time: {pageData.loadTime} seconds</h3>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                            <div
                              style={{
                                width: `${Math.min(100, (pageData.loadTime / 5) * 100)}%`,
                              }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                pageData.loadTime <= 2
                                  ? "bg-emerald-500"
                                  : pageData.loadTime <= 3.5
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>0s</span>
                            <span>2.5s</span>
                            <span>5s+</span>
                          </div>
                        </div>

                        <div
                          className={`mt-4 p-3 rounded-lg ${
                            pageData.loadTime <= 2
                              ? "bg-emerald-50 border border-emerald-200"
                              : pageData.loadTime <= 3.5
                                ? "bg-amber-50 border border-amber-200"
                                : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {pageData.loadTime <= 2 ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : pageData.loadTime <= 3.5 ? (
                              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p
                                className={`font-medium ${
                                  pageData.loadTime <= 2
                                    ? "text-emerald-800"
                                    : pageData.loadTime <= 3.5
                                      ? "text-amber-800"
                                      : "text-red-800"
                                }`}
                              >
                                {pageData.loadTime <= 2
                                  ? "Good page speed"
                                  : pageData.loadTime <= 3.5
                                    ? "Average page speed"
                                    : "Slow page speed"}
                              </p>
                              <p
                                className={`text-sm mt-1 ${
                                  pageData.loadTime <= 2
                                    ? "text-emerald-700"
                                    : pageData.loadTime <= 3.5
                                      ? "text-amber-700"
                                      : "text-red-700"
                                }`}
                              >
                                {pageData.loadTime <= 2
                                  ? "Your page loads quickly, which is great for user experience and SEO."
                                  : pageData.loadTime <= 3.5
                                    ? "Your page load time is acceptable but could be improved."
                                    : "Your page loads slowly, which may negatively impact user experience and SEO."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Performance Issues</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                            <div className="bg-red-100 p-1 rounded-full mt-0.5">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Unoptimized images</p>
                              <p className="text-sm text-slate-600 mt-1">
                                Your page has several unoptimized images. Compress and resize images to improve load
                                time.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                            <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">Render-blocking resources</p>
                              <p className="text-sm text-slate-600 mt-1">
                                Your page has 2 render-blocking resources. Consider deferring or asynchronously loading
                                these resources.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                            <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">No browser caching</p>
                              <p className="text-sm text-slate-600 mt-1">
                                Your page doesn't leverage browser caching. Set appropriate cache headers to improve
                                load times for returning visitors.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Recommendations</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Optimize images</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Compress and resize images to reduce their file size without sacrificing quality. Consider
                              using WebP format.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Enable compression</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Enable GZIP or Brotli compression to reduce the size of your HTML, CSS, and JavaScript
                              files.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Implement browser caching</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Set appropriate cache headers to leverage browser caching for static resources.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => handleExportReport("performance")}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Performance Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  )
}
