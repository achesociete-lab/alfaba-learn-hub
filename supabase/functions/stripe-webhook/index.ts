import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown"}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;

        // Map price_id → plan name
        const PRICE_PLANS: Record<string, string> = {
          "price_1TLAA8KXotpKdlTPXckHIYZl": "essentiel",
          "price_1TLAAUKXotpKdlTP01ELN0ky": "premium",
        };
        const plan = PRICE_PLANS[priceId] ?? "essentiel";

        // Get user_id from customer email
        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email" as any, customer.email)
          .maybeSingle();

        // Also try via auth.users
        let userId = profile?.user_id;
        if (!userId) {
          const { data: authUser } = await supabase.auth.admin.listUsers();
          const found = authUser?.users?.find((u) => u.email === customer.email);
          userId = found?.id;
        }

        if (userId) {
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            plan,
            status: "active",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          console.log(`✅ Subscription activated for user ${userId} — plan: ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;

        const PRICE_PLANS: Record<string, string> = {
          "price_1TLAA8KXotpKdlTPXckHIYZl": "essentiel",
          "price_1TLAAUKXotpKdlTP01ELN0ky": "premium",
        };
        const plan = PRICE_PLANS[priceId] ?? "essentiel";

        await supabase
          .from("subscriptions")
          .update({
            plan,
            status: subscription.status === "active" ? "active" : subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`✅ Subscription updated: ${subscription.id} — status: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`✅ Subscription canceled: ${subscription.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", invoice.customer as string);

        console.log(`⚠️ Payment failed for customer: ${invoice.customer}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(`Server Error: ${err instanceof Error ? err.message : "Unknown"}`, { status: 500 });
  }
});
