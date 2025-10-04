import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '@/constants'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
})

const endpointSecret = STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);

  if (session.mode === 'payment') {
    // Handle one-time credit purchase
    await handleCreditPurchaseCompleted(session);
  }
}

async function handleCreditPurchaseCompleted(session: Stripe.Checkout.Session) {
  const { userId, credits } = session.metadata || {};

  if (!userId || !credits) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  try {
    // Update credit purchase record
    await db.creditPurchase.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'COMPLETED' }
    });

    // Add credits to user account
    await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: parseInt(credits)
        }
      }
    });

    console.log(`Added ${credits} credits to user ${userId}`);

  } catch (error) {
    console.error('Error processing credit purchase:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if ('deleted' in customer) return;

    const userId = customer.metadata?.userId;
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }

    // Update subscription status
    await db.subscription.updateMany({
      where: { userId },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 
                subscription.status === 'canceled' ? 'CANCELED' : 'ACTIVE',
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      }
    });

    console.log(`Updated subscription for user ${userId}`);

  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);

  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if ('deleted' in customer) return;

    const userId = customer.metadata?.userId;
    if (!userId) return;

    await db.subscription.updateMany({
      where: { userId },
      data: {
        status: 'CANCELED',
        updatedAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}