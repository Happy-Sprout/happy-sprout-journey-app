
import { useState, ReactNode, useEffect } from "react";
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
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch parent info whenever user changes
  useEffect(() => {
    if (user?.id) {
      fetchParentInfo(user.id);
    } else {
      // Clear parent info if user is not logged in
      setParentInfoState(null);
    }
  }, [user]);
  
  const fetchParentInfo = async (userId: string) => {
    try {
      console.log("Fetching parent info for user:", userId);
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
    }
  };

  const refreshParentInfo = async () => {
    if (user?.id) {
      console.log("Refreshing parent info for user:", user.id);
      await fetchParentInfo(user.id);
    }
  };

  const setParentInfo = async (info: ParentInfo | null) => {
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
      setParentInfoState({...info});
      
      toast({
        title: "Success",
        description: "Profile saved successfully!"
      });
      
      // Refresh data from the server to ensure consistency
      await refreshParentInfo();
    } catch (error) {
      console.error("Error in setParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateParentInfo = async (updatedInfo: Partial<ParentInfo>) => {
    if (!user?.id || !parentInfo) {
      console.error("Cannot update parent info: no user logged in or no parent info available");
      return;
    }
    
    try {
      console.log("Updating parent info with:", updatedInfo);
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
            !updatedInfo.relationship ||
            !updatedInfo.email ||
            !updatedInfo.emergencyContact ||
            !updatedInfo.id
          ) {
            console.error("Missing required fields for parent info");
            return null;
          }
          
          return updatedInfo as ParentInfo;
        }
        
        // Create a new object instead of mutating the existing one
        return { ...prev, ...updatedInfo };
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      // Also refresh from the database to ensure we have the latest data
      await refreshParentInfo();
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <ParentContext.Provider
      value={{
        parentInfo,
        setParentInfo,
        updateParentInfo,
        fetchParentInfo,
        refreshParentInfo
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export default ParentProvider;
