import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DataValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateData = async () => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      console.log("Starting data validation...");
      
      // Check all tables for data
      const [parentsResult, childrenResult, selInsightsResult, journalResult, activityResult] = await Promise.allSettled([
        supabase.from('parents').select('*', { count: 'exact', head: true }),
        supabase.from('children').select('*', { count: 'exact', head: true }),
        supabase.from('sel_insights').select('*', { count: 'exact', head: true }),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
        supabase.from('user_activity_logs').select('*', { count: 'exact', head: true })
      ]);

      const validation = {
        success: true,
        tables: {},
        errors: [],
        totalRecords: 0
      };

      // Process results
      if (parentsResult.status === 'fulfilled' && !parentsResult.value.error) {
        validation.tables.parents = parentsResult.value.count || 0;
        validation.totalRecords += parentsResult.value.count || 0;
        console.log(`Parents: ${parentsResult.value.count}`);
      } else {
        validation.errors.push('Failed to count parents');
        console.error('Parents error:', parentsResult);
      }

      if (childrenResult.status === 'fulfilled' && !childrenResult.value.error) {
        validation.tables.children = childrenResult.value.count || 0;
        validation.totalRecords += childrenResult.value.count || 0;
        console.log(`Children: ${childrenResult.value.count}`);
      } else {
        validation.errors.push('Failed to count children');
        console.error('Children error:', childrenResult);
      }

      if (selInsightsResult.status === 'fulfilled' && !selInsightsResult.value.error) {
        validation.tables.sel_insights = selInsightsResult.value.count || 0;
        validation.totalRecords += selInsightsResult.value.count || 0;
        console.log(`SEL Insights: ${selInsightsResult.value.count}`);
      } else {
        validation.errors.push('Failed to count SEL insights');
        console.error('SEL insights error:', selInsightsResult);
      }

      if (journalResult.status === 'fulfilled' && !journalResult.value.error) {
        validation.tables.journal_entries = journalResult.value.count || 0;
        validation.totalRecords += journalResult.value.count || 0;
        console.log(`Journal entries: ${journalResult.value.count}`);
      } else {
        validation.errors.push('Failed to count journal entries');
        console.error('Journal error:', journalResult);
      }

      if (activityResult.status === 'fulfilled' && !activityResult.value.error) {
        validation.tables.user_activity_logs = activityResult.value.count || 0;
        validation.totalRecords += activityResult.value.count || 0;
        console.log(`Activity logs: ${activityResult.value.count}`);
      } else {
        validation.errors.push('Failed to count activity logs');
        console.error('Activity logs error:', activityResult);
      }

      // Sample some actual data
      const { data: sampleChildren, error: sampleError } = await supabase
        .from('children')
        .select('id, nickname, age')
        .limit(3);

      if (!sampleError && sampleChildren) {
        validation.sampleData = sampleChildren;
        console.log('Sample children:', sampleChildren);
      }

      // Check for recent SEL insights
      const { data: recentInsights, error: insightsError } = await supabase
        .from('sel_insights')
        .select('id, child_id, created_at, self_awareness, self_management')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!insightsError && recentInsights) {
        validation.recentInsights = recentInsights;
        console.log('Recent insights:', recentInsights);
      }

      validation.success = validation.totalRecords > 0 && validation.errors.length === 0;
      setValidationResult(validation);

      console.log('Validation complete:', validation);

    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({ 
        success: false, 
        error: error.message,
        tables: {},
        totalRecords: 0
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Data Validation
        </CardTitle>
        <CardDescription>
          Check if demo data was successfully created in the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={validateData} 
          disabled={isValidating}
          className="flex items-center gap-2"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Validate Data
        </Button>

        {validationResult && (
          <Alert variant={validationResult.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {validationResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <AlertDescription>
              {validationResult.success ? (
                <div>
                  <p className="font-medium">Data validation successful!</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Total Records:</strong> {validationResult.totalRecords}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(validationResult.tables).map(([table, count]) => (
                        <div key={table} className="flex justify-between">
                          <span>{table.replace('_', ' ')}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                    
                    {validationResult.sampleData && (
                      <div className="mt-2">
                        <p className="font-medium">Sample Children:</p>
                        {validationResult.sampleData.map((child: any) => (
                          <div key={child.id} className="text-xs">
                            • {child.nickname} (age {child.age})
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.recentInsights && (
                      <div className="mt-2">
                        <p className="font-medium">Recent SEL Insights:</p>
                        {validationResult.recentInsights.slice(0, 3).map((insight: any) => (
                          <div key={insight.id} className="text-xs">
                            • Self-awareness: {(insight.self_awareness * 100).toFixed(0)}%, 
                              Self-management: {(insight.self_management * 100).toFixed(0)}%
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Validation failed!</p>
                  {validationResult.error && (
                    <p className="text-sm mt-1">Error: {validationResult.error}</p>
                  )}
                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <ul className="text-sm mt-1 list-disc list-inside">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-sm mt-1">
                    Total records found: {validationResult.totalRecords}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Troubleshooting:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Check browser console (F12) for any errors</li>
            <li>2. Ensure you have proper database permissions</li>
            <li>3. Verify Supabase connection is working</li>
            <li>4. Check if RLS (Row Level Security) policies allow data access</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataValidator;
