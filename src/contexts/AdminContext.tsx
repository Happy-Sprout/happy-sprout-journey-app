
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type AdminContextType = {
  isAdmin: boolean;
  loading: boolean;
  checkAdminStatus: () => Promise<boolean>;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loading: true,
  checkAdminStatus: async () => false,
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }
    
    try {
      console.log("Checking admin status for user:", user.id);
      setLoading(true);
      
      // Call the is_admin RPC function to check admin status
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Could not verify administrator status",
          variant: "destructive",
        });
        setIsAdmin(false);
        return false;
      }
      
      console.log("Admin status check result:", data);
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error("Exception in checkAdminStatus:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, checkAdminStatus]);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        loading,
        checkAdminStatus
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
