
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ user: User | null; session: Session | null; } | undefined>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  user: null,
  session: null,
  loginWithEmail: async () => {},
  signUpWithEmail: async () => undefined,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Set up the auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoggedIn(!!newSession);
        setLoading(false);
      }
    );
    
    // Initial session check
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
  }, []);
  
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message === "Email not confirmed") {
          // Special handling for unconfirmed email
          console.log("Email not confirmed, attempting second login...");
          
          const { data: secondAttemptData, error: secondAttemptError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (secondAttemptError) {
            throw secondAttemptError;
          }
          
          if (secondAttemptData?.session) {
            toast({
              title: "Login successful",
              description: "Welcome back to Happy Sprout!"
            });
            return;
          }
        } else {
          // For other errors, throw immediately
          throw error;
        }
      }
      
      if (data?.session) {
        toast({
          title: "Login successful",
          description: "Welcome back to Happy Sprout!"
        });
        return;
      }
      
      // If we reach here without a session, throw a generic error
      throw new Error("No session returned after login");
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("User creation failed");
      }
      
      console.log("User created successfully:", data.user.id);
      
      // Create parent record
      const { error: parentError } = await supabase
        .from('parents')
        .insert({
          id: data.user.id,
          name: name,
          relationship: 'Parent',
          email: email,
          emergency_contact: ''
        });
        
      if (parentError) {
        console.error("Error creating parent record:", parentError);
        toast({
          title: "Profile creation issue",
          description: "Your account was created but we couldn't set up your profile. Please try again later.",
          variant: "destructive"
        });
      } else {
        console.log("Parent record created successfully");
      }
      
      // Auto login after signup
      if (data.user) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error("Auto login after signup failed:", signInError);
          } else if (signInData.session) {
            toast({
              title: "Registration successful",
              description: "Welcome to Happy Sprout!"
            });
          }
        } catch (signInError) {
          console.error("Error during auto-login:", signInError);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = error.message || "Could not create your account. Please try again.";
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Create a memoized context value to prevent unnecessary rerenders
  const authContextValue = {
    isLoggedIn,
    loading,
    user,
    session,
    loginWithEmail,
    signUpWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
