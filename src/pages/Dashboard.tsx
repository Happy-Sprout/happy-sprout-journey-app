
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import NoActiveChildPrompt from "@/components/dashboard/NoActiveChildPrompt";
import ChildProfileSelector from "@/components/dashboard/ChildProfileSelector";
import WelcomePrompt from "@/components/dashboard/WelcomePrompt";
import { useEmotionalInsights, Period } from "@/hooks/useEmotionalInsights";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardContent from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDevelopment = import.meta.env.DEV;
  const { toast } = useToast();
  
  console.log("[Dashboard-DEBUG] Current child ID:", currentChildId);
  console.log("[Dashboard-DEBUG] Current child:", currentChild);
  
  // Make the child ID stable to prevent unnecessary re-fetches
  const stableChildId = useCallback(() => {
    console.log("[Dashboard-DEBUG] Using stable child ID:", currentChildId);
    return currentChildId;
  }, [currentChildId]);

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
  
  // Log the emotional insights state for debugging
  useEffect(() => {
    console.log("[Dashboard-DEBUG] Latest insight:", latestInsight);
    console.log("[Dashboard-DEBUG] Historical insights count:", historicalInsights?.length || 0);
    console.log("[Dashboard-DEBUG] Insight loading:", insightLoading);
    console.log("[Dashboard-DEBUG] Historical loading:", historicalLoading);
    console.log("[Dashboard-DEBUG] Has insufficient data:", hasInsufficientData);
    console.log("[Dashboard-DEBUG] Is fallback data:", isFallbackData);
  }, [latestInsight, historicalInsights, insightLoading, historicalLoading, hasInsufficientData, isFallbackData]);
  
  const { 
    getTodayEntry, 
    todayEntryLoaded, 
    cachedTodayEntry,
    isCheckingTodayEntry
  } = useJournalEntries(currentChildId);
  
  // Ensure the date is properly passed to fetchHistoricalInsights
  const fetchHistoricalInsightsWithDate = useCallback(async (period: Period, startDate?: Date) => {
    console.log(`[Dashboard-DEBUG] Fetching insights for period: ${period}, date:`, startDate);
    
    if (!startDate) {
      console.log(`[Dashboard-DEBUG] No start date provided, using current week`);
    } else {
      console.log(`[Dashboard-DEBUG] Start date provided:`, startDate.toISOString());
    }
    
    // Make sure we pass the actual startDate to the hook
    return await fetchHistoricalInsights(period, startDate);
  }, [fetchHistoricalInsights]);

  useEffect(() => {
    let isMounted = true;
    const checkDbConnection = async () => {
      try {
        const { error } = await supabase.from('sel_insights').select('id').limit(1);
        if (isMounted) {
          setIsDbConnected(!error);
          
          if (error && isDevelopment) {
            console.error("[Dashboard-DEBUG] Database connection check failed:", error);
            toast({
              title: "Database connection error",
              description: "Using sample data for development purposes.",
              variant: "default",
              className: "bg-amber-50 border-amber-200 text-amber-800",
            });
          }
        }
      } catch (err) {
        console.error("[Dashboard-DEBUG] Error checking database connection:", err);
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (childProfiles.length > 0 || !currentChildId) {
      setIsLoading(false);
    }
  }, [childProfiles, currentChildId]);

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
      <div className="bg-sprout-cream min-h-screen">
        {isLoading ? (
          <DashboardLoading />
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
                  <DashboardContent 
                    currentChild={currentChild}
                    currentChildId={currentChildId!}
                    latestInsight={latestInsight}
                    insightLoading={insightLoading}
                    fetchHistoricalInsights={fetchHistoricalInsightsWithDate}
                    historicalInsights={historicalInsights}
                    historicalLoading={historicalLoading}
                    isFallbackData={isFallbackData}
                    hasInsufficientData={hasInsufficientData}
                    todayEntry={cachedTodayEntry}
                    journalLoading={isCheckingTodayEntry}
                    connectionError={connectionError}
                    isDbConnected={isDbConnected}
                    isDevelopment={isDevelopment}
                    insertSampleData={insertSampleData}
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
