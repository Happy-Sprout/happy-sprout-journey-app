
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";

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
        
        const today = new Date();
        const data: ActivityDataPoint[] = [];
        
        for (let i = 13; i >= 0; i--) {
          const date = subDays(today, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          const formattedDate = format(date, "MMM dd");
          
          // Count login activities for this day
          const { count: loginCount, error: loginError } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action_type', 'login')
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString());
            
          if (loginError) {
            console.error("Login count error:", loginError);
          }
          
          // Count journal entries for this day
          const { count: journalCount, error: journalError } = await supabase
            .from('journal_entries')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString());
            
          if (journalError) {
            console.error("Journal count error:", journalError);
          }
          
          // Count daily check-in activities for this day
          const { count: checkInCount, error: checkInError } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action_type', 'daily_check_in')
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString());
            
          if (checkInError) {
            console.error("Check-in count error:", checkInError);
          }
          
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
          <div className="h-80 w-full">
            <ChartContainer config={chartConfig}>
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={activityData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <RechartsXAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      padding={{ left: 10, right: 10 }}
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={1}
                      dy={10}
                    />
                    <RechartsYAxis 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      tick={{ fontSize: 12 }}
                      width={25}
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
                    <ChartLegend verticalAlign="top">
                      <ChartLegendContent verticalAlign="top" />
                    </ChartLegend>
                  </LineChart>
                </ResponsiveContainer>
              </>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityChart;
