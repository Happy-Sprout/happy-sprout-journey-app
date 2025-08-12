import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, Menu, ClipboardList, LayoutGrid, BarChart3 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type LayoutProps = {
  children: ReactNode;
  requireAuth?: boolean;
  hideNav?: boolean;
};

const Layout = ({ children, requireAuth = false, hideNav = false }: LayoutProps) => {
  const { isLoggedIn, logout, getCurrentChild } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (requireAuth && !isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
  }, [requireAuth, isLoggedIn, navigate, location.pathname]);

  const currentChild = getCurrentChild?.();
  
  const navItems = [
    { name: "Home", path: "/dashboard", icon: <Home className="mr-2 h-4 w-4" /> },
    { name: "Analytics", path: "/parent-analytics", icon: <BarChart3 className="mr-2 h-4 w-4" /> },
    { name: "Profile", path: "/profile", icon: <User className="mr-2 h-4 w-4" /> },
    { name: "Assessment", path: "/assessment", icon: <ClipboardList className="mr-2 h-4 w-4" /> }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const NavContent = () => (
    <div className="flex flex-col space-y-4 py-4">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          className={cn(
            "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all w-full text-left",
            location.pathname === item.path
              ? "bg-sprout-purple text-white"
              : "hover:bg-sprout-purple/10"
          )}
        >
          {item.icon}
          {item.name}
        </button>
      ))}
      <button
        onClick={handleLogout}
        className="flex items-center rounded-lg px-4 py-3 text-sm font-medium hover:bg-red-100 text-red-600 w-full text-left"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-sprout-cream" style={{ backgroundColor: '#FFF5E0', minHeight: '100vh' }}>
      {isLoggedIn && !hideNav && (
        <>
          <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/c1e8ccec-8b46-4a25-853f-255a861762d1.png" 
                alt="Happy Sprout" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-sprout-purple ml-2">Happy Sprout</span>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-sprout-cream">
                <div className="flex items-center mb-6">
                  <img 
                    src="/lovable-uploads/c1e8ccec-8b46-4a25-853f-255a861762d1.png" 
                    alt="Happy Sprout" 
                    className="h-10 w-auto"
                  />
                  <span className="text-xl font-bold text-sprout-purple ml-2">Happy Sprout</span>
                </div>
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="hidden md:flex h-screen">
            <div className="w-64 bg-white shadow-md p-6 flex flex-col">
              <div className="flex items-center mb-6">
                <img 
                  src="/lovable-uploads/c1e8ccec-8b46-4a25-853f-255a861762d1.png" 
                  alt="Happy Sprout" 
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-sprout-purple ml-2">Happy Sprout</span>
              </div>
              <NavContent />
              <div className="mt-auto">
                <div className="p-4 bg-sprout-cream rounded-xl border border-sprout-orange/20 shadow-sm">
                  <div className="text-sm font-medium text-center">
                    {currentChild ? (
                      <>
                        <div className="font-bold text-sprout-purple">{currentChild.nickname}</div>
                        <div className="text-xs text-gray-500 mt-1">XP: {currentChild.xpPoints || 0}</div>
                        <div className="text-xs text-gray-500">Streak: {currentChild.streakCount || 0} days</div>
                      </>
                    ) : (
                      <div className="text-gray-500">No active profile</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <main className="p-8">{children}</main>
            </div>
          </div>
          
          <main className="md:hidden flex-1 p-4">{children}</main>
        </>
      )}
      
      {(!isLoggedIn || hideNav) && (
        <main className="flex-1">{children}</main>
      )}
    </div>
  );
};

export default Layout;
