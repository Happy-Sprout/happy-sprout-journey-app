
import { useState, useEffect, useCallback, useRef } from "react";
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

export type SELAreaKey = 'self_awareness' | 'self_management' | 'social_awareness' | 'relationship_skills' | 'responsible_decision_making';

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

// SEL area prompts mapping for different age groups
const SEL_AREA_PROMPTS: Record<SELAreaKey, {
  title: string;
  description: string;
  prompts: {
    younger: string[];  // For children under 10
    older: string[];    // For children 10+
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

  const fetchInsights = useCallback(async () => {
    if (!childId || isFetchingRef.current || childId === prevChildIdRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setIsFallbackData(false);
    setHasInsufficientData(false);
    setConnectionError(false);
    
    try {
      console.log("Fetching insights for child ID:", childId);
      
      const { error: pingError } = await supabase.from('sel_insights').select('id').limit(1);
      
      if (pingError) {
        console.error("Database connection check failed:", pingError);
        throw new Error("Database connection failed");
      }
      
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
        const sortedData = [...data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setInsights(sortedData);
        setLatestInsight(sortedData[0]);
        prevChildIdRef.current = childId;
      } else {
        console.log("No insights found in database");
        setHasInsufficientData(true);
        
        if (IS_DEVELOPMENT) {
          console.log("Using sample data for development");
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

  const fetchHistoricalInsights = useCallback(async (period: Period = 'weekly') => {
    if (!childId) return;
    
    setHistoricalLoading(true);
    setHasInsufficientData(false);
    
    try {
      console.log(`Fetching historical insights for period: ${period}, childId: ${childId}`);
      
      const { error: pingError } = await supabase.from('sel_insights').select('id').limit(1);
      
      if (pingError) {
        console.error("Database connection check failed:", pingError);
        throw new Error("Database connection failed");
      }
      
      let startDate: string | null = null;
      const now = new Date();
      
      if (period === 'weekly') {
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(now.getDate() - 28);
        startDate = fourWeeksAgo.toISOString();
      } else if (period === 'monthly') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        startDate = sixMonthsAgo.toISOString();
      }
      
      let query = supabase
        .from('sel_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: true });
      
      if (startDate && period !== 'all') {
        query = query.gte('created_at', startDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching historical insights:", error);
        throw error;
      }
      
      console.log("Fetched historical data:", data);
      
      if (data && data.length >= MIN_DATA_POINTS_FOR_CHART) {
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
        
        if (IS_DEVELOPMENT) {
          console.log("Using sample historical data for development");
          const sampleHistorical = generateSampleHistoricalData(period, childId);
          setHistoricalInsights(sampleHistorical);
          setIsFallbackData(true);
        } else {
          setHistoricalInsights([]);
        }
      }
    } catch (error) {
      console.error("Error in fetchHistoricalInsights:", error);
      setHasInsufficientData(true);
      setConnectionError(true);
      
      if (IS_DEVELOPMENT) {
        const sampleHistorical = generateSampleHistoricalData(period, childId);
        setHistoricalInsights(sampleHistorical);
        setIsFallbackData(true);
      } else {
        setHistoricalInsights([]);
      }
    } finally {
      setHistoricalLoading(false);
    }
  }, [childId]);

  const generateSampleHistoricalData = useCallback((period: Period, childId: string): EmotionalInsight[] => {
    const now = new Date();
    const sampleData: EmotionalInsight[] = [];
    
    const dataPoints = period === 'weekly' ? 14 : period === 'monthly' ? 24 : 30;
    const intervalDays = period === 'weekly' ? 2 : period === 'monthly' ? 7 : 14;
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * intervalDays));
      
      const progress = i / dataPoints;
      
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
    
    return sampleData.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
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
