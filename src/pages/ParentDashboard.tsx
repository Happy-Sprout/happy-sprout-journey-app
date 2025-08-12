import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Heart, 
  BookOpen, 
  Target,
  Calendar,
  Award,
  Bell,
  Settings,
  Download
} from "lucide-react";

const ParentDashboard = () => {
  const { childProfiles, user } = useUser();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [familyInsights, setFamilyInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <Layout requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Family Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Track your family's social-emotional learning journey
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Family Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Children
                </CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{childProfiles.length}</div>
                <p className="text-xs text-gray-500 mt-1">Active profiles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Weekly Progress
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-gray-500 mt-1">Improvement this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Journal Entries
                </CardTitle>
                <BookOpen className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  SEL Score
                </CardTitle>
                <Heart className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-gray-500 mt-1">Family average</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="children">Children</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Family SEL Trends */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Family SEL Progress</CardTitle>
                    <CardDescription>
                      Social-emotional learning development over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      SEL Progress Chart Coming Soon
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <p className="font-medium">Alex completed daily check-in</p>
                        <p className="text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <p className="font-medium">Maya wrote journal entry</p>
                        <p className="text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="text-sm">
                        <p className="font-medium">Jordan finished assessment</p>
                        <p className="text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>This Week's Summary</CardTitle>
                  <CardDescription>
                    Key highlights and areas of focus for your family
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold text-green-800">Strengths</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Excellent self-awareness growth across all children
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800">Focus Areas</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Social awareness skills need more practice
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Next Steps</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Schedule family mindfulness activities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Children Tab */}
            <TabsContent value="children" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childProfiles.map((child) => (
                  <Card key={child.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{child.nickname}</CardTitle>
                        <Badge variant="outline">Age {child.age}</Badge>
                      </div>
                      <CardDescription>
                        Grade {child.grade}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall SEL Score</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold">Self-Aware</div>
                          <div className="text-blue-600">85%</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold">Self-Manage</div>
                          <div className="text-green-600">78%</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold">Social</div>
                          <div className="text-purple-600">80%</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="font-semibold">Relations</div>
                          <div className="text-orange-600">84%</div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Family Insights</CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your family's SEL journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-semibold text-blue-800">Communication Pattern</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Your children show strong emotional expression in journals but could benefit 
                        from more family discussion time about feelings.
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-semibold text-green-800">Growth Opportunity</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Maya is excelling in self-awareness - consider having her mentor Alex 
                        in emotional recognition activities.
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                      <h4 className="font-semibold text-yellow-800">Weekly Focus</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        This week, focus on relationship skills through family game night 
                        and collaborative activities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Family SEL Goals</CardTitle>
                  <CardDescription>
                    Set and track progress towards social-emotional learning objectives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Improve Family Communication</h4>
                        <p className="text-sm text-gray-600">Daily family check-ins</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">4/7 days</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '57%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Mindfulness Practice</h4>
                        <p className="text-sm text-gray-600">Weekly family meditation</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">2/4 weeks</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Set New Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
