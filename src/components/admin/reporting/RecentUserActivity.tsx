
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type ActivityLogItem = {
  id: string;
  user_id: string;
  user_type: string;
  action_type: string;
  action_details: any;
  created_at: string;
  user_name?: string;
};

const RecentUserActivity = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to get recent activity logs directly (fallback method)
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity_logs')
          .select(`
            id,
            user_id,
            user_type,
            action_type,
            action_details,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activityError) {
          console.error("Direct query error:", activityError);
          // Try using the edge function as fallback
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            throw new Error("No active session found");
          }
          
          console.log("Trying edge function fallback...");
          
          const response = await supabase.functions.invoke("admin-recent-activity", {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          
          if (response.error) {
            console.error("Edge function error:", response.error);
            throw new Error(`Failed to fetch activity logs: ${response.error.message || response.error}`);
          }
          
          setActivityLogs(response.data || []);
          return;
        }
        
        // Process direct query results
        const processedLogs = await Promise.all(
          (activityData || []).map(async (log) => {
            let userName = "Unknown User";
            
            // Try to get user name from parents table first
            if (log.user_type === 'parent' || !log.user_type) {
              const { data: parentData } = await supabase
                .from('parents')
                .select('name')
                .eq('id', log.user_id)
                .single();
              
              if (parentData?.name) {
                userName = parentData.name;
              }
            }
            
            // Try admin_users table if it's an admin
            if (log.user_type === 'admin') {
              const { data: adminData } = await supabase
                .from('admin_users')
                .select('name')
                .eq('id', log.user_id)
                .single();
              
              if (adminData?.name) {
                userName = adminData.name;
              }
            }
            
            return {
              ...log,
              user_name: userName
            };
          })
        );
        
        setActivityLogs(processedLogs);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setError("Failed to load recent activity");
        
        // Set some placeholder data to show the component structure
        setActivityLogs([
          {
            id: "placeholder-1",
            user_id: "placeholder",
            user_type: "parent",
            action_type: "login",
            action_details: { placeholder: true },
            created_at: new Date().toISOString(),
            user_name: "Demo User"
          }
        ]);
        
        toast({
          title: "Activity data unavailable",
          description: "Using placeholder data. Please check your permissions.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecentActivity();
  }, [toast]);

  const formatActionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActionBadgeColor = (actionType: string) => {
    if (actionType.includes('login')) {
      return 'bg-blue-100 text-blue-800';
    } else if (actionType.includes('check_in')) {
      return 'bg-green-100 text-green-800';
    } else if (actionType.includes('journal')) {
      return 'bg-purple-100 text-purple-800';
    } else if (actionType.includes('assessment')) {
      return 'bg-amber-100 text-amber-800';
    } else if (actionType.includes('profile')) {
      return 'bg-indigo-100 text-indigo-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later or contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent User Activity</CardTitle>
        <CardDescription>
          Most recent actions performed by all users across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No activity data available
                    </TableCell>
                  </TableRow>
                ) : (
                  activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user_name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          log.user_type === 'parent' ? 'bg-blue-100 text-blue-800' : 
                          log.user_type === 'admin' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.user_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getActionBadgeColor(log.action_type)}`}>
                          {formatActionType(log.action_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.action_details ? (
                          <span className="text-xs text-muted-foreground">
                            {Object.keys(log.action_details).length > 0 
                              ? Object.keys(log.action_details).slice(0, 2).map(key => 
                                  `${key}: ${JSON.stringify(log.action_details[key]).substring(0, 20)}...`
                                ).join(', ')
                              : 'No details'
                            }
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No details</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{format(new Date(log.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentUserActivity;
