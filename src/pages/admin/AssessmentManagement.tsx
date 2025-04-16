
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ChildProfile = {
  id: string;
  nickname: string;
  age: number;
  parent_name?: string;
  is_assessment_feature_enabled: boolean;
};

const AssessmentManagement = () => {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ChildProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildProfiles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProfiles(childProfiles);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredProfiles(
        childProfiles.filter(
          child => 
            child.nickname.toLowerCase().includes(lowercaseQuery) || 
            (child.parent_name && child.parent_name.toLowerCase().includes(lowercaseQuery))
        )
      );
    }
  }, [searchQuery, childProfiles]);

  const fetchChildProfiles = async () => {
    try {
      setLoading(true);
      
      // Get children with their parent names and assessment feature status
      const { data, error } = await supabase
        .from('children')
        .select(`
          id,
          nickname,
          age,
          is_assessment_feature_enabled,
          parents (name)
        `)
        .order('nickname');
      
      if (error) {
        throw error;
      }
      
      const formattedProfiles = data.map(child => ({
        id: child.id,
        nickname: child.nickname,
        age: child.age,
        parent_name: child.parents?.name,
        is_assessment_feature_enabled: child.is_assessment_feature_enabled
      }));
      
      setChildProfiles(formattedProfiles);
      setFilteredProfiles(formattedProfiles);
    } catch (error) {
      console.error('Error fetching child profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load child profiles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAssessmentFeature = async (childId: string, enabled: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('children')
        .update({ is_assessment_feature_enabled: enabled })
        .eq('id', childId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setChildProfiles(prevState => 
        prevState.map(child => 
          child.id === childId 
            ? { ...child, is_assessment_feature_enabled: enabled } 
            : child
        )
      );
      
      toast({
        title: 'Setting Updated',
        description: `Pre/Post Assessment feature has been ${enabled ? 'enabled' : 'disabled'} for ${childProfiles.find(c => c.id === childId)?.nickname}.`,
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
          Manage assessment questions and settings for children
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Per-Child Assessment Feature Settings
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Enable or disable the Pre/Post SEL Assessment feature for individual children. 
                    This determines whether a child can take assessments to track their progress.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Control which children can access Pre/Post SEL assessments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by child or parent name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Enable Assessments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No children found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.nickname}</TableCell>
                    <TableCell>{child.age}</TableCell>
                    <TableCell>{child.parent_name || 'Unknown'}</TableCell>
                    <TableCell className="text-right">
                      <Switch 
                        checked={child.is_assessment_feature_enabled}
                        onCheckedChange={(checked) => toggleAssessmentFeature(child.id, checked)}
                        disabled={loading}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
