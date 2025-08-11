import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DebugAnalytics = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Analytics Test</CardTitle>
          <CardDescription>Testing if basic components render</CardDescription>
        </CardHeader>
        <CardContent>
          <p>If you can see this, the basic component rendering works!</p>
          <p>Date: {new Date().toISOString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAnalytics;
