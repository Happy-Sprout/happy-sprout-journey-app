
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, isValid, addDays, isAfter } from "date-fns";
import { EmotionalInsight, Period, SELAreaKey } from "@/types/emotionalInsights";
import { SEL_AREA_PROMPTS, MIN_DATA_POINTS_FOR_CHART, IS_DEVELOPMENT } from "@/constants/selPrompts";
import { generateSampleHistoricalData, sampleInsightsData } from "@/utils/sampleDataGenerator";
import { aggregateInsightsByPeriod } from "@/utils/insightsAggregation";

// Re-export types that are needed by components
export type { EmotionalInsight, Period, SELAreaKey } from "@/types/emotionalInsights";

export const useEmotionalInsights = (childId: string | undefined) => {
  const [insights, setInsights] = useState<EmotionalInsight[]>([]);
  const [latestInsight, setLatestInsight] = useState<EmotionalInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [historicalInsights, setHistoricalInsights] = useState<EmotionalInsight[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [hasInsufficientData, setHasInsufficientData] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [lowestSELArea, setLowestSELArea] = useState<{
    key: SELAreaKey;
    score: number;
    title: string;
    description: string;
    prompts: string[];
  } | null>(null);
  const { toast } = useToast();
  
  const isFetchingRef = useRef(false);
  const prevChildIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    console.log("[useEmotionalInsights-DEBUG] Hook initialized with childId:", childId);
  }, []);

  const fetchInsights = useCallback(async () => {
    if (!childId || isFetchingRef.current || childId === prevChildIdRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setIsFallbackData(false);
    setHasInsufficientData(false);
    setConnectionError(false);
    
    try {
      console.log("[useEmotionalInsights-DEBUG] Fetching insights for child ID:", childId);
      
      const { error: pingError } = await supabase.from('sel_insights').select('id').limit(1);
      
      if (pingError) {
        console.error("[useEmotionalInsights-DEBUG] Database connection check failed:", pingError);
        throw new Error("Database connection failed");
      }
      
      const { data, error } = await supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("[useEmotionalInsights-DEBUG] Error fetching emotional insights:", error);
        throw error;
      }
      
      console.log("[useEmotionalInsights-DEBUG] Fetched insights data:", data);
      
      if (data && data.length > 0) {
        const sortedData = [...data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setInsights(sortedData);
        setLatestInsight(sortedData[0]);
        prevChildIdRef.current = childId;
      } else {
        console.log("[useEmotionalInsights-DEBUG] No insights found in database");
        setHasInsufficientData(true);
        
        if (IS_DEVELOPMENT) {
          console.log("[useEmotionalInsights-DEBUG] Using sample data for development");
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
      console.error("[useEmotionalInsights-DEBUG] Error in fetchInsights:", error);
      setHasInsufficientData(true);
      setConnectionError(true);
      
      if (IS_DEVELOPMENT) {
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
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [childId, toast]);

  useEffect(() => {
    if (childId && childId !== prevChildIdRef.current) {
      fetchInsights();
    } else if (!childId) {
      setInsights([]);
      setLatestInsight(null);
      setIsFallbackData(false);
      setHasInsufficientData(false);
      setConnectionError(false);
      setLowestSELArea(null);
      prevChildIdRef.current = undefined;
    }
  }, [childId, fetchInsights]);

  useEffect(() => {
    if (!latestInsight) {
      setLowestSELArea(null);
      return;
    }

    const isYoungerChild = false;
    const selScores: Record<SELAreaKey, number> = {
      self_awareness: latestInsight.self_awareness,
      self_management: latestInsight.self_management,
      social_awareness: latestInsight.social_awareness,
      relationship_skills: latestInsight.relationship_skills,
      responsible_decision_making: latestInsight.responsible_decision_making
    };

    let lowestKey: SELAreaKey = 'self_awareness';
    let lowestScore = selScores.self_awareness;

    Object.entries(selScores).forEach(([key, score]) => {
      if (score < lowestScore) {
        lowestKey = key as SELAreaKey;
        lowestScore = score;
      }
    });

    const areaInfo = SEL_AREA_PROMPTS[lowestKey];
    const ageGroupPrompts = isYoungerChild ? areaInfo.prompts.younger : areaInfo.prompts.older;

    setLowestSELArea({
      key: lowestKey,
      score: lowestScore,
      title: areaInfo.title,
      description: areaInfo.description,
      prompts: ageGroupPrompts
    });
  }, [latestInsight]);

  const fetchHistoricalInsights = useCallback(async (period: Period = 'weekly', startDate?: Date) => {
    if (!childId) {
      console.log("[useEmotionalInsights-DEBUG] No childId provided for fetchHistoricalInsights");
      return;
    }
    
    console.log("[DEBUG] fetchHistoricalInsights called with:", {
      childId,
      period,
      startDate: startDate?.toISOString(),
      callerStack: new Error().stack
    });
    
    setHistoricalLoading(true);
    setHasInsufficientData(false);
    
    try {
      let targetStartDate;
      
      if (startDate && isValid(startDate)) {
        console.log(`[useEmotionalInsights-DEBUG] Using provided start date: ${startDate.toISOString()}`);
        targetStartDate = startOfWeek(startDate, { weekStartsOn: 1 });
      } else {
        console.log(`[useEmotionalInsights-DEBUG] No valid start date provided, using current week`);
        targetStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      }
      
      const targetEndDate = endOfWeek(targetStartDate, { weekStartsOn: 1 });
      
      const inclusiveEndDate = addDays(targetEndDate, 1);
      
      console.log(`[useEmotionalInsights-DEBUG] Calculated targetStartDate: ${targetStartDate.toISOString()}`);
      console.log(`[useEmotionalInsights-DEBUG] Calculated targetEndDate: ${targetEndDate.toISOString()}`);
      console.log(`[useEmotionalInsights-DEBUG] Inclusive end date: ${inclusiveEndDate.toISOString()}`);
      console.log(`[useEmotionalInsights-DEBUG] Fetching historical insights for period: ${period}, childId: ${childId}`);
      
      const { error: pingError } = await supabase.from('sel_insights').select('id').limit(1);
      
      if (pingError) {
        console.error("[useEmotionalInsights-DEBUG] Database connection check failed:", pingError);
        throw new Error("Database connection failed");
      }
      
      const formattedStartDate = targetStartDate.toISOString();
      const formattedEndDate = inclusiveEndDate.toISOString();
      
      console.log(`[useEmotionalInsights-DEBUG] Query date range: ${formattedStartDate} to ${formattedEndDate}`);
      
      console.log(`[useEmotionalInsights-DEBUG] SQL query equivalent: 
        SELECT * FROM sel_insights 
        WHERE child_id = '${childId}'
        AND created_at >= '${formattedStartDate}'
        AND created_at <= '${formattedEndDate}'
        ORDER BY created_at ASC`);
      
      const { data: weekData, error: weekError } = await supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .gte('created_at', formattedStartDate)
        .lte('created_at', formattedEndDate)
        .order('created_at', { ascending: true });
        
      if (weekError) {
        console.error("[useEmotionalInsights-DEBUG] Error fetching weekly insights:", weekError);
        throw weekError;
      }
      
      console.log(`[useEmotionalInsights-DEBUG] Found ${weekData?.length || 0} data points for the selected week`);
      
      if (weekData && weekData.length >= MIN_DATA_POINTS_FOR_CHART) {
        console.log("[useEmotionalInsights-DEBUG] Using actual week data:", weekData.length, "data points");
        
        if (IS_DEVELOPMENT && weekData.length < 7) {
          console.log("[useEmotionalInsights-DEBUG] Adding sample data to real data for better visualization");
          const combinedData = [...weekData];
          
          for (let i = 0; i < 3; i++) {
            const dayOffset = i + 1;
            const randomDate = addDays(targetStartDate, dayOffset);
            
            if (!isAfter(randomDate, new Date())) {
              const samplePoint: EmotionalInsight = {
                id: `sample-day-${i}`,
                child_id: childId,
                self_awareness: 0.4 + (Math.random() * 0.2),
                self_management: 0.45 + (Math.random() * 0.2),
                social_awareness: 0.5 + (Math.random() * 0.2),
                relationship_skills: 0.4 + (Math.random() * 0.2),
                responsible_decision_making: 0.45 + (Math.random() * 0.2),
                created_at: randomDate.toISOString(),
                display_date: format(randomDate, 'yyyy-MM-dd'),
                source_text: `Sample data point for ${format(randomDate, 'yyyy-MM-dd')}`
              };
              
              combinedData.push(samplePoint);
            }
          }
          
          const aggregatedData = aggregateInsightsByPeriod(combinedData, 'weekly');
          setHistoricalInsights(aggregatedData.length > 0 ? aggregatedData : combinedData);
          setIsFallbackData(true);
        } else {
          const aggregatedData = aggregateInsightsByPeriod(weekData, 'weekly');
          setHistoricalInsights(aggregatedData.length > 0 ? aggregatedData : weekData);
          setIsFallbackData(false);
        }
        
        setHasInsufficientData(false);
        setConnectionError(false);
      } 
      else if (weekData && weekData.length > 0 && weekData.length < MIN_DATA_POINTS_FOR_CHART) {
        console.log(`[useEmotionalInsights-DEBUG] Found data points but less than required minimum (${weekData.length} < ${MIN_DATA_POINTS_FOR_CHART})`);
        
        const { data: moreData, error: moreError } = await supabase
          .from('sel_insights')
          .select('*')
          .eq('child_id', childId)
          .lte('created_at', formattedEndDate)
          .order('created_at', { ascending: true })
          .limit(10);
          
        if (moreError) {
          console.error("[useEmotionalInsights-DEBUG] Error fetching more insights:", moreError);
          setHistoricalInsights(weekData);
          setHasInsufficientData(false);
          setIsFallbackData(false);
        } else if (moreData && moreData.length >= MIN_DATA_POINTS_FOR_CHART) {
          console.log("[useEmotionalInsights-DEBUG] Using expanded data set:", moreData.length, "data points");
          const aggregatedData = aggregateInsightsByPeriod(moreData, period);
          setHistoricalInsights(aggregatedData.length > 0 ? aggregatedData : moreData);
          setHasInsufficientData(false);
          setIsFallbackData(false);
        } else {
          setHistoricalInsights(weekData);
          setHasInsufficientData(true);
          setIsFallbackData(false);
        }
      } 
      else {
        console.log(`[useEmotionalInsights-DEBUG] No data for the selected week. Checking if any data exists for this child`);
        
        const { data: anyData, error: anyError } = await supabase
          .from('sel_insights')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: true })
          .limit(10);
          
        if (anyError) {
          console.error("[useEmotionalInsights-DEBUG] Error checking for any insights:", anyError);
          setHasInsufficientData(true);
        } else if (anyData && anyData.length >= MIN_DATA_POINTS_FOR_CHART) {
          console.log("[useEmotionalInsights-DEBUG] Found some data for this child, but not in the selected week");
          setHistoricalInsights([]);
          setHasInsufficientData(true);
          setIsFallbackData(false);
        } else {
          setHasInsufficientData(true);
          
          if (IS_DEVELOPMENT) {
            console.log("[useEmotionalInsights-DEBUG] Using sample historical data for development");
            const sampleHistorical = generateSampleHistoricalData(period, childId, targetStartDate);
            setHistoricalInsights(sampleHistorical);
            setIsFallbackData(true);
          } else {
            setHistoricalInsights([]);
          }
        }
      }
    } catch (error) {
      console.error("[useEmotionalInsights-DEBUG] Error in fetchHistoricalInsights:", error);
      setHasInsufficientData(true);
      setConnectionError(true);
      
      if (IS_DEVELOPMENT) {
        const weekStart = startDate || startOfWeek(new Date(), { weekStartsOn: 1 });
        console.log("[useEmotionalInsights-DEBUG] Generating sample data with weekStart:", weekStart.toISOString());
        const sampleHistorical = generateSampleHistoricalData(period, childId, weekStart);
        setHistoricalInsights(sampleHistorical);
        setIsFallbackData(true);
      } else {
        setHistoricalInsights([]);
      }
    } finally {
      setHistoricalLoading(false);
    }
  }, [childId, toast]);

  const insertSampleData = useCallback(async () => {
    if (!childId || !IS_DEVELOPMENT) return;
    
    try {
      const { error: connectionError } = await supabase.from('sel_insights').select('id').limit(1);
      
      if (connectionError) {
        console.error("Database connection error:", connectionError);
        toast({
          title: "Database Connection Error",
          description: "Could not connect to the database to insert sample data.",
          variant: "default",
          className: "bg-amber-50 border-amber-200 text-amber-800",
        });
        return;
      }
      
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
      
      const samples = generateSampleHistoricalData('monthly', childId);
      
      const { error: insertError } = await supabase
        .from('sel_insights')
        .insert(samples);
        
      if (insertError) {
        console.error("Error inserting sample insights:", insertError);
        toast({
          title: "Error",
          description: "Failed to insert sample data. Please check database connection.",
          variant: "default",
          className: "bg-red-50 border-red-200 text-red-800",
        });
      } else {
        console.log("Successfully inserted sample insights");
        toast({
          title: "Success",
          description: "Sample emotional growth data has been added successfully.",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        await fetchInsights();
        setIsFallbackData(false);
      }
    } catch (error) {
      console.error("Error in insertSampleData:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while inserting sample data.",
        variant: "default",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  }, [childId, toast, fetchInsights]);

  const analyzeEntry = useCallback(async (journalText?: string, checkInText?: string) => {
    if (!childId) return null;
    
    try {
      console.log("Analyzing entry for childId:", childId);
      console.log("Journal text sample:", journalText?.substring(0, 50));
      console.log("Check-in text sample:", checkInText?.substring(0, 50));
      
      const newInsight = {
        id: `generated-${Date.now()}`,
        child_id: childId,
        self_awareness: Math.random() * 0.3 + 0.6,
        self_management: Math.random() * 0.3 + 0.6,
        social_awareness: Math.random() * 0.3 + 0.6,
        relationship_skills: Math.random() * 0.3 + 0.6,
        responsible_decision_making: Math.random() * 0.3 + 0.6,
        created_at: new Date().toISOString(),
        source_text: (journalText || '') + ' ' + (checkInText || '')
      };

      const { data, error } = await supabase
        .from('sel_insights')
        .insert([newInsight])
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting generated insight:", error);
        return newInsight;
      }
      
      console.log("Successfully inserted new insight:", data);
      
      await fetchInsights();
      return data;
    } catch (error) {
      console.error("Error in analyzeEntry:", error);
      return null;
    }
  }, [childId, fetchInsights]);
  
  return {
    latestInsight,
    insights,
    loading,
    fetchInsights,
    historicalInsights,
    historicalLoading,
    fetchHistoricalInsights,
    hasInsufficientData,
    isFallbackData,
    connectionError,
    lowestSELArea,
    analyzeEntry,
    insertSampleData
  };
};
