
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
      const data = await fetchParentInfoById(userId);
      
      if (data) {
        setParentInfoState(data);
      } else if (user) {
        // If parent record doesn't exist and we have user data, create one
        const newParent = await createParentInfo(user);
        if (newParent) {
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
      const success = await saveParentInfo(info);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Could not save profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setParentInfoState(info);
      
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
  };

  const updateParentInfo = async (updatedInfo: Partial<ParentInfo>) => {
    if (!user?.id || !parentInfo) {
      console.error("Cannot update parent info: no user logged in or no parent info available");
      return;
    }
    
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
      
      // Immediately update local state with the new data
      setParentInfoState((prev) => {
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
        
        return { ...prev, ...updatedInfo };
      });
      
      // Also refresh from the database to ensure we have the latest data
      await fetchParentInfo(parentInfo.id);
      
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
