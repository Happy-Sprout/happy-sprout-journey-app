
// Simple re-export for the auth context hook
import { useAuthContext } from "./auth";

export const useAuth = () => {
  return useAuthContext();
};

// Re-export for compatibility
export { AuthProvider } from "./auth";
export type { AuthContextType } from "./auth";
