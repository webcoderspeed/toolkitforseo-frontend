import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '@/constants';

const webhookSecret = STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { userId, packageType, credits, type } = paymentIntent.metadata;
  
  if (type === 'credit_purchase' && userId && credits) {
    try {
      // Add credits to user account
      await db.user.update({
        where: { clerkId: userId },
        data: {
          credits: {
            increment: parseInt(credits)
          }
        }
      });

      // Record the credit purchase
      await db.creditPurchase.create({
        data: {
          userId: userId,
          amount: paymentIntent.amount / 100, // Convert from cents
          credits: parseInt(credits),
          stripePaymentIntentId: paymentIntent.id,
          status: 'COMPLETED'
        }
      });

      console.log(`Added ${credits} credits to user ${userId}`);
    } catch (error) {
      console.error('Error processing credit purchase:', error);
    }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { userId, planType } = session.metadata || {};
  
  if (userId && planType && session.subscription) {
    try {
      // Get the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      // Find or create the subscription plan
      const { SUBSCRIPTION_PLANS } = await import('@/lib/stripe');
      const planKeys = Object.keys(SUBSCRIPTION_PLANS) as Array<keyof typeof SUBSCRIPTION_PLANS>;
      const planKey = planKeys.find(key => 
        SUBSCRIPTION_PLANS[key].name.toLowerCase().includes(planType.toLowerCase())
      );
      
      if (planKey) {
        const plan = SUBSCRIPTION_PLANS[planKey];
        
        let subscriptionPlan = await db.subscriptionPlan.findFirst({
          where: { name: plan.name }
        });

        if (!subscriptionPlan) {
          subscriptionPlan = await db.subscriptionPlan.create({
            data: {
              name: plan.name,
              description: `${plan.name} plan`,
              price: plan.price,
              stripePriceId: plan.priceId,
              features: plan.features,
              limits: { credits: plan.credits }
            }
          });
        }

        // Create or update user subscription
        await db.subscription.upsert({
          where: { userId: userId },
          update: {
            planId: subscriptionPlan.id,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: plan.priceId,
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: false,
            canceledAt: null
          },
          create: {
            userId: userId,
            planId: subscriptionPlan.id,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: plan.priceId,
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
          }
        });

        console.log(`Created/updated subscription for user ${userId} with plan ${plan.name}`);
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if ((invoice as any).subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
      
      // Update subscription period in database
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          status: 'ACTIVE'
        }
      });

      console.log(`Updated subscription period for subscription ${subscription.id}`);
    } catch (error) {
      console.error('Error updating subscription period:', error);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 
               subscription.status === 'canceled' ? 'CANCELED' : 
               subscription.status === 'past_due' ? 'PAST_DUE' : 'ACTIVE',
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
      }
    });

    console.log(`Updated subscription ${subscription.id} status to ${subscription.status}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date()
      }
    });

    console.log(`Canceled subscription ${subscription.id}`);
  } catch (error) {
    console.error('Error canceling subscription:', error);
  }
}