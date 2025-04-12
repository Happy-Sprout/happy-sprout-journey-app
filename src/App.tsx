
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserProvider";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Journal from "@/pages/Journal";
import Dashboard from "@/pages/Dashboard"; // Change to direct import instead of lazy

const Register = lazy(() => import("@/pages/Register"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const DailyCheckIn = lazy(() => import("@/pages/DailyCheckIn"));
const SELAssessment = lazy(() => import("@/pages/SELAssessment"));
const CreateProfile = lazy(() => import("@/pages/CreateProfile"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const ReportingAnalytics = lazy(() => import("@/pages/admin/ReportingAnalytics"));
const JournalMonitoring = lazy(() => import("@/pages/admin/JournalMonitoring"));
const AssessmentManagement = lazy(() => import("@/pages/admin/AssessmentManagement"));
const GamificationManagement = lazy(() => import("@/pages/admin/GamificationManagement"));
const NotificationsManagement = lazy(() => import("@/pages/admin/NotificationsManagement"));
const SettingsManagement = lazy(() => import("@/pages/admin/SettingsManagement"));
const AdminLayout = lazy(() => import("@/components/AdminLayout"));
const AdminProtectedRoute = lazy(() => import("@/components/AdminProtectedRoute"));

import "./App.css";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse">Loading...</div>
  </div>
);

function App() {
  return (
    <Router>
      <UserProvider>
        <AdminProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/daily-check-in" element={<DailyCheckIn />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/sel-assessment" element={<SELAssessment />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              
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
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </AdminProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
