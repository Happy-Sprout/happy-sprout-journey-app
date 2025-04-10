
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContentManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Manage daily questions, role-play scenarios, and motivational quotes
        </p>
      </div>
      
      <Tabs defaultValue="daily-questions">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily-questions">Daily Questions</TabsTrigger>
          <TabsTrigger value="roleplay">Role-play Scenarios</TabsTrigger>
          <TabsTrigger value="quotes">Motivational Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily-questions">
          <Card>
            <CardHeader>
              <CardTitle>Daily Questions</CardTitle>
              <CardDescription>
                Manage questions for daily check-ins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Daily questions management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roleplay">
          <Card>
            <CardHeader>
              <CardTitle>Role-play Scenarios</CardTitle>
              <CardDescription>
                Manage role-play scenarios for social skills development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Role-play scenarios management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Motivational Quotes</CardTitle>
              <CardDescription>
                Manage the collection of motivational quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Motivational quotes management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
