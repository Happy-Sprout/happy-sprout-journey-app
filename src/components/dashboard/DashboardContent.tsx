
import { ChildProfile } from "@/types/childProfile";
import { JournalEntry } from "@/types/journal";
import WelcomeHeader from "./WelcomeHeader";
import StatsCards from "./StatsCards";
import EmotionalGrowthInsights from "./EmotionalGrowthInsights";
import WellnessRadarChart from "../wellness/WellnessRadarChart";
import AchievementsSection from "./AchievementsSection";
import DevelopmentTools from "./DevelopmentTools";
import HeaderIllustration from "./HeaderIllustration";
import { Period } from "@/hooks/useEmotionalInsights";

interface DashboardContentProps {
  currentChild: ChildProfile;
  currentChildId: string;
  latestInsight: any;
  insightLoading: boolean;
  fetchHistoricalInsights: (period: Period) => Promise<void>;
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
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <HeaderIllustration />
      <WelcomeHeader currentChild={currentChild} />
      <StatsCards currentChild={currentChild} />
      
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-8 border border-sprout-purple/10">
        <EmotionalGrowthInsights 
          currentChild={currentChild} 
          insight={latestInsight}
          loading={insightLoading}
          fetchHistoricalInsights={fetchHistoricalInsights}
          historicalInsights={historicalInsights}
          historicalLoading={historicalLoading}
          isFallbackData={isFallbackData}
          hasInsufficientData={hasInsufficientData}
        />
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Wellness</h3>
          <div className="max-w-3xl mx-auto">
            <WellnessRadarChart 
              journalEntry={todayEntry} 
              loading={journalLoading} 
            />
          </div>
        </div>
      </div>

      <AchievementsSection 
        currentChild={currentChild}
        currentChildId={currentChildId}
      />
      
      <DevelopmentTools 
        isFallbackData={isFallbackData}
        connectionError={connectionError}
        isDbConnected={isDbConnected}
        isDevelopment={isDevelopment}
        insertSampleData={insertSampleData}
      />
    </div>
  );
};

export default DashboardContent;
