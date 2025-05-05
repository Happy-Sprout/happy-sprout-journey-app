
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserActivityStats from "@/components/admin/reporting/UserActivityStats";
import UserActivityChart from "@/components/admin/reporting/UserActivityChart";
import RecentUserActivity from "@/components/admin/reporting/RecentUserActivity";

const ReportingAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reporting & Analytics</h1>
        <p className="text-muted-foreground">
          View user activity, emotional trends, and assessment progress
        </p>
      </div>
      
      <Tabs defaultValue="user-activity">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="emotional-trends">Emotional Trends</TabsTrigger>
          <TabsTrigger value="assessment-progress">Assessment Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-activity" className="space-y-6">
          <UserActivityStats />
          <UserActivityChart />
          <RecentUserActivity />
        </TabsContent>
        
        <TabsContent value="emotional-trends">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Trends</CardTitle>
              <CardDescription>
                Analyze emotional well-being trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Emotional trends analysis interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assessment-progress">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Progress</CardTitle>
              <CardDescription>
                Track assessment completion and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Assessment progress reporting interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingAnalytics;
