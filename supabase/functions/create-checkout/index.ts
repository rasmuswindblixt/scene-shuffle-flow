import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key found", { keyPrefix: stripeKey.substring(0, 10) });

    // Create a Supabase client using the anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("ERROR: Authentication failed", { error: authError.message });
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe client initialized");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    logStep("Customer lookup completed", { found: customers.data.length > 0 });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Get origin from request headers, with smart fallback for different environments
    const origin = req.headers.get("origin") || 
                   req.headers.get("referer")?.split('/').slice(0, 3).join('/') ||
                   (Deno.env.get("VERCEL_URL") ? `https://${Deno.env.get("VERCEL_URL")}` : "https://clipmixpro.com");
    
    logStep("Origin detection", { 
      origin: origin,
      headerOrigin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      vercelUrl: Deno.env.get("VERCEL_URL")
    });
    
    // Parse plan from request body (defaults to 'monthly' for backwards compatibility)
    let plan = 'monthly';
    try {
      const body = await req.json();
      if (body?.plan === 'yearly' || body?.plan === 'monthly') {
        plan = body.plan;
      }
    } catch {
      // No body or invalid JSON — use default
    }

    const pricing = plan === 'yearly'
      ? { unit_amount: 9500, interval: 'year' as const, name: 'ClipMixPRO Premium (Yearly)' }
      : { unit_amount: 1295, interval: 'month' as const, name: 'ClipMixPRO Premium (Monthly)' };

    logStep("Creating checkout session", { origin, plan, pricing });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: pricing.name },
            unit_amount: pricing.unit_amount,
            recurring: { interval: pricing.interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${origin}/onboarding?step=12`,
      cancel_url: `${origin}/onboarding?step=11`,
    });

    logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check function logs for more information" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});