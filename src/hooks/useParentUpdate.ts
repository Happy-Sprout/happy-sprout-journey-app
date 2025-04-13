
import { useCallback, useRef, useState } from "react";
import { ParentInfo, saveParentInfo } from "@/utils/parent";
import { useToast } from "@/hooks/use-toast";

export function useParentUpdate() {
  const preventApiCallsFlag = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const preventApiCalls = useCallback(() => {
    preventApiCallsFlag.current = true;
    return () => {
      preventApiCallsFlag.current = false;
    };
  }, []);
  
  const isApiCallPrevented = useCallback(() => {
    return preventApiCallsFlag.current || isSubmitting;
  }, [isSubmitting]);
  
  const resetPrevention = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    preventApiCallsFlag.current = false;
    setIsSubmitting(false);
  }, []);
  
  const updateParentInfo = useCallback(async (parentInfo: Partial<ParentInfo> & { id: string }): Promise<boolean> => {
    // If already submitting or prevented, don't proceed
    if (preventApiCallsFlag.current || isSubmitting) {
      console.log("API calls are currently prevented or already submitting");
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
      
      // Set the submission state
      setIsSubmitting(true);
      
      // Use a timeout to ensure the flag is reset after a reasonable time
      timeoutRef.current = setTimeout(() => {
        resetPrevention();
      }, 10000); // 10 seconds timeout
      
      try {
        // Call the API to save parent info
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
          description: "Profile updated successfully.",
        });
        
        return true;
      } finally {
        // Clear the timeout to prevent unnecessary flag resets
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
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
      // IMPORTANT: Always release the flags, even in case of errors
      resetPrevention();
    }
  }, [toast, isSubmitting, resetPrevention]);

  return {
    updateParentInfo,
    preventApiCalls,
    isApiCallPrevented,
    isSubmitting
  };
}
