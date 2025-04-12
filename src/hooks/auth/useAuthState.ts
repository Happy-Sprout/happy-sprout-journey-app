
import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";

export const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  return {
    isLoggedIn,
    setIsLoggedIn,
    loading,
    setLoading,
    user,
    setUser,
    session,
    setSession,
  };
};
