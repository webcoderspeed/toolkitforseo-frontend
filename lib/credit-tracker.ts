import { db } from './db';
import { auth } from '@clerk/nextjs/server';
import { getToolCreditCost, getToolCategory, isValidTool } from '@/constants/credit-usage';

export interface CreditCheckResult {
  allowed: boolean;
  remainingCredits: number;
  message: string;
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

    // Get user's current credit balance
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        credits: true
      }
    });

    if (!user) {
      return {
        allowed: false,
        remainingCredits: 0,
        message: 'User not found'
      };
    }

    const remainingCredits = user.credits;

    if (remainingCredits < actualCreditsRequired) {
      return {
        allowed: false,
        remainingCredits,
        message: `Insufficient credits. You have ${remainingCredits} credits remaining, but need ${actualCreditsRequired} for ${toolName}`
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
      select: {
        id: true,
        credits: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has enough credits
    if (user.credits < actualCreditsUsed) {
      throw new Error('Insufficient credits');
    }

    // Use transaction to ensure atomicity
    await db.$transaction(async (tx) => {
      // Deduct credits from user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: actualCreditsUsed
          }
        }
      });

      // Record tool usage
      await tx.toolUsage.create({
        data: {
          userId: user.id,
          toolName,
          toolCategory: actualCategory,
          creditsUsed: actualCreditsUsed,
          success
        }
      });
    });

  } catch (error) {
    console.error('Usage recording error:', error);
    throw error;
  }
}



/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        credits: true
      }
    });

    if (!user) {
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

    const totalUsedThisMonth = monthlyUsage.reduce((total, item) => {
      return total + (item._sum.creditsUsed || 0);
    }, 0);
    
    return {
      currentCredits: user.credits,
      monthlyUsage: totalUsedThisMonth,
      usage: monthlyUsage.reduce((acc, item) => {
        acc[item.toolName] = item._sum.creditsUsed || 0;
        return acc;
      }, {} as Record<string, number>)
    };

  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
}