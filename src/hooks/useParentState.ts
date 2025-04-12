
import { useState, useCallback } from "react";
import { ParentInfo } from "@/utils/parent";

export function useParentState() {
  const [parentInfo, setParentInfoState] = useState<ParentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const setParentInfo = useCallback((info: ParentInfo | null) => {
    setParentInfoState(info);
  }, []);
  
  const updateParentInfoState = useCallback((updatedInfo: Partial<ParentInfo>) => {
    setParentInfoState(prev => {
      if (!prev) {
        if ('id' in updatedInfo) {
          // Only update if there's an ID
          return updatedInfo as ParentInfo;
        }
        return null;
      }
      
      return {
        ...prev,
        ...updatedInfo
      };
    });
  }, []);
  
  return {
    parentInfo,
    isLoading,
    setParentInfo,
    setIsLoading,
    updateParentInfoState
  };
}
