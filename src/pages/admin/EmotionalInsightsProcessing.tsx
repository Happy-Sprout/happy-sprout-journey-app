
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const EmotionalInsightsProcessing = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const processBatch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://ghucegvhempgmdykosiw.functions.supabase.co/batch-process-journal-entries',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            limit,
            offset
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error processing batch: ${response.statusText}`);
      }
      
      const result = await response.json();
      setResults(result);
      
      toast({
        title: "Batch Processing Complete",
        description: `Successfully processed ${result.processed} entries, failed: ${result.failed}`,
      });
    } catch (error) {
      console.error("Error processing batch:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Emotional Insights Batch Processing</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Process Journal Entries</CardTitle>
            <CardDescription>
              This tool will analyze journal entries that haven't been processed yet and generate emotional growth insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="limit">Limit (entries per batch)</Label>
                <Input 
                  id="limit" 
                  type="number" 
                  value={limit} 
                  onChange={(e) => setLimit(parseInt(e.target.value))} 
                  min={1}
                  max={100}
                />
              </div>
              <div>
                <Label htmlFor="offset">Offset (skip entries)</Label>
                <Input 
                  id="offset" 
                  type="number" 
                  value={offset} 
                  onChange={(e) => setOffset(parseInt(e.target.value))} 
                  min={0}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={processBatch} disabled={loading}>
              {loading ? "Processing..." : "Process Batch"}
            </Button>
          </CardFooter>
        </Card>
        
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <Badge variant="default" className="text-base py-1 px-3">
                  Processed: {results.processed}
                </Badge>
                <Badge variant="outline" className="text-base py-1 px-3">
                  Skipped: {results.skipped}
                </Badge>
                <Badge variant="destructive" className="text-base py-1 px-3">
                  Failed: {results.failed}
                </Badge>
              </div>
              
              {results.processedEntries?.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Processed Entries</h3>
                  <div className="bg-slate-50 p-3 rounded-md mb-4 max-h-60 overflow-auto">
                    <pre className="text-xs">{JSON.stringify(results.processedEntries, null, 2)}</pre>
                  </div>
                </>
              )}
              
              {results.failedEntries?.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Failed Entries</h3>
                  <div className="bg-red-50 p-3 rounded-md max-h-60 overflow-auto">
                    <pre className="text-xs">{JSON.stringify(results.failedEntries, null, 2)}</pre>
                  </div>
                </>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOffset(offset + limit)}
                  disabled={results.processed === 0}
                >
                  Process Next Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default EmotionalInsightsProcessing;
