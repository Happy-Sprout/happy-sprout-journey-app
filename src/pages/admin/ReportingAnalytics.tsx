
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserActivityStats from "@/components/admin/reporting/UserActivityStats";
import UserActivityChart from "@/components/admin/reporting/UserActivityChart";
import RecentUserActivity from "@/components/admin/reporting/RecentUserActivity";
import EmotionalTrendsAnalyticsFixed from "@/components/admin/reporting/EmotionalTrendsAnalyticsFixed";
import AssessmentProgressAnalyticsFixed from "@/components/admin/reporting/AssessmentProgressAnalyticsFixed";
import DebugAnalytics from "@/components/admin/reporting/DebugAnalytics";
import DataSeeder from "@/components/admin/DataSeeder";

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
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="emotional-trends">Emotional Trends</TabsTrigger>
          <TabsTrigger value="assessment-progress">Assessment Progress</TabsTrigger>
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-activity" className="space-y-6">
          <UserActivityStats />
          <UserActivityChart />
          <RecentUserActivity />
        </TabsContent>
        
        <TabsContent value="emotional-trends">
          <EmotionalTrendsAnalyticsFixed />
        </TabsContent>
        
        <TabsContent value="assessment-progress">
          <AssessmentProgressAnalyticsFixed />
        </TabsContent>

        <TabsContent value="data-management">
          <DataSeeder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingAnalytics;
