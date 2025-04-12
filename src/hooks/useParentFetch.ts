
import { useCallback, useRef } from "react";
import { ParentInfo } from "@/utils/parent";
import { fetchParentInfoById, createParentInfo } from "@/utils/parent";
import { User } from "@supabase/supabase-js";

export function useParentFetch() {
  const fetchInProgress = useRef(false);
  const lastUserIdFetched = useRef<string | null>(null);
  const fetchInFlightPromise = useRef<Promise<any> | null>(null);
  
  const fetchParentInfo = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!userId) {
      console.log("No user ID provided for parent info fetch");
      return null;
    }
    
    if (fetchInProgress.current && fetchInFlightPromise.current && lastUserIdFetched.current === userId) {
      console.log("Reusing in-flight parent info fetch for:", userId);
      return fetchInFlightPromise.current;
    }
    
    if (fetchInProgress.current) {
      console.log("Skipping parent info fetch - already in progress");
      return null;
    }

    try {
      console.log("Starting new parent info fetch for:", userId);
      fetchInProgress.current = true;
      lastUserIdFetched.current = userId;
      
      fetchInFlightPromise.current = (async () => {
        try {
          const data = await fetchParentInfoById(userId);
          
          if (data) {
            return data;
          } else if (currentUser) {
            const newParent = await createParentInfo(currentUser);
            return newParent;
          }
          return null;
        } finally {
          // Nothing to do here, cleanup happens in parent component
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
  }, []);

  return {
    fetchParentInfo,
    resetFetchState: useCallback(() => {
      lastUserIdFetched.current = null;
    }, [])
  };
}
