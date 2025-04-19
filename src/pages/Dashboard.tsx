
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
import { JournalEntry } from "@/types/journal";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardContent from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [journalLoading, setJournalLoading] = useState(true);
  const isDevelopment = import.meta.env.DEV;
  const { toast } = useToast();
  
  const stableChildId = useCallback(() => currentChildId, [currentChildId]);

  const { 
    latestInsight, 
    loading: insightLoading,
    fetchHistoricalInsights: fetchInsights,
    historicalInsights,
    historicalLoading,
    isFallbackData,
    hasInsufficientData,
    insertSampleData,
    connectionError
  } = useEmotionalInsights(stableChildId());
  
  const { 
    getTodayEntry, 
    todayEntryLoaded, 
    cachedTodayEntry 
  } = useJournalEntries(currentChildId);
  
  const fetchHistoricalInsights = useCallback(async (period: Period) => {
    return await fetchInsights(period);
  }, [fetchInsights]);
  
  useEffect(() => {
    const fetchTodayEntry = async () => {
      if (currentChildId) {
        setJournalLoading(true);
        try {
          console.log("Dashboard: Fetching today's journal entry for childId:", currentChildId);
          const entry = await getTodayEntry();
          console.log("Dashboard: Retrieved today's entry:", entry);
          setTodayEntry(entry);
        } catch (error) {
          console.error("Dashboard: Error fetching today's journal entry:", error);
        } finally {
          setJournalLoading(false);
        }
      }
    };
    
    fetchTodayEntry();
  }, [currentChildId, getTodayEntry]);
  
  useEffect(() => {
    if (cachedTodayEntry && todayEntryLoaded) {
      console.log("Dashboard: Using cached today entry:", cachedTodayEntry);
      setTodayEntry(cachedTodayEntry);
      setJournalLoading(false);
    }
  }, [cachedTodayEntry, todayEntryLoaded]);
  
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
