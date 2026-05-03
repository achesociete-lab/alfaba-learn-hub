import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const PRICE_PLANS: Record<string, string> = {
  "price_1TLAA8KXotpKdlTPXckHIYZl": "essentiel",
  "price_1TLAAUKXotpKdlTP01ELN0ky": "premium",
};

const PLAN_AMOUNTS: Record<string, string> = {
  "essentiel": "9.99",
  "premium": "19.99",
};

async function sendTransactionalEmail(
  supabaseUrl: string,
  serviceKey: string,
  opts: {
    templateName: string;
    recipientEmail: string;
    templateData: Record<string, unknown>;
    idempotencyKey: string;
  }
) {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(opts),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`sendTransactionalEmail failed (${opts.templateName}): ${res.status} — ${body}`);
    } else {
      console.log(`✉️  Email queued: ${opts.templateName} → ${opts.recipientEmail}`);
    }
  } catch (err) {
    console.error(`sendTransactionalEmail exception (${opts.templateName}):`, err);
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_PLANS[priceId] ?? "essentiel";

        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
        const customerEmail = customer.email ?? "";
        const customerName = (customer.name ?? "").split(" ")[0] || customerEmail.split("@")[0];

        // Resolve user_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email" as any, customerEmail)
          .maybeSingle();

        let userId = profile?.user_id;
        if (!userId) {
          const { data: authData } = await supabase.auth.admin.listUsers();
          const found = authData?.users?.find((u) => u.email === customerEmail);
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

        // Send payment confirmation email
        if (customerEmail) {
          // Fetch invoice URL if available
          let invoiceUrl: string | undefined;
          if (session.invoice) {
            try {
              const invoice = await stripe.invoices.retrieve(session.invoice as string);
              invoiceUrl = invoice.hosted_invoice_url ?? undefined;
            } catch {
              // non-blocking
            }
          }

          await sendTransactionalEmail(supabaseUrl, serviceKey, {
            templateName: "payment-confirmation",
            recipientEmail: customerEmail,
            idempotencyKey: `payment-${session.id}`,
            templateData: {
              userName: customerName,
              userEmail: customerEmail,
              planName: plan,
              amount: PLAN_AMOUNTS[plan] ?? "9.99",
              currency: "EUR",
              periodEnd: formatDate(subscription.current_period_end),
              invoiceUrl,
              subscriptionId: subscription.id,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
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
