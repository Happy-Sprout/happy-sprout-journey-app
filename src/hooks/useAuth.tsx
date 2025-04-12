
import { useAuthContext } from "./auth";

// This file now simply re-exports the hook for backward compatibility
export const useAuth = useAuthContext;

// Re-export types and the provider to maintain backwards compatibility
export { AuthProvider } from "./auth";
export type { AuthContextType } from "./auth";
