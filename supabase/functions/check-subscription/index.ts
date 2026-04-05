import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      // Update profile with no subscription status
      await supabaseClient.from("profiles").upsert({
        id: user.id,
        email: user.email,
        subscription_status: 'none',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_status: 'none'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get current profile data first (if needed for future use)
    const { data: currentProfile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    // Check for active AND recently cancelled subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all", // Check all statuses to see recent cancellations
      limit: 10,
    });
    
    let hasActiveSub = false;
    let subscriptionTier = "Premium"; // Default tier for active subscriptions
    let subscriptionEnd: string | null = null;
    let shouldUpdateSubscription = false;

    // Check for active subscriptions first
    const activeSubscriptions = subscriptions.data.filter(sub => sub.status === "active");
    if (activeSubscriptions.length > 0) {
      hasActiveSub = true;
      const subscription = activeSubscriptions[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionTier = "Premium";
      shouldUpdateSubscription = true;
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
    } else {
      // Check if there's a recently cancelled subscription that's still valid
      const recentSubscriptions = subscriptions.data.filter(sub => 
        sub.status === "canceled" && 
        new Date(sub.current_period_end * 1000) > new Date()
      );
      
      if (recentSubscriptions.length > 0) {
        // User still has access until period end
        hasActiveSub = true;
        const subscription = recentSubscriptions[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        subscriptionTier = "Premium";
        shouldUpdateSubscription = true;
        logStep("Cancelled subscription still valid", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      } else {
        // Check if we still have a valid subscription period in profiles
        if (currentProfile?.subscription_status === 'active') {
          // Keep existing subscription status (could be from database cache)
          hasActiveSub = true;
          subscriptionTier = "Premium";
          subscriptionEnd = null; // Will be updated if we find active subscription
          logStep("Using existing active subscription from profile");
        } else {
          // No active subscription found
          hasActiveSub = false;
          subscriptionTier = null;
          subscriptionEnd = null;
          shouldUpdateSubscription = true;
          logStep("No active subscription - setting to inactive");
        }
      }
    }

    // Update profiles table with subscription info
    await supabaseClient.from("profiles").upsert({
      id: user.id,
      email: user.email,
      subscription_status: hasActiveSub ? 'active' : 'none',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      subscription_status: hasActiveSub ? 'active' : 'none'
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: hasActiveSub ? subscriptionTier : null,
      subscription_end: subscriptionEnd,
      subscription_status: hasActiveSub ? 'active' : 'none',
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});