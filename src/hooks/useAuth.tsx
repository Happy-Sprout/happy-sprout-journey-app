
import { useAuthContext } from "./auth";

// This is a proper custom hook that simply re-exports the context hook
export const useAuth = () => {
  return useAuthContext();
};

// Re-export types and the provider to maintain backwards compatibility
export { AuthProvider } from "./auth";
export type { AuthContextType } from "./auth";
