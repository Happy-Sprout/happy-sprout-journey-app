
import { useState, ReactNode, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ParentContext from "@/contexts/ParentContext";
import { ParentInfo } from "@/types/parentInfo";
import { 
  fetchParentInfoById,
  createParentInfo,
  saveParentInfo,
  updateParentInfoFields
} from "@/utils/parentDb";

export const ParentProvider = ({ children }: { children: ReactNode }) => {
  const [parentInfo, setParentInfoState] = useState<ParentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const fetchInProgress = useRef(false);
  const initialFetchDone = useRef(false);
  const preventApiCallsFlag = useRef(false);
  const lastUserIdFetched = useRef<string | null>(null);

  // Memoize fetchParentInfo to prevent recreation on each render
  const fetchParentInfo = useCallback(async (userId: string) => {
    // Prevent multiple concurrent fetches or fetching the same data again
    if (fetchInProgress.current || preventApiCallsFlag.current || lastUserIdFetched.current === userId) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      const data = await fetchParentInfoById(userId);
      lastUserIdFetched.current = userId;
      
      if (data) {
        setParentInfoState(prevState => {
          // Only update if data is different to prevent unnecessary re-renders
          if (JSON.stringify(prevState) !== JSON.stringify(data)) {
            return data;
          }
          return prevState;
        });
      } else if (user) {
        // If parent record doesn't exist and we have user data, create one
        const newParent = await createParentInfo(user);
        if (newParent) {
          setParentInfoState(newParent);
        }
      }
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
      // Don't set parent info to null on error to prevent UI issues
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [user]);

  // Only fetch parent info once when user changes and userId exists
  useEffect(() => {
    if (!user?.id) return;
    
    if (!initialFetchDone.current || lastUserIdFetched.current !== user.id) {
      initialFetchDone.current = true;
      fetchParentInfo(user.id).catch(err => {
        console.error("Error in initial parent info fetch:", err);
      });
    }
    
    return () => {
      // Clean up on unmount
      initialFetchDone.current = false;
    };
  }, [user?.id, fetchParentInfo]);
  
  // Temporarily prevent API calls during state updates
  const preventApiCalls = useCallback(() => {
    preventApiCallsFlag.current = true;
    return () => {
      preventApiCallsFlag.current = false;
    };
  }, []);
  
  // Use useCallback for functions passed through context to prevent unnecessary re-renders
  const refreshParentInfo = useCallback(async () => {
    if (!user?.id || fetchInProgress.current || preventApiCallsFlag.current) return;
    
    lastUserIdFetched.current = null; // Force a refresh by resetting this
    try {
      await fetchParentInfo(user.id);
    } catch (err) {
      console.error("Error refreshing parent info:", err);
    }
  }, [user?.id, fetchParentInfo]);

  const setParentInfo = useCallback(async (info: ParentInfo | null) => {
    if (!info) {
      setParentInfoState(null);
      return;
    }
    
    try {
      // Prevent concurrent API calls during this operation
      const releaseFlag = preventApiCalls();
      
      const success = await saveParentInfo(info);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Could not save profile. Please try again.",
          variant: "destructive"
        });
        releaseFlag();
        return;
      }
      
      // Update state with a new object to ensure React detects the change
      setParentInfoState(() => ({...info}));
      
      toast({
        title: "Success",
        description: "Profile saved successfully!"
      });
      
      // Release the flag after state is updated
      setTimeout(releaseFlag, 100);
    } catch (error) {
      console.error("Error in setParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, preventApiCalls]);

  const updateParentInfo = useCallback(async (updatedInfo: Partial<ParentInfo>) => {
    if (!user?.id || !parentInfo) {
      console.error("Cannot update parent info: no user logged in or no parent info available");
      return;
    }
    
    try {
      // Prevent concurrent API calls during this operation
      const releaseFlag = preventApiCalls();
      
      const success = await updateParentInfoFields(parentInfo.id, updatedInfo);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Could not update profile. Please try again.",
          variant: "destructive"
        });
        releaseFlag();
        return;
      }
      
      // Immediately update local state with the new data immutably
      setParentInfoState(prev => {
        if (!prev) {
          if (
            !updatedInfo.name ||
            !updatedInfo.email ||
            !updatedInfo.id
          ) {
            console.error("Missing required fields for parent info");
            return null;
          }
          
          return updatedInfo as ParentInfo;
        }
        
        // Create a completely new object instead of mutating the existing one
        const newParentInfo = {
          ...prev,
          ...updatedInfo
        };
        
        return newParentInfo;
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      // Release the flag after state is updated
      setTimeout(releaseFlag, 100);
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [user?.id, parentInfo, toast, preventApiCalls]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    parentInfo,
    isLoading,
    setParentInfo,
    updateParentInfo,
    fetchParentInfo,
    refreshParentInfo
  }), [parentInfo, isLoading, setParentInfo, updateParentInfo, fetchParentInfo, refreshParentInfo]);

  return (
    <ParentContext.Provider value={contextValue}>
      {children}
    </ParentContext.Provider>
  );
};

export default ParentProvider;
