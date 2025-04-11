
// This file is maintained for backward compatibility
// It re-exports the useUser hook and types from the new structure
import { useUser, ChildProfile, ParentInfo } from "@/hooks/useUser";

export { useUser, ChildProfile, ParentInfo };

// Also export the UserProvider
export { UserProvider } from "./UserProvider";
