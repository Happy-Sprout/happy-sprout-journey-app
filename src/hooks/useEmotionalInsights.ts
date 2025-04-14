
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

// Sample data as fallback for when fetching fails
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

  useEffect(() => {
    if (childId) {
      fetchInsights();
    }
  }, [childId]);

  const fetchInsights = async () => {
    if (!childId) return;
    
    setLoading(true);
    setIsFallbackData(false);
    
    try {
      // Fetch the 10 most recent insights
      const { data, error } = await supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching emotional insights:", error);
        warningToast({
          title: "Error",
          description: "Could not fetch emotional growth insights. Using sample data instead."
        });
        
        // Use sample data as fallback
        setInsights(sampleInsightsData);
        setLatestInsight(sampleInsightsData[sampleInsightsData.length - 1]); // Most recent
        setIsFallbackData(true);
        return;
      }
      
      if (data && data.length > 0) {
        setInsights(data);
        setLatestInsight(data[0]); // Most recent insight
      } else {
        // No data, use samples
        setInsights(sampleInsightsData);
        setLatestInsight(sampleInsightsData[sampleInsightsData.length - 1]);
        setIsFallbackData(true);
      }
    } catch (error) {
      console.error("Error in fetchInsights:", error);
      warningToast({
        title: "Error",
        description: "Failed to fetch emotional growth insights. Using sample data instead."
      });
      
      // Use sample data as fallback
      setInsights(sampleInsightsData);
      setLatestInsight(sampleInsightsData[sampleInsightsData.length - 1]);
      setIsFallbackData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalInsights = async (period: Period = 'weekly') => {
    if (!childId && !isFallbackData) return;
    
    setHistoricalLoading(true);
    
    try {
      // If we're already using fallback data, generate more sample data for historical view
      if (isFallbackData) {
        // Generate appropriate sample data based on period
        const sampleHistorical = generateSampleHistoricalData(period);
        setHistoricalInsights(sampleHistorical);
        setHistoricalLoading(false);
        return;
      }
      
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
        // Use sample historical data as fallback
        const sampleHistorical = generateSampleHistoricalData(period);
        setHistoricalInsights(sampleHistorical);
        setIsFallbackData(true);
        return;
      }
      
      if (data && data.length > 0) {
        setHistoricalInsights(data);
      } else {
        // No real data, use samples
        const sampleHistorical = generateSampleHistoricalData(period);
        setHistoricalInsights(sampleHistorical);
        setIsFallbackData(true);
      }
    } catch (error) {
      console.error("Error in fetchHistoricalInsights:", error);
      // Use sample historical data as fallback
      const sampleHistorical = generateSampleHistoricalData(period);
      setHistoricalInsights(sampleHistorical);
      setIsFallbackData(true);
    } finally {
      setHistoricalLoading(false);
    }
  };
  
  // Helper function to generate appropriate sample historical data
  const generateSampleHistoricalData = (period: Period): EmotionalInsight[] => {
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
        child_id: childId || 'sample-child',
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
      const response = await fetch(
        'https://ghucegvhempgmdykosiw.functions.supabase.co/analyze-emotional-growth',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
          },
          body: JSON.stringify({
            journalText,
            checkInText,
            childId
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error analyzing entry:", errorData);
        return null;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Refresh insights after successful analysis
        await fetchInsights();
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error("Error in analyzeEntry:", error);
      return null;
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
    isFallbackData
  };
};
