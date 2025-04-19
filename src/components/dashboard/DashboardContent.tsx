import { ChildProfile } from "@/types/childProfile";
import { JournalEntry } from "@/types/journal";
import WelcomeHeader from "./WelcomeHeader";
import EmotionalGrowthInsights from "./EmotionalGrowthInsights";
import WellnessRadarChart from "../wellness/WellnessRadarChart";
import AchievementsSection from "./AchievementsSection";
import DevelopmentTools from "./DevelopmentTools";
import HeaderIllustration from "./HeaderIllustration";
import { Period } from "@/hooks/useEmotionalInsights";
import DailyActivities from "./DailyActivities";
import StatsSidebar from "./stats/StatsSidebar";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Stats sidebar for mobile */}
      <div className="lg:hidden mb-6">
        <StatsSidebar currentChild={currentChild} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <main className="lg:col-span-2 space-y-6">
          <HeaderIllustration />
          <WelcomeHeader currentChild={currentChild} />
          
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
        </main>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block space-y-6">
          <StatsSidebar currentChild={currentChild} />
        </aside>
      </div>
    </div>
  );
};

export default DashboardContent;
