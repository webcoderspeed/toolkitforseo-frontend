import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        toolUsages: {
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        creditPurchases: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate stats
    const currentDate = new Date()
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Tool usage stats
    const totalToolUsages = user.toolUsages.length
    const recentToolUsages = user.toolUsages.filter(usage => 
      new Date(usage.createdAt) >= thirtyDaysAgo
    ).length

    const weeklyToolUsages = user.toolUsages.filter(usage => 
      new Date(usage.createdAt) >= sevenDaysAgo
    ).length

    // Credit stats
    const totalCreditsPurchased = user.creditPurchases.reduce((sum, purchase) => 
      sum + purchase.credits, 0
    )
    
    const totalCreditsUsed = user.toolUsages.reduce((sum, usage) => 
      sum + usage.creditsUsed, 0
    )

    // Monthly usage
    const monthlyUsage = user.toolUsages.filter(usage => {
      const usageDate = new Date(usage.createdAt)
      return usageDate.getMonth() === currentDate.getMonth() && 
             usageDate.getFullYear() === currentDate.getFullYear()
    }).reduce((sum, usage) => sum + usage.creditsUsed, 0)

    // Tool usage breakdown
    const toolUsageBreakdown = user.toolUsages.reduce((acc, usage) => {
      const toolName = usage.toolName
      if (!acc[toolName]) {
        acc[toolName] = { count: 0, credits: 0 }
      }
      acc[toolName].count += 1
      acc[toolName].credits += usage.creditsUsed
      return acc
    }, {} as Record<string, { count: number; credits: number }>)

    // Most used tools (top 5)
    const mostUsedTools = Object.entries(toolUsageBreakdown)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5)
      .map(([tool, stats]) => ({
        tool,
        usageCount: stats.count,
        creditsUsed: stats.credits
      }))

    // Recent activity (last 10 tool usages)
    const recentActivity = user.toolUsages.slice(0, 10).map(usage => ({
      id: usage.id,
      toolName: usage.toolName,
      creditsUsed: usage.creditsUsed,
      createdAt: usage.createdAt,
      status: 'completed'
    }))

    // Calculate growth metrics
    const previousMonthUsages = user.toolUsages.filter(usage => {
      const usageDate = new Date(usage.createdAt)
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      return usageDate >= previousMonth && usageDate < currentMonth
    }).length

    const currentMonthUsages = user.toolUsages.filter(usage => {
      const usageDate = new Date(usage.createdAt)
      return usageDate.getMonth() === currentDate.getMonth() && 
             usageDate.getFullYear() === currentDate.getFullYear()
    }).length

    const usageGrowth = previousMonthUsages > 0 
      ? Math.round(((currentMonthUsages - previousMonthUsages) / previousMonthUsages) * 100)
      : currentMonthUsages > 0 ? 100 : 0

    const dashboardStats = {
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        credits: user.credits,
        subscription: user.subscription ? {
          plan: user.subscription.plan.name,
          status: user.subscription.status,
          limits: user.subscription.plan.limits
        } : null
      },
      overview: {
        seoScore: Math.min(95, Math.max(65, 75 + Math.floor(totalToolUsages / 10))), // Dynamic SEO score based on usage
        keywordRankings: Math.min(50, Math.max(5, totalToolUsages * 2)), // Simulated keyword rankings
        backlinks: Math.min(500, Math.max(10, totalToolUsages * 5)), // Simulated backlinks
        organicTraffic: Math.min(10000, Math.max(100, totalToolUsages * 50)), // Simulated traffic
        usageGrowth
      },
      usage: {
        totalToolUsages,
        recentToolUsages,
        weeklyToolUsages,
        monthlyUsage,
        totalCreditsPurchased,
        totalCreditsUsed,
        mostUsedTools,
        recentActivity
      },
      trends: {
        dailyUsage: generateDailyUsageData(user.toolUsages),
        weeklyGrowth: calculateWeeklyGrowth(user.toolUsages),
        monthlyGrowth: usageGrowth
      }
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to generate daily usage data for the last 7 days
function generateDailyUsageData(toolUsages: any[]) {
  const dailyData = []
  const currentDate = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    
    const dayUsages = toolUsages.filter(usage => {
      const usageDate = new Date(usage.createdAt)
      return usageDate >= dayStart && usageDate < dayEnd
    })
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      usages: dayUsages.length,
      credits: dayUsages.reduce((sum, usage) => sum + usage.creditsUsed, 0)
    })
  }
  
  return dailyData
}

// Helper function to calculate weekly growth
function calculateWeeklyGrowth(toolUsages: any[]) {
  const currentDate = new Date()
  const thisWeekStart = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekStart = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  const thisWeekUsages = toolUsages.filter(usage => 
    new Date(usage.createdAt) >= thisWeekStart
  ).length
  
  const lastWeekUsages = toolUsages.filter(usage => {
    const usageDate = new Date(usage.createdAt)
    return usageDate >= lastWeekStart && usageDate < thisWeekStart
  }).length
  
  return lastWeekUsages > 0 
    ? Math.round(((thisWeekUsages - lastWeekUsages) / lastWeekUsages) * 100)
    : thisWeekUsages > 0 ? 100 : 0
}