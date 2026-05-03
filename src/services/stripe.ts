// Stripe.js client stub — @stripe/stripe-js is not installed.
// Checkout and portal flows go through Supabase Edge Functions
// (`create-checkout`, `customer-portal`), so the browser SDK is not required.

export async function createCheckoutSession(
  _planId: string,
  _userId: string,
  _email: string,
): Promise<string> {
  throw new Error("createCheckoutSession is not implemented — use the create-checkout edge function instead.");
}

export async function createPortalSession(_stripeCustomerId: string): Promise<string> {
  throw new Error("createPortalSession is not implemented — use the customer-portal edge function instead.");
}
