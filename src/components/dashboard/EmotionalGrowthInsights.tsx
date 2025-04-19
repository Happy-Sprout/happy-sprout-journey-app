import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChildProfile } from "@/types/childProfile";
import { EmotionalInsight, Period } from "@/hooks/useEmotionalInsights";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft, ChevronRight, RefreshCw, Info, Thermometer, TrendingUp } from "lucide-react";
import { format, subWeeks, addWeeks, startOfWeek } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmotionalGrowthInsightsProps {
  currentChild: ChildProfile;
  insight: EmotionalInsight | null;
  loading: boolean;
  fetchHistoricalInsights: (period: Period, startDate?: Date) => Promise<void>;
  historicalInsights: EmotionalInsight[];
  historicalLoading: boolean;
  isFallbackData: boolean;
  hasInsufficientData: boolean;
}

// Helper function to prepare radar chart data from insight
const getRadarChartData = (insight: EmotionalInsight | null, isMobile: boolean) => {
  if (!insight) return [];

  return [
    { 
      skill: isMobile ? "Self-Aware" : "Self-Awareness", 
      value: insight.self_awareness * 10 
    },
    { 
      skill: isMobile ? "Self-Manage" : "Self-Management", 
      value: insight.self_management * 10 
    },
    { 
      skill: isMobile ? "Social" : "Social Awareness", 
      value: insight.social_awareness * 10 
    },
    { 
      skill: isMobile ? "Relations" : "Relationship Skills", 
      value: insight.relationship_skills * 10 
    },
    { 
      skill: isMobile ? "Decisions" : "Decision Making", 
      value: insight.responsible_decision_making * 10 
    }
  ];
};

const EmotionalGrowthInsights = ({
  currentChild,
  insight,
  loading,
  fetchHistoricalInsights,
  historicalInsights,
  historicalLoading,
  isFallbackData,
  hasInsufficientData
}: EmotionalGrowthInsightsProps) => {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const prevWeekStart = subWeeks(currentWeekStart, 1);
  const nextWeekStart = addWeeks(currentWeekStart, 1);
  const today = new Date();
  
  const formattedDateRange = `${format(currentWeekStart, "MMM d")} - ${format(addWeeks(currentWeekStart, 1), "MMM d")}`;
  
  useEffect(() => {
    fetchHistoricalInsights(selectedPeriod, currentWeekStart);
  }, [fetchHistoricalInsights, selectedPeriod, currentWeekStart]);
  
  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    fetchHistoricalInsights(period, currentWeekStart);
  };
  
  const handlePrevWeek = () => {
    setCurrentWeekStart(prevWeekStart);
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(nextWeekStart);
  };
  
  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };
  
  const radarData = getRadarChartData(insight, isMobile);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Emotional Growth Insights</CardTitle>
        <CardDescription>
          Tracking emotional well-being and growth for {currentChild.nickname}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={48} />
          </div>
        ) : hasInsufficientData ? (
          <div className="text-center py-12">
            <Info className="mx-auto h-6 w-6 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500">
              {isFallbackData
                ? "Using sample data for demonstration."
                : "Not enough data to display insights."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <h4 className="mb-2 font-semibold text-sm">Skills Snapshot</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar
                      name="Skills"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full">
                <h4 className="mb-2 font-semibold text-sm">Weekly Trends</h4>
                <div className="flex items-center justify-between mb-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePrevWeek}
                    disabled={loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{formattedDateRange}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleNextWeek}
                    disabled={loading || currentWeekStart >= startOfWeek(today, { weekStartsOn: 1 })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToday}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalInsights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="display_date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="self_awareness" stroke="#8884d8" name="Self-Awareness" />
                    <Line type="monotone" dataKey="self_management" stroke="#82ca9d" name="Self-Management" />
                    {/* Add more lines for other skills as needed */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly" onClick={() => handlePeriodChange("weekly")}>Weekly</TabsTrigger>
            <TabsTrigger value="monthly" onClick={() => handlePeriodChange("monthly")}>Monthly</TabsTrigger>
            <TabsTrigger value="all" onClick={() => handlePeriodChange("all")}>All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardFooter>
    </Card>
  );
};

export default EmotionalGrowthInsights;
