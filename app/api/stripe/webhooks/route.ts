import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '@/constants'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
})

const endpointSecret = STRIPE_WEBHOOK_SECRET

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    }
  });
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
        }
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
        }
      });
    }

    console.log('🔔 Received webhook event:', event.type, 'ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout session completed');
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

    return NextResponse.json({ received: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      }
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
        }
      }
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
  console.log('💰 Processing credit purchase for session:', session.id);
  const { userId, credits } = session.metadata || {};

  console.log('📋 Session metadata:', { userId, credits, sessionId: session.id });

  if (!userId || !credits) {
    console.error('❌ Missing metadata in checkout session:', session.id);
    return;
  }

  try {
    console.log('🔄 Updating credit purchase record...');
    // Update credit purchase record
    const updatedPurchase = await db.creditPurchase.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'COMPLETED' }
    });

    console.log('📝 Updated purchase records:', updatedPurchase.count);

    console.log('➕ Adding credits to user account...');
    // Add credits to user account
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: parseInt(credits)
        }
      }
    });

    console.log(`✅ Successfully added ${credits} credits to user ${userId}. New balance: ${updatedUser.credits}`);

  } catch (error) {
    console.error('❌ Error processing credit purchase:', error);
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