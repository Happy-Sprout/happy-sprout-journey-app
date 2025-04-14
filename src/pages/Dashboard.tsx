import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const { 
    latestInsight, 
    loading: insightLoading,
    fetchHistoricalInsights,
    historicalInsights,
    historicalLoading,
    isFallbackData,
    hasInsufficientData,
    insertSampleData
  } = useEmotionalInsights(currentChildId);
  const [isLoading, setIsLoading] = useState(true);
  const isDevelopment = import.meta.env.DEV;
  
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
                      <>
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
                        
                        {isFallbackData && isDevelopment && (
                          <div className="mb-8 flex justify-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={insertSampleData}
                              className="flex items-center gap-1 text-sm text-muted-foreground"
                            >
                              <Beaker className="h-4 w-4" />
                              Generate Sample Emotional Data
                            </Button>
                          </div>
                        )}
                      </>
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
