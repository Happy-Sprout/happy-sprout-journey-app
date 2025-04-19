
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the userId from the request
    const { userId, date } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const today = date || new Date().toISOString().split('T')[0];

    // Check if there's already a quote for today
    const { data: existingQuote, error: fetchError } = await supabase
      .from('daily_inspirations')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching daily inspiration:', fetchError);
      throw fetchError;
    }

    // If we already have a quote for today, return it
    if (existingQuote) {
      return new Response(
        JSON.stringify({ quote: existingQuote.quote }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch a random quote from motivational_quotes table
    const { data: quotes, error: quotesError } = await supabase
      .from('motivational_quotes')
      .select('quote')
      .eq('active', true);

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError);
      throw quotesError;
    }

    // If no quotes in DB, use these fallback quotes
    const fallbackQuotes = [
      "Believe you can and you're halfway there.",
      "You are braver than you believe, stronger than you seem, and smarter than you think.",
      "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      "It always seems impossible until it's done.",
      "You're off to great places! Today is your day! Your mountain is waiting, so get on your way!"
    ];

    const availableQuotes = quotes && quotes.length > 0 
      ? quotes.map(q => q.quote) 
      : fallbackQuotes;

    // Select a random quote
    const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];

    // Store the selected quote for today
    const { error: insertError } = await supabase
      .from('daily_inspirations')
      .insert({
        user_id: userId,
        date: today,
        quote: randomQuote
      });

    if (insertError) {
      console.error('Error inserting daily inspiration:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ quote: randomQuote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-daily-inspiration function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
