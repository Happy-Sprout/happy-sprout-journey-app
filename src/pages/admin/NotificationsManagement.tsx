
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NotificationsManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications Management</h1>
        <p className="text-muted-foreground">
          Configure parent and child notification triggers
        </p>
      </div>
      
      <Tabs defaultValue="parent-notifications">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="parent-notifications">Parent Notifications</TabsTrigger>
          <TabsTrigger value="child-notifications">Child Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parent-notifications">
          <Card>
            <CardHeader>
              <CardTitle>Parent Notifications</CardTitle>
              <CardDescription>
                Configure notifications for parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Parent notifications management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="child-notifications">
          <Card>
            <CardHeader>
              <CardTitle>Child Notifications</CardTitle>
              <CardDescription>
                Configure notifications for children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Child notifications management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsManagement;
