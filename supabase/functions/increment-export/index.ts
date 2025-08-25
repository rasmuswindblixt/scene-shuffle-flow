import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('[INCREMENT-EXPORT] Request received:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('[INCREMENT-EXPORT] Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[INCREMENT-EXPORT] Starting function execution');

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    console.log('[INCREMENT-EXPORT] Auth header present:', !!authHeader);

    if (!authHeader) {
      console.log('[INCREMENT-EXPORT] No auth header provided');
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validate user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    console.log('[INCREMENT-EXPORT] User validation:', {
      hasUser: !!user,
      email: user?.email,
      error: userError?.message
    });

    if (userError || !user?.email) {
      console.log('[INCREMENT-EXPORT] User validation failed');
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log('[INCREMENT-EXPORT] User validated:', user.email);

    // Get user profile with trial information
    let { data: profile, error: selectError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    console.log('[INCREMENT-EXPORT] Profile query result:', {
      found: !!profile,
      error: selectError?.message
    });

    if (selectError) {
      console.log('[INCREMENT-EXPORT] Database error:', selectError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create profile if doesn't exist (shouldn't happen with proper auth flow)
    if (!profile) {
      console.log('[INCREMENT-EXPORT] Creating new profile');
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          export_count: 1,
          trial_status: 'active',
          trial_started_at: new Date().toISOString(),
          subscription_status: 'none'
        })
        .select()
        .single();

      if (insertError) {
        console.log('[INCREMENT-EXPORT] Insert error:', insertError);
        return new Response(JSON.stringify({ error: "Failed to create profile record" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log('[INCREMENT-EXPORT] New profile created');
      return new Response(JSON.stringify({
        success: true,
        export_count: 1,
        trial_status: 'active',
        subscription_status: 'none',
        remaining_exports: 2
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if user has active subscription
    const hasActiveSubscription = profile.subscription_status === 'active';
    
    // Check trial export limit (3 exports for free trial)
    const TRIAL_EXPORT_LIMIT = 3;
    if (!hasActiveSubscription && profile.export_count >= TRIAL_EXPORT_LIMIT && profile.trial_status !== 'converted') {
      console.log('[INCREMENT-EXPORT] Trial export limit reached');
      
      // Mark trial as expired
      await supabaseAdmin
        .from("profiles")
        .update({ trial_status: 'expired' })
        .eq("id", user.id);

      return new Response(JSON.stringify({
        error: "Free trial limit reached. Please subscribe to continue.",
        export_count: profile.export_count,
        trial_status: 'expired',
        subscription_status: profile.subscription_status,
        remaining_exports: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Increment export count (for both trial and paid users - for analytics)
    const newExportCount = profile.export_count + 1;
    let newTrialStatus = profile.trial_status;
    
    // Update trial status if this is the last free export
    if (!hasActiveSubscription && newExportCount >= TRIAL_EXPORT_LIMIT) {
      newTrialStatus = 'expired';
    }

    console.log('[INCREMENT-EXPORT] Incrementing export count');
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        export_count: newExportCount,
        trial_status: newTrialStatus
      })
      .eq("id", user.id);

    if (updateError) {
      console.log('[INCREMENT-EXPORT] Update error:', updateError);
      return new Response(JSON.stringify({ error: "Failed to update export count" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const remainingExports = hasActiveSubscription ? -1 : Math.max(0, TRIAL_EXPORT_LIMIT - newExportCount);

    console.log('[INCREMENT-EXPORT] Success! Export count:', newExportCount);
    return new Response(JSON.stringify({
      success: true,
      export_count: newExportCount,
      trial_status: newTrialStatus,
      subscription_status: profile.subscription_status,
      remaining_exports: remainingExports
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('[INCREMENT-EXPORT] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});