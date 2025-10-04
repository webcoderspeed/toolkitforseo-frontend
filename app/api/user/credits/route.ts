import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserUsageStats } from '@/lib/credit-tracker'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usageStats = await getUserUsageStats(userId)

    if (!usageStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      currentCredits: usageStats.currentCredits,
      monthlyUsage: usageStats.monthlyUsage,
      usage: usageStats.usage
    })

  } catch (error) {
    console.error('Error fetching user credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user credits' },
      { status: 500 }
    )
  }
}