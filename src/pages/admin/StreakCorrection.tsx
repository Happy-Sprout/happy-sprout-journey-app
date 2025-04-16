
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { correctExistingStreakCounts } from "@/utils/streakCorrection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface CorrectionResult {
  success: boolean;
  message?: string;
  error?: string;
  resetChildren?: string[];
}

const StreakCorrection = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);

  const handleCorrection = async () => {
    if (isRunning) return;
    
    if (!confirm("Are you sure you want to run the streak correction utility? This will reset streaks for users who haven't checked in recently.")) {
      return;
    }
    
    setIsRunning(true);
    setResult(null);
    
    try {
      const correctionResult = await correctExistingStreakCounts();
      setResult(correctionResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Streak Count Correction Utility</h1>
        <p className="text-muted-foreground">
          One-time utility to fix streak counts for users who missed check-ins
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Correct Streak Counts</CardTitle>
          <CardDescription>
            This utility will find all users whose last check-in was more than one day ago
            and reset their streak count to 0. This corrects historical data after fixing
            the streak calculation logic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Caution</AlertTitle>
            <AlertDescription>
              This operation will update the database and cannot be undone.
              Make sure you have a database backup before proceeding.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleCorrection} 
            disabled={isRunning}
            variant="destructive"
          >
            {isRunning ? "Running Correction..." : "Run Streak Correction"}
          </Button>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message || result.error || "Operation completed"}
                
                {result.resetChildren && result.resetChildren.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Reset {result.resetChildren.length} users:</p>
                    <div className="max-h-40 overflow-y-auto mt-1 text-xs bg-background p-2 rounded">
                      {result.resetChildren.map((id, index) => (
                        <div key={id}>{index + 1}. {id}</div>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakCorrection;
