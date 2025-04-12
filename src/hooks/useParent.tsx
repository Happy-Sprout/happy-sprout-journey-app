
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export type ParentInfo = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  emergencyContact: string;
  additionalInfo?: string;
};

type ParentContextType = {
  parentInfo: ParentInfo | null;
  setParentInfo: (info: ParentInfo | null) => Promise<void>;
  updateParentInfo: (info: Partial<ParentInfo>) => Promise<void>;
  fetchParentInfo: (userId: string) => Promise<void>;
  refreshParentInfo: () => Promise<void>;
};

const ParentContext = createContext<ParentContextType>({
  parentInfo: null,
  setParentInfo: async () => {},
  updateParentInfo: async () => {},
  fetchParentInfo: async () => {},
  refreshParentInfo: async () => {},
});

export const ParentProvider = ({ children }: { children: ReactNode }) => {
  const [parentInfo, setParentInfoState] = useState<ParentInfo | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchParentInfo(user.id);
    }
  }, [user]);
  
  const fetchParentInfo = async (userId: string) => {
    try {
      console.log("Fetching parent info for user:", userId);
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching parent data:", error);
        return;
      }
      
      if (data) {
        console.log("Parent data found:", data);
        setParentInfoState({
          id: data.id,
          name: data.name,
          relationship: data.relationship,
          email: data.email,
          emergencyContact: data.emergency_contact,
          additionalInfo: data.additional_info
        });
      } else {
        console.log("No parent data found for user:", userId);
        
        // If parent record doesn't exist and we have user data, create one
        if (user?.id && user.user_metadata?.name) {
          console.log("Creating parent record for user:", userId);
          const newParent = {
            id: user.id,
            name: user.user_metadata.name as string,
            relationship: "Parent",
            email: user.email || "",
            emergency_contact: ""
          };
          
          const { error: insertError } = await supabase
            .from('parents')
            .insert([newParent]);
            
          if (insertError) {
            console.error("Error creating parent record:", insertError);
            return;
          }
          
          console.log("Parent record created successfully");
          // Make sure we match the ParentInfo type when setting state
          setParentInfoState({
            id: newParent.id,
            name: newParent.name,
            relationship: newParent.relationship,
            email: newParent.email,
            emergencyContact: newParent.emergency_contact,
            // additionalInfo is optional, so we can omit it
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
    }
  };

  const refreshParentInfo = async () => {
    if (user?.id) {
      await fetchParentInfo(user.id);
    }
  };

  const setParentInfo = async (info: ParentInfo | null) => {
    if (!info) {
      setParentInfoState(null);
      return;
    }
    
    try {
      console.log("Setting parent info:", info);
      const { error } = await supabase
        .from('parents')
        .upsert({
          id: info.id,
          name: info.name,
          relationship: info.relationship,
          email: info.email,
          emergency_contact: info.emergencyContact,
          additional_info: info.additionalInfo
        });
        
      if (error) {
        console.error("Error setting parent info:", error);
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
      console.log("Updating parent info:", updatedInfo);
      const update: any = {};
      if (updatedInfo.name) update.name = updatedInfo.name;
      if (updatedInfo.relationship) update.relationship = updatedInfo.relationship;
      if (updatedInfo.email) update.email = updatedInfo.email;
      if (updatedInfo.emergencyContact) update.emergency_contact = updatedInfo.emergencyContact;
      if (updatedInfo.additionalInfo) update.additional_info = updatedInfo.additionalInfo;
      
      const { error } = await supabase
        .from('parents')
        .update(update)
        .eq('id', parentInfo.id);
        
      if (error) {
        console.error("Error updating parent info:", error);
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

export const useParent = () => useContext(ParentContext);
