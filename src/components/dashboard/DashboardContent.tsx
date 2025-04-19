import { useState, useEffect } from "react";
import { startOfWeek, addWeeks } from "date-fns";
import { ChildProfile } from "@/types/childProfile";
import { JournalEntry } from "@/types/journal";
import { Period } from "@/types/emotionalInsights";
import DailyActivities from "./DailyActivities";
import StatsSidebar from "./stats/StatsSidebar";
import HeaderIllustration from "./HeaderIllustration";
import MainContent from "./main/MainContent";

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
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const handlePrevWeek = () => setCurrentWeekStart(w => addWeeks(w, -1));
  const handleNextWeek = () => setCurrentWeekStart(w => addWeeks(w, 1));
  const handleResetWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (currentChildId) {
      fetchHistoricalInsights("weekly", currentWeekStart);
    }
  }, [currentChildId, currentWeekStart, fetchHistoricalInsights]);

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
            <MainContent 
              currentChild={currentChild}
              currentChildId={currentChildId}
              latestInsight={latestInsight}
              insightLoading={insightLoading}
              fetchHistoricalInsights={fetchHistoricalInsights}
              historicalInsights={historicalInsights}
              historicalLoading={historicalLoading}
              isFallbackData={isFallbackData}
              hasInsufficientData={hasInsufficientData}
              todayEntry={todayEntry}
              journalLoading={journalLoading}
              connectionError={connectionError}
              isDbConnected={isDbConnected}
              isDevelopment={isDevelopment}
              insertSampleData={insertSampleData}
              currentWeekStart={currentWeekStart}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onResetWeek={handleResetWeek}
            />
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
