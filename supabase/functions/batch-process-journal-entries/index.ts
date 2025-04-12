
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const MAX_CONCURRENT_REQUESTS = 5; // Process 5 entries at once
const RATE_LIMIT_DELAY_MS = 1000; // 1 second delay between batches

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 100, offset = 0 } = await req.json();
    
    // 1. Fetch journal entries that don't have SEL insights yet
    console.log(`Fetching unprocessed journal entries (limit: ${limit}, offset: ${offset})...`);
    const journalEntriesResponse = await fetch(`${supabaseUrl}/rest/v1/journal_entries?select=id,child_id,content,went_well,went_badly,gratitude,challenge,tomorrow_plan&order=created_at.desc&limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    });

    if (!journalEntriesResponse.ok) {
      throw new Error(`Error fetching journal entries: ${journalEntriesResponse.statusText}`);
    }

    const journalEntries = await journalEntriesResponse.json();
    console.log(`Retrieved ${journalEntries.length} journal entries`);
    
    if (journalEntries.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No journal entries to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. For each journal entry, check if it already has an SEL insight
    const processedEntries = [];
    const skippedEntries = [];
    const failedEntries = [];
    
    // Process entries in batches to respect rate limits
    for (let i = 0; i < journalEntries.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = journalEntries.slice(i, i + MAX_CONCURRENT_REQUESTS);
      console.log(`Processing batch ${i / MAX_CONCURRENT_REQUESTS + 1}, size: ${batch.length}`);
      
      const batchPromises = batch.map(async (entry) => {
        try {
          // Check if entry already has an SEL insight
          const insightCheckResponse = await fetch(
            `${supabaseUrl}/rest/v1/sel_insights?child_id=eq.${entry.child_id}&select=id&order=created_at.desc&limit=1`, 
            {
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
              }
            }
          );
          
          if (!insightCheckResponse.ok) {
            throw new Error(`Error checking for existing insights: ${insightCheckResponse.statusText}`);
          }
          
          const existingInsights = await insightCheckResponse.json();
          
          // Prepare journal text for analysis
          const journalText = `
            Journal Entry:
            What went well: ${entry.went_well || ''}
            What went badly: ${entry.went_badly || ''}
            Gratitude: ${entry.gratitude || ''}
            Challenge: ${entry.challenge || ''}
            Tomorrow's plan: ${entry.tomorrow_plan || ''}
            Additional content: ${entry.content || ''}
          `;
          
          // Call OpenAI for analysis
          const analysis = await analyzeEmotionalGrowth(journalText);
          
          if (!analysis) {
            throw new Error('Failed to analyze journal entry');
          }
          
          // Store the result in the database
          const insightId = await saveInsights(entry.child_id, analysis, journalText);
          
          console.log(`Processed entry ${entry.id} for child ${entry.child_id}, created insight ${insightId}`);
          processedEntries.push({
            entryId: entry.id,
            childId: entry.child_id,
            insightId: insightId
          });
        } catch (error) {
          console.error(`Error processing entry ${entry.id}:`, error);
          failedEntries.push({
            entryId: entry.id,
            error: error.message
          });
        }
      });
      
      // Wait for the current batch to complete
      await Promise.all(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (i + MAX_CONCURRENT_REQUESTS < journalEntries.length) {
        console.log(`Waiting ${RATE_LIMIT_DELAY_MS}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: processedEntries.length,
        skipped: skippedEntries.length,
        failed: failedEntries.length,
        processedEntries,
        skippedEntries,
        failedEntries
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch-process-journal-entries function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeEmotionalGrowth(text: string) {
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return null;
  }

  try {
    const prompt = `
You are an educational psychologist specializing in Social Emotional Learning (SEL) for children. 
Analyze the following text from a child's journal entry and/or daily check-in.
Based solely on this text, rate the child's development in the following 5 SEL dimensions on a scale from 0.0 to 1.0:

1. Self-Awareness: Understanding one's emotions, personal goals, and values.
2. Self-Management: Regulating emotions and behaviors to achieve goals.
3. Social Awareness: Showing understanding and empathy for others.
4. Relationship Skills: Forming positive relationships, teamwork, conflict resolution.
5. Responsible Decision-Making: Making ethical, constructive choices.

Provide your analysis in a JSON format with only these keys and numeric values between 0 and 1:
{
  "self_awareness": 0.0-1.0,
  "self_management": 0.0-1.0,
  "social_awareness": 0.0-1.0,
  "relationship_skills": 0.0-1.0,
  "responsible_decision_making": 0.0-1.0
}

Text to analyze:
${text}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert educational psychologist.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid response from OpenAI:', data);
      return null;
    }

    // Parse the JSON response
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}

async function saveInsights(childId: string, analysis: any, sourceText: string) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sel_insights`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': `${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        child_id: childId,
        self_awareness: analysis.self_awareness,
        self_management: analysis.self_management,
        social_awareness: analysis.social_awareness,
        relationship_skills: analysis.relationship_skills,
        responsible_decision_making: analysis.responsible_decision_making,
        source_text: sourceText
      })
    });

    const data = await response.json();
    return data[0]?.id;
  } catch (error) {
    console.error('Error saving insights to database:', error);
    throw error;
  }
}
