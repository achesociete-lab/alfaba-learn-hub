// Checkout and portal flows go through Supabase Edge Functions
// (`create-checkout`, `customer-portal`). @stripe/stripe-js is not needed in the browser.

import { supabase } from "@/integrations/supabase/client";

export async function createCheckoutSession(
  _planId: string,
  _userId: string,
  _email: string,
): Promise<string> {
  throw new Error("createCheckoutSession is not implemented — use the create-checkout edge function instead.");
}

export async function createPortalSession(_stripeCustomerId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("customer-portal");
  if (error) throw new Error(error.message);
  if (!data?.url) throw new Error("No portal URL returned from customer-portal function");
  return data.url as string;
}
