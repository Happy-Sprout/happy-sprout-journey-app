
import { useContext } from "react";
import ParentContext from "@/contexts/ParentContext";
import { ParentInfo } from "@/types/parentInfo";

export const useParent = () => useContext(ParentContext);
export type { ParentInfo };
