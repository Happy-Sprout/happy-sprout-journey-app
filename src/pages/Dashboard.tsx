import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useUser } from "@/contexts/UserContext";
import { useEmotionalInsightsSimple } from "@/hooks/useEmotionalInsights-simple";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import DashboardContent from "@/components/dashboard/DashboardContent";
import WelcomePrompt from "@/components/dashboard/WelcomePrompt";
import NoActiveChildPrompt from "@/components/dashboard/NoActiveChildPrompt";
import ChildProfileSelector from "@/components/dashboard/ChildProfileSelector";
import DashboardLoading from "@/components/dashboard/DashboardLoading";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId, loading } = useUser();
  const currentChild = getCurrentChild();
  const [componentReady, setComponentReady] = useState(false);
  
  // Add back emotional insights with simplified hook
  const { 
    latestInsight, 
    loading: insightLoading, 
    connectionError,
    hasInsufficientData,
    isFallbackData
  } = useEmotionalInsightsSimple(currentChildId);

  // Add journal entries hook back
  const { 
    cachedTodayEntry,
    isCheckingTodayEntry
  } = useJournalEntries(currentChildId);

  useEffect(() => {
    // Give context time to load
    const timer = setTimeout(() => {
      setComponentReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!componentReady) {
    return (
      <Layout requireAuth>
        <DashboardLoading />
      </Layout>
    );
  }

  // Simple mock function for historical insights (since we're not using the complex hook)
  const mockFetchHistoricalInsights = async () => {
    return Promise.resolve();
  };

  return (
    <Layout requireAuth>
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
              fetchHistoricalInsights={mockFetchHistoricalInsights}
              historicalInsights={[]}
              historicalLoading={false}
              isFallbackData={isFallbackData}
              hasInsufficientData={hasInsufficientData}
              todayEntry={cachedTodayEntry}
              journalLoading={isCheckingTodayEntry}
              connectionError={connectionError}
              isDbConnected={!connectionError}
              isDevelopment={import.meta.env.DEV}
              insertSampleData={() => {}}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
