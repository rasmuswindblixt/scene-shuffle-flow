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

    // Check/create subscriber record
    let { data: subscriber, error: selectError } = await supabaseAdmin
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    console.log('[INCREMENT-EXPORT] Subscriber query result:', {
      found: !!subscriber,
      error: selectError?.message
    });

    if (selectError) {
      console.log('[INCREMENT-EXPORT] Database error:', selectError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create subscriber if doesn't exist
    if (!subscriber) {
      console.log('[INCREMENT-EXPORT] Creating new subscriber');
      const { data: newSubscriber, error: insertError } = await supabaseAdmin
        .from("subscribers")
        .insert({
          email: user.email,
          user_id: user.id,
          subscribed: false,
          free_exports_used: 1,
        })
        .select()
        .single();

      if (insertError) {
        console.log('[INCREMENT-EXPORT] Insert error:', insertError);
        return new Response(JSON.stringify({ error: "Failed to create subscriber record" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log('[INCREMENT-EXPORT] New subscriber created');
      return new Response(JSON.stringify({
        success: true,
        free_exports_used: 1,
        subscribed: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check export limit
    if (!subscriber.subscribed && subscriber.free_exports_used >= 1) {
      console.log('[INCREMENT-EXPORT] Export limit reached');
      return new Response(JSON.stringify({
        error: "Free export limit reached. Please subscribe to continue.",
        free_exports_used: subscriber.free_exports_used,
        subscribed: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Increment export count for non-subscribers
    let newExportCount = subscriber.free_exports_used;
    if (!subscriber.subscribed) {
      console.log('[INCREMENT-EXPORT] Incrementing export count');
      const { error: updateError } = await supabaseAdmin
        .from("subscribers")
        .update({
          free_exports_used: subscriber.free_exports_used + 1,
        })
        .eq("email", user.email);

      if (updateError) {
        console.log('[INCREMENT-EXPORT] Update error:', updateError);
        return new Response(JSON.stringify({ error: "Failed to update export count" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      newExportCount = subscriber.free_exports_used + 1;
    }

    console.log('[INCREMENT-EXPORT] Success! Export count:', newExportCount);
    return new Response(JSON.stringify({
      success: true,
      free_exports_used: newExportCount,
      subscribed: subscriber.subscribed
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