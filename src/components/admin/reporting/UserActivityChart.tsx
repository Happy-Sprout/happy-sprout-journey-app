
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

type ActivityDataPoint = {
  date: string;
  logins: number;
  journalEntries: number;
  checkIns: number;
};

const UserActivityChart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivityData() {
      try {
        setIsLoading(true);
        
        // Generate placeholder data for the last 14 days
        // In a real implementation, this would be fetched from the database
        const today = new Date();
        const data: ActivityDataPoint[] = [];
        
        for (let i = 13; i >= 0; i--) {
          const date = subDays(today, i);
          const formattedDate = format(date, "MMM dd");
          
          // In a real implementation, you would fetch this data from your database
          // using queries that count daily activities
          const { count: loginCount, error: loginError } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action_type', 'login')
            .gte('created_at', format(date, "yyyy-MM-dd"))
            .lt('created_at', format(subDays(date, -1), "yyyy-MM-dd"));
            
          if (loginError) throw loginError;
          
          const { count: journalCount, error: journalError } = await supabase
            .from('journal_entries')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', format(date, "yyyy-MM-dd"))
            .lt('created_at', format(subDays(date, -1), "yyyy-MM-dd"));
            
          if (journalError) throw journalError;
          
          const { count: checkInCount, error: checkInError } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action_type', 'daily_check_in_completed')
            .gte('created_at', format(date, "yyyy-MM-dd"))
            .lt('created_at', format(subDays(date, -1), "yyyy-MM-dd"));
            
          if (checkInError) throw checkInError;
          
          data.push({
            date: formattedDate,
            logins: loginCount || 0,
            journalEntries: journalCount || 0,
            checkIns: checkInCount || 0
          });
        }
        
        setActivityData(data);
      } catch (error) {
        console.error("Error fetching activity chart data:", error);
        setError("Failed to load activity chart");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchActivityData();
  }, []);

  const chartConfig = {
    logins: {
      label: "Logins",
      color: "#3b82f6" // blue-500
    },
    journalEntries: {
      label: "Journal Entries",
      color: "#8b5cf6" // violet-500
    },
    checkIns: {
      label: "Daily Check-ins",
      color: "#10b981" // emerald-500
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
        <CardTitle>User Activity (Last 14 Days)</CardTitle>
        <CardDescription>
          Daily logins, journal entries, and check-ins
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke={chartConfig.logins.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="journalEntries"
                    stroke={chartConfig.journalEntries.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkIns"
                    stroke={chartConfig.checkIns.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityChart;
