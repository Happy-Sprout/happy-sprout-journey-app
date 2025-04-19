
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { warningToast } from "@/components/ui/toast-extensions";
import { format, parseISO, startOfWeek, startOfMonth, isValid, addWeeks, addDays, isAfter, isBefore, endOfWeek, subDays, endOfMonth } from "date-fns";

export type EmotionalInsight = {
  id: string;
  child_id: string;
  self_awareness: number;
  self_management: number;
  social_awareness: number;
  relationship_skills: number;
  responsible_decision_making: number;
  created_at: string;
  display_date?: string;
  source_text?: string;
};

export type SELAreaKey = 'self_awareness' | 'self_management' | 'social_awareness' | 'relationship_skills' | 'responsible_decision_making';

export type Period = 'weekly' | 'monthly' | 'all';

const MIN_DATA_POINTS_FOR_CHART = 2;
const IS_DEVELOPMENT = import.meta.env.DEV;

const sampleInsightsData: EmotionalInsight[] = [
  {
    id: 'sample-1',
    child_id: 'sample-child',
    self_awareness: 0.65,
    self_management: 0.70,
    social_awareness: 0.60,
    relationship_skills: 0.55,
    responsible_decision_making: 0.68,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sample-2',
    child_id: 'sample-child',
    self_awareness: 0.68,
    self_management: 0.72,
    social_awareness: 0.62,
    relationship_skills: 0.58,
    responsible_decision_making: 0.70,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sample-3',
    child_id: 'sample-child',
    self_awareness: 0.72,
    self_management: 0.75,
    social_awareness: 0.65,
    relationship_skills: 0.60,
    responsible_decision_making: 0.73,
    created_at: new Date().toISOString()
  }
];

const SEL_AREA_PROMPTS: Record<SELAreaKey, {
  title: string;
  description: string;
  prompts: {
    younger: string[];
    older: string[];
  };
}> = {
  'self_awareness': {
    title: 'Self-Awareness',
    description: 'Understanding your own emotions, strengths, and areas for growth',
    prompts: {
      younger: [
        'Draw a picture of how you feel right now and explain why you feel that way.',
        'Name three things that make you feel happy and three things that make you feel sad.',
        'When you get upset, what happens in your body? Where do you feel it?',
        "What's one thing you're really good at and one thing that's hard for you?",
      ],
      older: [
        'Take a few minutes to reflect on a recent strong emotional reaction you had. What triggered it and how did you respond?',
        'Think about a time when your emotions affected your decisions. What would you do differently next time?',
        'List three of your strengths and three areas where you want to improve. How can you use your strengths to help with your challenges?',
        'How do you think others see you? Is this different from how you see yourself?',
      ]
    }
  },
  'self_management': {
    title: 'Self-Management',
    description: 'Managing emotions, thoughts, and behaviors effectively',
    prompts: {
      younger: [
        'What do you do to calm down when you feel angry or upset?',
        'Make a list of things you can do when you feel like giving up on something hard.',
        "What's something you really want but have to wait for? How do you handle waiting?",
        'Think of a time you made a mistake. What did you learn from it?',
      ],
      older: [
        'Describe a situation where you successfully managed strong emotions. What strategies did you use?',
        'What are your top three stress triggers, and what techniques can you use to manage them better?',
        'Set a small goal for this week. What specific steps will you take to achieve it? What obstacles might come up?',
        'Think about a recent time when you procrastinated. What emotions were you feeling? How could you handle similar situations differently?',
      ]
    }
  },
  'social_awareness': {
    title: 'Social Awareness',
    description: "Understanding others' perspectives and empathizing with them",
    prompts: {
      younger: [
        'Think about a friend who was sad recently. How could you tell they were sad? What did you do to help?',
        'When someone feels different from you about something, how do you try to understand their feelings?',
        'Think of someone who might be lonely at school. What could you do to include them?',
        "Name three ways people show they're feeling happy, sad, or angry without using words.",
      ],
      older: [
        'Think about a recent disagreement you had with someone. Try to describe the situation from their perspective.',
        'Consider someone in your life who is very different from you. What might be some challenges they face that you don\'t?',
        'How might your actions or words affect others, even when you don\'t intend them to?',
        'Think about a time when you noticed someone needed help. How did you know, and what did you do?',
      ]
    }
  },
  'relationship_skills': {
    title: 'Relationship Skills',
    description: 'Building and maintaining healthy relationships',
    prompts: {
      younger: [
        'What makes someone a good friend? How are you a good friend to others?',
        'When you have a problem with a friend, what do you do to fix it?',
        'How do you show people that you care about them?',
        "What's something nice someone did for you recently? How did it make you feel?",
      ],
      older: [
        'Think about a conflict you recently had with someone. How did you handle it? What could you have done differently?',
        'What are three qualities you look for in close friendships? How do you demonstrate these qualities yourself?',
        'Describe a time when you had to compromise with someone. What did you learn from the experience?',
        'How do you respond when a friend shares something personal or difficult with you?',
      ]
    }
  },
  'responsible_decision_making': {
    title: 'Responsible Decision-Making',
    description: 'Making constructive choices about personal behavior and social interactions',
    prompts: {
      younger: [
        'Think about a choice you made today. Was it a good choice? How do you know?',
        'When you need to make a decision, who helps you? How do they help?',
        "What's a rule at home or school that helps keep you safe? Why is it important?",
        'Think about a time you helped someone else. Why did you decide to help?',
      ],
      older: [
        'Describe a difficult decision you had to make recently. What factors did you consider?',
        'Think about a time when you made a decision you later regretted. What would you do differently now?',
        'How do your personal values influence the decisions you make?',
        'Consider a choice you need to make soon. What are the possible consequences (both positive and negative) of each option?',
      ]
    }
  }
};

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

  const aggregateInsightsByPeriod = (data: EmotionalInsight[], period: Period) => {
    if (!data || data.length === 0) return [];
    
    console.log("[useEmotionalInsights-DEBUG] Aggregating insights by period:", period);
    console.log("[useEmotionalInsights-DEBUG] Data to aggregate count:", data.length);
    
    const groupedData: Record<string, EmotionalInsight[]> = {};
    
    data.forEach(insight => {
      const date = new Date(insight.created_at);
      
      if (!isValid(date)) {
        console.log("[useEmotionalInsights-DEBUG] Invalid date found:", insight.created_at);
        return;
      }
      
      let groupKey: string;
      
      if (period === 'weekly') {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        groupKey = format(weekStart, 'yyyy-MM-dd');
      } else if (period === 'monthly') {
        const monthStart = startOfMonth(date);
        groupKey = format(monthStart, 'yyyy-MM');
      } else {
        groupKey = format(date, 'yyyy-MM-dd');
      }
      
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      
      groupedData[groupKey].push(insight);
    });
    
    const result = Object.entries(groupedData).map(([dateKey, insights]) => {
      const avgSelfAwareness = insights.reduce((sum, insight) => sum + insight.self_awareness, 0) / insights.length;
      const avgSelfManagement = insights.reduce((sum, insight) => sum + insight.self_management, 0) / insights.length;
      const avgSocialAwareness = insights.reduce((sum, insight) => sum + insight.social_awareness, 0) / insights.length;
      const avgRelationshipSkills = insights.reduce((sum, insight) => sum + insight.relationship_skills, 0) / insights.length;
      const avgResponsibleDecisionMaking = insights.reduce((sum, insight) => sum + insight.responsible_decision_making, 0) / insights.length;
      
      const sortedByDate = [...insights].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const mostRecentInsight = sortedByDate[0];
      
      return {
        id: `aggregated-${dateKey}`,
        child_id: childId || '',
        self_awareness: avgSelfAwareness,
        self_management: avgSelfManagement,
        social_awareness: avgSocialAwareness,
        relationship_skills: avgRelationshipSkills,
        responsible_decision_making: avgResponsibleDecisionMaking,
        created_at: mostRecentInsight.created_at,
        display_date: dateKey,
        source_text: '' // Add the missing required source_text property with a default empty string
      };
    }).sort((a, b) => 
      new Date(a.display_date || a.created_at).getTime() - new Date(b.display_date || b.created_at).getTime()
    );
    
    console.log("[useEmotionalInsights-DEBUG] Aggregated results:", result);
    return result;
  };

  const fetchHistoricalInsights = useCallback(async (period: Period = 'weekly', startDate?: Date) => {
    if (!childId) {
      console.log("[useEmotionalInsights-DEBUG] No childId provided for fetchHistoricalInsights");
      return;
    }
    
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
      
      console.log(`[useEmotionalInsights-DEBUG] Calculated targetStartDate: ${targetStartDate.toISOString()}`);
      console.log(`[useEmotionalInsights-DEBUG] Calculated targetEndDate: ${targetEndDate.toISOString()}`);
      console.log(`[useEmotionalInsights-DEBUG] Fetching historical insights for period: ${period}, childId: ${childId}`);
      
      const { error: pingError } = await supabase.from('sel_insights').select('id').limit(1);
      
      if (pingError) {
        console.error("[useEmotionalInsights-DEBUG] Database connection check failed:", pingError);
        throw new Error("Database connection failed");
      }
      
      const formattedStartDate = targetStartDate.toISOString();
      const formattedEndDate = targetEndDate.toISOString();
      
      console.log(`[useEmotionalInsights-DEBUG] Query date range: ${formattedStartDate} to ${formattedEndDate}`);
      
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
              const samplePoint = {
                id: `sample-day-${i}`,
                child_id: childId,
                self_awareness: 0.4 + (Math.random() * 0.2),
                self_management: 0.45 + (Math.random() * 0.2),
                social_awareness: 0.5 + (Math.random() * 0.2),
                relationship_skills: 0.4 + (Math.random() * 0.2),
                responsible_decision_making: 0.45 + (Math.random() * 0.2),
                created_at: randomDate.toISOString(),
                display_date: format(randomDate, 'yyyy-MM-dd')
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
  }, [childId]);

  const generateSampleHistoricalData = useCallback((period: Period, childId: string, startDate?: Date): EmotionalInsight[] => {
    const weekStart = startDate || startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const sampleData: EmotionalInsight[] = [];
    const currentDate = new Date();
    
    console.log("[useEmotionalInsights-DEBUG] Generating sample data for period:", period);
    console.log("[useEmotionalInsights-DEBUG] Sample data weekStart:", weekStart.toISOString());
    console.log("[useEmotionalInsights-DEBUG] Sample data weekEnd:", weekEnd.toISOString());
    
    if (period === 'weekly') {
      for (let i = 0; i < 7; i++) {
        if (i % 2 === 0 || i === 6) {
          const date = addDays(weekStart, i);
          
          if (!isAfter(date, currentDate)) {
            const dayProgress = i / 6;
            const samplePoint: EmotionalInsight = {
              id: `sample-daily-${i}`,
              child_id: childId,
              self_awareness: 0.4 + (0.4 * dayProgress) + (Math.random() * 0.1),
              self_management: 0.45 + (0.35 * dayProgress) + (Math.random() * 0.1),
              social_awareness: 0.5 + (0.3 * dayProgress) + (Math.random() * 0.1),
              relationship_skills: 0.4 + (0.35 * dayProgress) + (Math.random() * 0.1),
              responsible_decision_making: 0.45 + (0.4 * dayProgress) + (Math.random() * 0.1),
              created_at: date.toISOString(),
              display_date: format(date, 'yyyy-MM-dd'),
              source_text: '' // Add the missing required source_text property
            };
            
            console.log(`[useEmotionalInsights-DEBUG] Generated sample day ${i}:`, {
              date: date.toISOString(),
              display_date: format(date, 'yyyy-MM-dd')
            });
            
            sampleData.push(samplePoint);
          }
        }
      }
    } else {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(monthStart);
      
      for (let i = 0; i < 30; i++) {
        const date = addDays(monthStart, i);
        
        if (!isAfter(date, currentDate)) {
          const dayProgress = i / 30;
          const samplePoint: EmotionalInsight = {
            id: `sample-daily-${i}`,
            child_id: childId,
            self_awareness: 0.4 + (0.4 * dayProgress) + (Math.random() * 0.1),
            self_management: 0.45 + (0.35 * dayProgress) + (Math.random() * 0.1),
            social_awareness: 0.5 + (0.3 * dayProgress) + (Math.random() * 0.1),
            relationship_skills: 0.4 + (0.35 * dayProgress) + (Math.random() * 0.1),
            responsible_decision_making: 0.45 + (0.4 * dayProgress) + (Math.random() * 0.1),
            created_at: date.toISOString(),
            display_date: format(date, 'yyyy-MM-dd'),
            source_text: '' // Add the missing required source_text property
          };
          
          console.log(`[useEmotionalInsights-DEBUG] Generated sample day ${i}:`, {
            date: date.toISOString(),
            display_date: format(date, 'yyyy-MM-dd')
          });
          
          sampleData.push(samplePoint);
        }
      }
    }
    
    const sortedData = sampleData.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    console.log("[useEmotionalInsights-DEBUG] Generated sample data count:", sortedData.length);
    return sortedData;
  }, []);

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
  }, [childId, toast, generateSampleHistoricalData, fetchInsights]);

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
    connectionError,
    lowestSELArea
  };
};
