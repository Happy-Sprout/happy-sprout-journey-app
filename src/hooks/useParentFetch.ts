
import { useCallback, useRef } from "react";
import { ParentInfo } from "@/utils/parent";
import { fetchParentInfoById, createParentInfo } from "@/utils/parent";
import { User } from "@supabase/supabase-js";

export function useParentFetch() {
  const fetchInProgress = useRef(false);
  const lastUserIdFetched = useRef<string | null>(null);
  const fetchInFlightPromise = useRef<Promise<ParentInfo | null> | null>(null);
  
  const fetchParentInfo = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!userId) {
      console.log("No user ID provided for parent info fetch");
      return null;
    }
    
    // If we already have a fetch in progress for this user, return that promise
    if (fetchInProgress.current && fetchInFlightPromise.current && lastUserIdFetched.current === userId) {
      console.log("Reusing in-flight parent info fetch for:", userId);
      return fetchInFlightPromise.current;
    }
    
    // If we have a fetch in progress for a different user, wait for it to complete
    if (fetchInProgress.current) {
      console.log("Skipping parent info fetch - already in progress for a different user");
      return null;
    }

    try {
      console.log("Starting new parent info fetch for:", userId);
      fetchInProgress.current = true;
      lastUserIdFetched.current = userId;
      
      // Create a promise for this fetch operation
      fetchInFlightPromise.current = (async () => {
        try {
          const data = await fetchParentInfoById(userId);
          
          if (data) {
            return data;
          } else if (currentUser) {
            // Create parent info if it doesn't exist
            const newParent = await createParentInfo(currentUser);
            return newParent;
          }
          return null;
        } catch (error) {
          console.error("Error in fetchParentInfo internal promise:", error);
          return null;
        }
      })();
      
      const result = await fetchInFlightPromise.current;
      return result;
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
      return null;
    } finally {
      fetchInProgress.current = false;
    }
  }, []);

  return {
    fetchParentInfo,
    resetFetchState: useCallback(() => {
      fetchInProgress.current = false;
      lastUserIdFetched.current = null;
      fetchInFlightPromise.current = null;
    }, [])
  };
}
