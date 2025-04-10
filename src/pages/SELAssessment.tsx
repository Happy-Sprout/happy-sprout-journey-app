
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MindfulCheckIn from "@/components/mindfulness/MindfulCheckIn";
import BehavioralObservationForm from "@/components/observations/BehavioralObservationForm";
import EmotionalTrendsChart from "@/components/dashboard/EmotionalTrendsChart";
import { useChildren } from "@/hooks/useChildren";

// Sample data for the emotional trends chart
const sampleEmotionalData = [
  { date: "2025-03-01", mood: 7, anxiety: 3, focus: 6, energy: 8 },
  { date: "2025-03-02", mood: 6, anxiety: 4, focus: 5, energy: 7 },
  { date: "2025-03-03", mood: 5, anxiety: 5, focus: 4, energy: 6 },
  { date: "2025-03-04", mood: 6, anxiety: 3, focus: 7, energy: 8 },
  { date: "2025-03-05", mood: 8, anxiety: 2, focus: 8, energy: 9 },
  { date: "2025-03-06", mood: 7, anxiety: 3, focus: 6, energy: 7 },
  { date: "2025-03-07", mood: 9, anxiety: 1, focus: 9, energy: 8 },
];

const SELAssessment = () => {
  const { childProfiles, currentChildId } = useChildren();
  const [activeTab, setActiveTab] = useState("check-in");
  
  // Get current child name
  const currentChild = childProfiles.find(child => child.id === currentChildId);
  const childName = currentChild ? currentChild.nickname : "your child";
  
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
            <EmotionalTrendsChart 
              data={sampleEmotionalData} 
              title="Emotional Trends" 
              description={`Tracking emotional well-being over time for ${childName}`}
              height={350}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmotionalTrendsChart 
                data={sampleEmotionalData} 
                title="Mood & Anxiety" 
                description="Tracking mood and anxiety levels"
                height={250}
                showFocus={false}
                showEnergy={false}
              />
              
              <EmotionalTrendsChart 
                data={sampleEmotionalData} 
                title="Focus & Energy" 
                description="Tracking focus and energy levels"
                height={250}
                showMood={false}
                showAnxiety={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SELAssessment;
