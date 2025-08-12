
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";

export const useAuthActions = (
  setLoading: (loading: boolean) => void,
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
  setIsLoggedIn: (isLoggedIn: boolean) => void
) => {
  const { toast } = useToast();

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
      
    } catch (error: unknown) {
      console.error("Login error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Please check your email and password";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, setLoading]);
  
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
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not create your account. Please try again.";
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, setLoading]);
  
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error: unknown) {
      console.error("Logout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not log out. Please try again.";
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    loginWithEmail,
    signUpWithEmail,
    logout
  };
};
