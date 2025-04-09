
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import EditProfile from "./pages/EditProfile";
import DailyCheckIn from "./pages/DailyCheckIn";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement"; 
import JournalMonitoring from "./pages/admin/JournalMonitoring";
import AssessmentManagement from "./pages/admin/AssessmentManagement";
import GamificationManagement from "./pages/admin/GamificationManagement";
import NotificationsManagement from "./pages/admin/NotificationsManagement";
import ReportingAnalytics from "./pages/admin/ReportingAnalytics";

// Context
import { UserProvider, useUser } from "./contexts/UserContext";
import { AdminProvider, useAdmin } from "./contexts/AdminContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useUser();
  
  // If still loading auth state, show nothing or a loading indicator
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading: userLoading } = useUser();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  // If still loading auth state, show nothing or a loading indicator
  if (userLoading || adminLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to dashboard if not an admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/create-profile" element={
        <ProtectedRoute>
          <CreateProfile />
        </ProtectedRoute>
      } />
      <Route path="/edit-profile/:id" element={
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      } />
      <Route path="/daily-check-in" element={
        <ProtectedRoute>
          <DailyCheckIn />
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <Journal />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      } />
      <Route path="/admin/content" element={
        <AdminRoute>
          <ContentManagement />
        </AdminRoute>
      } />
      <Route path="/admin/journal-monitoring" element={
        <AdminRoute>
          <JournalMonitoring />
        </AdminRoute>
      } />
      <Route path="/admin/assessments" element={
        <AdminRoute>
          <AssessmentManagement />
        </AdminRoute>
      } />
      <Route path="/admin/gamification" element={
        <AdminRoute>
          <GamificationManagement />
        </AdminRoute>
      } />
      <Route path="/admin/notifications" element={
        <AdminRoute>
          <NotificationsManagement />
        </AdminRoute>
      } />
      <Route path="/admin/reports" element={
        <AdminRoute>
          <ReportingAnalytics />
        </AdminRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
