import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, packageType, planType } = await req.json();

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || undefined,
        metadata: {
          userId: user.id,
          clerkId: userId,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    let sessionConfig: any = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
    };

    if (type === 'credit_purchase') {
      // Handle credit purchase
      const packageKeys = Object.keys(CREDIT_PACKAGES) as Array<keyof typeof CREDIT_PACKAGES>;
      const packageKey = packageKeys.find(key => 
        key.toLowerCase() === packageType.toLowerCase()
      );

      if (!packageKey) {
        return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
      }

      const creditPackage = CREDIT_PACKAGES[packageKey];

      sessionConfig = {
        ...sessionConfig,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${creditPackage.credits} Credits`,
                description: `${packageKey} credit package`,
              },
              unit_amount: creditPackage.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          packageType: packageKey,
          credits: creditPackage.credits.toString(),
          type: 'credit_purchase',
        },
      };
    } else if (type === 'subscription') {
      // Handle subscription
      const planKeys = Object.keys(SUBSCRIPTION_PLANS) as Array<keyof typeof SUBSCRIPTION_PLANS>;
      const planKey = planKeys.find(key => 
        SUBSCRIPTION_PLANS[key].name.toLowerCase().includes(planType.toLowerCase())
      );

      if (!planKey) {
        return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
      }

      const plan = SUBSCRIPTION_PLANS[planKey];

      sessionConfig = {
        ...sessionConfig,
        mode: 'subscription',
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          planType: plan.name,
        },
      };
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}