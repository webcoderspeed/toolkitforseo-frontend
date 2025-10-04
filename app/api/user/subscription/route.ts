import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      subscription: user.subscription ? {
        id: user.subscription.id,
        planId: user.subscription.planId,
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        plan: {
          id: user.subscription.plan.id,
          name: user.subscription.plan.name,
          price: Number(user.subscription.plan.price),
          interval: user.subscription.plan.interval,
          features: user.subscription.plan.features as string[]
        }
      } : null,
      credits: user.credits
    });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}