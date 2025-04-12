
// This file is maintained for backward compatibility
// It re-exports the useUser hook and types from the new structure
import { useUser } from "@/hooks/useUser";
import type { ChildProfile } from "@/hooks/useChildren";
import type { ParentInfo } from "@/types/parentInfo";

export { useUser };
export type { ChildProfile, ParentInfo };

// Also export the UserProvider
export { UserProvider } from "./UserProvider";
