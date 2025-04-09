
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
      }
    );
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      setIsLoggedIn(true);
      toast({
        title: "Login successful",
        description: "Welcome back to Happy Sprout!"
      });
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
  };
  
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // First create the user
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
      
      // Now create parent record - use RPC call with security definer to bypass RLS
      const { error: parentError } = await supabase.rpc('create_parent_profile', {
        user_id: data.user.id,
        user_name: name,
        user_email: email
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
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully! You can now log in."
      });
      
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
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setUser(null);
      setSession(null);
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
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        session,
        loginWithEmail,
        signUpWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
