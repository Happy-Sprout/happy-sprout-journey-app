
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { UserProvider } from "@/contexts/UserContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
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
              
              {/* Protected parent routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/daily-check-in" element={<DailyCheckIn />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/sel-assessment" element={<SELAssessment />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/content" element={<ContentManagement />} />
              <Route path="/admin/reports" element={<ReportingAnalytics />} />
              <Route path="/admin/journal-monitoring" element={<JournalMonitoring />} />
              <Route path="/admin/assessments" element={<AssessmentManagement />} />
              <Route path="/admin/gamification" element={<GamificationManagement />} />
              <Route path="/admin/notifications" element={<NotificationsManagement />} />
              <Route path="/admin/settings" element={<SettingsManagement />} />
              
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
