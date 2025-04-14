
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const { journalText, checkInText, childId } = await req.json();
    
    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'Child ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!journalText && !checkInText) {
      return new Response(
        JSON.stringify({ error: 'Either journal text or check-in text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine available text for analysis
    const textToAnalyze = [
      journalText ? `Journal entry: ${journalText}` : '',
      checkInText ? `Daily check-in: ${checkInText}` : ''
    ].filter(Boolean).join('\n\n');

    // Call OpenAI API for analysis
    const analysis = await analyzeEmotionalGrowth(textToAnalyze);
    
    if (!analysis) {
      return new Response(
        JSON.stringify({ error: 'Failed to analyze emotional growth' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store results in database
    const insightId = await saveInsights(childId, analysis, textToAnalyze);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          id: insightId,
          ...analysis
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-emotional-growth function:', error);
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

1. Self-Awareness: Understanding one's emotions, personal goals, and values. This includes accurately assessing strengths and limitations, having positive mindsets, and possessing a well-grounded sense of self-efficacy and optimism.

2. Self-Management: Regulating emotions and behaviors to achieve goals. This includes managing stress, controlling impulses, motivating oneself, setting and working toward personal and academic goals.

3. Social Awareness: Understanding others' perspectives and empathizing with them. This includes appreciating diversity, respecting others, and understanding social and ethical norms for behavior.

4. Relationship Skills: Forming positive relationships, teamwork, conflict resolution. This includes communicating clearly, listening actively, cooperating, resisting inappropriate social pressure, negotiating conflict constructively, and seeking and offering help when needed.

5. Responsible Decision-Making: Making ethical, constructive choices about personal behavior and social interactions. This includes considering ethical standards, safety concerns, appropriate social norms, and the well-being of self and others.

For each dimension, provide a score between 0 and 1, where:
- 0.0-0.2: Significant growth needed
- 0.3-0.4: Developing
- 0.5-0.6: Moderate competence
- 0.7-0.8: Strong competence
- 0.9-1.0: Exceptional competence

Also include a brief rationale for each score to help understand why you assigned it.

Provide your analysis in a JSON format with these keys and numeric values between 0 and 1:
{
  "self_awareness": 0.0-1.0,
  "self_management": 0.0-1.0,
  "social_awareness": 0.0-1.0,
  "relationship_skills": 0.0-1.0,
  "responsible_decision_making": 0.0-1.0,
  "analysis": {
    "self_awareness_notes": "brief explanation",
    "self_management_notes": "brief explanation",
    "social_awareness_notes": "brief explanation",
    "relationship_skills_notes": "brief explanation",
    "responsible_decision_making_notes": "brief explanation"
  }
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
        max_tokens: 800,
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
    const parsedResponse = JSON.parse(content);
    
    // Extract just the numerical scores for saving to the database
    const scores = {
      self_awareness: parsedResponse.self_awareness,
      self_management: parsedResponse.self_management,
      social_awareness: parsedResponse.social_awareness,
      relationship_skills: parsedResponse.relationship_skills,
      responsible_decision_making: parsedResponse.responsible_decision_making
    };
    
    return scores;
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
