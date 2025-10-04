"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  TrendingUp,
  Users,
  Search,
  LinkIcon,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Zap,
  Lightbulb,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"

export default function Dashboard() {
  const {user} =  useUser();
  const [isLoading, setIsLoading] = useState(true)
  const [seoScore, setSeoScore] = useState(0)
  const [keywordRankings, setKeywordRankings] = useState<{ keyword: string; position: number; change: number }[]>([])
  const [backlinks, setBacklinks] = useState<{ domain: string; authority: number; status: string }[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<
    { title: string; description: string; priority: string }[]
  >([])

  useEffect(() => {

    setTimeout(() => {
      // Generate random SEO score
      setSeoScore(Math.floor(Math.random() * 30) + 65)

      // Generate random keyword rankings
      setKeywordRankings([
        { keyword: "seo tools", position: Math.floor(Math.random() * 10) + 1, change: 2 },
        { keyword: "keyword research", position: Math.floor(Math.random() * 20) + 5, change: -1 },
        { keyword: "backlink checker", position: Math.floor(Math.random() * 15) + 3, change: 5 },
        { keyword: "seo analysis", position: Math.floor(Math.random() * 30) + 10, change: 0 },
        { keyword: "meta tag generator", position: Math.floor(Math.random() * 25) + 5, change: 3 },
      ])

      // Generate random backlinks
      setBacklinks([
        { domain: "example.com", authority: 76, status: "active" },
        { domain: "seonews.org", authority: 82, status: "active" },
        { domain: "digitalmarketing.com", authority: 65, status: "active" },
        { domain: "techblog.net", authority: 58, status: "pending" },
        { domain: "webmaster.org", authority: 71, status: "active" },
      ])

      // Generate AI recommendations
      setAiRecommendations([
        {
          title: "Optimize Meta Descriptions",
          description:
            "5 of your top pages have meta descriptions that are too short. Our AI suggests optimizing them for better click-through rates.",
          priority: "high",
        },
        {
          title: "Content Gap Opportunity",
          description:
            "AI analysis shows a content gap for 'SEO tools comparison' that your competitors aren't covering well.",
          priority: "medium",
        },
        {
          title: "Backlink Opportunity",
          description:
            "We've identified 3 high-authority websites in your niche that don't link to you yet but link to competitors.",
          priority: "high",
        },
        {
          title: "Page Speed Improvement",
          description:
            "Your homepage loads 2.3s slower on mobile than desktop. Optimize images to improve mobile performance.",
          priority: "medium",
        },
        {
          title: "Keyword Cannibalization",
          description:
            "Two of your pages are competing for the same keyword 'backlink checker'. Consider consolidating content.",
          priority: "low",
        },
      ])

      setIsLoading(false)
    }, 1500)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4">
            <Zap className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-medium mb-2">Loading your AI SEO dashboard</h3>
          <p className="text-slate-600">Analyzing your website data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName}</h1>
        <p className="text-slate-600">Here's what our AI has discovered about your website today</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">SEO Score</p>
                <h3 className="text-2xl font-bold mt-1">{seoScore}/100</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +4 points this week
                </p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <BarChart className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <Progress value={seoScore} className="h-1.5 mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Keyword Rankings</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />5 new rankings
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Backlinks</p>
                <h3 className="text-2xl font-bold mt-1">142</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12 this month
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <LinkIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Organic Traffic</p>
                <h3 className="text-2xl font-bold mt-1">3,842</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18% vs last month
                </p>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              5 New Insights
            </Badge>
          </div>
          <CardDescription>
            Our AI has analyzed your website and found these opportunities for improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="flex gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div
                  className={`
                  h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${rec.priority === "high" ? "bg-red-100" : rec.priority === "medium" ? "bg-amber-100" : "bg-blue-100"}
                `}
                >
                  <Zap
                    className={`h-5 w-5 
                    ${rec.priority === "high" ? "text-red-600" : rec.priority === "medium" ? "text-amber-600" : "text-blue-600"}
                  `}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge
                      variant="outline"
                      className={`
                      ${
                        rec.priority === "high"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : rec.priority === "medium"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    `}
                    >
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All AI Recommendations
          </Button>
        </CardFooter>
      </Card>

      {/* Keyword Rankings & Backlinks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Keyword Rankings</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Top 5 Keywords
              </Badge>
            </div>
            <CardDescription>Your top performing keywords in search engines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywordRankings.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {keyword.position}
                    </div>
                    <div>
                      <p className="font-medium">{keyword.keyword}</p>
                      <p className="text-xs text-slate-500">Position {keyword.position}</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center ${
                      keyword.change > 0 ? "text-emerald-600" : keyword.change < 0 ? "text-red-600" : "text-slate-600"
                    }`}
                  >
                    {keyword.change > 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : keyword.change < 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-180" />
                    ) : (
                      <span className="w-4 h-4 mr-1">-</span>
                    )}
                    <span>{Math.abs(keyword.change)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Keywords
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Backlinks</CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                New Links
              </Badge>
            </div>
            <CardDescription>Latest backlinks pointing to your website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backlinks.map((backlink, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                      <LinkIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{backlink.domain}</p>
                      <p className="text-xs text-slate-500">DA: {backlink.authority}</p>
                    </div>
                  </div>
                  {backlink.status === "active" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Backlinks
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>Latest updates and changes to your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-emerald-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">New backlink detected</p>
                <p className="text-sm text-slate-600">A new backlink from example.com was detected by our crawler</p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Keyword position improved</p>
                <p className="text-sm text-slate-600">"SEO tools" keyword improved from position 8 to position 5</p>
                <p className="text-xs text-slate-500 mt-1">Yesterday</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-amber-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Page speed issue detected</p>
                <p className="text-sm text-slate-600">Your homepage has a slow loading time on mobile devices</p>
                <p className="text-xs text-slate-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
