import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cancelAtPeriodEnd = true } = await request.json();

    // Get user's subscription
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    });

    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subscription = user.subscription;

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Stripe subscription ID not found' }, { status: 400 });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
      }
    );

    // Update subscription in database
    const updatedSubscription = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be canceled at the end of the current period'
        : 'Subscription cancellation has been undone',
      subscription: {
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
      }
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}