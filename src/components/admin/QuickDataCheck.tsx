import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const QuickDataCheck = () => {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runQuickQueries = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Run several quick queries to verify data
      const queries = [
        {
          name: "Parents Count",
          query: () => supabase.from('parents').select('*', { count: 'exact', head: true })
        },
        {
          name: "Children with Details", 
          query: () => supabase.from('children').select('id, nickname, age, parent_id').limit(5)
        },
        {
          name: "Recent SEL Insights",
          query: () => supabase.from('sel_insights').select('id, child_id, self_awareness, created_at').order('created_at', { ascending: false }).limit(3)
        },
        {
          name: "Journal Entries Count",
          query: () => supabase.from('journal_entries').select('*', { count: 'exact', head: true })
        },
        {
          name: "Activity Logs Sample",
          query: () => supabase.from('user_activity_logs').select('action_type, created_at').limit(3)
        }
      ];

      const results = {};
      
      for (const { name, query } of queries) {
        try {
          const result = await query();
          if (result.error) {
            results[name] = { error: result.error.message };
          } else {
            results[name] = { 
              data: result.data, 
              count: result.count,
              success: true 
            };
          }
        } catch (error) {
          results[name] = { error: error.message };
        }
      }

      setResult(results);
      console.log("Quick data check results:", results);

    } catch (error) {
      setResult({ error: error.message });
      console.error("Quick check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Quick Data Check
        </CardTitle>
        <CardDescription>
          Run sample queries to verify demo data exists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runQuickQueries} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Database className="h-4 w-4 animate-pulse" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run Quick Checks
        </Button>

        {result && (
          <div className="space-y-3">
            {Object.entries(result).map(([queryName, queryResult]: [string, any]) => (
              <Alert key={queryName} variant={queryResult.success ? "default" : "destructive"}>
                <AlertDescription>
                  <div>
                    <p className="font-medium">{queryName}</p>
                    {queryResult.error ? (
                      <p className="text-sm text-red-600 mt-1">Error: {queryResult.error}</p>
                    ) : (
                      <div className="text-sm mt-1">
                        {queryResult.count !== undefined && (
                          <p>Count: {queryResult.count}</p>
                        )}
                        {queryResult.data && queryResult.data.length > 0 && (
                          <Textarea 
                            value={JSON.stringify(queryResult.data, null, 2)} 
                            readOnly 
                            className="mt-2 h-24 text-xs font-mono"
                          />
                        )}
                        {queryResult.data && queryResult.data.length === 0 && (
                          <p className="text-yellow-600">No data found</p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickDataCheck;
