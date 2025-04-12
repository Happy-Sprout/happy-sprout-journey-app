
import { useContext } from "react";
import ParentContext from "@/contexts/ParentContext";
import { ParentInfo } from "@/types/parentInfo";

export const useParent = () => {
  const context = useContext(ParentContext);
  
  if (context === undefined) {
    throw new Error("useParent must be used within a ParentProvider");
  }
  
  return context;
};

export type { ParentInfo };
