
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, AlertTriangle, Activity } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChildren: 0,
    journalEntries: 0,
    flaggedEntries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch parent count
        const { count: parentCount, error: parentError } = await supabase
          .from('parents')
          .select('*', { count: 'exact', head: true });
          
        if (parentError) throw parentError;
        
        // Fetch children count
        const { count: childrenCount, error: childrenError } = await supabase
          .from('children')
          .select('*', { count: 'exact', head: true });
          
        if (childrenError) throw childrenError;
        
        // Fetch journal entries count
        const { count: journalCount, error: journalError } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true });
          
        if (journalError) throw journalError;
        
        // Fetch flagged entries count
        const { count: flaggedCount, error: flaggedError } = await supabase
          .from('journal_monitoring')
          .select('*', { count: 'exact', head: true });
          
        if (flaggedError) throw flaggedError;
        
        setStats({
          totalUsers: parentCount || 0,
          totalChildren: childrenCount || 0,
          journalEntries: journalCount || 0,
          flaggedEntries: flaggedCount || 0
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const adminCards = [
    {
      title: "User Management",
      description: "Manage parent and child accounts",
      icon: <Users className="h-8 w-8 text-blue-600" />,
      stats: `${stats.totalUsers} parents, ${stats.totalChildren} children`,
      path: "/admin/users"
    },
    {
      title: "Content Management",
      description: "Manage questions, scenarios, and quotes",
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      path: "/admin/content"
    },
    {
      title: "Journal Monitoring",
      description: "Review flagged journal entries",
      icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
      stats: `${stats.flaggedEntries} flagged entries`,
      alert: stats.flaggedEntries > 0,
      path: "/admin/journal-monitoring"
    },
    {
      title: "Analytics",
      description: "User activity and emotional trends",
      icon: <Activity className="h-8 w-8 text-purple-600" />,
      stats: `${stats.journalEntries} journal entries`,
      path: "/admin/reports"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Happy Sprout administration panel.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            // Loading skeleton for cards
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-8 w-1/2 bg-gray-200 rounded-md animate-pulse mt-2" />
                </CardContent>
              </Card>
            ))
          ) : (
            adminCards.map((card) => (
              <Card key={card.title} className="relative overflow-hidden">
                {card.alert && (
                  <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                )}
                <CardHeader className="pb-2">
                  {card.icon}
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                  {card.stats && (
                    <p className="text-2xl font-semibold mt-2">{card.stats}</p>
                  )}
                  <Button 
                    className="mt-4 w-full" 
                    onClick={() => navigate(card.path)}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                User activity data will be displayed here.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Authentication Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
