
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
    console.log("Admin recent activity function called");
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify that the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
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
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user ID for admin check
    const userId = user.id;
    console.log("User authenticated, checking admin status for user:", userId);
    
    // Check if the user is an admin by querying the admin_users table directly
    const { data: adminData, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_id', userId)
      .maybeSingle();
    
    if (adminCheckError) {
      console.error("Admin check error:", adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!adminData) {
      console.error("Access denied: User is not an admin");
      return new Response(
        JSON.stringify({ error: 'Access denied: Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Admin verification successful");
    
    // Parse the URL to get the limit parameter
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 20;
    
    if (isNaN(limit)) {
      return new Response(
        JSON.stringify({ error: 'Invalid limit parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching recent activity logs with limit: ${limit}`);
    
    // Fetch recent activity logs with user information in a single optimized query
    const { data: logs, error: logsError } = await supabase
      .from('user_activity_logs')
      .select(`
        *,
        parent_info:parents!user_activity_logs_user_id_fkey(name),
        child_info:children!user_activity_logs_user_id_fkey(nickname),
        admin_info:admin_users!user_activity_logs_user_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (logsError) {
      console.error('Error fetching logs:', logsError);
      // If the optimized query fails, fall back to the original approach
      console.log('Falling back to individual queries for user names');
      
      const { data: fallbackLogs, error: fallbackError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (fallbackError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch activity logs' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Process with individual queries for user names (original approach)
      const logsWithNames = await Promise.all(fallbackLogs.map(async (log) => {
        let userName = "Unknown";
        
        try {
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
        } catch (error) {
          console.error(`Error getting user name for log ${log.id}:`, error);
          // Continue with default "Unknown" username
        }
        
        return {
          ...log,
          user_name: userName
        };
      }));
      
      console.log("Successfully processed activity logs with user names (fallback)");
      
      return new Response(
        JSON.stringify(logsWithNames),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    console.log(`Retrieved ${logs.length} activity logs`);
    
    // Process the optimized query results
    const logsWithNames = logs.map((log) => {
      let userName = "Unknown";
      
      try {
        if (log.user_type === 'parent' && log.parent_info?.name) {
          userName = log.parent_info.name;
        } else if (log.user_type === 'child' && log.child_info?.nickname) {
          userName = log.child_info.nickname;
        } else if (log.user_type === 'admin' && log.admin_info?.name) {
          userName = log.admin_info.name + " (Admin)";
        } else if (log.user_type === 'admin') {
          userName = "Admin User";
        }
      } catch (error) {
        console.error(`Error processing user name for log ${log.id}:`, error);
        // Continue with default "Unknown" username
      }
      
      // Remove the joined data from the final response to keep it clean
      const { parent_info, child_info, admin_info, ...cleanLog } = log;
      
      return {
        ...cleanLog,
        user_name: userName
      };
    });
    
    console.log("Successfully processed activity logs with user names (optimized)");
    
    // Return the logs with user names
    return new Response(
      JSON.stringify(logsWithNames),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in admin-recent-activity function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
