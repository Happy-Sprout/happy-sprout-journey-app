
import { useCallback, useRef } from "react";
import { ParentInfo, saveParentInfo } from "@/utils/parent";
import { useToast } from "@/hooks/use-toast";

export function useParentUpdate() {
  const preventApiCallsFlag = useRef(false);
  const { toast } = useToast();
  
  const preventApiCalls = useCallback(() => {
    preventApiCallsFlag.current = true;
    return () => {
      preventApiCallsFlag.current = false;
    };
  }, []);
  
  const isApiCallPrevented = useCallback(() => {
    return preventApiCallsFlag.current;
  }, []);
  
  const updateParentInfo = useCallback(async (parentInfo: Partial<ParentInfo> & { id: string }): Promise<boolean> => {
    if (preventApiCallsFlag.current) {
      console.log("API calls are currently prevented");
      return false;
    }
    
    try {
      console.log("Calling saveParentInfo with:", parentInfo);
      // Store the release function in a variable so we can call it in finally
      const releaseFlag = preventApiCalls();
      
      // Make sure we have the required fields
      if (!parentInfo.id) {
        console.error("Missing required parent ID for update");
        toast({
          title: "Error",
          description: "Missing required information for update",
          variant: "destructive"
        });
        return false;
      }
      
      const success = await saveParentInfo(parentInfo as ParentInfo);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Could not update profile. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      return true;
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      // IMPORTANT: Always release the flag, even in case of errors
      // This ensures we don't get stuck in a state where API calls are prevented
      preventApiCallsFlag.current = false;
    }
  }, [toast, preventApiCalls]);

  return {
    updateParentInfo,
    preventApiCalls,
    isApiCallPrevented
  };
}
