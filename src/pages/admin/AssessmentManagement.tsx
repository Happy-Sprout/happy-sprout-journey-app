
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AssessmentManagement = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assessment Management</h1>
          <p className="text-muted-foreground">
            Manage assessment questions for children and parents
          </p>
        </div>
        
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
                <p className="text-center py-8 text-muted-foreground">
                  Child assessment questions management interface will be implemented here.
                </p>
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
    </AdminLayout>
  );
};

export default AssessmentManagement;
