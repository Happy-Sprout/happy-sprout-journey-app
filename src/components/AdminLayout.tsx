
import { ReactNode } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  ClipboardList, 
  Trophy, 
  Bell, 
  BarChart, 
  Settings, 
  LogOut, 
  Home,
  Menu,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: <Home className="h-5 w-5" /> },
  { name: "Users", path: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { name: "Content", path: "/admin/content", icon: <FileText className="h-5 w-5" /> },
  { name: "Journal Monitoring", path: "/admin/journal-monitoring", icon: <AlertTriangle className="h-5 w-5" /> },
  { name: "Assessments", path: "/admin/assessments", icon: <ClipboardList className="h-5 w-5" /> },
  { name: "Gamification", path: "/admin/gamification", icon: <Trophy className="h-5 w-5" /> },
  { name: "Notifications", path: "/admin/notifications", icon: <Bell className="h-5 w-5" /> },
  { name: "AI Insights", path: "/admin/emotional-insights-processing", icon: <Brain className="h-5 w-5" /> },
  { name: "Reports", path: "/admin/reports", icon: <BarChart className="h-5 w-5" /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
];

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => (
    <Link
      to={item.path}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
        location.pathname === item.path
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {item.icon}
      <span>{item.name}</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-2 py-4">
                  {menuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <span className="text-xl font-bold">Happy Sprout Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
              Exit Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden md:block w-64 border-r bg-white p-6">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
