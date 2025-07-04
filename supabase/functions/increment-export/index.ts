import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log('[INCREMENT-EXPORT] Function started');
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    console.log('[INCREMENT-EXPORT] Authenticating user with token');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    console.log('[INCREMENT-EXPORT] User authenticated:', { userId: user.id, email: user.email });

    // Get current subscriber data
    console.log('[INCREMENT-EXPORT] Fetching subscriber data');
    const { data: subscriber, error: selectError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.log('[INCREMENT-EXPORT] Error fetching subscriber:', selectError);
      throw new Error(`Error fetching subscriber: ${selectError.message}`);
    }

    // If no subscriber record exists, create one
    if (!subscriber) {
      console.log('[INCREMENT-EXPORT] Creating new subscriber record');
      await supabaseClient.from("subscribers").insert({
        email: user.email,
        user_id: user.id,
        subscribed: false,
        free_exports_used: 1,
        updated_at: new Date().toISOString(),
      });
      
      console.log('[INCREMENT-EXPORT] New subscriber created, returning success');
      return new Response(JSON.stringify({ 
        success: true, 
        free_exports_used: 1,
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if user has subscription or free exports remaining
    console.log('[INCREMENT-EXPORT] Checking export limits:', { 
      subscribed: subscriber.subscribed, 
      freeExportsUsed: subscriber.free_exports_used 
    });
    
    if (!subscriber.subscribed && subscriber.free_exports_used >= 3) {
      console.log('[INCREMENT-EXPORT] Free export limit reached');
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
    if (!subscriber.subscribed) {
      console.log('[INCREMENT-EXPORT] Incrementing export count for non-subscriber');
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({ 
          free_exports_used: subscriber.free_exports_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq("email", user.email);

      if (updateError) {
        console.log('[INCREMENT-EXPORT] Error updating export count:', updateError);
        throw new Error(`Error updating export count: ${updateError.message}`);
      }
    }

    console.log('[INCREMENT-EXPORT] Export successful');
    return new Response(JSON.stringify({ 
      success: true,
      free_exports_used: subscriber.subscribed ? subscriber.free_exports_used : subscriber.free_exports_used + 1,
      subscribed: subscriber.subscribed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[INCREMENT-EXPORT] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});