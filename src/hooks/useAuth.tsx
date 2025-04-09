
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
  verifyOtp: (email: string, token: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: false,
  user: null,
  session: null,
  loginWithEmail: async () => {},
  signUpWithEmail: async () => undefined,
  verifyOtp: async () => false,
  sendOtp: async () => false,
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
      // Create the user without email confirmation
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
      
      // Create parent record in database
      const { error: parentError } = await supabase
        .from('parents')
        .insert([{
          id: data.user.id,
          name: name,
          relationship: "Parent",
          email: email,
          emergency_contact: ""
        }]);
        
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
      
      // Instead of waiting for email verification, we set the session directly
      // The user will still need to verify with OTP in the next step
      toast({
        title: "Registration successful",
        description: "Please verify your account with the OTP code"
      });
      
      return data;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // New function to send OTP to the user's email
  const sendOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create a new user
        }
      });
      
      if (error) {
        toast({
          title: "Failed to send OTP",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code"
      });
      return true;
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Could not send verification code",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // New function to verify OTP
  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email"
      });
      
      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      setSession(data.session);
      setUser(data.user);
      setIsLoggedIn(!!data.session);
      
      toast({
        title: "Verification successful",
        description: "Your account has been verified"
      });
      return true;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Could not verify code",
        variant: "destructive"
      });
      return false;
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
        verifyOtp,
        sendOtp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
