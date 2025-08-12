import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Simplified types
export interface EmotionalInsight {
  id: string;
  child_id: string;
  self_awareness: number;
  self_management: number;
  social_awareness: number;
  relationship_skills: number;
  responsible_decision_making: number;
  created_at: string;
  source_text?: string;
  display_date?: string;
}

export type Period = 'daily' | 'weekly' | 'monthly';

export const useEmotionalInsightsSimple = (childId: string | undefined) => {
  const [latestInsight, setLatestInsight] = useState<EmotionalInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [hasInsufficientData, setHasInsufficientData] = useState(false);
  const [isFallbackData, setIsFallbackData] = useState(false);

  // Simple fetch function without complex dependencies
  const fetchLatestInsight = useCallback(async () => {
    if (!childId) {
      setLatestInsight(null);
      return;
    }

    setLoading(true);
    setConnectionError(false);
    
    try {
      // Simple query for latest insight
      const { data, error } = await supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setLatestInsight(data[0]);
        setHasInsufficientData(false);
        setIsFallbackData(false);
      } else {
        // Simple fallback data with more realistic values
        const sampleInsight: EmotionalInsight = {
          id: `sample-${childId}`,
          child_id: childId,
          self_awareness: 0.82,
          self_management: 0.78,
          social_awareness: 0.85,
          relationship_skills: 0.88,
          responsible_decision_making: 0.76,
          created_at: new Date().toISOString(),
          source_text: "Sample emotional growth data for development",
          display_date: new Date().toISOString().split('T')[0]
        };
        
        setLatestInsight(sampleInsight);
        setHasInsufficientData(true);
        setIsFallbackData(true);
      }
    } catch (error) {
      setConnectionError(true);
      setHasInsufficientData(true);
      
      // Fallback data on error with more realistic values
      const fallbackInsight: EmotionalInsight = {
        id: `fallback-${childId}`,
        child_id: childId,
        self_awareness: 0.80,
        self_management: 0.75,
        social_awareness: 0.83,
        relationship_skills: 0.86,
        responsible_decision_making: 0.72,
        created_at: new Date().toISOString(),
        source_text: "Fallback emotional growth data",
        display_date: new Date().toISOString().split('T')[0]
      };
      
      setLatestInsight(fallbackInsight);
      setIsFallbackData(true);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Simple effect - only runs when childId changes
  useEffect(() => {
    if (childId) {
      fetchLatestInsight();
    } else {
      setLatestInsight(null);
      setHasInsufficientData(false);
      setConnectionError(false);
      setIsFallbackData(false);
    }
  }, [childId, fetchLatestInsight]);

  return {
    latestInsight,
    loading,
    connectionError,
    hasInsufficientData,
    isFallbackData,
    refetch: fetchLatestInsight
  };
};
