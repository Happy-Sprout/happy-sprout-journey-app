
import { ChildProfile } from "@/types/childProfile";
import { JournalEntry } from "@/types/journal";
import { Period } from "@/hooks/useEmotionalInsights";
import EmotionalGrowthInsights from "../EmotionalGrowthInsights";
import WellnessSection from "../wellness/WellnessSection";
import DailyActivities from "../DailyActivities";
import HeaderIllustration from "../HeaderIllustration";
import DevelopmentTools from "../DevelopmentTools";
import { useState } from "react";

interface MainContentProps {
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
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
}

const MainContent = ({
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
  insertSampleData,
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onResetWeek
}: MainContentProps) => {
  const [wellnessView, setWellnessView] = useState<"radar" | "trend">("trend");

  return (
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
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onResetWeek={onResetWeek}
      />
      
      <WellnessSection 
        wellnessView={wellnessView}
        setWellnessView={setWellnessView}
        todayEntry={todayEntry}
        journalLoading={journalLoading}
        currentChildId={currentChildId}
      />

      {isDevelopment && (
        <DevelopmentTools 
          isFallbackData={isFallbackData}
          connectionError={connectionError}
          isDbConnected={isDbConnected}
          isDevelopment={isDevelopment}
          insertSampleData={insertSampleData}
        />
      )}
    </div>
  );
};

export default MainContent;
