import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { CREDIT_PACKAGES } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageType } = await request.json();

    if (!packageType || !CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]) {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
    }

    const creditPackage = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(creditPackage.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        packageType,
        credits: creditPackage.credits.toString(),
        type: 'credit_purchase'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: creditPackage.price,
      credits: creditPackage.credits,
      packageName: creditPackage.name
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}