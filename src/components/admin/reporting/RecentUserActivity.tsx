
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
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setIsLoading(true);
        
        // Fetch recent activity logs with an increased limit to ensure comprehensive data
        const { data, error: logsError } = await supabase
          .from('user_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20); // Increased from 10 to 20 to show more activity
          
        if (logsError) throw logsError;
        
        if (!data) {
          setActivityLogs([]);
          return;
        }
        
        // Get user/child names for each log
        const logsWithNames = await Promise.all(data.map(async (log) => {
          let userName = "Unknown";
          
          if (log.user_type === 'parent') {
            const { data: parentData } = await supabase
              .from('parents')
              .select('name')
              .eq('id', log.user_id)
              .maybeSingle(); // Changed from single to maybeSingle to handle cases where the parent might not exist
              
            if (parentData?.name) {
              userName = parentData.name;
            }
          } else if (log.user_type === 'child') {
            const { data: childData } = await supabase
              .from('children')
              .select('nickname')
              .eq('id', log.user_id)
              .maybeSingle(); // Changed from single to maybeSingle
              
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
        
        setActivityLogs(logsWithNames);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setError("Failed to load recent activity");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecentActivity();
  }, []);

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
