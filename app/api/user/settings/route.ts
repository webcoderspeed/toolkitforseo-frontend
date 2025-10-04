import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Simple encryption for API keys (in production, use a proper encryption service)
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.API_KEY_ENCRYPTION_SECRET || 'default-key-change-in-production').digest()

function encrypt(text: string): string {
  if (!text) return ''
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText: string): string {
  if (!encryptedText) return ''
  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 2) return ''
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Error decrypting API key:', error)
    return ''
  }
}

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

    // Get current month's credit usage
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const monthlyUsage = await db.toolUsage.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentMonth,
          lt: nextMonth
        }
      },
      _sum: {
        creditsUsed: true
      }
    })

    // Calculate total credit purchases this month
    const monthlyPurchases = await db.creditPurchase.aggregate({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        createdAt: {
          gte: currentMonth,
          lt: nextMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    const creditsUsedThisMonth = monthlyUsage._sum.creditsUsed || 0
    const currentBalance = monthlyPurchases._sum.amount || 0

    // Get payment method info from Stripe if user has a subscription
    let paymentMethod = null
    if (user.subscription && user.stripeCustomerId) {
      try {
        const { STRIPE_SECRET_KEY } = await import('@/constants')
        const stripe = require('stripe')(STRIPE_SECRET_KEY)
        const customer = await stripe.customers.retrieve(user.stripeCustomerId, {
          expand: ['invoice_settings.default_payment_method']
        })
        
        if (customer.invoice_settings?.default_payment_method) {
          const pm = customer.invoice_settings.default_payment_method
          paymentMethod = {
            last4: pm.card?.last4,
            brand: pm.card?.brand,
            expMonth: pm.card?.exp_month,
            expYear: pm.card?.exp_year
          }
        }
      } catch (error) {
        console.error('Error fetching payment method:', error)
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        creditsUsedThisMonth,
        currentBalance: Number(currentBalance),
        paymentMethod,
        subscription: user.subscription ? {
          id: user.subscription.id,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          plan: user.subscription.plan
        } : null,
        preferences: user.userPreferences || {
          emailNotifications: true,
          defaultAiVendor: 'gemini'
        },
        apiKeys: user.userPreferences?.apiKeys ? {
          openai: decrypt((user.userPreferences.apiKeys as any)?.openai || ''),
          gemini: decrypt((user.userPreferences.apiKeys as any)?.gemini || ''),
          anthropic: decrypt((user.userPreferences.apiKeys as any)?.anthropic || '')
        } : {
          openai: '',
          gemini: '',
          anthropic: ''
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

    // Prepare update data
    const updateData: any = {}
    const createData: any = { userId: user.id }

    // Update user preferences
    if (preferences) {
      updateData.emailNotifications = preferences.emailNotifications
      updateData.defaultAiVendor = preferences.defaultAiVendor || 'gemini'
      createData.emailNotifications = preferences.emailNotifications
      createData.defaultAiVendor = preferences.defaultAiVendor || 'gemini'
    }

    // Handle API keys with encryption
    if (apiKeys) {
      const encryptedApiKeys = {
        openai: apiKeys.openai ? encrypt(apiKeys.openai) : '',
        gemini: apiKeys.gemini ? encrypt(apiKeys.gemini) : '',
        anthropic: apiKeys.anthropic ? encrypt(apiKeys.anthropic) : ''
      }
      updateData.apiKeys = encryptedApiKeys
      createData.apiKeys = encryptedApiKeys
    }

    // Only update if there's data to update
    if (Object.keys(updateData).length > 0) {
      await db.userPreferences.upsert({
        where: { userId: user.id },
        update: updateData,
        create: createData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}