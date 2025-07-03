import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Get current subscriber data
    const { data: subscriber, error: selectError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Error fetching subscriber: ${selectError.message}`);
    }

    // If no subscriber record exists, create one
    if (!subscriber) {
      await supabaseClient.from("subscribers").insert({
        email: user.email,
        user_id: user.id,
        subscribed: false,
        free_exports_used: 1,
        updated_at: new Date().toISOString(),
      });
      
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
    if (!subscriber.subscribed && subscriber.free_exports_used >= 3) {
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
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({ 
          free_exports_used: subscriber.free_exports_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq("email", user.email);

      if (updateError) {
        throw new Error(`Error updating export count: ${updateError.message}`);
      }
    }

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
    console.error("ERROR in increment-export", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});