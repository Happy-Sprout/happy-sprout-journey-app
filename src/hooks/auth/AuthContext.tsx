
import { createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";

export type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ user: User | null; session: Session | null; } | undefined>;
  logout: () => Promise<void>;
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  user: null,
  session: null,
  loginWithEmail: async () => {},
  signUpWithEmail: async () => undefined,
  logout: async () => {},
});

// Hook to use auth context
export const useAuthContext = () => useContext(AuthContext);
