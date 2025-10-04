"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LinkIcon,
  Globe,
  Search,
  Loader2,
  BarChart2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Download,
  TrendingUp,
  Filter,
  ArrowUpRight,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Backlink {
  domain: string
  url: string
  anchorText: string
  authority: number
  status: "follow" | "nofollow"
  discovered: string
  lastSeen: string
}

export default function BacklinksPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [domain, setDomain] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedAuthority, setSelectedAuthority] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [backlinkStats, setBacklinkStats] = useState({
    total: 0,
    follow: 0,
    nofollow: 0,
    highAuthority: 0,
    mediumAuthority: 0,
    lowAuthority: 0,
    domains: 0,
  })

  // Load user backlinks on component mount
  useEffect(() => {
    const loadUserBacklinks = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/user/backlinks')
        if (response.ok) {
          const data = await response.json()
          setBacklinks(data.backlinks)
          setBacklinkStats(data.stats)
        }
      } catch (error) {
        console.error('Error loading user backlinks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserBacklinks()
  }, [])

  const handleExportBacklinks = (type: "all" | "domains" = "all") => {
    // Create CSV content
    let csvContent = ""

    if (type === "all") {
      csvContent = "Domain,URL,Anchor Text,Authority,Status,Discovered,Last Seen\n"

      // Add data rows
      backlinks.forEach((item) => {
        csvContent += `"${item.domain}","${item.url}","${item.anchorText}",${item.authority},"${item.status}","${item.discovered}","${item.lastSeen}"\n`
      })
    } else {
      // Get unique domains
      const domains = Array.from(new Set(backlinks.map((b) => b.domain)))

      csvContent = "Domain,Authority,Backlinks,First Seen\n"

      // Add data rows
      domains.forEach((domain) => {
        const domainBacklinks = backlinks.filter((b) => b.domain === domain)
        const authority = domainBacklinks[0].authority
        const firstSeen = domainBacklinks[0].discovered

        csvContent += `"${domain}",${authority},${domainBacklinks.length},"${firstSeen}"\n`
      })
    }

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob)

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `backlinks_${type}_${new Date().toISOString().split("T")[0]}.csv`)

    // Append the link to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `Your backlink ${type === "all" ? "data" : "domains"} has been exported as CSV.`,
    })
  }

  const handleAnalyze = async () => {
    if (!domain.trim() || !domain.includes(".")) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Fetch user backlinks from API
      const response = await fetch('/api/user/backlinks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch backlinks')
      }

      const data = await response.json()
      
      setBacklinks(data.backlinks)
      setBacklinkStats(data.stats)
      
      toast({
        title: "Analysis complete",
        description: `Found ${data.stats.total} backlinks from ${data.stats.domains} domains`,
      })
    } catch (error) {
      console.error('Error fetching backlinks:', error)
      
      // Fallback to mock data if API fails
      const mockBacklinks: Backlink[] = []

      for (let i = 0; i < 20; i++) {
        const authority = Math.floor(Math.random() * 100)
        const status = Math.random() > 0.3 ? "follow" : "nofollow"
        const randomDomain = `${getRandomDomainName()}.${getRandomTLD()}`

        mockBacklinks.push({
          domain: randomDomain,
          url: `https://${randomDomain}/${getRandomPath()}`,
          anchorText: getRandomAnchorText(),
          authority: authority,
          status: status,
          discovered: getRandomDate(365),
          lastSeen: getRandomDate(30),
        })
      }

      const stats = {
        total: mockBacklinks.length,
        follow: mockBacklinks.filter((b) => b.status === "follow").length,
        nofollow: mockBacklinks.filter((b) => b.status === "nofollow").length,
        highAuthority: mockBacklinks.filter((b) => b.authority >= 70).length,
        mediumAuthority: mockBacklinks.filter((b) => b.authority >= 40 && b.authority < 70).length,
        lowAuthority: mockBacklinks.filter((b) => b.authority < 40).length,
        domains: new Set(mockBacklinks.map((b) => b.domain)).size,
      }

      setBacklinks(mockBacklinks)
      setBacklinkStats(stats)
      
      toast({
        title: "Using sample data",
        description: "Showing sample backlinks. Try the backlink checker tool for real analysis.",
        variant: "default",
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

  const getRandomDomainName = () => {
    const prefixes = ["blog", "news", "tech", "digital", "online", "web", "my", "the", "best", "top"]
    const words = ["marketing", "seo", "business", "tech", "design", "dev", "code", "web", "media", "content"]
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${words[Math.floor(Math.random() * words.length)]}`
  }

  const getRandomTLD = () => {
    const tlds = ["com", "org", "net", "io", "co", "info", "blog"]
    return tlds[Math.floor(Math.random() * tlds.length)]
  }

  const getRandomPath = () => {
    const paths = ["blog", "article", "news", "post", "page", "content", "resource", "guide", "tutorial", "review"]
    const slugs = [
      "seo-tips",
      "marketing-guide",
      "best-practices",
      "how-to",
      "top-10",
      "ultimate-guide",
      "review",
      "analysis",
    ]
    return `${paths[Math.floor(Math.random() * paths.length)]}/${slugs[Math.floor(Math.random() * slugs.length)]}`
  }

  const getRandomAnchorText = () => {
    const anchors = [
      "click here",
      "read more",
      "learn more",
      "visit website",
      "check out",
      "SEO tools",
      "best SEO software",
      "marketing resources",
      "useful guide",
      domain.replace(/https?:\/\/(www\.)?/, ""),
    ]
    return anchors[Math.floor(Math.random() * anchors.length)]
  }

  const getRandomDate = (daysBack: number) => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
    return date.toISOString().split("T")[0]
  }

  const getAuthorityColor = (authority: number) => {
    if (authority >= 70) return "bg-emerald-100 text-emerald-800"
    if (authority >= 40) return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
  }

  const getAuthorityLabel = (authority: number) => {
    if (authority >= 70) return "High"
    if (authority >= 40) return "Medium"
    return "Low"
  }

  const filteredBacklinks = backlinks.filter((backlink) => {
    let matchesStatus = true
    let matchesAuthority = true
    let matchesSearch = true

    if (selectedStatus !== "all") {
      matchesStatus = backlink.status === selectedStatus
    }

    if (selectedAuthority !== "all") {
      if (selectedAuthority === "high") {
        matchesAuthority = backlink.authority >= 70
      } else if (selectedAuthority === "medium") {
        matchesAuthority = backlink.authority >= 40 && backlink.authority < 70
      } else if (selectedAuthority === "low") {
        matchesAuthority = backlink.authority < 40
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matchesSearch =
        backlink.domain.toLowerCase().includes(query) ||
        backlink.url.toLowerCase().includes(query) ||
        backlink.anchorText.toLowerCase().includes(query)
    }

    return matchesStatus && matchesAuthority && matchesSearch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Backlink Analysis</h1>
        <p className="text-slate-600">Analyze and monitor your website&apos;s backlink profile</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Backlink Analyzer</CardTitle>
          <CardDescription>Enter a domain to analyze its backlink profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Enter domain (e.g., example.com)"
                className="pl-9"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
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
                "Analyze Backlinks"
              )}
            </Button>
          </div>

          {!backlinks.length && !isAnalyzing && (
            <div className="mt-8 text-center py-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              <LinkIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Enter a domain to get started</h3>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                Our tool will analyze the backlink profile of your website and provide detailed insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {backlinks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <LinkIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold">{backlinkStats.total}</h3>
                  <p className="text-sm text-slate-600">Total Backlinks</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-purple-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold">{backlinkStats.domains}</h3>
                  <p className="text-sm text-slate-600">Referring Domains</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-emerald-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold">{backlinkStats.follow}</h3>
                  <p className="text-sm text-slate-600">Follow Links</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-amber-100 p-2 rounded-full inline-flex items-center justify-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold">{backlinkStats.nofollow}</h3>
                  <p className="text-sm text-slate-600">Nofollow Links</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="backlinks" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                <span>Backlinks</span>
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Referring Domains</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Backlink Profile Overview</CardTitle>
                  <CardDescription>Summary of your backlink profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-4">Link Type Distribution</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Follow</span>
                              <span className="text-sm font-medium">
                                {Math.round((backlinkStats.follow / backlinkStats.total) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(backlinkStats.follow / backlinkStats.total) * 100}
                              className="h-2 bg-slate-200"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Nofollow</span>
                              <span className="text-sm font-medium">
                                {Math.round((backlinkStats.nofollow / backlinkStats.total) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(backlinkStats.nofollow / backlinkStats.total) * 100}
                              className="h-2 bg-slate-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-4">Domain Authority Distribution</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">High Authority (70-100)</span>
                              <span className="text-sm font-medium">
                                {Math.round((backlinkStats.highAuthority / backlinkStats.total) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(backlinkStats.highAuthority / backlinkStats.total) * 100}
                              className="h-2 bg-slate-200"
                            />
                          </div>
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Medium Authority (40-69)</span>
                              <span className="text-sm font-medium">
                                {Math.round((backlinkStats.mediumAuthority / backlinkStats.total) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(backlinkStats.mediumAuthority / backlinkStats.total) * 100}
                              className="h-2 bg-slate-200"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Low Authority (0-39)</span>
                              <span className="text-sm font-medium">
                                {Math.round((backlinkStats.lowAuthority / backlinkStats.total) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(backlinkStats.lowAuthority / backlinkStats.total) * 100}
                              className="h-2 bg-slate-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Backlink Profile Analysis</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Your backlink profile consists of {backlinkStats.total} backlinks from{" "}
                            {backlinkStats.domains} unique domains.
                            {backlinkStats.highAuthority > 0
                              ? ` You have ${backlinkStats.highAuthority} high-authority backlinks, which is excellent for your SEO.`
                              : ` You should focus on acquiring more high-authority backlinks to improve your SEO.`}
                            {backlinkStats.follow > backlinkStats.nofollow
                              ? ` The majority of your backlinks are follow links, which pass link equity to your site.`
                              : ` A significant portion of your backlinks are nofollow, which don't pass link equity.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Top Anchor Texts</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          "click here",
                          "read more",
                          "visit website",
                          domain.replace(/https?:\/\/(www\.)?/, ""),
                          "SEO tools",
                        ].map((anchor, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{anchor}</span>
                              <Badge className="bg-blue-100 text-blue-800">
                                {Math.floor(Math.random() * 5) + 1} links
                              </Badge>
                            </div>
                            <Progress value={Math.random() * 100} className="h-1.5 mt-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Backlink Growth</h3>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium">Last 30 days</span>
                          <div className="flex items-center text-emerald-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              +{Math.floor(Math.random() * 10) + 1} new backlinks
                            </span>
                          </div>
                        </div>
                        <div className="h-40 flex items-end gap-1">
                          {Array.from({ length: 30 }).map((_, i) => {
                            const height = Math.floor(Math.random() * 70) + 10
                            return (
                              <div
                                key={i}
                                className="bg-emerald-500 rounded-t w-full"
                                style={{ height: `${height}%` }}
                              ></div>
                            )
                          })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                          <span>30 days ago</span>
                          <span>Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actionable insights to improve your backlink profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                      <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Diversify your anchor text</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Your backlink profile shows a high concentration of generic anchor texts like "click here" and
                          "read more". Try to acquire more backlinks with keyword-rich anchor text relevant to your
                          content.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                      <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Focus on high-authority domains</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {backlinkStats.highAuthority < 5
                            ? "Your backlink profile has few high-authority links. Focus on acquiring backlinks from websites with higher domain authority to improve your SEO performance."
                            : "You have a good number of high-authority backlinks. Continue to focus on quality over quantity when building new links."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                      <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Monitor competitor backlinks</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Analyze your competitors' backlink profiles to identify new link building opportunities. Look
                          for domains that link to multiple competitors but not to you.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => handleExportBacklinks("all")}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Backlinks Tab */}
            <TabsContent value="backlinks">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>All Backlinks</CardTitle>
                      <CardDescription>Complete list of backlinks pointing to your domain</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleExportBacklinks("all")}
                    >
                      <Download className="h-4 w-4" />
                      Export All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Link Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Links</SelectItem>
                          <SelectItem value="follow">Follow</SelectItem>
                          <SelectItem value="nofollow">Nofollow</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Authority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Authority</SelectItem>
                          <SelectItem value="high">High (70-100)</SelectItem>
                          <SelectItem value="medium">Medium (40-69)</SelectItem>
                          <SelectItem value="low">Low (0-39)</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search backlinks..."
                          className="pl-9 w-full sm:w-[200px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {filteredBacklinks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Source</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Anchor Text</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Authority</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Discovered</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBacklinks.map((backlink, index) => (
                            <tr key={index} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span className="font-medium">{backlink.domain}</span>
                                  <a
                                    href={backlink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-600 hover:underline truncate max-w-[200px]"
                                  >
                                    {backlink.url}
                                  </a>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">&quot;{backlink.anchorText}&quot;</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                  <Badge className={getAuthorityColor(backlink.authority)}>
                                    {getAuthorityLabel(backlink.authority)}
                                  </Badge>
                                  <Progress value={backlink.authority} className="h-1.5 w-24" />
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={
                                    backlink.status === "follow"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }
                                >
                                  {backlink.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm">{backlink.discovered}</div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <a
                                  href={backlink.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-slate-500 hover:text-emerald-600"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <LinkIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900">No backlinks found</h3>
                      <p className="text-slate-500 mt-1 max-w-md mx-auto">
                        {searchQuery || selectedStatus !== "all" || selectedAuthority !== "all"
                          ? "Try changing your search or filter criteria"
                          : "No backlinks were found for this domain"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referring Domains Tab */}
            <TabsContent value="domains">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Referring Domains</CardTitle>
                      <CardDescription>Domains linking to your website</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleExportBacklinks("domains")}
                    >
                      <Download className="h-4 w-4" />
                      Export Domains
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Domain</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Authority</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Backlinks</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">First Seen</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(backlinks.map((b) => b.domain))).map((domain, index) => {
                          const domainBacklinks = backlinks.filter((b) => b.domain === domain)
                          const authority = domainBacklinks[0].authority
                          return (
                            <tr key={index} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium">
                                    {domain.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-medium">{domain}</span>
                                    <a
                                      href={`https://${domain}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-emerald-600 hover:underline block"
                                    >
                                      Visit site
                                    </a>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                  <Badge className={getAuthorityColor(authority)}>{getAuthorityLabel(authority)}</Badge>
                                  <Progress value={authority} className="h-1.5 w-24" />
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className="bg-blue-100 text-blue-800">
                                  {domainBacklinks.length} {domainBacklinks.length === 1 ? "link" : "links"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm">{domainBacklinks[0].discovered}</div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="ghost" size="sm">
                                  View Links
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  )
}
