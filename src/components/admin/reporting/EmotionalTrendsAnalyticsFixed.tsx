import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp, TrendingDown, Users, Brain, Heart, HandHeart, Scale, Target } from "lucide-react";

// Type definitions
interface SELInsight {
  id: string;
  child_id: string;
  self_awareness: number;
  self_management: number;
  social_awareness: number;
  relationship_skills: number;
  responsible_decision_making: number;
  created_at: string;
  source_text?: string;
}

interface Child {
  id: string;
  nickname: string;
  age: number;
}

interface TrendData {
  date: string;
  self_awareness: number;
  self_management: number;
  social_awareness: number;
  relationship_skills: number;
  responsible_decision_making: number;
}

interface CompetencyProgress {
  competency: string;
  icon: any;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// Fixed components
const XAxis: any = RechartsXAxis;
const YAxis: any = RechartsYAxis;

const EmotionalTrendsAnalyticsFixed = () => {
  const [insights, setInsights] = useState<SELInsight[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("30");
  const [selectedCompetency, setSelectedCompetency] = useState<string>("all");

  // Competency definitions
  const competencies = [
    { key: 'self_awareness', label: 'Self-Awareness', icon: Brain, color: '#8B5CF6' },
    { key: 'self_management', label: 'Self-Management', icon: Target, color: '#06B6D4' },
    { key: 'social_awareness', label: 'Social Awareness', icon: Users, color: '#10B981' },
    { key: 'relationship_skills', label: 'Relationship Skills', icon: Heart, color: '#F59E0B' },
    { key: 'responsible_decision_making', label: 'Responsible Decision Making', icon: Scale, color: '#EF4444' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedTimeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const daysAgo = parseInt(selectedTimeframe);
      const startDate = subDays(new Date(), daysAgo).toISOString();

      // Fetch SEL insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('sel_insights')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (insightsError) {
        console.error('Error fetching insights:', insightsError);
        return;
      }

      // Fetch children separately
      const childIds = [...new Set(insightsData?.map(insight => insight.child_id) || [])];
      
      if (childIds.length > 0) {
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('id, nickname, age')
          .in('id', childIds);

        if (childrenError) {
          console.error('Error fetching children:', childrenError);
        } else {
          setChildren(childrenData || []);
        }
      }

      setInsights(insightsData || []);
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const processedTrendData = (): TrendData[] => {
    if (!insights.length) return [];

    // Group insights by date
    const groupedByDate = insights.reduce((acc, insight) => {
      const date = format(new Date(insight.created_at), 'MMM dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(insight);
      return acc;
    }, {} as Record<string, SELInsight[]>);

    // Calculate averages for each date
    return Object.entries(groupedByDate).map(([date, dayInsights]) => {
      const averages = {
        self_awareness: 0,
        self_management: 0,
        social_awareness: 0,
        relationship_skills: 0,
        responsible_decision_making: 0
      };

      dayInsights.forEach(insight => {
        averages.self_awareness += insight.self_awareness;
        averages.self_management += insight.self_management;
        averages.social_awareness += insight.social_awareness;
        averages.relationship_skills += insight.relationship_skills;
        averages.responsible_decision_making += insight.responsible_decision_making;
      });

      const count = dayInsights.length;
      return {
        date,
        self_awareness: Math.round((averages.self_awareness / count) * 100),
        self_management: Math.round((averages.self_management / count) * 100),
        social_awareness: Math.round((averages.social_awareness / count) * 100),
        relationship_skills: Math.round((averages.relationship_skills / count) * 100),
        responsible_decision_making: Math.round((averages.responsible_decision_making / count) * 100),
      };
    });
  };

  const getOverallStats = () => {
    if (!insights.length) return null;

    const totalInsights = insights.length;
    const avgScores = competencies.map(comp => {
      const scores = insights.map(insight => insight[comp.key as keyof SELInsight] as number);
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return {
        ...comp,
        average: Math.round(avg * 100)
      };
    });

    return {
      totalInsights,
      avgScores,
      activeChildren: children.length
    };
  };

  const stats = getOverallStats();
  const trendData = processedTrendData();

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Emotional Trends & SEL Analytics
              </CardTitle>
              <CardDescription>
                Track Social-Emotional Learning competency development over time
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalInsights}</div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.activeChildren}</div>
                <p className="text-sm text-muted-foreground">Active Children</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.avgScores.reduce((sum, comp) => sum + comp.average, 0) / stats.avgScores.length}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Average</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competency Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>SEL Competency Overview</CardTitle>
            <CardDescription>Average scores across all competencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.avgScores.map((comp) => {
                const Icon = comp.icon;
                return (
                  <div key={comp.key} className="text-center p-4 bg-muted/50 rounded-lg">
                    <Icon className="h-8 w-8 mx-auto mb-2" style={{ color: comp.color }} />
                    <div className="text-2xl font-bold">{comp.average}%</div>
                    <div className="text-sm text-muted-foreground">{comp.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends Chart */}
      {trendData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>SEL Competency Trends</CardTitle>
            <CardDescription>Progress over time across all competencies</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                self_awareness: { label: "Self-Awareness", color: "#8B5CF6" },
                self_management: { label: "Self-Management", color: "#06B6D4" },
                social_awareness: { label: "Social Awareness", color: "#10B981" },
                relationship_skills: { label: "Relationship Skills", color: "#F59E0B" },
                responsible_decision_making: { label: "Responsible Decision Making", color: "#EF4444" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {competencies.map((comp) => (
                    <Line
                      key={comp.key}
                      type="monotone"
                      dataKey={comp.key}
                      stroke={comp.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              No SEL assessment data found for the selected timeframe. Generate some demo data to see analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the "Generate Demo Data" button in the Data Management section to create sample SEL assessments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Children Performance Table */}
      {children.length > 0 && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Child Performance</CardTitle>
            <CardDescription>Latest SEL competency scores by child</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map(child => {
                const childInsights = insights.filter(insight => insight.child_id === child.id);
                if (childInsights.length === 0) return null;

                const latestInsight = childInsights[childInsights.length - 1];
                
                return (
                  <div key={child.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium">{child.nickname}</h4>
                        <p className="text-sm text-muted-foreground">Age {child.age} • {childInsights.length} assessments</p>
                      </div>
                      <Badge variant="outline">{format(new Date(latestInsight.created_at), 'MMM dd')}</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {competencies.map(comp => {
                        const score = Math.round((latestInsight[comp.key as keyof SELInsight] as number) * 100);
                        return (
                          <div key={comp.key} className="text-center">
                            <div className="text-lg font-semibold">{score}%</div>
                            <div className="text-xs text-muted-foreground">{comp.label.split(' ')[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmotionalTrendsAnalyticsFixed;
