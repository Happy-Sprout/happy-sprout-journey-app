import { useState } from "react";
import { useParent } from "@/hooks/useParent";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const ParentProfileTest = () => {
  const { user } = useAuth();
  const { parentInfo, updateParentInfo, setParentInfo, isLoading } = useParent();
  const { toast } = useToast();
  
  const [testName, setTestName] = useState(parentInfo?.name || "");
  const [testEmail, setTestEmail] = useState(parentInfo?.email || "");
  const [isTesting, setIsTesting] = useState(false);

  const handleTestUpdate = async () => {
    if (!testName || !testEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and email",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    console.log("🧪 Testing parent profile update...");
    
    try {
      let result;
      
      if (parentInfo) {
        // Update existing
        result = await updateParentInfo({
          ...parentInfo,
          name: testName,
          email: testEmail
        });
        console.log("🧪 Update result:", result);
      } else {
        // Create new
        result = await setParentInfo({
          id: user?.id || "test-id",
          name: testName,
          email: testEmail,
          relationship: "Parent",
          emergencyContact: ""
        });
        console.log("🧪 Create result:", result);
      }
      
      if (result) {
        toast({
          title: "Success!",
          description: "Parent profile test update successful",
        });
      } else {
        toast({
          title: "Failed",
          description: "Parent profile test update failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("🧪 Test error:", error);
      toast({
        title: "Error",
        description: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Layout requireAuth>
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Parent Profile Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                This is a test page to debug parent profile editing issues.
                Current status: {parentInfo ? "Has parent info" : "No parent info"} | 
                Loading: {isLoading ? "Yes" : "No"}
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Enter test name"
                />
              </div>
              
              <div>
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email"
                />
              </div>
              
              <Button 
                onClick={handleTestUpdate}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? "Testing..." : "Test Save Parent Profile"}
              </Button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2">Current State:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify({
                  user: user ? { id: user.id, email: user.email } : null,
                  parentInfo,
                  isLoading
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ParentProfileTest;
