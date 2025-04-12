
import { useState, ReactNode, useEffect, useCallback, useMemo } from "react";
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

  // Memoize fetchParentInfo to prevent recreation on each render
  const fetchParentInfo = useCallback(async (userId: string) => {
    try {
      console.log("Fetching parent info for user:", userId);
      setIsLoading(true);
      const data = await fetchParentInfoById(userId);
      
      if (data) {
        console.log("Parent data fetched successfully:", data);
        setParentInfoState(data);
      } else if (user) {
        // If parent record doesn't exist and we have user data, create one
        console.log("No parent record found, creating new one");
        const newParent = await createParentInfo(user);
        if (newParent) {
          console.log("New parent record created:", newParent);
          setParentInfoState(newParent);
        }
      }
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
      // Don't set parent info to null on error to prevent UI issues
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Only fetch parent info when user changes and userId exists
  useEffect(() => {
    let isMounted = true;
    
    if (user?.id) {
      console.log("User ID changed, fetching parent info:", user.id);
      setIsLoading(true);
      fetchParentInfo(user.id)
        .catch(err => {
          console.error("Error in initial parent info fetch:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      // Clear parent info if user is not logged in
      setParentInfoState(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, fetchParentInfo]);
  
  // Use useCallback for functions passed through context to prevent unnecessary re-renders
  const refreshParentInfo = useCallback(async () => {
    if (user?.id) {
      console.log("Explicitly refreshing parent info for user:", user.id);
      try {
        await fetchParentInfo(user.id);
      } catch (err) {
        console.error("Error refreshing parent info:", err);
      }
    }
  }, [user?.id, fetchParentInfo]);

  const setParentInfo = useCallback(async (info: ParentInfo | null) => {
    if (!info) {
      setParentInfoState(null);
      return;
    }
    
    try {
      console.log("Saving parent info:", info);
      const success = await saveParentInfo(info);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Could not save profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Update state with a new object to ensure React detects the change
      setParentInfoState(prevState => {
        // Create a completely new object to ensure reference changes
        return JSON.parse(JSON.stringify(info));
      });
      
      toast({
        title: "Success",
        description: "Profile saved successfully!"
      });
    } catch (error) {
      console.error("Error in setParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateParentInfo = useCallback(async (updatedInfo: Partial<ParentInfo>) => {
    if (!user?.id || !parentInfo) {
      console.error("Cannot update parent info: no user logged in or no parent info available");
      return;
    }
    
    console.log("Updating parent info with:", updatedInfo);
    
    try {
      const success = await updateParentInfoFields(parentInfo.id, updatedInfo);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Could not update profile. Please try again.",
          variant: "destructive"
        });
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
        
        console.log("Updated parent info state:", newParentInfo);
        return newParentInfo;
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [user?.id, parentInfo, toast]);

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
