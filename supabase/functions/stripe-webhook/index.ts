import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeSecret || !webhookSecret) {
    return new Response("Missing Stripe secrets", { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  let event;
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      logStep("Missing stripe-signature header");
      return new Response("Missing stripe-signature header", { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    const body = await req.text();
    logStep("Webhook received", { signature: sig.substring(0, 20) + "..." });
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    logStep("Webhook signature verified", { eventType: event.type });
  } catch (err) {
    logStep("Webhook signature verification failed", { error: err.message });
    return new Response(`Webhook Error: ${err.message}`, { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  try {
    logStep("Processing webhook event", { type: event.type, id: event.id });
    
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const cancelAtPeriodEnd = subscription.cancel_at_period_end;
      const status = cancelAtPeriodEnd ? "Cancelled" : "Active";
      const subscribed = status === "Active"; // Add this line
      logStep("Subscription event", { customerId, status, subscribed });

      // Find user by stripe_customer_id
      const { data: subscriber, error } = await supabase
        .from("subscribers")
        .select("email")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      
      if (error) {
        logStep("Database error when finding subscriber", { customerId, error: error.message });
        return new Response("Database error", { 
          status: 500, 
          headers: corsHeaders 
        });
      }
      
      if (!subscriber) {
        // Fallback: look up by email via Stripe customer object
        logStep("No subscriber found by stripe_customer_id, falling back to email lookup", { customerId });
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        const customerEmail = (stripeCustomer as any).email as string | null;

        if (!customerEmail) {
          logStep("Stripe customer has no email, cannot resolve subscriber", { customerId });
          return new Response("Customer email not found", { status: 200, headers: corsHeaders });
        }

        // Look up auth user to get user_id
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          logStep("Error listing auth users", { error: authError.message });
          return new Response("Auth lookup error", { status: 500, headers: corsHeaders });
        }
        const authUser = authUsers.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
        if (!authUser) {
          logStep("No auth user found for email", { customerEmail });
          return new Response("Auth user not found", { status: 200, headers: corsHeaders });
        }

        const { error: upsertError } = await supabase
          .from("subscribers")
          .upsert({
            user_id: authUser.id,
            email: customerEmail,
            stripe_customer_id: customerId,
            subscription_status: status,
            subscribed: subscribed,
            subscription_tier: subscribed ? "premium" : "free",
            active_trial: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

        if (upsertError) {
          logStep("Database error when upserting subscriber via email fallback", { customerEmail, error: upsertError.message });
          return new Response("Database upsert error", { status: 500, headers: corsHeaders });
        }

        logStep("Upserted subscriber via email fallback", { customerEmail, status, subscribed });
        return new Response("ok", { status: 200, headers: corsHeaders });
      }

      const { error: updateError } = await supabase
        .from("subscribers")
        .update({
          stripe_customer_id: customerId,
          subscription_status: status,
          subscribed: subscribed,
          subscription_tier: subscribed ? "premium" : "free",
          active_trial: false,
          updated_at: new Date().toISOString()
        })
        .eq("stripe_customer_id", customerId);

      if (updateError) {
        logStep("Database error when updating subscriber", { customerId, error: updateError.message });
        return new Response("Database update error", {
          status: 500,
          headers: corsHeaders
        });
      }

      logStep("Updated subscription_status and subscribed", { email: subscriber.email, status, subscribed });
    }
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      logStep("Subscription deleted", { customerId });
      
      const { error: deleteError } = await supabase
        .from("subscribers")
        .update({ 
          subscription_status: "Cancelled",
          subscribed: false,
          updated_at: new Date().toISOString()
        })
        .eq("stripe_customer_id", customerId);
        
      if (deleteError) {
        logStep("Database error when cancelling subscription", { customerId, error: deleteError.message });
        return new Response("Database update error", { 
          status: 500, 
          headers: corsHeaders 
        });
      }
      
      logStep("Subscription cancelled successfully", { customerId });
    }
    
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      logStep("Payment failed for customer", { customerId, invoiceId: invoice.id });
      
      // Optionally handle payment failures - you could send notifications, etc.
      // For now, just log it
      logStep("Payment failure logged", { customerId });
    }
    
    return new Response("ok", { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (err) {
    logStep("Error handling event", { error: err.message });
    return new Response(`Webhook handler error: ${err.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}); 