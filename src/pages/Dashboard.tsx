
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect, useCallback } from "react";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const { latestInsight, loading: insightLoading } = useEmotionalInsights(currentChildId);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a timeout to ensure loading state doesn't get stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loading for max 2 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Once we have child profiles data or timeout occurs, stop loading
  useEffect(() => {
    if (childProfiles.length > 0 || !currentChildId) {
      setIsLoading(false);
    }
  }, [childProfiles, currentChildId]);
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner message="Loading your dashboard..." />
          </div>
        ) : (
          <>
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
                    
                    {currentChild && (
                      <EmotionalGrowthInsights 
                        currentChild={currentChild} 
                        insight={latestInsight}
                        loading={insightLoading}
                      />
                    )}
                  </>
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
