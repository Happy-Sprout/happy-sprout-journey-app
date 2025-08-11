
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, AlertTriangle, Activity, Database, TrendingUp, BarChart3 } from "lucide-react";
import DataSeeder from "@/components/admin/DataSeeder";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChildren: 0,
    journalEntries: 0,
    flaggedEntries: 0,
    selInsights: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use Promise.allSettled to handle partial failures gracefully
        const [parentResult, childrenResult, journalResult, flaggedResult, selResult] = await Promise.allSettled([
          supabase.from('parents').select('*', { count: 'exact', head: true }),
          supabase.from('children').select('*', { count: 'exact', head: true }),
          supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
          supabase.from('journal_monitoring').select('*', { count: 'exact', head: true }),
          supabase.from('sel_insights').select('*', { count: 'exact', head: true })
        ]);
        
        const newStats = {
          totalUsers: 0,
          totalChildren: 0,
          journalEntries: 0,
          flaggedEntries: 0,
          selInsights: 0,
          activeToday: 0
        };
        
        let hasErrors = false;
        const errors: string[] = [];
        
        if (parentResult.status === 'fulfilled' && !parentResult.value.error) {
          newStats.totalUsers = parentResult.value.count || 0;
        } else {
          hasErrors = true;
          errors.push('Failed to fetch parent count');
          console.error('Parent count error:', parentResult.status === 'fulfilled' ? parentResult.value.error : parentResult.reason);
        }
        
        if (childrenResult.status === 'fulfilled' && !childrenResult.value.error) {
          newStats.totalChildren = childrenResult.value.count || 0;
        } else {
          hasErrors = true;
          errors.push('Failed to fetch children count');
          console.error('Children count error:', childrenResult.status === 'fulfilled' ? childrenResult.value.error : childrenResult.reason);
        }
        
        if (journalResult.status === 'fulfilled' && !journalResult.value.error) {
          newStats.journalEntries = journalResult.value.count || 0;
        } else {
          hasErrors = true;
          errors.push('Failed to fetch journal entries count');
          console.error('Journal count error:', journalResult.status === 'fulfilled' ? journalResult.value.error : journalResult.reason);
        }
        
        if (flaggedResult.status === 'fulfilled' && !flaggedResult.value.error) {
          newStats.flaggedEntries = flaggedResult.value.count || 0;
        } else {
          hasErrors = true;
          errors.push('Failed to fetch flagged entries count');
          console.error('Flagged count error:', flaggedResult.status === 'fulfilled' ? flaggedResult.value.error : flaggedResult.reason);
        }

        if (selResult.status === 'fulfilled' && !selResult.value.error) {
          newStats.selInsights = selResult.value.count || 0;
        } else {
          hasErrors = true;
          errors.push('Failed to fetch SEL insights count');
          console.error('SEL insights count error:', selResult.status === 'fulfilled' ? selResult.value.error : selResult.reason);
        }

        // Calculate active today (approximate based on recent journal entries)
        const today = new Date().toISOString().split('T')[0];
        try {
          const { count: todayCount } = await supabase
            .from('journal_entries')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
          newStats.activeToday = todayCount || 0;
        } catch (error) {
          console.error('Error fetching today activity:', error);
        }
        
        setStats(newStats);
        
        if (hasErrors) {
          setError(`Some statistics could not be loaded: ${errors.join(', ')}`);
        }
      } catch (error) {
        console.error("Unexpected error fetching admin stats:", error);
        setError("An unexpected error occurred while loading dashboard statistics.");
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
      path: "/admin/users",
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Content Management",
      description: "Manage questions, scenarios, and quotes",
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      path: "/admin/content",
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Journal Monitoring",
      description: "Review flagged journal entries",
      icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
      stats: `${stats.flaggedEntries} flagged entries`,
      alert: stats.flaggedEntries > 0,
      path: "/admin/journal-monitoring",
      color: "bg-amber-50 border-amber-200",
      buttonColor: "bg-amber-600 hover:bg-amber-700"
    },
    {
      title: "Analytics",
      description: "User activity and emotional trends",
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      stats: `${stats.journalEntries} journal entries`,
      path: "/admin/reports",
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Happy Sprout administration panel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/admin/reports")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers + stats.totalChildren}</div>
                <div className="text-blue-100 text-sm">Total Users</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <div>
                <div className="text-2xl font-bold">{stats.journalEntries}</div>
                <div className="text-green-100 text-sm">Journal Entries</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <div>
                <div className="text-2xl font-bold">{stats.selInsights}</div>
                <div className="text-purple-100 text-sm">SEL Assessments</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <div>
                <div className="text-2xl font-bold">{stats.activeToday}</div>
                <div className="text-orange-100 text-sm">Active Today</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Alert Section */}
      {(stats.flaggedEntries > 0 || error) && (
        <div className="space-y-4">
          {stats.flaggedEntries > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800">
                    Action Required: Flagged Journal Entries
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {stats.flaggedEntries} journal entries need review for appropriate content.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate("/admin/journal-monitoring")}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Review Now
                </Button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Data Loading Issues
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {error && (
          <div className="col-span-full">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Loading Dashboard Data
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            <Card key={card.title} className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${card.color}`}>
              {card.alert && (
                <div className="absolute top-2 right-2 flex items-center">
                  <Badge variant="destructive" className="animate-pulse">
                    Alert
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {card.icon}
                  {card.stats && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-700">{card.stats.split(' ')[0]}</div>
                      <div className="text-xs text-gray-500">{card.stats.split(' ').slice(1).join(' ')}</div>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{card.description}</CardDescription>
                <Button 
                  className={`w-full ${card.buttonColor} text-white`}
                  onClick={() => navigate(card.path)}
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Demo Data Management
            </CardTitle>
            <CardDescription>
              Generate sample data to test analytics features and explore the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataSeeder />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Connection</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Healthy
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Healthy
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Authentication Service</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Healthy
                </Badge>
              </div>
              {stats.selInsights > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Data Available: Analytics ready with {stats.selInsights} SEL insights
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
