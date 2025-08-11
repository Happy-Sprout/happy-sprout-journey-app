import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { seedDummyDataSafe, clearDummyDataSafe } from "@/utils/seedDataSafe";
import { seedEnhancedDummyData } from "@/utils/seedEnhancedData";
import { Loader2, Database, Trash2, CheckCircle, AlertCircle, Shield, Zap } from "lucide-react";

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEnhancedSeeding, setIsEnhancedSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerateData = async () => {
    setIsSeeding(true);
    setResult(null);
    
    try {
      const result = await seedDummyDataSafe();
      setResult(result);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.message || "Failed to generate demo data" 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleGenerateEnhancedData = async () => {
    setIsEnhancedSeeding(true);
    setResult(null);
    
    try {
      const result = await seedEnhancedDummyData();
      setResult(result);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.message || "Failed to generate enhanced demo data" 
      });
    } finally {
      setIsEnhancedSeeding(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    setResult(null);
    
    try {
      const result = await clearDummyDataSafe();
      setResult(result);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data Management
        </CardTitle>
        <CardDescription>
          Generate sample data to test the analytics dashboard features. Using authenticated user context to work with Row Level Security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleGenerateData} 
            disabled={isSeeding || isEnhancedSeeding || isClearing}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            Generate Basic Data
          </Button>

          <Button 
            onClick={handleGenerateEnhancedData} 
            disabled={isSeeding || isEnhancedSeeding || isClearing}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isEnhancedSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Generate Enhanced Data
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleClearData} 
            disabled={isSeeding || isEnhancedSeeding || isClearing}
            className="flex items-center gap-2"
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Clear Demo Data
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <AlertDescription>
              {result.success ? (
                <div>
                  <p className="font-medium">Demo data generated successfully!</p>
                  {result.summary && (
                    <ul className="mt-2 text-sm list-disc list-inside">
                      <li>{result.summary.parents} parents created</li>
                      <li>{result.summary.children} children created</li>
                      <li>{result.summary.selInsights} SEL assessments created</li>
                      <li>{result.summary.journalEntries} journal entries created</li>
                      {result.summary.activityLogs && <li>{result.summary.activityLogs} activity logs created</li>}
                      {result.summary.timespan && <li>Timespan: {result.summary.timespan}</li>}
                      {result.summary.diversity && <li>{result.summary.diversity}</li>}
                    </ul>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium">Error: {result.error}</p>
                  <p className="text-sm mt-1">Please check the console for more details.</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Basic Data Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Basic Demo Data:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Uses your authenticated user account as parent</li>
              <li>• 3 sample children (ages 8-10)</li>
              <li>• 15-24 SEL assessments across 30 days</li>
              <li>• 15-30 journal entries with mood tracking</li>
              <li>• Progressive improvement data showing growth</li>
            </ul>
          </div>

          {/* Enhanced Data Info */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Enhanced Demo Data:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 6 diverse children with unique personalities</li>
              <li>• 90 days of comprehensive SEL data</li>
              <li>• 200+ realistic journal entries</li>
              <li>• 500+ user activity logs</li>
              <li>• Advanced analytics patterns and trends</li>
              <li>• Realistic improvement trajectories</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;