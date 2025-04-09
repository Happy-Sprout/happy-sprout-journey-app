
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
  setParentInfo: (info: ParentInfo | null) => void;
  updateParentInfo: (info: Partial<ParentInfo>) => void;
  fetchParentInfo: (userId: string) => Promise<void>;
};

const ParentContext = createContext<ParentContextType>({
  parentInfo: null,
  setParentInfo: () => {},
  updateParentInfo: () => {},
  fetchParentInfo: async () => {},
});

export const ParentProvider = ({ children }: { children: ReactNode }) => {
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchParentInfo(user.id);
    }
  }, [user]);
  
  const fetchParentInfo = async (userId: string) => {
    try {
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
        setParentInfo({
          id: data.id,
          name: data.name,
          relationship: data.relationship,
          email: data.email,
          emergencyContact: data.emergency_contact,
          additionalInfo: data.additional_info
        });
      }
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
    }
  };

  const updateParentInfo = async (updatedInfo: Partial<ParentInfo>) => {
    if (!user?.id || !parentInfo) return;
    
    try {
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
      
      setParentInfo((prev) => {
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
        fetchParentInfo
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => useContext(ParentContext);
