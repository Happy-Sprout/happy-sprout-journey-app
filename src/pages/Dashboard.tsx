
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import NoActiveChildPrompt from "@/components/dashboard/NoActiveChildPrompt";
import ChildProfileSelector from "@/components/dashboard/ChildProfileSelector";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import DailyActivities from "@/components/dashboard/DailyActivities";
import AchievementsSection from "@/components/dashboard/AchievementsSection";
import WelcomePrompt from "@/components/dashboard/WelcomePrompt";
import EmotionalGrowthInsights from "@/components/dashboard/EmotionalGrowthInsights";
import { useEmotionalInsights } from "@/hooks/useEmotionalInsights";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const { latestInsight, loading } = useEmotionalInsights(currentChildId);
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4">
        {childProfiles.length === 0 ? (
          <WelcomePrompt />
        ) : (
          <>
            {(!currentChildId || !getCurrentChild()) && childProfiles.length > 0 ? (
              <NoActiveChildPrompt />
            ) : null}
            
            {!currentChildId && childProfiles.length > 0 && (
              <ChildProfileSelector />
            )}
            
            {currentChild && (
              <>
                <WelcomeHeader currentChild={currentChild} />
                
                <StatsCards currentChild={currentChild} />
                
                <DailyActivities 
                  currentChild={currentChild}
                  currentChildId={currentChildId!}
                />

                <AchievementsSection 
                  currentChild={currentChild}
                  currentChildId={currentChildId!}
                />
                
                {/* Add Emotional Growth Insights section */}
                {currentChild && (
                  <EmotionalGrowthInsights 
                    currentChild={currentChild} 
                    insight={latestInsight}
                    loading={loading}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
