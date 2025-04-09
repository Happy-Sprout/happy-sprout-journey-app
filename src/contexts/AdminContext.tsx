
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Use "is_admin" function instead of "is_admin_user" to match Supabase's available RPC functions
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

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
