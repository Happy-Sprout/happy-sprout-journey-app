
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Activity, TrendingUp } from "lucide-react";

type UserActivityStat = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
};

const UserActivityStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserActivityStat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserActivityStats() {
      try {
        setIsLoading(true);
        
        // Fetch total users count
        const { count: userCount, error: usersError } = await supabase
          .from('parents')
          .select('*', { count: 'exact', head: true });
          
        if (usersError) throw usersError;
        
        // Fetch total children count
        const { count: childrenCount, error: childrenError } = await supabase
          .from('children')
          .select('*', { count: 'exact', head: true });
          
        if (childrenError) throw childrenError;
        
        // Fetch total journal entries
        const { count: journalCount, error: journalError } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true });
          
        if (journalError) throw journalError;
        
        // Fetch activity logs from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentActivityCount, error: activityError } = await supabase
          .from('user_activity_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());
          
        if (activityError) throw activityError;
        
        setStats([
          {
            icon: <Users className="h-5 w-5 text-blue-500" />,
            title: "Total Users",
            value: userCount || 0,
            description: "Registered parent accounts"
          },
          {
            icon: <Users className="h-5 w-5 text-green-500" />,
            title: "Total Children",
            value: childrenCount || 0,
            description: "Child profiles created"
          },
          {
            icon: <Activity className="h-5 w-5 text-indigo-500" />,
            title: "Journal Entries",
            value: journalCount || 0,
            description: "Total entries created"
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
            title: "Recent Activity",
            value: recentActivityCount || 0,
            description: "Actions in last 30 days"
          }
        ]);
      } catch (error) {
        console.error("Error fetching user activity stats:", error);
        setError("Failed to load user statistics");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserActivityStats();
  }, []);

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later or contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        // Loading skeletons
        Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))
      ) : (
        // Actual stat cards
        stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-1 bg-muted rounded-full">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default UserActivityStats;
