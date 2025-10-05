import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '@/constants'
import { sendCreditPurchaseConfirmationEmail } from '@/app/actions'
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
  let event: Stripe.Event;

  try {
    // Get the raw body and signature
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    // Development mode bypass for signature validation
    if (process.env.NODE_ENV === 'development' && !endpointSecret) {
      console.log('🔧 Development mode: Bypassing signature validation');
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('❌ Invalid JSON payload:', err);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
    } else {
      // Production signature validation
      if (!signature) {
        console.error('❌ No signature provided');
        return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
      }

      if (!endpointSecret) {
        console.error('❌ Webhook endpoint secret not configured');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
      }

      try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    console.log('🔔 Received webhook event:', event.type, 'ID:', event.id);

    // Handle the event based on type
    try {
      await handleWebhookEvent(event);
    } catch (error) {
      console.error('❌ Error handling webhook event:', error);
      // Return 200 to acknowledge receipt but log the error
      // This prevents Stripe from retrying the webhook
      return NextResponse.json({ 
        received: true, 
        error: 'Event processing failed but acknowledged' 
      }, { status: 200 });
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('💳 Processing checkout session completed');
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.created':
      console.log('👤 Processing customer created');
      await handleCustomerCreated(event.data.object as Stripe.Customer);
      break;

    case 'payment_intent.succeeded':
      console.log('✅ Processing payment intent succeeded');
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      console.log('❌ Processing payment intent failed');
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
      // Don't throw an error for unhandled events
      break;
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);

  try {
    if (session.mode === 'payment') {
      // Handle one-time credit purchase
      await handleCreditPurchaseCompleted(session);
    } else if (session.mode === 'subscription') {
      // Handle subscription creation
      console.log('🔄 Subscription checkout completed, will be handled by subscription.created event');
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

async function handleCreditPurchaseCompleted(session: Stripe.Checkout.Session) {
  console.log('💰 Processing credit purchase for session:', session.id);
  const { userId, credits, clerkId, creditPurchaseId } = session.metadata || {};

  console.log('📋 Session metadata:', { userId, credits, clerkId, creditPurchaseId, sessionId: session.id });

  if (!userId || !credits) {
    console.error('❌ Missing metadata in checkout session:', session.id);
    throw new Error(`Missing required metadata: userId=${userId}, credits=${credits}`);
  }

  try {
    console.log('🔄 Updating credit purchase record...');
    // Update credit purchase record - try by ID first, then by session ID
    let updatedPurchase;
    if (creditPurchaseId) {
      updatedPurchase = await db.creditPurchase.update({
        where: { id: creditPurchaseId },
        data: { 
          status: 'COMPLETED',
          stripeSessionId: session.id 
        }
      });
      console.log('📝 Updated purchase record by ID:', updatedPurchase.id);
    } else {
      // Fallback to session ID lookup
      updatedPurchase = await db.creditPurchase.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'COMPLETED' }
      });
      console.log('📝 Updated purchase records by session ID:', updatedPurchase.count);
    }

    console.log('➕ Adding credits to user account...');
    
    // First, check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.error(`❌ User not found with ID: ${userId}`);
      
      // If we have clerkId, try to find user by clerkId
      if (clerkId) {
        console.log(`🔍 Attempting to find user by Clerk ID: ${clerkId}`);
        const userByClerkId = await db.user.findUnique({
          where: { clerkId: clerkId }
        });
        
        if (userByClerkId) {
          console.log(`✅ Found user by Clerk ID: ${userByClerkId.id}`);
          // Update credits using the correct user ID
          const updatedUser = await db.user.update({
            where: { id: userByClerkId.id },
            data: {
              credits: {
                increment: parseInt(credits)
              }
            }
          });
          console.log(`✅ Successfully added ${credits} credits to user ${userByClerkId.id}. New balance: ${updatedUser.credits}`);
          return;
        }
      }
      
      throw new Error(`User not found: userId=${userId}, clerkId=${clerkId}`);
    }

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

    // Send confirmation email
    try {
      console.log('📧 Sending credit purchase confirmation email...');
      
      // Get the credit purchase record for email details
      let creditPurchase;
      if (creditPurchaseId) {
        creditPurchase = await db.creditPurchase.findUnique({
          where: { id: creditPurchaseId },
          include: { user: true }
        });
      } else {
        creditPurchase = await db.creditPurchase.findFirst({
          where: { stripeSessionId: session.id },
          include: { user: true }
        });
      }

      if (creditPurchase && creditPurchase.user) {
        const userName = creditPurchase.user.firstName && creditPurchase.user.lastName 
          ? `${creditPurchase.user.firstName} ${creditPurchase.user.lastName}`
          : creditPurchase.user.firstName || creditPurchase.user.email.split('@')[0];

        await sendCreditPurchaseConfirmationEmail({
          email: creditPurchase.user.email,
          userName: userName,
          credits: creditPurchase.credits,
          amount: parseFloat(creditPurchase.amount.toString()),
          currency: creditPurchase.currency,
          transactionId: session.id,
          packageType: session.metadata?.packageType ?? 'Standard',
          purchaseDate: creditPurchase.createdAt
        });

        console.log('✅ Credit purchase confirmation email sent successfully');
      } else {
        console.log('⚠️ Could not find credit purchase record for email');
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
      // Don't throw error here as the main transaction was successful
    }

  } catch (error) {
    console.error('❌ Error processing credit purchase:', error);
    throw error;
  }
}



async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Processing customer created:', customer.id);
  
  try {
    const userId = customer.metadata?.userId;
    const clerkId = customer.metadata?.clerkId;
    
    if (!userId) {
      console.log('No userId in customer metadata, skipping database update');
      return;
    }

    // First, check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.error(`❌ User not found with ID: ${userId}`);
      
      // If we have clerkId, try to find user by clerkId
      if (clerkId) {
        console.log(`🔍 Attempting to find user by Clerk ID: ${clerkId}`);
        const userByClerkId = await db.user.findUnique({
          where: { clerkId: clerkId }
        });
        
        if (userByClerkId) {
          console.log(`✅ Found user by Clerk ID: ${userByClerkId.id}`);
          // Update user with Stripe customer ID using the correct user ID
          await db.user.update({
            where: { id: userByClerkId.id },
            data: { stripeCustomerId: customer.id }
          });
          console.log(`✅ Updated user ${userByClerkId.id} with Stripe customer ID ${customer.id}`);
          return;
        }
      }
      
      console.error(`User not found: userId=${userId}, clerkId=${clerkId}`);
      return; // Don't throw error for customer creation, just log it
    }

    // Update user record with Stripe customer ID
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });

    console.log(`✅ Updated user ${userId} with Stripe customer ID ${customer.id}`);

  } catch (error) {
    console.error('❌ Error processing customer created:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment intent succeeded:', paymentIntent.id);
  
  try {
    // Handle successful one-time payments that aren't part of checkout sessions
    if (paymentIntent.metadata?.userId && paymentIntent.metadata?.credits) {
      const { userId, credits, clerkId } = paymentIntent.metadata;
      
      // First, check if user exists
      const existingUser = await db.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        console.error(`❌ User not found with ID: ${userId}`);
        
        // If we have clerkId, try to find user by clerkId
        if (clerkId) {
          console.log(`🔍 Attempting to find user by Clerk ID: ${clerkId}`);
          const userByClerkId = await db.user.findUnique({
            where: { clerkId: clerkId }
          });
          
          if (userByClerkId) {
            console.log(`✅ Found user by Clerk ID: ${userByClerkId.id}`);
            // Update credits using the correct user ID
            await db.user.update({
              where: { id: userByClerkId.id },
              data: {
                credits: {
                  increment: parseInt(credits)
                }
              }
            });
            console.log(`✅ Added ${credits} credits to user ${userByClerkId.id} from payment intent`);
            return;
          }
        }
        
        throw new Error(`User not found: userId=${userId}, clerkId=${clerkId}`);
      }
      
      await db.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: parseInt(credits)
          }
        }
      });

      console.log(`✅ Added ${credits} credits to user ${userId} from payment intent`);
    }
  } catch (error) {
    console.error('❌ Error processing payment intent succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment intent failed:', paymentIntent.id);
  
  try {
    // Log failed payment for monitoring
    console.log(`⚠️ Payment failed: ${paymentIntent.id}, reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);
    
    // You might want to notify the user or update records
  } catch (error) {
    console.error('❌ Error processing payment intent failed:', error);
    throw error;
  }
}