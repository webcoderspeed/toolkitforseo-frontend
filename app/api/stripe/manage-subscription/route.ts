import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, planType } = await req.json();

    // Get user with subscription
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscription;

    switch (action) {
      case 'cancel':
        if (!subscription?.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }

        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });

        // Update database
        await db.subscription.update({
          where: { id: subscription.id },
          data: { 
            cancelAtPeriodEnd: true,
            canceledAt: new Date()
          }
        });

        return NextResponse.json({ 
          message: 'Subscription will be canceled at the end of the current period',
          cancelAtPeriodEnd: true
        });

      case 'upgrade':
      case 'downgrade':
        if (!subscription?.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }

        // Get the new plan price ID from your SUBSCRIPTION_PLANS
        const { SUBSCRIPTION_PLANS } = await import('@/lib/stripe');
        const planKeys = Object.keys(SUBSCRIPTION_PLANS) as Array<keyof typeof SUBSCRIPTION_PLANS>;
        const newPlanKey = planKeys.find(key => 
          SUBSCRIPTION_PLANS[key].name.toLowerCase().includes(planType.toLowerCase())
        );
        
        if (!newPlanKey) {
          return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        const newPlan = SUBSCRIPTION_PLANS[newPlanKey];

        // Update subscription in Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: newPlan.priceId,
          }],
          proration_behavior: action === 'upgrade' ? 'create_prorations' : 'none'
        });

        // For downgrades, we need to find or create the subscription plan in the database
        let subscriptionPlan = await db.subscriptionPlan.findFirst({
          where: { name: newPlan.name }
        });

        if (!subscriptionPlan) {
          // Create the plan if it doesn't exist
          subscriptionPlan = await db.subscriptionPlan.create({
            data: {
              name: newPlan.name,
              description: `${newPlan.name} plan`,
              price: newPlan.price,
              stripePriceId: newPlan.priceId,
              features: newPlan.features,
              limits: { credits: newPlan.credits }
            }
          });
        }

        // Update database
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            planId: subscriptionPlan.id,
            stripePriceId: newPlan.priceId,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({ 
          message: `Subscription ${action}d successfully`,
          newPlan: newPlan.name,
          effectiveDate: action === 'downgrade' ? subscription.currentPeriodEnd : new Date()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Subscription management error:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user subscription details
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return NextResponse.json({
        hasSubscription: false,
        plan: 'FREE',
        status: 'inactive'
      });
    }

    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    return NextResponse.json({
      hasSubscription: true,
      plan: user.subscription.plan,
      status: stripeSubscription.status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      scheduledPlanChange: user.subscription.scheduledPlanChange,
      scheduledChangeDate: user.subscription.scheduledChangeDate
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}