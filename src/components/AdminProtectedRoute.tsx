
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAdmin, loading: adminLoading, checkAdminStatus } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only check admin status if we have a user and don't already know they're an admin
    if (user && !isAdmin && !adminLoading) {
      checkAdminStatus();
    }
  }, [user, isAdmin, adminLoading, checkAdminStatus]);

  // Show loading state while checking authentication and admin status
  if (authLoading || adminLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, redirect to dashboard
  if (!isAdmin) {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If admin, render the protected content
  console.log("User is admin, allowing access to admin content");
  return <>{children}</>;
};

export default AdminProtectedRoute;
