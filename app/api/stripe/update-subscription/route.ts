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

    const { newPlanId } = await request.json();

    if (!newPlanId) {
      return NextResponse.json({ error: 'New plan ID is required' }, { status: 400 });
    }

    // Get user's current subscription
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

    // Get the new plan details
    const newPlan = await db.subscriptionPlan.findUnique({
      where: { id: newPlanId }
    });

    if (!newPlan || !newPlan.stripePriceId) {
      return NextResponse.json({ error: 'Invalid plan or missing Stripe price ID' }, { status: 400 });
    }

    // Get current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // Update subscription in Stripe
    const updatedStripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPlan.stripePriceId,
        }],
        proration_behavior: 'create_prorations',
      }
    );

    // Update subscription in database
    const updatedSubscription = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: newPlanId,
        stripePriceId: newPlan.stripePriceId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        id: updatedSubscription.id,
        planId: updatedSubscription.planId,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
      }
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}