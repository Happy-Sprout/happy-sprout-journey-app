
import { ChildProfile } from "@/types/childProfile";
import { JournalEntry } from "@/types/journal";
import WelcomeHeader from "./WelcomeHeader";
import StatsCards from "./StatsCards";
import EmotionalGrowthInsights from "./EmotionalGrowthInsights";
import WellnessRadarChart from "../wellness/WellnessRadarChart";
import AchievementsSection from "./AchievementsSection";
import DevelopmentTools from "./DevelopmentTools";
import HeaderIllustration from "./HeaderIllustration";

interface DashboardContentProps {
  currentChild: ChildProfile;
  currentChildId: string;
  latestInsight: any;
  insightLoading: boolean;
  fetchHistoricalInsights: () => void;
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
    <div className="max-w-4xl mx-auto">
      <HeaderIllustration />
      <WelcomeHeader currentChild={currentChild} />
      <StatsCards currentChild={currentChild} />
      
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
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
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Today's Wellness</h3>
          <WellnessRadarChart 
            journalEntry={todayEntry} 
            loading={journalLoading} 
          />
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
