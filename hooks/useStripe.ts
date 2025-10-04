import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { STRIPE_PUBLISHABLE_KEY } from '@/constants';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export function useStripe() {
  const [loading, setLoading] = useState(false);

  const purchaseCredits = async (packageType: string) => {
    setLoading(true);
    try {
      // Create checkout session for credit purchase
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'credit_purchase', packageType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async (action: 'upgrade' | 'downgrade' | 'cancel', planType?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, planType }),
      });

      if (!response.ok) {
        throw new Error('Failed to manage subscription');
      }

      const result = await response.json();
      
      if (action === 'cancel') {
        toast.success('Subscription will be canceled at the end of the current period');
      } else if (action === 'downgrade') {
        toast.success(`Plan will be downgraded to ${result.newPlan} at the end of the current period`);
      } else {
        toast.success(`Plan upgraded to ${result.newPlan} successfully!`);
      }

      // Refresh the page or update state
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Subscription management error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to manage subscription');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    purchaseCredits,
    createSubscription,
    manageSubscription,
  };
}