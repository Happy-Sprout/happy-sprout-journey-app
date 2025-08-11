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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { Target, TrendingUp, Users, Calendar, Award, CheckCircle } from "lucide-react";

// Fixed components
const XAxis: any = RechartsXAxis;
const YAxis: any = RechartsYAxis;

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
  date_of_birth: string;
}

interface CompletionData {
  month: string;
  assessments: number;
  completion_rate: number;
}

interface ProgressData {
  month: string;
  average_score: number;
  improvement: number;
}

const AssessmentProgressAnalyticsFixed = () => {
  const [insights, setInsights] = useState<SELInsight[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("6");

  useEffect(() => {
    fetchData();
  }, [selectedTimeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const monthsAgo = parseInt(selectedTimeframe);
      const startDate = subDays(new Date(), monthsAgo * 30).toISOString();

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
          .select('id, nickname, age, date_of_birth')
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

  const getCompletionTrends = (): CompletionData[] => {
    if (!insights.length || !children.length) return [];

    // Generate last 6 months
    const monthsToShow = parseInt(selectedTimeframe);
    const months = eachMonthOfInterval({
      start: subDays(new Date(), monthsToShow * 30),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthInsights = insights.filter(insight => {
        const insightDate = new Date(insight.created_at);
        return insightDate >= monthStart && insightDate <= monthEnd;
      });

      // Calculate expected assessments (assume 4 per child per month)
      const expectedAssessments = children.length * 4;
      const actualAssessments = monthInsights.length;
      const completionRate = expectedAssessments > 0 
        ? Math.round((actualAssessments / expectedAssessments) * 100)
        : 0;

      return {
        month: format(month, 'MMM yyyy'),
        assessments: actualAssessments,
        completion_rate: Math.min(completionRate, 100) // Cap at 100%
      };
    });
  };

  const getProgressOverTime = (): ProgressData[] => {
    if (!insights.length) return [];

    const monthsToShow = parseInt(selectedTimeframe);
    const months = eachMonthOfInterval({
      start: subDays(new Date(), monthsToShow * 30),
      end: new Date()
    });

    let previousAverage = 0;

    return months.map((month, index) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthInsights = insights.filter(insight => {
        const insightDate = new Date(insight.created_at);
        return insightDate >= monthStart && insightDate <= monthEnd;
      });

      if (monthInsights.length === 0) {
        return {
          month: format(month, 'MMM yyyy'),
          average_score: previousAverage,
          improvement: 0
        };
      }

      // Calculate average score across all competencies
      const totalScore = monthInsights.reduce((sum, insight) => {
        return sum + 
          insight.self_awareness + 
          insight.self_management + 
          insight.social_awareness + 
          insight.relationship_skills + 
          insight.responsible_decision_making;
      }, 0);

      const averageScore = Math.round((totalScore / (monthInsights.length * 5)) * 100);
      const improvement = index > 0 ? averageScore - previousAverage : 0;
      
      previousAverage = averageScore;

      return {
        month: format(month, 'MMM yyyy'),
        average_score: averageScore,
        improvement
      };
    });
  };

  const getAgeGroupAnalysis = () => {
    if (!children.length || !insights.length) return [];

    const ageGroups = {
      '6-8': { count: 0, totalScore: 0, assessments: 0 },
      '9-10': { count: 0, totalScore: 0, assessments: 0 },
      '11-12': { count: 0, totalScore: 0, assessments: 0 },
      '13+': { count: 0, totalScore: 0, assessments: 0 }
    };

    children.forEach(child => {
      const age = child.age;
      let group: keyof typeof ageGroups;
      
      if (age <= 8) group = '6-8';
      else if (age <= 10) group = '9-10';
      else if (age <= 12) group = '11-12';
      else group = '13+';

      ageGroups[group].count++;

      const childInsights = insights.filter(insight => insight.child_id === child.id);
      childInsights.forEach(insight => {
        const score = (
          insight.self_awareness + 
          insight.self_management + 
          insight.social_awareness + 
          insight.relationship_skills + 
          insight.responsible_decision_making
        ) / 5;
        
        ageGroups[group].totalScore += score;
        ageGroups[group].assessments++;
      });
    });

    return Object.entries(ageGroups)
      .filter(([_, data]) => data.count > 0)
      .map(([ageGroup, data]) => ({
        age_group: ageGroup,
        children_count: data.count,
        average_score: data.assessments > 0 ? Math.round((data.totalScore / data.assessments) * 100) : 0,
        total_assessments: data.assessments
      }));
  };

  const getTopImprovers = () => {
    if (!children.length || !insights.length) return [];

    return children.map(child => {
      const childInsights = insights
        .filter(insight => insight.child_id === child.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      if (childInsights.length < 2) return null;

      const firstInsight = childInsights[0];
      const lastInsight = childInsights[childInsights.length - 1];

      const firstScore = (
        firstInsight.self_awareness + 
        firstInsight.self_management + 
        firstInsight.social_awareness + 
        firstInsight.relationship_skills + 
        firstInsight.responsible_decision_making
      ) / 5;

      const lastScore = (
        lastInsight.self_awareness + 
        lastInsight.self_management + 
        lastInsight.social_awareness + 
        lastInsight.relationship_skills + 
        lastInsight.responsible_decision_making
      ) / 5;

      const improvement = Math.round((lastScore - firstScore) * 100);

      return {
        id: child.id,
        nickname: child.nickname,
        age: child.age,
        first_score: Math.round(firstScore * 100),
        last_score: Math.round(lastScore * 100),
        improvement,
        assessments_count: childInsights.length
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.improvement || 0) - (a?.improvement || 0))
    .slice(0, 5);
  };

  const getOverallStats = () => {
    if (!insights.length || !children.length) return null;

    const totalAssessments = insights.length;
    const activeChildren = children.length;
    const averageAssessmentsPerChild = Math.round(totalAssessments / activeChildren);
    
    // Calculate completion rate for current month
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const currentMonthInsights = insights.filter(insight => 
      new Date(insight.created_at) >= monthStart
    );
    
    const expectedThisMonth = activeChildren * 4; // Assuming 4 assessments per child per month
    const actualThisMonth = currentMonthInsights.length;
    const completionRate = Math.round((actualThisMonth / expectedThisMonth) * 100);

    return {
      totalAssessments,
      activeChildren,
      averageAssessmentsPerChild,
      completionRate: Math.min(completionRate, 100)
    };
  };

  const completionTrends = getCompletionTrends();
  const progressData = getProgressOverTime();
  const ageGroupData = getAgeGroupAnalysis();
  const topImprovers = getTopImprovers();
  const stats = getOverallStats();

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
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
                <Target className="h-5 w-5" />
                Assessment Progress Analytics
              </CardTitle>
              <CardDescription>
                Track assessment completion rates and learning progress over time
              </CardDescription>
            </div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.activeChildren}</div>
                  <p className="text-sm text-muted-foreground">Active Children</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.averageAssessmentsPerChild}</div>
                  <p className="text-sm text-muted-foreground">Avg. per Child</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="completion" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="demographics">Age Groups</TabsTrigger>
          <TabsTrigger value="improvers">Top Improvers</TabsTrigger>
        </TabsList>

        {/* Completion Trends */}
        <TabsContent value="completion">
          {completionTrends.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Completion Trends</CardTitle>
                <CardDescription>Monthly assessment completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completion_rate: { label: "Completion Rate", color: "#8B5CF6" },
                    assessments: { label: "Assessments", color: "#06B6D4" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completion_rate" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No completion data available for the selected timeframe.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Over Time */}
        <TabsContent value="progress">
          {progressData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress Over Time</CardTitle>
                <CardDescription>Average SEL competency scores by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    average_score: { label: "Average Score", color: "#10B981" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="average_score" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#10B981" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No progress data available for the selected timeframe.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Age Group Demographics */}
        <TabsContent value="demographics">
          {ageGroupData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Performance by Age Group</CardTitle>
                <CardDescription>SEL competency scores across different age ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChartContainer
                    config={{
                      average_score: { label: "Average Score", color: "#F59E0B" }
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageGroupData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age_group" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="average_score" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Age Group Breakdown</h4>
                    {ageGroupData.map((group, index) => (
                      <div key={group.age_group} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">Ages {group.age_group}</div>
                          <div className="text-sm text-muted-foreground">{group.children_count} children</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{group.average_score}%</div>
                          <div className="text-sm text-muted-foreground">{group.total_assessments} assessments</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No demographic data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Top Improvers */}
        <TabsContent value="improvers">
          {topImprovers.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top Improving Children</CardTitle>
                <CardDescription>Children showing the most improvement in SEL competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topImprovers.map((child, index) => (
                    <div key={child?.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{child?.nickname}</div>
                          <div className="text-sm text-muted-foreground">
                            Age {child?.age} • {child?.assessments_count} assessments
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{child?.first_score}%</span>
                          <span>→</span>
                          <span className="font-bold text-green-600">{child?.last_score}%</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          +{child?.improvement}% improvement
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No improvement data available. Need more assessment data over time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentProgressAnalyticsFixed;
