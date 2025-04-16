
import React, { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssessment } from '@/hooks/useAssessment';
import { useChildren } from '@/hooks/useChildren';
import AssessmentForm from '@/components/assessment/AssessmentForm';
import AssessmentComparison from '@/components/assessment/AssessmentComparison';
import NoActiveChildPrompt from '@/components/dashboard/NoActiveChildPrompt';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Assessment = () => {
  const { currentChildId, getCurrentChild } = useChildren();
  const { toast } = useToast();
  const { assessmentStatus, statusLoading, checkAssessmentStatus } = useAssessment();
  const [activeTab, setActiveTab] = useState<string>('take-assessment');
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  
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
  
  // Toggle feature flag in database
  const handleToggleFeature = async (newValue: boolean) => {
    if (!currentChildId) return;
    
    setIsToggleLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('children')
        .update({ is_assessment_feature_enabled: newValue })
        .eq('id', currentChildId)
        .select();
      
      if (error) {
        console.error('Error updating feature status:', error);
        toast({
          title: 'Update Failed',
          description: 'Could not update assessment feature status',
          variant: 'destructive'
        });
        return;
      }
      
      setIsFeatureEnabled(newValue);
      toast({
        title: 'Feature Updated',
        description: `Assessment feature ${newValue ? 'enabled' : 'disabled'} successfully`,
      });
      
      // Refresh assessment status
      checkAssessmentStatus();
      
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: 'Update Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsToggleLoading(false);
    }
  };
  
  const handleAssessmentComplete = () => {
    checkAssessmentStatus();
    setActiveTab('progress');
  };
  
  const currentChild = getCurrentChild();
  const isAkash = currentChild?.nickname === 'Akash';
  
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">SEL Assessment</h1>
            <p className="text-gray-600">
              Measure and track social-emotional learning progress
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="assessment-toggle" className="sr-only">
              Assessment Feature
            </Label>
            <span className="text-sm text-gray-500 hidden sm:inline">
              {isFeatureEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              id="assessment-toggle"
              checked={isFeatureEnabled}
              onCheckedChange={handleToggleFeature}
              disabled={isToggleLoading || isAkash}
            />
            <span className="text-xs text-gray-500 sm:hidden">
              {isFeatureEnabled ? 'On' : 'Off'}
            </span>
          </div>
        </div>
        
        {!isFeatureEnabled && !isAkash ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feature Not Enabled</AlertTitle>
            <AlertDescription>
              The SEL Assessment feature is currently disabled. Enable it using the toggle above.
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
