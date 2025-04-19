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
import WellnessRadarChart from "@/components/wellness/WellnessRadarChart";
import { useEmotionalInsights } from "@/hooks/useEmotionalInsights";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/journal";
import HeaderIllustration from "@/components/dashboard/HeaderIllustration";

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
    fetchHistoricalInsights,
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
    const todayString = new Date().toISOString().split('T')[0];
    console.log("Dashboard: Today's ISO date string:", todayString);
    if (todayEntry) {
      console.log("Dashboard: Today's entry date:", todayEntry.date);
      console.log("Dashboard: Date match?", todayEntry.date === todayString);
    }
  }, [todayEntry]);
  
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
                      currentChildId={currentChildId!}
                    />
                    
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
                  </div>
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
