
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser access
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
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify that the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user is an admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
    
    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Access denied: Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // User is verified as admin, proceed to fetch activity logs
    // Get query limit from URL params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Fetch recent activity logs
    const { data: logs, error: logsError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch activity logs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user names for each log
    const logsWithNames = await Promise.all(logs.map(async (log) => {
      let userName = "Unknown";
      
      if (log.user_type === 'parent') {
        const { data: parentData } = await supabase
          .from('parents')
          .select('name')
          .eq('id', log.user_id)
          .maybeSingle();
          
        if (parentData?.name) {
          userName = parentData.name;
        }
      } else if (log.user_type === 'child') {
        const { data: childData } = await supabase
          .from('children')
          .select('nickname')
          .eq('id', log.user_id)
          .maybeSingle();
          
        if (childData?.nickname) {
          userName = childData.nickname;
        }
      } else if (log.user_type === 'admin') {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('name')
          .eq('id', log.user_id)
          .maybeSingle();
          
        if (adminData?.name) {
          userName = adminData.name + " (Admin)";
        } else {
          userName = "Admin User";
        }
      }
      
      return {
        ...log,
        user_name: userName
      };
    }));
    
    return new Response(
      JSON.stringify(logsWithNames),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in admin-recent-activity function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
