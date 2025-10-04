import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get credit purchases
    const creditPurchases = await db.creditPurchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Get tool usages
    const toolUsages = await db.toolUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Get subscription
    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true }
    })

    // Format transactions
    const transactions: any[] = []

    // Add subscription transactions
    if (subscription) {
      transactions.push({
        id: `sub_${subscription.id}`,
        date: subscription.createdAt.toISOString().split('T')[0],
        type: 'subscription',
        description: `${subscription.plan.name} Plan Subscription`,
        amount: Number(subscription.plan.price),
        status: subscription.status.toLowerCase(),
        credits: 0
      })
    }

    // Add credit purchases
    creditPurchases.forEach((purchase: any) => {
      transactions.push({
        id: `cp_${purchase.id}`,
        date: purchase.createdAt.toISOString().split('T')[0],
        type: 'credit-purchase',
        description: `Credit Purchase - ${purchase.credits} Credits`,
        amount: Number(purchase.amount),
        status: purchase.status.toLowerCase(),
        credits: purchase.credits
      })
    })

    // Add tool usages
    toolUsages.forEach((usage: any) => {
      transactions.push({
        id: `tu_${usage.id}`,
        date: usage.createdAt.toISOString().split('T')[0],
        type: 'credit-usage',
        description: `${usage.toolCategory} - Tool Usage`,
        amount: 0,
        status: 'completed',
        credits: -usage.creditsUsed
      })
    })

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      transactions,
      totalTransactions: transactions.length
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}