
import { useCallback, useRef } from "react";
import { ParentInfo } from "@/utils/parent";
import { fetchParentInfoById, createParentInfo } from "@/utils/parent";
import { User } from "@supabase/supabase-js";

export function useParentFetch() {
  // Use refs to track in-progress operations
  const fetchInProgress = useRef(false);
  const lastUserIdFetched = useRef<string | null>(null);
  const fetchInFlightPromise = useRef<Promise<ParentInfo | null> | null>(null);
  
  const fetchParentInfo = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!userId) {
      console.log("No user ID provided for parent info fetch");
      return null;
    }
    
    // Return existing promise if we're already fetching for this user
    if (fetchInProgress.current && fetchInFlightPromise.current && lastUserIdFetched.current === userId) {
      console.log("Reusing in-flight parent info fetch for:", userId);
      return fetchInFlightPromise.current;
    }
    
    // Start a new fetch operation
    console.log("Starting new parent info fetch for:", userId);
    fetchInProgress.current = true;
    lastUserIdFetched.current = userId;
    
    // Create a promise for this fetch and store it
    fetchInFlightPromise.current = (async () => {
      try {
        // First try to fetch existing parent info
        const data = await fetchParentInfoById(userId);
        
        if (data) {
          return data;
        } 
        
        // If no data and we have a current user, create a new parent
        if (currentUser) {
          const newParent = await createParentInfo(currentUser);
          return newParent;
        }
        
        return null;
      } catch (error) {
        console.error("Error in fetchParentInfo internal promise:", error);
        return null;
      } finally {
        // Always clean up after fetch completes
        fetchInProgress.current = false;
      }
    })();
    
    try {
      // Wait for the promise to resolve
      const result = await fetchInFlightPromise.current;
      return result;
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
      return null;
    }
  }, []);

  // Return the fetch function and a reset function
  return {
    fetchParentInfo,
    resetFetchState: useCallback(() => {
      fetchInProgress.current = false;
      lastUserIdFetched.current = null;
      fetchInFlightPromise.current = null;
    }, [])
  };
}
