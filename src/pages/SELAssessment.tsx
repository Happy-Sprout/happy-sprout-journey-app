
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MindfulCheckIn from "@/components/mindfulness/MindfulCheckIn";
import BehavioralObservationForm from "@/components/observations/BehavioralObservationForm";
import EmotionalTrendsChart from "@/components/dashboard/EmotionalTrendsChart";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const SELAssessment = () => {
  const { childProfiles, currentChildId } = useChildren();
  const [activeTab, setActiveTab] = useState("check-in");
  const [emotionalData, setEmotionalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Get current child name
  const currentChild = childProfiles.find(child => child.id === currentChildId);
  const childName = currentChild ? currentChild.nickname : "your child";
  
  useEffect(() => {
    if (currentChildId) {
      fetchEmotionalData();
    }
  }, [currentChildId]);
  
  const fetchEmotionalData = async () => {
    setLoading(true);
    try {
      // Get the last 14 days of data
      const startDate = format(subDays(new Date(), 14), "yyyy-MM-dd");
      
      // First try to get data from emotional_trends table
      let { data: trendsData, error } = await supabase
        .from('emotional_trends')
        .select('*')
        .eq('child_id', currentChildId)
        .gte('recorded_at', startDate)
        .order('recorded_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching emotional trends:", error);
        setEmotionalData([]);
        setLoading(false);
        return;
      }
      
      // If we have real data, format and use it
      if (trendsData && trendsData.length > 0) {
        const formattedData = trendsData.map(item => {
          const date = format(new Date(item.recorded_at), "yyyy-MM-dd");
          const emotion = item.emotion;
          
          // Map emotional data to chart format
          let mood = 5, anxiety = 5, focus = 5, energy = 5;
          
          if (emotion === 'happy' || emotion === 'excited' || emotion === 'energized') {
            mood = 8;
            anxiety = 2;
            focus = 7;
            energy = 8;
          } else if (emotion === 'calm' || emotion === 'peaceful' || emotion === 'grateful') {
            mood = 7;
            anxiety = 3;
            focus = 9;
            energy = 6;
          } else if (emotion === 'sad' || emotion === 'disappointed' || emotion === 'lonely') {
            mood = 3;
            anxiety = 6;
            focus = 4;
            energy = 3;
          } else if (emotion === 'angry' || emotion === 'frustrated' || emotion === 'annoyed') {
            mood = 4;
            anxiety = 7;
            focus = 3;
            energy = 7;
          } else if (emotion === 'worried' || emotion === 'anxious' || emotion === 'nervous') {
            mood = 4;
            anxiety = 9;
            focus = 3;
            energy = 5;
          }
          
          return {
            date,
            mood,
            anxiety,
            focus,
            energy,
            emotion
          };
        });
        
        setEmotionalData(formattedData);
      } else {
        // Use the sample data if no real data is available
        setEmotionalData(sampleEmotionalData);
      }
    } catch (error) {
      console.error("Error:", error);
      setEmotionalData(sampleEmotionalData);
    } finally {
      setLoading(false);
    }
  };
  
  // Sample data as fallback for the emotional trends chart
  const sampleEmotionalData = [
    { date: "2025-03-01", mood: 7, anxiety: 3, focus: 6, energy: 8, emotion: "happy" },
    { date: "2025-03-02", mood: 6, anxiety: 4, focus: 5, energy: 7, emotion: "calm" },
    { date: "2025-03-03", mood: 5, anxiety: 5, focus: 4, energy: 6, emotion: "neutral" },
    { date: "2025-03-04", mood: 6, anxiety: 3, focus: 7, energy: 8, emotion: "happy" },
    { date: "2025-03-05", mood: 8, anxiety: 2, focus: 8, energy: 9, emotion: "excited" },
    { date: "2025-03-06", mood: 7, anxiety: 3, focus: 6, energy: 7, emotion: "happy" },
    { date: "2025-03-07", mood: 9, anxiety: 1, focus: 9, energy: 8, emotion: "energized" },
  ];
  
  // Create radar chart data from the latest emotional data point
  const getSkillsRadarData = () => {
    if (!emotionalData || emotionalData.length === 0) return [];
    
    // Use the latest data point
    const latestData = emotionalData[emotionalData.length - 1];
    
    // Transform to radar format
    return [
      { skill: isMobile ? "Awareness" : "Self-Awareness", value: latestData.mood },
      { skill: isMobile ? "Management" : "Self-Management", value: 10 - latestData.anxiety },
      { skill: isMobile ? "Social" : "Social Awareness", value: latestData.focus },
      { skill: isMobile ? "Relations" : "Relationship Skills", value: latestData.energy },
      { skill: isMobile ? "Decisions" : "Decision-Making", value: (latestData.mood + latestData.focus) / 2 }
    ];
  };
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-left">Social Emotional Learning</h1>
        <p className="text-gray-600 mb-6 sm:mb-8 text-left">
          Track emotional well-being, mindfulness, and behavior for {childName}
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="check-in">Mindful Check-In</TabsTrigger>
            <TabsTrigger value="observation">Behavioral Observations</TabsTrigger>
            <TabsTrigger value="trends">Emotional Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="check-in" className="focus-visible:outline-none focus-visible:ring-0">
            <MindfulCheckIn />
          </TabsContent>
          
          <TabsContent value="observation" className="focus-visible:outline-none focus-visible:ring-0">
            <BehavioralObservationForm />
          </TabsContent>
          
          <TabsContent value="trends" className="focus-visible:outline-none focus-visible:ring-0 space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sprout-purple"></div>
              </div>
            ) : (
              <>
                <EmotionalTrendsChart 
                  data={emotionalData} 
                  title="Emotional Trends" 
                  description={`Tracking emotional well-being over time for ${childName}`}
                  height={350}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EmotionalTrendsChart 
                    data={emotionalData} 
                    title="Mood & Anxiety" 
                    description="Tracking mood and anxiety levels"
                    height={250}
                    showFocus={false}
                    showEnergy={false}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Compare Skills Areas</CardTitle>
                      <CardDescription>Current skills snapshot for {childName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {emotionalData.length > 0 ? (
                        <div className="w-full h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                              cx="50%" 
                              cy="50%" 
                              outerRadius={isMobile ? "65%" : "80%"} 
                              data={getSkillsRadarData()}
                            >
                              <PolarGrid />
                              <PolarAngleAxis 
                                dataKey="skill"
                                tick={{ 
                                  fontSize: isMobile ? 9 : 12,
                                  fill: "#666" 
                                }}
                              />
                              <PolarRadiusAxis
                                angle={90}
                                domain={[0, 10]}
                                tickCount={5}
                                tick={{ fontSize: isMobile ? 9 : 10 }}
                              />
                              <Radar
                                name="Skill Level"
                                dataKey="value"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                              />
                              <Tooltip
                                formatter={(value) => [`${value}/10`, "Skill Level"]}
                                contentStyle={{
                                  backgroundColor: 'white',
                                  fontSize: isMobile ? '10px' : '12px',
                                  padding: '8px',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px'
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-[250px] bg-slate-50 rounded-md">
                          <p className="text-gray-500 text-center">
                            No data available for skills comparison
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SELAssessment;
