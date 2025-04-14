import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { warningToast } from "@/components/ui/toast-extensions";

export type EmotionalInsight = {
  id: string;
  child_id: string;
  self_awareness: number;
  self_management: number;
  social_awareness: number;
  relationship_skills: number;
  responsible_decision_making: number;
  created_at: string;
};

export type Period = 'weekly' | 'monthly' | 'all';

// Constants and configuration
const MIN_DATA_POINTS_FOR_CHART = 2; // Minimum number of data points needed for a meaningful chart
const IS_DEVELOPMENT = import.meta.env.DEV; // Check if we're in development mode

// Sample data as fallback for when fetching fails (only for development)
const sampleInsightsData: EmotionalInsight[] = [
  {
    id: 'sample-1',
    child_id: 'sample-child',
    self_awareness: 0.65,
    self_management: 0.70,
    social_awareness: 0.60,
    relationship_skills: 0.55,
    responsible_decision_making: 0.68,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: 'sample-2',
    child_id: 'sample-child',
    self_awareness: 0.68,
    self_management: 0.72,
    social_awareness: 0.62,
    relationship_skills: 0.58,
    responsible_decision_making: 0.70,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'sample-3',
    child_id: 'sample-child',
    self_awareness: 0.72,
    self_management: 0.75,
    social_awareness: 0.65,
    relationship_skills: 0.60,
    responsible_decision_making: 0.73,
    created_at: new Date().toISOString() // today
  }
];

export const useEmotionalInsights = (childId: string | undefined) => {
  const [insights, setInsights] = useState<EmotionalInsight[]>([]);
  const [latestInsight, setLatestInsight] = useState<EmotionalInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [historicalInsights, setHistoricalInsights] = useState<EmotionalInsight[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [hasInsufficientData, setHasInsufficientData] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (childId) {
      fetchInsights();
    } else {
      // Reset data if no childId is provided
      setInsights([]);
      setLatestInsight(null);
      setIsFallbackData(false);
      setHasInsufficientData(false);
      setConnectionError(false);
    }
  }, [childId]);

  const fetchInsights = async () => {
    if (!childId) return;
    
    setLoading(true);
    setIsFallbackData(false);
    setHasInsufficientData(false);
    setConnectionError(false);
    
    try {
      console.log("Fetching insights for child ID:", childId);
      
      // Check if the database is available by making a simple query
      const { error: pingError } = await supabase.from('sel_insights').select('count(*)').limit(1);
      
      if (pingError) {
        console.error("Database connection check failed:", pingError);
        throw new Error("Database connection failed");
      }
      
      // Fetch the 10 most recent insights
      const { data, error } = await supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Error fetching emotional insights:", error);
        throw error;
      }
      
      console.log("Fetched insights data:", data);
      
      if (data && data.length > 0) {
        // Sort data by date (newest first) for consistency
        const sortedData = [...data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setInsights(sortedData);
        setLatestInsight(sortedData[0]); // Most recent insight
      } else {
        console.log("No insights found in database");
        setHasInsufficientData(true);
        
        // Only use sample data in development, not for end users
        if (IS_DEVELOPMENT) {
          console.log("Using sample data for development");
          // Create sample data with the actual childId
          const sampleData = sampleInsightsData.map(item => ({
            ...item,
            child_id: childId
          }));
          
          setInsights(sampleData);
          setLatestInsight(sampleData[sampleData.length - 1]);
          setIsFallbackData(true);
        } else {
          setInsights([]);
          setLatestInsight(null);
        }
      }
    } catch (error) {
      console.error("Error in fetchInsights:", error);
      setHasInsufficientData(true);
      setConnectionError(true);
      
      // Only use sample data in development, not for end users
      if (IS_DEVELOPMENT) {
        // Create sample data with the actual childId
        const sampleData = sampleInsightsData.map(item => ({
          ...item,
          child_id: childId
        }));
        
        // Use sample data as fallback in development
        setInsights(sampleData);
        setLatestInsight(sampleData[sampleData.length - 1]);
        setIsFallbackData(true);
      } else {
        setInsights([]);
        setLatestInsight(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalInsights = async (period: Period = 'weekly') => {
    if (!childId) return;
    
    setHistoricalLoading(true);
    setHasInsufficientData(false);
    
    try {
      console.log(`Fetching historical insights for period: ${period}, childId: ${childId}`);
      
      // Define date range based on period
      let startDate: string | null = null;
      const now = new Date();
      
      if (period === 'weekly') {
        // Last 4 weeks
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(now.getDate() - 28);
        startDate = fourWeeksAgo.toISOString();
      } else if (period === 'monthly') {
        // Last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        startDate = sixMonthsAgo.toISOString();
      }
      
      // Build query
      let query = supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: true });
      
      // Add date filter if needed
      if (startDate && period !== 'all') {
        query = query.gte('created_at', startDate);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching historical insights:", error);
        throw error;
      }
      
      console.log("Fetched historical data:", data);
      
      if (data && data.length >= MIN_DATA_POINTS_FOR_CHART) {
        // We have enough real data to show a meaningful chart
        // Sort the data by date to ensure chronological order (oldest first)
        const sortedData = [...data].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        console.log("Sorted historical data:", sortedData);
        
        setHistoricalInsights(sortedData);
        setIsFallbackData(false);
        setHasInsufficientData(false);
        setConnectionError(false);
      } else {
        console.log(`Insufficient data for ${period} chart (need at least ${MIN_DATA_POINTS_FOR_CHART} points)`);
        setHasInsufficientData(true);
        
        // Only use sample data in development mode
        if (IS_DEVELOPMENT) {
          console.log("Using sample historical data for development");
          const sampleHistorical = generateSampleHistoricalData(period, childId);
          console.log("Generated sample historical data:", sampleHistorical);
          setHistoricalInsights(sampleHistorical);
          setIsFallbackData(true);
        } else {
          // For production, just set empty array to show "not enough data" message
          setHistoricalInsights([]);
        }
      }
    } catch (error) {
      console.error("Error in fetchHistoricalInsights:", error);
      setHasInsufficientData(true);
      setConnectionError(true);
      
      // Only use sample data in development
      if (IS_DEVELOPMENT) {
        // Use sample historical data as fallback in development
        const sampleHistorical = generateSampleHistoricalData(period, childId);
        setHistoricalInsights(sampleHistorical);
        setIsFallbackData(true);
      } else {
        setHistoricalInsights([]);
      }
    } finally {
      setHistoricalLoading(false);
    }
  };
  
  // Helper function to generate appropriate sample historical data
  const generateSampleHistoricalData = (period: Period, childId: string): EmotionalInsight[] => {
    const now = new Date();
    const sampleData: EmotionalInsight[] = [];
    
    const dataPoints = period === 'weekly' ? 14 : period === 'monthly' ? 24 : 30;
    const intervalDays = period === 'weekly' ? 2 : period === 'monthly' ? 7 : 14;
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * intervalDays));
      
      // Create slightly varying data to simulate progress
      const progress = i / dataPoints; // Higher for older entries (to show improvement)
      
      sampleData.push({
        id: `sample-historical-${i}`,
        child_id: childId,
        self_awareness: 0.4 + (0.4 * (1 - progress)) + (Math.random() * 0.1),
        self_management: 0.45 + (0.35 * (1 - progress)) + (Math.random() * 0.1),
        social_awareness: 0.5 + (0.3 * (1 - progress)) + (Math.random() * 0.1),
        relationship_skills: 0.4 + (0.35 * (1 - progress)) + (Math.random() * 0.1),
        responsible_decision_making: 0.45 + (0.4 * (1 - progress)) + (Math.random() * 0.1),
        created_at: date.toISOString()
      });
    }
    
    // Sort by date (oldest first)
    return sampleData.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  const analyzeEntry = async (journalText?: string, checkInText?: string) => {
    if (!childId) return null;
    
    try {
      console.log("Analyzing entry for childId:", childId);
      console.log("Journal text sample:", journalText?.substring(0, 50));
      console.log("Check-in text sample:", checkInText?.substring(0, 50));
      
      // Now let's create a sample insight for demonstration purposes
      const newInsight = {
        id: `generated-${Date.now()}`,
        child_id: childId,
        self_awareness: Math.random() * 0.3 + 0.6, // Random value between 0.6 and 0.9
        self_management: Math.random() * 0.3 + 0.6,
        social_awareness: Math.random() * 0.3 + 0.6,
        relationship_skills: Math.random() * 0.3 + 0.6,
        responsible_decision_making: Math.random() * 0.3 + 0.6,
        created_at: new Date().toISOString(),
        source_text: (journalText || '') + ' ' + (checkInText || '')
      };

      // Try to insert the sample insight into the database
      const { data, error } = await supabase
        .from('sel_insights')
        .insert([newInsight])
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting generated insight:", error);
        // For demo, still return the insight even if we couldn't save it
        return newInsight;
      }
      
      console.log("Successfully inserted new insight:", data);
      
      // Refresh insights after successful insertion
      await fetchInsights();
      return data;
    } catch (error) {
      console.error("Error in analyzeEntry:", error);
      return null;
    }
  };

  // Function to insert sample data for testing - ONLY available in development mode
  const insertSampleData = async () => {
    if (!childId || !IS_DEVELOPMENT) return;
    
    try {
      // Check if data already exists
      const { data, error } = await supabase
        .from('sel_insights')
        .select('id')
        .eq('child_id', childId)
        .limit(1);
        
      if (error) {
        console.error("Error checking for existing insights:", error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Insights already exist for this child, not adding samples");
        return;
      }
      
      // Generate sample data with proper child_id
      const samples = generateSampleHistoricalData('monthly', childId);
      
      // Insert samples
      const { error: insertError } = await supabase
        .from('sel_insights')
        .insert(samples);
        
      if (insertError) {
        console.error("Error inserting sample insights:", insertError);
      } else {
        console.log("Successfully inserted sample insights");
        // Refresh data
        await fetchInsights();
        setIsFallbackData(false);
      }
    } catch (error) {
      console.error("Error in insertSampleData:", error);
    }
  };

  return {
    insights,
    latestInsight,
    loading,
    fetchInsights,
    analyzeEntry,
    fetchHistoricalInsights,
    historicalInsights,
    historicalLoading,
    isFallbackData,
    hasInsufficientData,
    insertSampleData,
    connectionError
  };
};
