
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, Award, BookOpen, Zap } from "lucide-react";
import EmotionTrackingSlider from "@/components/EmotionTrackingSlider";
import MultipleCheckboxGroup from "@/components/MultipleCheckboxGroup";

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Here you would save the data to your backend
      // For now, we'll just simulate a successful submission
      
      setTimeout(() => {
        toast({
          title: "Check-in saved",
          description: checkInType === "before" 
            ? "Your pre-activity check-in has been recorded. Remember to complete the post-activity check-in afterward." 
            : "Your post-activity check-in has been recorded. Great job on your mindfulness practice!",
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
      toast({
        title: "Error",
        description: "There was a problem saving your check-in. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
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
              <Textarea
                id="reflection"
                placeholder="How did this mindfulness activity make you feel? What did you notice?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[100px]"
              />
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
