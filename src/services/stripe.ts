import Stripe from '@stripe/stripe-js';

let stripePromise: Promise<Stripe.Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) throw new Error('VITE_STRIPE_PUBLISHABLE_KEY not configured');
    stripePromise = Stripe.loadStripe(key);
  }
  return stripePromise;
};

export async function createCheckoutSession(planId: string, userId: string, email: string): Promise<string> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, userId, email }),
  });
  const { sessionId } = await response.json();
  return sessionId;
}

export async function createPortalSession(stripeCustomerId: string): Promise<string> {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stripeCustomerId }),
  });
  const { url } = await response.json();
  return url;
}
