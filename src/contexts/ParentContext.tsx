
import { createContext } from "react";
import { ParentContextType } from "@/types/parentInfo";

// Create the context with default values
const ParentContext = createContext<ParentContextType>({
  parentInfo: null,
  isLoading: false,
  setParentInfo: async () => {},
  updateParentInfo: async () => {},
  fetchParentInfo: async () => {},
  refreshParentInfo: async () => {},
});

export default ParentContext;
