import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChildProfile } from "@/types/childProfile";
import { EmotionalInsight } from "@/types/emotionalInsights";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EmotionalGrowthInsightsProps {
  currentChild: ChildProfile;
  insight: EmotionalInsight | null;
  loading: boolean;
  fetchHistoricalInsights: (period: Period, startDate?: Date) => Promise<void>;
  historicalInsights: EmotionalInsight[];
  historicalLoading: boolean;
  isFallbackData: boolean;
  hasInsufficientData: boolean;
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
}

const getRadarChartData = (insight: EmotionalInsight | null, isMobile: boolean) => {
  if (!insight) return [];

  return [
    { 
      skill: isMobile ? "Self-Aware" : "Self-Awareness", 
      value: insight.self_awareness * 100
    },
    { 
      skill: isMobile ? "Self-Manage" : "Self-Management", 
      value: insight.self_management * 100 
    },
    { 
      skill: isMobile ? "Social" : "Social Awareness", 
      value: insight.social_awareness * 100 
    },
    { 
      skill: isMobile ? "Relations" : "Relationship Skills", 
      value: insight.relationship_skills * 100 
    },
    { 
      skill: isMobile ? "Decisions" : "Decision Making", 
      value: insight.responsible_decision_making * 100 
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
  hasInsufficientData,
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onResetWeek
}: EmotionalGrowthInsightsProps) => {
  const isMobile = useIsMobile();
  const formattedDateRange = `${format(currentWeekStart, "MMM d")} - ${format(addWeeks(currentWeekStart, 1), "MMM d")}`;
  const radarData = getRadarChartData(insight, isMobile);
  
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex justify-center py-12">
          <LoadingSpinner size={48} />
        </CardContent>
      </Card>
    );
  }

  if (hasInsufficientData) {
    return (
      <Card className="shadow-sm">
        <CardContent className="text-center py-12">
          <p className="text-sm text-gray-500">
            {isFallbackData
              ? "Using sample data for demonstration."
              : "Not enough data to display insights."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Emotional Growth Insights</CardTitle>
        <CardDescription>
          Tracking emotional well-being and growth for {currentChild.nickname}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="snapshot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="snapshot">Compare Areas</TabsTrigger>
            <TabsTrigger value="trends">Growth Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="snapshot" className="space-y-4">
            <h4 className="font-semibold">Skills Snapshot</h4>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(val) => `${val.toFixed(0)}%`} />
                  <Radar 
                    name="Skills" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onPrevWeek}
                  disabled={historicalLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{formattedDateRange}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onNextWeek}
                  disabled={historicalLoading || currentWeekStart >= new Date()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onResetWeek}
                  disabled={historicalLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <span className="bg-sprout-purple/10 text-sprout-purple px-3 py-1 rounded-full text-sm">
                Weekly
              </span>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                {historicalLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <LoadingSpinner size={32} />
                  </div>
                ) : historicalInsights && historicalInsights.length > 0 ? (
                  <LineChart data={historicalInsights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="display_date" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ paddingTop: 8 }}
                    />
                    <Line type="monotone" dataKey="self_awareness" stroke="#8884d8" name="Self-Awareness" />
                    <Line type="monotone" dataKey="self_management" stroke="#82ca9d" name="Self-Management" />
                    <Line type="monotone" dataKey="social_awareness" stroke="#ffc658" name="Social Awareness" />
                    <Line type="monotone" dataKey="relationship_skills" stroke="#ff7300" name="Relationship Skills" />
                    <Line type="monotone" dataKey="responsible_decision_making" stroke="#413ea0" name="Decision-Making" />
                  </LineChart>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-sm text-gray-500">No data for this week</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmotionalGrowthInsights;
