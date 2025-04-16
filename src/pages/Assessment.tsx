
import React, { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssessment } from '@/hooks/useAssessment';
import { useChildren } from '@/hooks/useChildren';
import AssessmentForm from '@/components/assessment/AssessmentForm';
import AssessmentComparison from '@/components/assessment/AssessmentComparison';
import NoActiveChildPrompt from '@/components/dashboard/NoActiveChildPrompt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Assessment = () => {
  const { currentChildId, getCurrentChild } = useChildren();
  const { toast } = useToast();
  const { assessmentStatus, statusLoading, checkAssessmentStatus } = useAssessment();
  const [activeTab, setActiveTab] = useState<string>('take-assessment');
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  
  // Load feature status when component mounts or child changes
  useEffect(() => {
    if (currentChildId) {
      checkAssessmentStatus();
      loadFeatureStatus();
    }
  }, [currentChildId, checkAssessmentStatus]);
  
  // Get feature status from database
  const loadFeatureStatus = async () => {
    if (!currentChildId) return;
    
    try {
      const { data, error } = await supabase
        .from('children')
        .select('is_assessment_feature_enabled, nickname')
        .eq('id', currentChildId)
        .single();
      
      if (error) {
        console.error('Error fetching feature status:', error);
        return;
      }
      
      console.log('Assessment feature status loaded:', {
        childName: data.nickname,
        featureEnabled: data.is_assessment_feature_enabled
      });
      
      // For Akash, always default to true for testing
      if (data.nickname === 'Akash') {
        setIsFeatureEnabled(true);
        return;
      }
      
      setIsFeatureEnabled(!!data.is_assessment_feature_enabled);
    } catch (error) {
      console.error('Error loading feature status:', error);
    }
  };
  
  const handleAssessmentComplete = () => {
    checkAssessmentStatus();
    setActiveTab('progress');
  };
  
  const currentChild = getCurrentChild();
  
  if (!currentChildId) {
    return (
      <Layout requireAuth>
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">SEL Assessment</h1>
          <p className="text-gray-600 mb-8">
            Measure and track social-emotional learning progress
          </p>
          <NoActiveChildPrompt />
        </div>
      </Layout>
    );
  }
  
  if (statusLoading) {
    return (
      <Layout requireAuth>
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">SEL Assessment</h1>
          <p className="text-gray-600 mb-8">
            Measure and track social-emotional learning progress
          </p>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sprout-purple"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout requireAuth>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">SEL Assessment</h1>
          <p className="text-gray-600">
            Measure and track social-emotional learning progress
          </p>
        </div>
        
        {!isFeatureEnabled ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feature Not Enabled</AlertTitle>
            <AlertDescription>
              The SEL Assessment feature is not currently enabled for your account. Please contact support if you believe this is an error.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="take-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="progress">Progress Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="take-assessment" className="space-y-6">
              {!assessmentStatus?.nextAssessment ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Assessments Completed</AlertTitle>
                  <AlertDescription>
                    You have completed both the Pre and Post assessments. 
                    View your progress in the Progress Report tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="bg-sprout-green/5 border border-sprout-green/20 rounded-lg p-4 mb-6">
                    <h2 className="text-xl font-semibold text-sprout-green mb-2">
                      {assessmentStatus.nextAssessment === 'PRE' ? 'Pre-Assessment' : 'Post-Assessment'}
                    </h2>
                    <p className="text-gray-700">
                      {assessmentStatus.nextAssessment === 'PRE' 
                        ? 'This assessment establishes a baseline of your current social-emotional skills. Please answer all questions honestly.'
                        : 'This assessment helps measure your growth since the Pre-Assessment. Compare your results in the Progress Report tab.'}
                    </p>
                  </div>
                  
                  <AssessmentForm 
                    assessmentType={assessmentStatus.nextAssessment} 
                    onComplete={handleAssessmentComplete}
                  />
                </>
              )}
            </TabsContent>
            
            <TabsContent value="progress">
              <AssessmentComparison />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Assessment;
