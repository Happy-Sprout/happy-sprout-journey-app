
import { ReactNode, useMemo, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";
import { useAuthSession } from "./useAuthSession";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    isLoggedIn, setIsLoggedIn,
    loading, setLoading,
    user, setUser,
    session, setSession
  } = useAuthState();

  // Initialize auth actions with state setters
  const { loginWithEmail, signUpWithEmail, logout } = useAuthActions(
    setLoading,
    setUser,
    setSession,
    setIsLoggedIn
  );

  // Initialize session handling - always called, never conditional
  useAuthSession(setSession, setUser, setIsLoggedIn, setLoading);

  // Create a memoized context value to prevent unnecessary rerenders
  const authContextValue = useMemo(() => ({
    isLoggedIn,
    loading,
    user,
    session,
    loginWithEmail,
    signUpWithEmail,
    logout
  }), [isLoggedIn, loading, user, session, loginWithEmail, signUpWithEmail, logout]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
