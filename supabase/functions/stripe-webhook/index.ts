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
        logStep("No subscriber found for customer", { customerId });
        return new Response("No subscriber found", { 
          status: 200, 
          headers: corsHeaders 
        });
      }

      const { error: updateError } = await supabase
        .from("subscribers")
        .update({ 
          subscription_status: status,
          subscribed: subscribed,
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