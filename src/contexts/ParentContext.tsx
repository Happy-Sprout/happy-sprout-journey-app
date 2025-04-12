
import { createContext } from "react";
import type { ParentInfo } from "@/types/parentInfo";

// Define the ParentContextType
export interface ParentContextType {
  parentInfo: ParentInfo | null;
  isLoading: boolean;
  setParentInfo: (info: ParentInfo | null) => Promise<void>;
  updateParentInfo: (info: Partial<ParentInfo>) => Promise<void>;
  fetchParentInfo: (userId: string) => Promise<ParentInfo | null>;
  refreshParentInfo: () => Promise<void>;
}

// Create the context with default values
const ParentContext = createContext<ParentContextType>({
  parentInfo: null,
  isLoading: false,
  setParentInfo: async () => {},
  updateParentInfo: async () => {},
  fetchParentInfo: async () => null,
  refreshParentInfo: async () => {},
});

export default ParentContext;
