import { useState, useEffect } from "react";
import { ChildProfile } from "@/types/childProfile";
import { JournalEntry } from "@/types/journal";
import EmotionalGrowthInsights from "./EmotionalGrowthInsights";
import WellnessRadarChart from "../wellness/WellnessRadarChart";
import WellnessTrendChart from "../wellness/WellnessTrendChart";
import AchievementsSection from "./AchievementsSection";
import DevelopmentTools from "./DevelopmentTools";
import HeaderIllustration from "./HeaderIllustration";
import { Period } from "@/hooks/useEmotionalInsights";
import DailyActivities from "./DailyActivities";
import StatsSidebar from "./stats/StatsSidebar";
import { Button } from "@/components/ui/button";
import { List, BarChart2 } from "lucide-react";
import { startOfWeek, addWeeks } from "date-fns";

interface DashboardContentProps {
  currentChild: ChildProfile;
  currentChildId: string;
  latestInsight: any;
  insightLoading: boolean;
  fetchHistoricalInsights: (period: Period, startDate?: Date) => Promise<void>;
  historicalInsights: any[];
  historicalLoading: boolean;
  isFallbackData: boolean;
  hasInsufficientData: boolean;
  todayEntry: JournalEntry | null;
  journalLoading: boolean;
  connectionError: boolean;
  isDbConnected: boolean | null;
  isDevelopment: boolean;
  insertSampleData: () => void;
}

type WellnessViewMode = "radar" | "trend";

const DashboardContent = ({ 
  currentChild,
  currentChildId,
  latestInsight,
  insightLoading,
  fetchHistoricalInsights,
  historicalInsights,
  historicalLoading,
  isFallbackData,
  hasInsufficientData,
  todayEntry,
  journalLoading,
  connectionError,
  isDbConnected,
  isDevelopment,
  insertSampleData
}: DashboardContentProps) => {
  const [wellnessView, setWellnessView] = useState<WellnessViewMode>("trend");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    if (currentChildId) {
      console.log("[DashboardContent-DEBUG] Fetching historical insights on mount/child change");
      fetchHistoricalInsights("weekly", currentWeekStart);
    }
  }, [currentChildId, currentWeekStart, fetchHistoricalInsights]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleResetToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="lg:hidden mb-6">
          <StatsSidebar currentChild={currentChild} />
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6">
          <main className="w-full lg:w-3/4 space-y-6">
            <HeaderIllustration />
            
            <DailyActivities 
              currentChild={currentChild} 
              currentChildId={currentChildId} 
            />
            
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-sprout-purple/10">
              <EmotionalGrowthInsights 
                currentChild={currentChild} 
                insight={latestInsight}
                loading={insightLoading}
                fetchHistoricalInsights={fetchHistoricalInsights}
                historicalInsights={historicalInsights}
                historicalLoading={historicalLoading}
                isFallbackData={isFallbackData}
                hasInsufficientData={hasInsufficientData}
                currentWeekStart={currentWeekStart}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onResetWeek={handleResetToCurrentWeek}
              />
              
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Wellness Trends</h3>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={wellnessView === "radar" ? "default" : "outline"}
                      onClick={() => setWellnessView("radar")}
                      className="rounded-full text-xs"
                    >
                      <List className="h-4 w-4 mr-1" /> Snapshot
                    </Button>
                    <Button 
                      size="sm" 
                      variant={wellnessView === "trend" ? "default" : "outline"}
                      onClick={() => setWellnessView("trend")}
                      className="rounded-full text-xs"
                    >
                      <BarChart2 className="h-4 w-4 mr-1" /> Trends
                    </Button>
                  </div>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  {wellnessView === "radar" ? (
                    <WellnessRadarChart 
                      journalEntry={todayEntry} 
                      loading={journalLoading} 
                    />
                  ) : (
                    <WellnessTrendChart 
                      childId={currentChildId}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {isDevelopment && (
              <DevelopmentTools 
                isFallbackData={isFallbackData}
                connectionError={connectionError}
                isDbConnected={isDbConnected}
                isDevelopment={isDevelopment}
                insertSampleData={insertSampleData}
              />
            )}
          </main>

          <aside className="hidden lg:block w-64 space-y-4">
            <StatsSidebar currentChild={currentChild} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
