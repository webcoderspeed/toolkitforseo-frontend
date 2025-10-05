"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  TrendingUp,
  Users,
  Search,
  Zap,
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
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/dashboard-stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        // Fallback to mock data if API fails
        setDashboardData({
          overview: {
            seoScore: 75,
            keywordRankings: 24,
            backlinks: 142,
            organicTraffic: 1250,
            usageGrowth: 15
          },
          usage: {
            totalToolUsages: 0,
            recentToolUsages: 0,
            weeklyToolUsages: 0,
            monthlyUsage: 0,
            mostUsedTools: [],
            recentActivity: []
          },
          user: {
            credits: 0,
            name: user?.firstName || 'User'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">


        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Tool Usage</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.usage?.totalToolUsages || 0}</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {dashboardData?.usage?.weeklyToolUsages || 0} this week
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
                <p className="text-sm font-medium text-slate-500">Credits Used</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.usage?.monthlyUsage || 0}</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  This month
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Available Credits</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.user?.credits || 0}</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {dashboardData?.overview?.usageGrowth || 0}% growth
                </p>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {dashboardData?.usage?.recentActivity?.length || 0} Activities
            </Badge>
          </div>
          <CardDescription>
            Your recent tool usage and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.usage?.recentActivity?.length > 0 ? (
              dashboardData.usage.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">{activity.toolName?.replaceAll(
                        '-',
                        ' '
                      )}</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {activity.creditsUsed} credits
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Used {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Zap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No recent activity found</p>
                <p className="text-sm">Start using our SEO tools to see your activity here</p>
              </div>
            )}
          </div>
        </CardContent>
        {dashboardData?.usage?.recentActivity?.length > 0 && (
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Most Used Tools & Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Most Used Tools</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Top {dashboardData?.usage?.mostUsedTools?.length || 0} Tools
              </Badge>
            </div>
            <CardDescription>Your most frequently used SEO tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.usage?.mostUsedTools?.length > 0 ? (
                dashboardData.usage.mostUsedTools.map((tool: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tool.tool?.replaceAll(
                          '-',
                          ' '
                        )}</p>
                        <p className="text-xs text-slate-500">{tool.usageCount} uses</p>
                      </div>
                    </div>
                    <div className="flex items-center text-emerald-600">
                      <Zap className="h-4 w-4 mr-1" />
                      <span>{tool.creditsUsed} credits</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No tools used yet</p>
                  <p className="text-sm">Start using our SEO tools to see statistics here</p>
                </div>
              )}
            </div>
          </CardContent>
          {dashboardData?.usage?.mostUsedTools?.length > 0 && (
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Tools
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usage Statistics</CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                This Month
              </Badge>
            </div>
            <CardDescription>Your tool usage and credit consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Total Tool Uses</p>
                    <p className="text-xs text-slate-500">All time</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                  {dashboardData?.usage?.totalToolUsages || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">This Week</p>
                    <p className="text-xs text-slate-500">Tool uses</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                  {dashboardData?.usage?.weeklyToolUsages || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Credits Used</p>
                    <p className="text-xs text-slate-500">This month</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">
                  {dashboardData?.usage?.monthlyUsage || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Detailed Stats
            </Button>
          </CardFooter>
        </Card>
      </div>


    </motion.div>
  )
}
