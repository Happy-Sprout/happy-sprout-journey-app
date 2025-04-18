import { useUser } from "@/contexts/UserContext";
import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import NoActiveChildPrompt from "@/components/dashboard/NoActiveChildPrompt";
import ChildProfileSelector from "@/components/dashboard/ChildProfileSelector";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import AchievementsSection from "@/components/dashboard/AchievementsSection";
import WelcomePrompt from "@/components/dashboard/WelcomePrompt";
import EmotionalGrowthInsights from "@/components/dashboard/EmotionalGrowthInsights";
import { useEmotionalInsights } from "@/hooks/useEmotionalInsights";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDevelopment = import.meta.env.DEV;
  const { toast } = useToast();
  
  // Memoize child ID to prevent unnecessary re-renders of useEmotionalInsights
  const stableChildId = useCallback(() => currentChildId, [currentChildId]);

  // Use the stable child ID reference for the emotional insights hook
  const { 
    latestInsight, 
    loading: insightLoading,
    fetchHistoricalInsights,
    historicalInsights,
    historicalLoading,
    isFallbackData,
    hasInsufficientData,
    insertSampleData,
    connectionError
  } = useEmotionalInsights(stableChildId());
  
  // Check database connection only once on mount or when in development mode
  useEffect(() => {
    let isMounted = true;
    const checkDbConnection = async () => {
      try {
        const { error } = await supabase.from('sel_insights').select('id').limit(1);
        if (isMounted) {
          setIsDbConnected(!error);
          
          if (error && isDevelopment) {
            console.error("Database connection error:", error);
            toast({
              title: "Database connection error",
              description: "Using sample data for development purposes.",
              variant: "default",
              className: "bg-amber-50 border-amber-200 text-amber-800",
            });
          }
        }
      } catch (err) {
        console.error("Error checking database connection:", err);
        if (isMounted) {
          setIsDbConnected(false);
        }
      }
    };
    
    checkDbConnection();
    
    return () => {
      isMounted = false;
    };
  }, [isDevelopment, toast]);
  
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

  // Handle offline mode or connection errors with sample data in development
  useEffect(() => {
    if ((connectionError || isDbConnected === false) && isDevelopment) {
      toast({
        title: "Database connection error",
        description: "Using sample data for development purposes.",
        variant: "default",
        className: "bg-amber-50 border-amber-200 text-amber-800",
      });
    }
  }, [connectionError, isDbConnected, isDevelopment, toast]);
  
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
                    
                    {/* Emotional Growth Insights now appears before Achievements */}
                    {currentChild && (
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
                    )}

                    <AchievementsSection 
                      currentChild={currentChild}
                      currentChildId={currentChildId!}
                    />
                    
                    {/* Sample data generation button for development */}
                    {((isFallbackData || connectionError || isDbConnected === false) && isDevelopment) && (
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
      </div>
    </Layout>
  );
};

export default Dashboard;
