import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        userPreferences: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        subscription: user.subscription ? {
          id: user.subscription.id,
          status: user.subscription.status,
          plan: user.subscription.plan
        } : null,
        preferences: user.userPreferences || {
          emailNotifications: true,
          defaultAiVendor: 'gemini'
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { preferences, apiKeys } = body

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user preferences
    if (preferences) {
      await db.userPreferences.upsert({
        where: { userId: user.id },
        update: {
          emailNotifications: preferences.emailNotifications,
          defaultAiVendor: preferences.defaultAiVendor || 'gemini'
        },
        create: {
          userId: user.id,
          emailNotifications: preferences.emailNotifications,
          defaultAiVendor: preferences.defaultAiVendor || 'gemini'
        }
      })
    }

    // Note: API keys should be handled separately with proper encryption
    // This is a simplified implementation
    if (apiKeys) {
      // In a real implementation, you would encrypt these keys
      console.log('API keys update requested:', apiKeys)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}