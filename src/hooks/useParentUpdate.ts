
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
    // Check if API calls are prevented BEFORE trying to update
    if (preventApiCallsFlag.current) {
      console.log("API calls are currently prevented");
      return false;
    }
    
    try {
      console.log("Calling saveParentInfo with:", parentInfo);
      
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
      
      // Set the flag BEFORE making the API call
      preventApiCallsFlag.current = true;
      
      // Use a timeout to ensure the flag is reset after a reasonable time
      // This prevents the API call from being blocked indefinitely if there's an error
      const resetTimer = setTimeout(() => {
        preventApiCallsFlag.current = false;
      }, 10000); // 10 seconds timeout
      
      try {
        const success = await saveParentInfo(parentInfo as ParentInfo);
        
        if (!success) {
          toast({
            title: "Error",
            description: "Could not update profile. Please try again.",
            variant: "destructive"
          });
          return false;
        }
        
        return true;
      } finally {
        // Clear the timeout to prevent unnecessary flag resets
        clearTimeout(resetTimer);
      }
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
      preventApiCallsFlag.current = false;
    }
  }, [toast]);

  return {
    updateParentInfo,
    preventApiCalls,
    isApiCallPrevented
  };
}
