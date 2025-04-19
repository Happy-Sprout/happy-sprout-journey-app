
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { format, subDays, parseISO, startOfWeek, addWeeks, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type WellnessTrendPoint = {
  date: string;
  rawDate?: string;
  mood: number;
  sleep: number;
  water: number;
  exercise: number;
  mindfulness: number;
  kindness: number;
  positivity: number;
  confidence: number;
};

interface WellnessTrendChartProps {
  childId: string;
  className?: string;
  currentWeekStart?: Date;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onResetWeek?: () => void;
}

const METRIC_COLORS = {
  mood: "#8B5CF6",      // Vivid Purple
  sleep: "#3B82F6",     // Blue
  water: "#06B6D4",     // Cyan
  exercise: "#F97316",   // Orange
  mindfulness: "#EC4899", // Pink
  kindness: "#10B981",   // Green
  positivity: "#FBBF24", // Yellow
  confidence: "#EF4444", // Red
};

const WellnessTrendChart = ({ 
  childId,
  className,
  currentWeekStart: externalWeekStart,
  onPrevWeek: externalPrevWeek,
  onNextWeek: externalNextWeek,
  onResetWeek: externalResetWeek
}: WellnessTrendChartProps) => {
  // Use internal state only if external state is not provided
  const [internalWeekStart, setInternalWeekStart] = useState(() => startOfWeek(new Date()));
  const [data, setData] = useState<WellnessTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which week state to use
  const currentWeekStart = externalWeekStart || internalWeekStart;
  
  // Determine which handlers to use (external if provided, internal otherwise)
  const handlePreviousWeek = externalPrevWeek || (() => {
    setInternalWeekStart(prev => addWeeks(prev, -1));
  });

  const handleNextWeek = externalNextWeek || (() => {
    const nextWeek = addWeeks(internalWeekStart, 1);
    if (nextWeek <= new Date()) {
      setInternalWeekStart(nextWeek);
    }
  });

  const handleResetWeek = externalResetWeek || (() => {
    setInternalWeekStart(startOfWeek(new Date()));
  });

  const formatChartDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEE");
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Function to deduplicate data points by date
  const deduplicateDataByDate = useCallback((data: WellnessTrendPoint[]): WellnessTrendPoint[] => {
    if (!data || data.length === 0) return [];
    
    const dateMap = new Map<string, WellnessTrendPoint>();
    
    const sortedData = [...data].sort((a, b) => {
      if (!a.rawDate || !b.rawDate) return 0;
      return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
    });
    
    sortedData.forEach(point => {
      if (point.rawDate) {
        const dateKey = point.rawDate.split('T')[0];
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, point);
        }
      }
    });
    
    return Array.from(dateMap.values()).sort((a, b) => {
      if (!a.rawDate || !b.rawDate) return 0;
      return new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
    });
  }, []);

  const fetchWellnessTrends = async (weekStart: Date) => {
    if (!childId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const weekEnd = addWeeks(weekStart, 1);
      const formattedStartDate = format(weekStart, "yyyy-MM-dd");
      const formattedEndDate = format(weekEnd, "yyyy-MM-dd");
      
      const { data: journalEntries, error } = await supabase
        .from('journal_entries')
        .select(`
          created_at,
          mood_intensity,
          sleep,
          water,
          exercise,
          mindfulness,
          kindness,
          positivity,
          confidence
        `)
        .eq('child_id', childId)
        .gte('created_at', formattedStartDate)
        .lt('created_at', formattedEndDate)
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

      const formattedData: WellnessTrendPoint[] = journalEntries.map(entry => {
        const entryDate = new Date(entry.created_at);
        
        return {
          date: formatChartDate(entry.created_at),
          rawDate: format(entryDate, "yyyy-MM-dd"),
          mood: entry.mood_intensity || 5,
          sleep: entry.sleep || 7,
          water: entry.water || 4,
          exercise: entry.exercise || 3,
          mindfulness: entry.mindfulness || 5,
          kindness: entry.kindness || 5,
          positivity: entry.positivity || 6,
          confidence: entry.confidence || 5
        };
      });
      
      const processedData = deduplicateDataByDate(formattedData);
      setData(processedData);
    } catch (err) {
      console.error("Error in fetchWellnessTrends:", err);
      setError("An error occurred while loading wellness trends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchWellnessTrends(currentWeekStart);
    }
  }, [childId, currentWeekStart]);

  if (error) {
    return (
      <Card className={cn("bg-white shadow-sm", className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchWellnessTrends(currentWeekStart)}
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousWeek}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev Week
            </Button>
            <span className="text-sm font-medium">
              {format(currentWeekStart, "MMM d")} - {format(addWeeks(currentWeekStart, 1), "MMM d")}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextWeek}
              disabled={addWeeks(currentWeekStart, 1) > new Date()}
              className="rounded-full"
            >
              Next Week
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner message="Loading wellness trends..." />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>No wellness data available for this week.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
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
                <Bar dataKey="mood" stackId="a" fill={METRIC_COLORS.mood} name="Mood" />
                <Bar dataKey="sleep" stackId="a" fill={METRIC_COLORS.sleep} name="Sleep" />
                <Bar dataKey="water" stackId="a" fill={METRIC_COLORS.water} name="Water" />
                <Bar dataKey="exercise" stackId="a" fill={METRIC_COLORS.exercise} name="Exercise" />
                <Bar dataKey="mindfulness" stackId="a" fill={METRIC_COLORS.mindfulness} name="Mindfulness" />
                <Bar dataKey="kindness" stackId="a" fill={METRIC_COLORS.kindness} name="Kindness" />
                <Bar dataKey="positivity" stackId="a" fill={METRIC_COLORS.positivity} name="Positivity" />
                <Bar dataKey="confidence" stackId="a" fill={METRIC_COLORS.confidence} name="Confidence" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;
