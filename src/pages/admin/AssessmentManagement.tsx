
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AssessmentManagement = () => {
  const [isPrePostEnabled, setIsPrePostEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch the current feature flag value
    const fetchFeatureFlag = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'is_pre_post_assessment_enabled')
          .single();
        
        if (error) {
          throw error;
        }
        
        setIsPrePostEnabled(data?.setting_value === true);
      } catch (error) {
        console.error('Error fetching Pre/Post Assessment feature flag:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assessment settings',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatureFlag();
  }, [toast]);

  // Toggle the Pre/Post Assessment feature
  const togglePrePostAssessment = async (enabled: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('admin_settings')
        .update({ setting_value: enabled })
        .eq('setting_key', 'is_pre_post_assessment_enabled');
      
      if (error) {
        throw error;
      }
      
      setIsPrePostEnabled(enabled);
      
      toast({
        title: 'Setting Updated',
        description: `Pre/Post Assessment feature has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessment Management</h1>
        <p className="text-muted-foreground">
          Manage assessment questions for children and parents
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>
            Enable or disable assessment features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Pre/Post SEL Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Allow children to take both Pre and Post SEL assessments to track progress
              </p>
            </div>
            <Switch 
              checked={isPrePostEnabled}
              onCheckedChange={togglePrePostAssessment}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="child-assessments">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="child-assessments">Child Assessments</TabsTrigger>
          <TabsTrigger value="parent-assessments">Parent Assessments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="child-assessments">
          <Card>
            <CardHeader>
              <CardTitle>Child Assessment Questions</CardTitle>
              <CardDescription>
                Manage assessment questions for children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">SEL Assessment Questions</h3>
                  <Button variant="outline" size="sm">Manage Questions</Button>
                </div>
                <p className="text-center py-4 text-muted-foreground">
                  The SEL assessment contains questions across 5 dimensions: Self-Awareness, Self-Management, 
                  Social Awareness, Relationship Skills, and Responsible Decision-Making.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parent-assessments">
          <Card>
            <CardHeader>
              <CardTitle>Parent Assessment Questions</CardTitle>
              <CardDescription>
                Manage assessment questions for parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Parent assessment questions management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentManagement;
