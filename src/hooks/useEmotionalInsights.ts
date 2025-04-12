
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

export const useEmotionalInsights = (childId: string | undefined) => {
  const [insights, setInsights] = useState<EmotionalInsight[]>([]);
  const [latestInsight, setLatestInsight] = useState<EmotionalInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (childId) {
      fetchInsights();
    }
  }, [childId]);

  const fetchInsights = async () => {
    if (!childId) return;
    
    setLoading(true);
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
          description: "Could not fetch emotional growth insights. Please try again."
        });
        return;
      }
      
      if (data && data.length > 0) {
        setInsights(data);
        setLatestInsight(data[0]); // Most recent insight
      } else {
        setInsights([]);
        setLatestInsight(null);
      }
    } catch (error) {
      console.error("Error in fetchInsights:", error);
      warningToast({
        title: "Error",
        description: "Failed to fetch emotional growth insights. Please try again."
      });
    } finally {
      setLoading(false);
    }
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
    analyzeEntry
  };
};
