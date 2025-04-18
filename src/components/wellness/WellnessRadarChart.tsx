
import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { JournalEntry } from "@/types/journal";
import { cn } from "@/lib/utils";
import { Smile, Meh, Frown, Heart, Droplet, Moon, Activity, Brain, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface WellnessRadarChartProps {
  journalEntry: JournalEntry | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 shadow-md rounded-md border text-sm">
        <p className="font-semibold">{`${data.subject}: ${data.A}`}</p>
      </div>
    );
  }
  return null;
};

const getMoodColor = (moodValue: number): string => {
  if (moodValue >= 8) return "bg-yellow-400 text-yellow-800";
  if (moodValue >= 6) return "bg-green-400 text-green-800";
  if (moodValue >= 5) return "bg-blue-300 text-blue-800";
  if (moodValue >= 3) return "bg-orange-300 text-orange-800";
  return "bg-red-300 text-red-800";
};

const WellnessRadarChart = ({ journalEntry }: WellnessRadarChartProps) => {
  const [view, setView] = useState<"radar" | "list">("radar");
  const isMobile = useIsMobile();

  if (!journalEntry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200 p-4">
        <p className="text-gray-500 text-center">No journal data available for today.</p>
        <p className="text-gray-400 text-sm mt-2">Complete your daily journal to see your wellness wheel.</p>
      </div>
    );
  }

  const wellnessData = [
    { subject: "Mood", A: journalEntry.mood_intensity || journalEntry.mood === "happy" ? 8 : journalEntry.mood === "neutral" ? 5 : 3, fullMark: 10 },
    { subject: "Sleep", A: journalEntry.sleep, fullMark: 10 },
    { subject: "Water", A: journalEntry.water, fullMark: 10 },
    { subject: "Exercise", A: journalEntry.exercise, fullMark: 10 },
    { subject: "Mindfulness", A: journalEntry.mindfulness, fullMark: 10 },
    { subject: "Kindness", A: journalEntry.kindness, fullMark: 10 },
    { subject: "Positivity", A: journalEntry.positivity, fullMark: 10 },
    { subject: "Confidence", A: journalEntry.confidence, fullMark: 10 },
  ];

  const metricsWithIcons = [
    { name: "Mood", value: journalEntry.mood_intensity || (journalEntry.mood === "happy" ? 8 : journalEntry.mood === "neutral" ? 5 : 3), icon: <Smile className="h-4 w-4" />, max: 10 },
    { name: "Sleep", value: journalEntry.sleep, icon: <Moon className="h-4 w-4" />, max: 10 },
    { name: "Water", value: journalEntry.water, icon: <Droplet className="h-4 w-4" />, max: 10 },
    { name: "Exercise", value: journalEntry.exercise, icon: <Activity className="h-4 w-4" />, max: 10 },
    { name: "Mindfulness", value: journalEntry.mindfulness, icon: <Brain className="h-4 w-4" />, max: 10 },
    { name: "Kindness", value: journalEntry.kindness, icon: <Heart className="h-4 w-4" />, max: 10 },
    { name: "Positivity", value: journalEntry.positivity, icon: <Star className="h-4 w-4" />, max: 10 },
    { name: "Confidence", value: journalEntry.confidence, icon: <Zap className="h-4 w-4" />, max: 10 },
  ];

  // We ensure the moodValue is valid for display - default to 5 if not available
  const moodValue = journalEntry.mood_intensity || 
                   (journalEntry.mood === "happy" ? 8 : 
                    journalEntry.mood === "neutral" ? 5 : 
                    journalEntry.mood === "sad" ? 3 : 5);

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-medium">Wellness Wheel</h3>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button 
            variant={view === "radar" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setView("radar")}
            className="rounded-full text-xs sm:text-sm flex-1 sm:flex-none min-w-[80px] z-0"
          >
            Radar View
          </Button>
          <Button 
            variant={view === "list" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setView("list")}
            className="rounded-full text-xs sm:text-sm flex-1 sm:flex-none min-w-[80px] z-0"
          >
            List View
          </Button>
        </div>
      </div>

      {view === "radar" ? (
        <div className="w-full h-[280px] sm:h-[320px] relative" style={{ minHeight: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "65%" : "80%"} data={wellnessData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: '#666', 
                  fontSize: isMobile ? 10 : 12,
                  dy: isMobile ? 3 : 0
                }} 
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Radar
                name="Wellness"
                dataKey="A"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center",
            getMoodColor(moodValue)
          )}>
            <div className="text-xl sm:text-2xl">
              {moodValue >= 7 ? "😃" : moodValue >= 5 ? "🙂" : moodValue >= 3 ? "😐" : "☹️"}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 py-2">
          {metricsWithIcons.map((metric) => (
            <div key={metric.name} className="flex items-center mb-2">
              <div className="mr-2 w-8 flex justify-center">
                {metric.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-sm text-gray-600 ml-2">{metric.value}/{metric.max}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full", getMoodColor(moodValue))}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t">
        <div className="overflow-x-auto -mx-3 px-3 pb-2">
          <div className="flex gap-2 min-w-max">
            <div className={cn("px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1", getMoodColor(moodValue))}>
              {moodValue >= 7 ? "😃" : moodValue >= 5 ? "🙂" : moodValue >= 3 ? "😐" : "☹️"} 
              <span className="hidden sm:inline">Mood:</span> {moodValue}
            </div>
            <div className={cn("px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 bg-blue-100 text-blue-800")}>
              <Moon className="h-3 w-3" /> 
              <span className="hidden sm:inline">Sleep:</span> {journalEntry.sleep}
            </div>
            <div className={cn("px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 bg-cyan-100 text-cyan-800")}>
              <Droplet className="h-3 w-3" /> 
              <span className="hidden sm:inline">Water:</span> {journalEntry.water}
            </div>
            <div className={cn("px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 bg-green-100 text-green-800")}>
              <Activity className="h-3 w-3" /> 
              <span className="hidden sm:inline">Exercise:</span> {journalEntry.exercise}
            </div>
            <div className={cn("px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 bg-purple-100 text-purple-800")}>
              <Brain className="h-3 w-3" /> 
              <span className="hidden sm:inline">Mindfulness:</span> {journalEntry.mindfulness}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessRadarChart;
