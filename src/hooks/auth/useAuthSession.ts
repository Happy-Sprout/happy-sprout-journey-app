
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export const useAuthSession = (
  setSession: (session: Session | null) => void,
  setUser: (user: User | null) => void,
  setIsLoggedIn: (isLoggedIn: boolean) => void,
  setLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoggedIn(!!newSession);
        setLoading(false);
      }
    );
    
    // Then check for an existing session
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoggedIn(!!data.session);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setIsLoggedIn, setLoading]);
};
