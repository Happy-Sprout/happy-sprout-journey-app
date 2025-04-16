
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, Award, BookOpen, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { successToast, warningToast } from "@/components/ui/toast-extensions";
import EmotionTrackingSlider from "@/components/EmotionTrackingSlider";
import MultipleCheckboxGroup from "@/components/MultipleCheckboxGroup";
import { XP_VALUES } from "@/types/journal";
import SpeechInput from "@/components/SpeechInput";

const emotionRegulationTechniques = [
  { value: "deep-breathing", label: "Deep Breathing", description: "Taking slow, deep breaths to calm down" },
  { value: "counting", label: "Counting", description: "Counting to 10 or higher to manage emotions" },
  { value: "positive-self-talk", label: "Positive Self-Talk", description: "Using encouraging words to yourself" },
  { value: "physical-activity", label: "Physical Activity", description: "Moving your body to release tension" },
  { value: "visualization", label: "Visualization", description: "Imagining a peaceful place or scene" },
  { value: "talking", label: "Talking to Someone", description: "Sharing feelings with a trusted person" },
];

const MindfulCheckIn = () => {
  const { toast } = useToast();
  const { currentChildId } = useUser();
  const [checkInType, setCheckInType] = useState<"before" | "after">("before");
  const [currentMood, setCurrentMood] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(3);
  const [focusLevel, setFocusLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mindfulnessMinutes, setMindfulnessMinutes] = useState(5);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTechniqueToggle = (value: string) => {
    setTechniques(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };
  
  const handleSpeechTranscript = (text: string) => {
    setReflection(text);
  };

  const handleSubmit = async () => {
    if (!currentChildId) {
      warningToast({
        title: "No child profile selected",
        description: "Please select a child profile to continue"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Record before or after activity data
      const checkInData = {
        child_id: currentChildId,
        check_in_type: checkInType,
        mood: currentMood,
        anxiety: anxietyLevel,
        focus: focusLevel,
        energy: energyLevel,
        timestamp: new Date().toISOString()
      };
      
      // Add after-activity specific data
      if (checkInType === "after") {
        Object.assign(checkInData, {
          mindfulness_minutes: mindfulnessMinutes,
          techniques_used: techniques,
          reflection: reflection
        });
        
        // Record in emotional_trends table if it's an after check-in
        await supabase.from('emotional_trends').insert([{
          child_id: currentChildId,
          emotion: getMoodLabel(currentMood),
          intensity: currentMood,
          recorded_at: new Date().toISOString()
        }]);
        
        // Award XP for completing a mindfulness session
        try {
          // Get current XP
          const { data: progress } = await supabase
            .from('child_progress')
            .select('xp_points')
            .eq('child_id', currentChildId)
            .single();
            
          if (progress) {
            const currentXP = progress.xp_points || 0;
            const xpEarned = XP_VALUES.SOCIAL_SCENARIO; // 10 XP for completing a scenario
            
            // Update XP
            await supabase
              .from('child_progress')
              .update({ xp_points: currentXP + xpEarned })
              .eq('child_id', currentChildId);
              
            // Log activity
            await supabase
              .from('user_activity_logs')
              .insert([{
                user_id: currentChildId,
                user_type: 'child',
                action_type: 'mindfulness_completed',
                action_details: {
                  date: new Date().toISOString(),
                  minutes: mindfulnessMinutes,
                  techniques: techniques,
                  xp_earned: xpEarned
                }
              }]);
          }
        } catch (error) {
          console.error("Error awarding XP:", error);
        }
      }
      
      // Here you would save the data to your backend
      console.log("Saving mindful check-in data:", checkInData);
      
      // Simulate a successful submission (replace with actual API call)
      setTimeout(() => {
        successToast({
          title: "Check-in saved",
          description: checkInType === "before" 
            ? "Your pre-activity check-in has been recorded. Remember to complete the post-activity check-in afterward." 
            : `Your post-activity check-in has been recorded. Great job on your mindfulness practice! You earned ${XP_VALUES.SOCIAL_SCENARIO} XP!`,
        });
        
        // Reset form if it's an after check-in
        if (checkInType === "after") {
          setCurrentMood(5);
          setAnxietyLevel(3);
          setFocusLevel(5);
          setEnergyLevel(5);
          setMindfulnessMinutes(5);
          setTechniques([]);
          setReflection("");
        }
        
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving check-in:", error);
      warningToast({
        title: "Error",
        description: "There was a problem saving your check-in. Please try again."
      });
      setIsSubmitting(false);
    }
  };
  
  // Helper function to convert numeric mood to a label
  const getMoodLabel = (moodValue: number): string => {
    if (moodValue >= 8) return "happy";
    if (moodValue >= 6) return "calm";
    if (moodValue >= 4) return "neutral";
    if (moodValue >= 2) return "sad";
    return "angry";
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Mindful Check-In</CardTitle>
        <CardDescription>
          Track your emotional state before and after mindfulness activities
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={checkInType} onValueChange={(value) => setCheckInType(value as "before" | "after")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">Before Activity</TabsTrigger>
            <TabsTrigger value="after">After Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="before" className="space-y-6 mt-4">
            <EmotionTrackingSlider 
              label="How are you feeling right now?" 
              value={currentMood} 
              onChange={setCurrentMood}
              leftLabel="Not Good"
              rightLabel="Great"
              required
            />
            
            <EmotionTrackingSlider 
              label="Anxiety Level" 
              value={anxietyLevel} 
              onChange={setAnxietyLevel}
              leftLabel="Calm"
              rightLabel="Anxious"
            />
            
            <EmotionTrackingSlider 
              label="Focus Level" 
              value={focusLevel} 
              onChange={setFocusLevel}
              leftLabel="Distracted"
              rightLabel="Focused"
            />
            
            <EmotionTrackingSlider 
              label="Energy Level" 
              value={energyLevel} 
              onChange={setEnergyLevel}
              leftLabel="Tired"
              rightLabel="Energetic"
            />
          </TabsContent>
          
          <TabsContent value="after" className="space-y-6 mt-4">
            <EmotionTrackingSlider 
              label="How are you feeling now?" 
              value={currentMood} 
              onChange={setCurrentMood}
              leftLabel="Not Good"
              rightLabel="Great"
              required
            />
            
            <EmotionTrackingSlider 
              label="Anxiety Level" 
              value={anxietyLevel} 
              onChange={setAnxietyLevel}
              leftLabel="Calm"
              rightLabel="Anxious"
            />
            
            <EmotionTrackingSlider 
              label="Focus Level" 
              value={focusLevel} 
              onChange={setFocusLevel}
              leftLabel="Distracted"
              rightLabel="Focused"
            />
            
            <div className="flex items-center space-x-4">
              <Label className="text-base font-medium whitespace-nowrap">
                Minutes of mindfulness:
              </Label>
              <div className="flex items-center border rounded-md px-3 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMindfulnessMinutes(prev => Math.max(1, prev - 1))}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="mx-2 w-8 text-center">{mindfulnessMinutes}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMindfulnessMinutes(prev => prev + 1)}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <Clock className="text-gray-500 h-5 w-5" />
            </div>
            
            <MultipleCheckboxGroup
              label="Techniques used"
              options={emotionRegulationTechniques}
              selectedValues={techniques}
              onChange={handleTechniqueToggle}
            />
            
            <div className="space-y-2">
              <Label htmlFor="reflection" className="text-base font-medium">Reflection</Label>
              <div className="relative">
                <Textarea
                  id="reflection"
                  placeholder="How did this mindfulness activity make you feel? What did you notice?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[100px] w-full pr-12"
                  maxLength={2000}
                />
                <div className="absolute top-1 right-1">
                  <SpeechInput 
                    onTranscript={handleSpeechTranscript} 
                    isAppending={true}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Check-In"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MindfulCheckIn;
