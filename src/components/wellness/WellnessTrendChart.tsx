
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { format, subDays, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

export type WellnessTrendPoint = {
  date: string;
  rawDate?: string; // For tooltip display
  mood: number;
  sleep: number;
  water: number;
  exercise: number;
  mindfulness: number;
};

export type WellnessPeriod = "weekly" | "monthly" | "all";

interface WellnessTrendChartProps {
  childId: string;
  period?: WellnessPeriod;
  className?: string;
}

const WellnessTrendChart = ({ 
  childId,
  period: initialPeriod = "weekly",
  className 
}: WellnessTrendChartProps) => {
  const [period, setPeriod] = useState<WellnessPeriod>(initialPeriod);
  const [data, setData] = useState<WellnessTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatChartDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return period === "monthly" ? format(date, "MMM d") : format(date, "M/d");
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const fetchWellnessTrends = async (selectedPeriod: WellnessPeriod) => {
    if (!childId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine date range based on period
      let startDate;
      const today = new Date();
      
      if (selectedPeriod === "weekly") {
        startDate = subDays(today, 7);
      } else if (selectedPeriod === "monthly") {
        startDate = subMonths(today, 1);
      } else {
        // For "all", we'll get all data but limit to last 3 months for performance
        startDate = subMonths(today, 3);
      }
      
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      
      const { data: journalEntries, error } = await supabase
        .from('journal_entries')
        .select(`
          created_at,
          mood_intensity,
          sleep,
          water,
          exercise,
          mindfulness
        `)
        .eq('child_id', childId)
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching wellness data:", error);
        setError("Failed to load wellness trends");
        setLoading(false);
        return;
      }
      
      if (!journalEntries || journalEntries.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Format data for chart
      const formattedData: WellnessTrendPoint[] = journalEntries.map(entry => {
        const entryDate = new Date(entry.created_at);
        
        return {
          date: formatChartDate(entry.created_at),
          rawDate: format(entryDate, "yyyy-MM-dd"),
          mood: entry.mood_intensity || 5,
          sleep: entry.sleep || 7,
          water: entry.water || 4,
          exercise: entry.exercise || 3,
          mindfulness: entry.mindfulness || 5
        };
      });
      
      setData(formattedData);
    } catch (err) {
      console.error("Error in fetchWellnessTrends:", err);
      setError("An error occurred while loading wellness trends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchWellnessTrends(period);
    }
  }, [childId, period]);

  const handlePeriodChange = (newPeriod: WellnessPeriod) => {
    setPeriod(newPeriod);
  };

  if (error) {
    return (
      <Card className={cn("bg-white shadow-sm", className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchWellnessTrends(period)}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">Wellness Trends</div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={period === "weekly" ? "default" : "outline"}
              onClick={() => handlePeriodChange("weekly")}
              className="rounded-full text-xs"
            >
              Weekly
            </Button>
            <Button
              size="sm"
              variant={period === "monthly" ? "default" : "outline"}
              onClick={() => handlePeriodChange("monthly")}
              className="rounded-full text-xs"
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant={period === "all" ? "default" : "outline"}
              onClick={() => handlePeriodChange("all")}
              className="rounded-full text-xs"
            >
              All Time
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner message="Loading wellness trends..." />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>No wellness data available for this time period.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  formatter={(value) => [`${value}`, ""]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload.rawDate) {
                      return `Date: ${payload[0].payload.rawDate}`;
                    }
                    return `Date: ${label}`;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#9b87f5"
                  name="Mood"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#3b82f6"
                  name="Sleep"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="water"
                  stroke="#06b6d4"
                  name="Water"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="exercise"
                  stroke="#f59e0b"
                  name="Exercise"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="mindfulness"
                  stroke="#ec4899"
                  name="Mindfulness"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;
