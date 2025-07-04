import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('[INCREMENT-EXPORT] Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === "OPTIONS") {
    console.log('[INCREMENT-EXPORT] Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log('[INCREMENT-EXPORT] Function started');
    
    const authHeader = req.headers.get("Authorization");
    console.log('[INCREMENT-EXPORT] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('[INCREMENT-EXPORT] No authorization header provided');
      return new Response(JSON.stringify({ error: "No authorization header provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log('[INCREMENT-EXPORT] Token extracted, length:', token.length);
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    console.log('[INCREMENT-EXPORT] Auth result:', { 
      hasUser: !!userData?.user, 
      userEmail: userData?.user?.email,
      error: userError?.message 
    });
    
    if (userError) {
      console.log('[INCREMENT-EXPORT] Authentication error:', userError.message);
      return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      console.log('[INCREMENT-EXPORT] User not authenticated or email not available');
      return new Response(JSON.stringify({ error: "User not authenticated or email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    console.log('[INCREMENT-EXPORT] User authenticated:', { userId: user.id, email: user.email });

    // Get current subscriber data
    console.log('[INCREMENT-EXPORT] Fetching subscriber data');
    const { data: subscriber, error: selectError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    console.log('[INCREMENT-EXPORT] Subscriber query result:', {
      hasSubscriber: !!subscriber,
      subscriberData: subscriber,
      error: selectError?.message
    });

    if (selectError) {
      console.log('[INCREMENT-EXPORT] Error fetching subscriber:', selectError);
      return new Response(JSON.stringify({ error: `Error fetching subscriber: ${selectError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // If no subscriber record exists, create one
    if (!subscriber) {
      console.log('[INCREMENT-EXPORT] Creating new subscriber record');
      const { data: newSubscriber, error: insertError } = await supabaseClient.from("subscribers").insert({
        email: user.email,
        user_id: user.id,
        subscribed: false,
        free_exports_used: 1,
        updated_at: new Date().toISOString(),
      }).select().single();
      
      console.log('[INCREMENT-EXPORT] Insert result:', {
        success: !!newSubscriber,
        error: insertError?.message
      });

      if (insertError) {
        console.log('[INCREMENT-EXPORT] Error creating subscriber:', insertError);
        return new Response(JSON.stringify({ error: `Error creating subscriber: ${insertError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
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
      const { data: updatedSubscriber, error: updateError } = await supabaseClient
        .from("subscribers")
        .update({ 
          free_exports_used: subscriber.free_exports_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq("email", user.email)
        .select()
        .single();

      console.log('[INCREMENT-EXPORT] Update result:', {
        success: !!updatedSubscriber,
        newCount: updatedSubscriber?.free_exports_used,
        error: updateError?.message
      });

      if (updateError) {
        console.log('[INCREMENT-EXPORT] Error updating export count:', updateError);
        return new Response(JSON.stringify({ error: `Error updating export count: ${updateError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    console.log('[INCREMENT-EXPORT] Export successful');
    const finalResponse = { 
      success: true,
      free_exports_used: subscriber.subscribed ? subscriber.free_exports_used : subscriber.free_exports_used + 1,
      subscribed: subscriber.subscribed
    };
    
    console.log('[INCREMENT-EXPORT] Returning response:', finalResponse);
    
    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[INCREMENT-EXPORT] FATAL ERROR:", errorMessage, error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});