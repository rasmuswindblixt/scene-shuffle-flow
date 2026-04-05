import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Complimentary premium accounts — bypass subscription check
const COMPLIMENTARY_PREMIUM_EMAILS = ["pptskolan@gmail.com"];

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

    // Get user profile
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

    // If no profile, check if complimentary before blocking
    if (!profile) {
      if (COMPLIMENTARY_PREMIUM_EMAILS.includes(user.email.toLowerCase())) {
        console.log('[INCREMENT-EXPORT] No profile but complimentary premium – allowing export');
        return new Response(JSON.stringify({
          success: true,
          export_count: 0,
          subscription_status: 'active',
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      console.log('[INCREMENT-EXPORT] No profile found – subscription required');
      return new Response(JSON.stringify({
        error: "Subscription required to export. Please subscribe to continue.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Check if user has active subscription or is a complimentary premium account
    const isComplimentary = COMPLIMENTARY_PREMIUM_EMAILS.includes(user.email.toLowerCase());
    const hasActiveSubscription = profile.subscription_status === 'active' || isComplimentary;

    if (isComplimentary) {
      console.log('[INCREMENT-EXPORT] Complimentary premium account:', user.email);
    }

    // Require subscription for export
    if (!hasActiveSubscription) {
      console.log('[INCREMENT-EXPORT] User not subscribed – blocking export');
      return new Response(JSON.stringify({
        error: "Subscription required to export. Please subscribe to continue.",
        subscription_status: profile.subscription_status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Increment export count for analytics (subscribed users only)
    const newExportCount = (profile.export_count || 0) + 1;
    console.log('[INCREMENT-EXPORT] Incrementing export count for subscribed user');
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        export_count: newExportCount
      })
      .eq("id", user.id);

    if (updateError) {
      console.log('[INCREMENT-EXPORT] Update error:', updateError);
      return new Response(JSON.stringify({ error: "Failed to update export count" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log('[INCREMENT-EXPORT] Success! Export count:', newExportCount);
    return new Response(JSON.stringify({
      success: true,
      export_count: newExportCount,
      subscription_status: profile.subscription_status
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