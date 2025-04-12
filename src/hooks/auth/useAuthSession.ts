
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
    // Mark this as a mounted reference
    let isMounted = true;
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoggedIn(!!newSession);
        setLoading(false);
      }
    );
    
    // Then check for an existing session
    const initSession = async () => {
      if (!isMounted) return;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoggedIn(!!data.session);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initSession();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setIsLoggedIn, setLoading]);
};
