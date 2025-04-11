
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { UserProvider } from "@/contexts/UserContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import DailyCheckIn from "@/pages/DailyCheckIn";
import Journal from "@/pages/Journal";
import SELAssessment from "@/pages/SELAssessment";
import NotFound from "@/pages/NotFound";
import CreateProfile from "@/pages/CreateProfile";
import EditProfile from "@/pages/EditProfile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import ContentManagement from "@/pages/admin/ContentManagement";
import ReportingAnalytics from "@/pages/admin/ReportingAnalytics";
import JournalMonitoring from "@/pages/admin/JournalMonitoring";
import AssessmentManagement from "@/pages/admin/AssessmentManagement";
import GamificationManagement from "@/pages/admin/GamificationManagement";
import NotificationsManagement from "@/pages/admin/NotificationsManagement";
import SettingsManagement from "@/pages/admin/SettingsManagement";
import AdminLayout from "@/components/AdminLayout";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <AdminProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected parent routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/daily-check-in" element={<DailyCheckIn />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/sel-assessment" element={<SELAssessment />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              
              {/* Admin routes - properly nested structure */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="reports" element={<ReportingAnalytics />} />
                <Route path="journal-monitoring" element={<JournalMonitoring />} />
                <Route path="assessments" element={<AssessmentManagement />} />
                <Route path="gamification" element={<GamificationManagement />} />
                <Route path="notifications" element={<NotificationsManagement />} />
                <Route path="settings" element={<SettingsManagement />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AdminProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
