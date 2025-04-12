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
  loading: false,
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

  useEffect(() => {
    let isMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (isMounted) {
          console.log('Auth state changed:', event, newSession?.user?.email);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoggedIn(!!newSession);
        }
      }
    );
    
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsLoggedIn(!!data.session);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
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
  }, []);
  
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error && error.message !== "Email not confirmed") {
        throw error;
      }
      
      if (data?.session) {
        toast({
          title: "Login successful",
          description: "Welcome back to Happy Sprout!"
        });
        
        return;
      } else if (error && error.message === "Email not confirmed") {
        console.log("Email not confirmed, but proceeding with login anyway");
        
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
        throw new Error("No session returned after login");
      }
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
  
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
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
      
      if (data.user) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error("Auto login after signup failed:", signInError);
          } else if (signInData.session) {
            setSession(signInData.session);
            setUser(signInData.user);
            setIsLoggedIn(true);
            
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
  };
  
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
