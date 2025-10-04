import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PLAN_PRICE_ID!,
    price: 9.99,
    credits: 1000,
    features: [
      '1,000 credits per month',
      'All SEO tools access',
      'Email support',
      'Basic analytics'
    ]
  },
  PRO: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PLAN_PRICE_ID!,
    price: 19.99,
    credits: 5000,
    features: [
      '5,000 credits per month',
      'All SEO tools access',
      'Priority email support',
      'Advanced analytics',
      'API access'
    ]
  },
  PREMIUM: {
    name: 'Premium Plan',
    priceId: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID!,
    price: 49.99,
    credits: 15000,
    features: [
      '15,000 credits per month',
      'All SEO tools access',
      '24/7 priority support',
      'Advanced analytics',
      'Full API access',
      'White-label options'
    ]
  }
} as const;

// One-time Credit Packages
export const CREDIT_PACKAGES = {
  SMALL: {
    name: '100 Credits',
    priceId: process.env.STRIPE_CREDITS_100_PRICE_ID!,
    price: 4.99,
    credits: 100
  },
  MEDIUM: {
    name: '500 Credits',
    priceId: process.env.STRIPE_CREDITS_500_PRICE_ID!,
    price: 19.99,
    credits: 500
  },
  LARGE: {
    name: '1,000 Credits',
    priceId: process.env.STRIPE_CREDITS_1000_PRICE_ID!,
    price: 34.99,
    credits: 1000
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
export type CreditPackage = keyof typeof CREDIT_PACKAGES;