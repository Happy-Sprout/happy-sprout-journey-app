
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GamificationManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gamification Management</h1>
        <p className="text-muted-foreground">
          Configure streak rules, XP allocation, and badges
        </p>
      </div>
      
      <Tabs defaultValue="streak-rules">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="streak-rules">Streak Rules</TabsTrigger>
          <TabsTrigger value="xp-allocation">XP Allocation</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="streak-rules">
          <Card>
            <CardHeader>
              <CardTitle>Streak Rules</CardTitle>
              <CardDescription>
                Configure streak rules for engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Streak rules management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="xp-allocation">
          <Card>
            <CardHeader>
              <CardTitle>XP Allocation</CardTitle>
              <CardDescription>
                Configure XP points allocation for different activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                XP allocation management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                Configure badges and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Badges management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationManagement;
