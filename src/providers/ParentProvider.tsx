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
  const fetchInFlightPromise = useRef<Promise<any> | null>(null);
  const componentMounted = useRef(true);

  const fetchParentInfo = useCallback(async (userId: string) => {
    if (fetchInProgress.current && fetchInFlightPromise.current && lastUserIdFetched.current === userId) {
      console.log("Reusing in-flight parent info fetch for:", userId);
      return fetchInFlightPromise.current;
    }
    
    if (fetchInProgress.current || preventApiCallsFlag.current || !componentMounted.current) {
      console.log("Skipping parent info fetch - already in progress or prevented");
      return;
    }

    try {
      console.log("Starting new parent info fetch for:", userId);
      fetchInProgress.current = true;
      setIsLoading(true);
      lastUserIdFetched.current = userId;
      
      fetchInFlightPromise.current = (async () => {
        try {
          const data = await fetchParentInfoById(userId);
          
          if (!componentMounted.current) return null;
          
          if (data) {
            setParentInfoState(prevState => {
              if (JSON.stringify(prevState) !== JSON.stringify(data)) {
                return data;
              }
              return prevState;
            });
            return data;
          } else if (user) {
            const newParent = await createParentInfo(user);
            if (newParent && componentMounted.current) {
              setParentInfoState(newParent);
              return newParent;
            }
          }
          return null;
        } finally {
          if (componentMounted.current) {
            setIsLoading(false);
          }
        }
      })();
      
      const result = await fetchInFlightPromise.current;
      return result;
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
      return null;
    } finally {
      fetchInProgress.current = false;
      fetchInFlightPromise.current = null;
    }
  }, [user]);

  useEffect(() => {
    componentMounted.current = true;
    
    const initParentInfo = async () => {
      if (!user?.id || initialFetchDone.current) return;
      
      try {
        initialFetchDone.current = true;
        console.log("Performing initial parent info fetch");
        await fetchParentInfo(user.id);
      } catch (err) {
        console.error("Error in initial parent info fetch:", err);
      }
    };
    
    initParentInfo();
    
    return () => {
      componentMounted.current = false;
      initialFetchDone.current = false;
    };
  }, [user?.id, fetchParentInfo]);
  
  const preventApiCalls = useCallback(() => {
    preventApiCallsFlag.current = true;
    return () => {
      preventApiCallsFlag.current = false;
    };
  }, []);
  
  const refreshParentInfo = useCallback(async () => {
    if (!user?.id || fetchInProgress.current || preventApiCallsFlag.current || !componentMounted.current) {
      console.log("Skipping parent info refresh - fetch in progress or prevented");
      return;
    }
    
    console.log("Forcing parent info refresh");
    lastUserIdFetched.current = null;
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
      
      setParentInfoState(() => ({...info}));
      
      toast({
        title: "Success",
        description: "Profile saved successfully!"
      });
      
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
