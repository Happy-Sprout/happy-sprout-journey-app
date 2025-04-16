
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChildren } from '@/hooks/useChildren';
import { 
  AssessmentQuestion, 
  AssessmentAnswer, 
  AssessmentStatusResponse, 
  AssessmentType,
  AssessmentComparisonResponse,
  SELDimension
} from '@/types/assessment';

export const useAssessment = () => {
  const { toast } = useToast();
  const { currentChildId } = useChildren();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatusResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<AssessmentComparisonResponse | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Check if the feature is enabled and get assessment status
  const checkAssessmentStatus = useCallback(async () => {
    if (!currentChildId) return;
    
    try {
      setStatusLoading(true);
      
      // First check if feature is enabled
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'is_pre_post_assessment_enabled')
        .single();
      
      if (settingsError) {
        console.error('Error fetching feature flag:', settingsError);
        return;
      }
      
      const enabled = settingsData?.setting_value === true;
      
      if (!enabled) {
        setAssessmentStatus({
          enabled: false,
          nextAssessment: null,
          preStatus: 'Not Started',
          postStatus: 'Not Started'
        });
        return;
      }
      
      // Now check existing assessments for this child
      const { data: preData, error: preError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('child_id', currentChildId)
        .eq('assessment_type', 'PRE')
        .maybeSingle();
      
      if (preError) {
        console.error('Error fetching PRE assessment:', preError);
      }
      
      const { data: postData, error: postError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('child_id', currentChildId)
        .eq('assessment_type', 'POST')
        .maybeSingle();
      
      if (postError) {
        console.error('Error fetching POST assessment:', postError);
      }
      
      const preStatus = preData?.status || 'Not Started';
      const postStatus = postData?.status || 'Not Started';
      
      // Determine the next assessment to take
      let nextAssessment: AssessmentType | null = null;
      
      if (preStatus !== 'Completed') {
        nextAssessment = 'PRE';
      } else if (postStatus !== 'Completed') {
        nextAssessment = 'POST';
      }
      
      setAssessmentStatus({
        enabled: true,
        nextAssessment,
        preStatus,
        postStatus
      });
      
    } catch (error) {
      console.error('Error checking assessment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check assessment status',
        variant: 'destructive'
      });
    } finally {
      setStatusLoading(false);
    }
  }, [currentChildId, toast]);

  // Fetch assessment questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .order('dimension')
        .order('display_order');
      
      if (error) {
        throw error;
      }
      
      setQuestions(data as AssessmentQuestion[]);
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Submit assessment answers
  const submitAssessment = useCallback(async (
    assessmentType: AssessmentType, 
    answers: AssessmentAnswer[]
  ) => {
    if (!currentChildId || !answers.length) return;
    
    try {
      setLoading(true);
      
      // Create or update the assessment result
      const { data: resultData, error: resultError } = await supabase
        .from('assessment_results')
        .upsert({
          child_id: currentChildId,
          assessment_type: assessmentType,
          status: 'Completed',
          completion_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'child_id,assessment_type',
          returning: 'representation'
        })
        .select()
        .single();
      
      if (resultError) {
        throw resultError;
      }
      
      // Insert the answers
      const answersWithResultId = answers.map(answer => ({
        result_id: resultData.id,
        question_code: answer.question_code,
        answer_value: answer.answer_value
      }));
      
      const { error: answersError } = await supabase
        .from('assessment_answers')
        .upsert(answersWithResultId, {
          onConflict: 'result_id,question_code',
          ignoreDuplicates: false
        });
      
      if (answersError) {
        throw answersError;
      }
      
      // Calculate scores by dimension
      const questionsByDimension = questions.reduce((acc, question) => {
        if (!acc[question.dimension]) {
          acc[question.dimension] = [];
        }
        acc[question.dimension].push(question);
        return acc;
      }, {} as Record<SELDimension, AssessmentQuestion[]>);
      
      const scoresByDimension = {} as Record<SELDimension, number>;
      
      for (const dimension in questionsByDimension) {
        const dimensionQuestions = questionsByDimension[dimension as SELDimension];
        const dimensionAnswers = answers.filter(answer => 
          dimensionQuestions.some(q => q.question_code === answer.question_code)
        );
        
        if (dimensionAnswers.length) {
          // Calculate average score (1-5) and normalize to 0-100
          const averageScore = dimensionAnswers.reduce((sum, answer) => 
            sum + answer.answer_value, 0) / dimensionAnswers.length;
          
          scoresByDimension[dimension as SELDimension] = Math.round((averageScore / 5) * 100);
        }
      }
      
      // Update the assessment result with the scores
      const { error: updateError } = await supabase
        .from('assessment_results')
        .update({
          scores_by_dimension: scoresByDimension,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultData.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Trigger a status refresh
      checkAssessmentStatus();
      
      toast({
        title: 'Assessment Completed',
        description: 'Your assessment has been submitted successfully',
      });
      
      return resultData.id;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assessment',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentChildId, questions, checkAssessmentStatus, toast]);

  // Fetch comparison data for completed PRE/POST assessments
  const fetchComparisonData = useCallback(async () => {
    if (!currentChildId) return;
    
    try {
      setComparisonLoading(true);
      
      // Check if feature is enabled
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'is_pre_post_assessment_enabled')
        .single();
      
      if (settingsError) {
        console.error('Error fetching feature flag:', settingsError);
        setComparisonData({ status: 'DISABLED' });
        return;
      }
      
      const enabled = settingsData?.setting_value === true;
      
      if (!enabled) {
        setComparisonData({ status: 'DISABLED' });
        return;
      }
      
      // Fetch PRE assessment
      const { data: preData, error: preError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('child_id', currentChildId)
        .eq('assessment_type', 'PRE')
        .eq('status', 'Completed')
        .maybeSingle();
      
      if (preError) {
        console.error('Error fetching PRE assessment:', preError);
      }
      
      if (!preData) {
        setComparisonData({ status: 'PRE_PENDING' });
        return;
      }
      
      // Fetch POST assessment
      const { data: postData, error: postError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('child_id', currentChildId)
        .eq('assessment_type', 'POST')
        .eq('status', 'Completed')
        .maybeSingle();
      
      if (postError) {
        console.error('Error fetching POST assessment:', postError);
      }
      
      if (!postData) {
        setComparisonData({
          status: 'POST_PENDING',
          preAssessment: {
            completionDate: preData.completion_date,
            scores: preData.scores_by_dimension
          }
        });
        return;
      }
      
      // Both PRE and POST are completed, generate comparison data
      const preScores = preData.scores_by_dimension as Record<SELDimension, number>;
      const postScores = postData.scores_by_dimension as Record<SELDimension, number>;
      
      const comparison = Object.keys(preScores).map(dimensionKey => {
        const dimension = dimensionKey as SELDimension;
        const pre = preScores[dimension] || 0;
        const post = postScores[dimension] || 0;
        
        return {
          dimension,
          pre,
          post,
          change: post - pre
        };
      });
      
      setComparisonData({
        status: 'AVAILABLE',
        preAssessment: {
          completionDate: preData.completion_date,
          scores: preData.scores_by_dimension
        },
        postAssessment: {
          completionDate: postData.completion_date,
          scores: postData.scores_by_dimension
        },
        comparison
      });
      
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment comparison data',
        variant: 'destructive'
      });
    } finally {
      setComparisonLoading(false);
    }
  }, [currentChildId, toast]);

  // Load assessment status on child change
  useEffect(() => {
    if (currentChildId) {
      checkAssessmentStatus();
    }
  }, [currentChildId, checkAssessmentStatus]);

  return {
    loading,
    statusLoading,
    questions,
    assessmentStatus,
    comparisonData,
    comparisonLoading,
    fetchQuestions,
    checkAssessmentStatus,
    submitAssessment,
    fetchComparisonData
  };
};
