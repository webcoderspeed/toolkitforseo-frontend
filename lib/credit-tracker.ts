import { db } from './db';
import { auth } from '@clerk/nextjs/server';
import { getToolCreditCost, getToolCategory, isValidTool } from '@/constants/credit-usage';

export interface CreditCheckResult {
  allowed: boolean;
  remainingCredits: number;
  message: string;
}

export interface ToolLimits {
  monthlyCredits: number;
  keywordResearch: number;
  backlinkChecker: number;
  sslChecker: number;
  pageSpeedTest: number;
  seoAnalysis: number;
  aiTools: number;
}

/**
 * Check if user has enough credits for a tool
 */
export async function checkCredits(
  toolName: string,
  creditsRequired?: number
): Promise<CreditCheckResult> {
  // Use centralized credit configuration
  const actualCreditsRequired = creditsRequired ?? getToolCreditCost(toolName);
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        allowed: false,
        remainingCredits: 0,
        message: 'Authentication required'
      };
    }

    // Get user's subscription
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user || !user.subscription) {
      return {
        allowed: false,
        remainingCredits: 0,
        message: 'No active subscription found'
      };
    }

    const limits = user.subscription.plan.limits as unknown as ToolLimits;
    const toolLimit = getToolLimit(toolName, limits);

    // -1 means unlimited
    if (toolLimit === -1) {
      return {
        allowed: true,
        remainingCredits: -1,
        message: 'Unlimited usage'
      };
    }

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentUsage = await db.toolUsage.aggregate({
      where: {
        userId: user.id,
        toolName,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        creditsUsed: true
      }
    });

    const usedCredits = currentUsage._sum.creditsUsed || 0;
    const remainingCredits = toolLimit - usedCredits;

    if (remainingCredits < actualCreditsRequired) {
      return {
        allowed: false,
        remainingCredits,
        message: `Insufficient credits. You have ${remainingCredits} credits remaining for ${toolName}`
      };
    }

    return {
      allowed: true,
      remainingCredits,
      message: 'Credits available'
    };

  } catch (error) {
    console.error('Credit check error:', error);
    return {
      allowed: false,
      remainingCredits: 0,
      message: 'Error checking credits'
    };
  }
}

/**
 * Record tool usage and deduct credits
 */
export async function recordUsage(
  toolName: string,
  toolCategory?: string,
  creditsUsed?: number,
  success: boolean = true
): Promise<void> {
  // Use centralized credit configuration
  const actualCategory = toolCategory ?? getToolCategory(toolName);
  const actualCreditsUsed = creditsUsed ?? getToolCreditCost(toolName);
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Record tool usage
    await db.toolUsage.create({
      data: {
        userId: user.id,
        toolName,
        toolCategory: actualCategory,
        creditsUsed: actualCreditsUsed,
        success
      }
    });

    // Record usage in subscription
    if (user.subscription) {
      await db.usageRecord.create({
        data: {
          subscriptionId: user.subscription.id,
          toolName,
          usageCount: actualCreditsUsed
        }
      });
    }

  } catch (error) {
    console.error('Usage recording error:', error);
    throw error;
  }
}

/**
 * Get tool-specific limit from subscription limits
 */
function getToolLimit(toolName: string, limits: ToolLimits): number {
  const toolLimitMap: Record<string, keyof ToolLimits> = {
    'keyword-research': 'keywordResearch',
    'backlink-checker': 'backlinkChecker',
    'ssl-checker': 'sslChecker',
    'page-speed-test': 'pageSpeedTest',
    'seo-analysis': 'seoAnalysis',
    'ai-content-detector': 'aiTools',
    'paraphrasing-tool': 'aiTools',
    'grammar-checker': 'aiTools',
    'text-summarizer': 'aiTools'
  };

  const limitKey = toolLimitMap[toolName];
  return limitKey ? limits[limitKey] : limits.monthlyCredits;
}

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    });

    if (!user || !user.subscription) {
      return null;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await db.toolUsage.groupBy({
      by: ['toolName'],
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        creditsUsed: true
      }
    });

    const limits = user.subscription.plan.limits as unknown as ToolLimits;
    
    return {
      plan: user.subscription.plan.name,
      limits,
      usage: monthlyUsage.reduce((acc, item) => {
        acc[item.toolName] = item._sum.creditsUsed || 0;
        return acc;
      }, {} as Record<string, number>)
    };

  } catch (error) {
    console.error('Usage stats error:', error);
    return null;
  }
}