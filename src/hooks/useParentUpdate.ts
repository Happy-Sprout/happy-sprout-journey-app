
import { useCallback, useRef, useState } from "react";
import { ParentInfo, saveParentInfo } from "@/utils/parent";
import { useToast } from "@/hooks/use-toast";

export function useParentUpdate() {
  const preventApiCallsFlag = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Cleanup function to ensure all flags are reset
  const resetPrevention = useCallback(() => {
    console.log("Resetting prevention flags and submission state");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    preventApiCallsFlag.current = false;
    setIsSubmitting(false);
  }, []);
  
  // New function to set a prevention flag with timeout
  const preventApiCalls = useCallback(() => {
    console.log("Setting API call prevention flag");
    preventApiCallsFlag.current = true;
    
    // Set a timeout to automatically clear the flag after 10 seconds
    // This is a safety mechanism in case clearPrevention is never called
    timeoutRef.current = setTimeout(() => {
      console.log("Auto-clearing prevention flag after timeout");
      preventApiCallsFlag.current = false;
    }, 10000);
    
    // Return function to manually clear the prevention
    return () => {
      console.log("Manually clearing prevention flag");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      preventApiCallsFlag.current = false;
    };
  }, []);
  
  // Check if API calls are currently prevented
  const isApiCallPrevented = useCallback(() => {
    console.log("Checking if API calls are prevented, flag:", preventApiCallsFlag.current, "isSubmitting:", isSubmitting);
    return preventApiCallsFlag.current || isSubmitting;
  }, [isSubmitting]);
  
  // Main function to update parent info
  const updateParentInfo = useCallback(async (parentInfo: Partial<ParentInfo> & { id: string }): Promise<boolean> => {
    console.log("updateParentInfo called with:", parentInfo);
    
    // If already submitting or prevented, don't proceed
    if (preventApiCallsFlag.current) {
      console.log("API calls are currently prevented - not submitting");
      return false;
    }
    
    if (isSubmitting) {
      console.log("Already submitting - not proceeding with new submission");
      return false;
    }
    
    try {
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
      
      // Set the submission state
      setIsSubmitting(true);
      console.log("Setting isSubmitting to true");
      
      try {
        // Call the API to save parent info
        console.log("Calling saveParentInfo to update the database", parentInfo);
        
        // Type assertion to ensure type compatibility
        // This is safe because saveParentInfo will validate required fields server-side
        const success = await saveParentInfo(parentInfo as unknown as ParentInfo);
        
        console.log("saveParentInfo result:", success);
        
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
          description: "Profile updated successfully.",
        });
        
        return true;
      } finally {
        // Always reset the state, even in case of error
        console.log("Resetting submission state in finally block");
        setTimeout(() => {
          resetPrevention();
        }, 500); // Small delay to ensure UI state is consistent
      }
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, resetPrevention]);

  return {
    updateParentInfo,
    preventApiCalls,
    isApiCallPrevented,
    isSubmitting,
    resetPrevention
  };
}
