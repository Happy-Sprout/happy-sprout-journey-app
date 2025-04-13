
import { ReactNode, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import ParentContext from "@/contexts/ParentContext";
import type { ParentInfo } from "@/types/parentInfo";
import { useParentState } from "@/hooks/useParentState";
import { useParentUpdate } from "@/hooks/useParentUpdate";
import { useParentFetch } from "@/hooks/useParentFetch";

export const ParentProvider = ({ children }: { children: ReactNode }) => {
  const { parentInfo, isLoading, setParentInfo: setParentInfoState, setIsLoading, updateParentInfoState } = useParentState();
  const { updateParentInfo: saveParentInfoToDb, preventApiCalls, isApiCallPrevented } = useParentUpdate();
  const { fetchParentInfo, resetFetchState } = useParentFetch();
  const { user } = useAuth();
  
  const initialFetchDone = useRef(false);
  const componentMounted = useRef(true);

  // Pre-create the fetchParentInfoWithUser function at the top level
  const fetchParentInfoWithUser = useCallback((userId: string) => {
    return fetchParentInfo(userId, user);
  }, [fetchParentInfo, user]);

  // Handle initial fetch of parent info when user logs in
  useEffect(() => {
    componentMounted.current = true;
    
    const initParentInfo = async () => {
      if (!user?.id || initialFetchDone.current) return;
      
      try {
        initialFetchDone.current = true;
        console.log("Performing initial parent info fetch");
        setIsLoading(true);
        const data = await fetchParentInfo(user.id, user);
        
        if (componentMounted.current && data) {
          setParentInfoState(data);
        }
      } catch (err) {
        console.error("Error in initial parent info fetch:", err);
      } finally {
        if (componentMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    initParentInfo();
    
    return () => {
      componentMounted.current = false;
    };
  }, [user?.id, fetchParentInfo, setParentInfoState, setIsLoading, user]);
  
  const refreshParentInfo = useCallback(async () => {
    if (!user?.id || isApiCallPrevented() || !componentMounted.current) {
      console.log("Skipping parent info refresh - fetch prevented or component unmounted");
      return;
    }
    
    console.log("Forcing parent info refresh");
    resetFetchState();
    setIsLoading(true);
    
    try {
      const data = await fetchParentInfo(user.id, user);
      if (componentMounted.current && data) {
        setParentInfoState(data);
      }
    } catch (err) {
      console.error("Error refreshing parent info:", err);
    } finally {
      if (componentMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, fetchParentInfo, resetFetchState, setParentInfoState, setIsLoading, isApiCallPrevented, user]);

  const setParentInfo = useCallback(async (info: ParentInfo | null) => {
    if (!info) {
      setParentInfoState(null);
      return;
    }
    
    const success = await saveParentInfoToDb(info);
    if (success) {
      setParentInfoState(info);
    }
  }, [setParentInfoState, saveParentInfoToDb]);

  const updateParentInfo = useCallback(async (updatedInfo: Partial<ParentInfo>): Promise<boolean> => {
    if (!user?.id || !parentInfo) {
      console.error("Cannot update parent info: no user logged in or no parent info available");
      return false;
    }
    
    const dataToUpdate = {
      ...updatedInfo,
      id: parentInfo.id
    };
    
    const success = await saveParentInfoToDb(dataToUpdate);
    if (success) {
      updateParentInfoState(updatedInfo);
    }
    return success;
  }, [user?.id, parentInfo, saveParentInfoToDb, updateParentInfoState]);

  // Create context value with useMemo to ensure consistent reference
  const contextValue = useMemo(() => ({
    parentInfo,
    isLoading,
    setParentInfo,
    updateParentInfo,
    fetchParentInfo: fetchParentInfoWithUser,
    refreshParentInfo
  }), [parentInfo, isLoading, setParentInfo, updateParentInfo, fetchParentInfoWithUser, refreshParentInfo]);

  return (
    <ParentContext.Provider value={contextValue}>
      {children}
    </ParentContext.Provider>
  );
};

export default ParentProvider;
