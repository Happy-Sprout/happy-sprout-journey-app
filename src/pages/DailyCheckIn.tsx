import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { Smile, Frown, Angry, AlertCircle, Lightbulb, Calendar, ArrowRight, Meh } from "lucide-react";
import { warningToast, successToast } from "@/components/ui/toast-extensions";
import { supabase } from "@/integrations/supabase/client";

const emotionFeelingMap = {
  "happy": {
    icon: <Smile size={32} className="text-sprout-green" />,
    color: "sprout-green",
    feelings: ["Excited", "Happy", "Proud", "Successful", "Motivated", "Inspired", "Energized", "Fulfilled", "Confident"]
  },
  "calm": {
    icon: <Smile size={32} className="text-sprout-blue" />,
    color: "sprout-blue",
    feelings: ["Grateful", "Peaceful", "Included", "Valued", "Optimistic", "Focused", "Curious", "Creative", "Awed"]
  },
  "neutral": {
    icon: <Meh size={32} className="text-gray-500" />,
    color: "gray-500",
    feelings: ["Okay", "Fine", "Bored", "Tired", "Indifferent", "Blank", "Numb", "Unsure", "Disconnected"]
  },
  "sad": {
    icon: <Frown size={32} className="text-sprout-blue" />,
    color: "sprout-blue",
    feelings: ["Sad", "Worried", "Anxious", "Lonely", "Disappointed", "Embarrassed", "Hurt", "Confused", "Discouraged"]
  },
  "angry": {
    icon: <Angry size={32} className="text-sprout-orange" />,
    color: "sprout-orange",
    feelings: ["Angry", "Frustrated", "Annoyed", "Mad", "Jealous", "Impatient", "Overwhelmed", "Resentful", "Defensive"]
  },
};

const DailyCheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentChild, currentChildId, markDailyCheckInComplete } = useUser();
  const currentChild = getCurrentChild();
  
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [anxiety, setAnxiety] = useState("");
  const [scenarioAnswer, setScenarioAnswer] = useState("");
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState("");
  
  const totalSteps = 4;

  useEffect(() => {
    setSelectedFeeling("");
  }, [mood]);

  useEffect(() => {
    if (currentChild) {
      const isToday = (date) => {
        if (!date) return false;
        const checkInDate = new Date(date);
        const today = new Date();
        return checkInDate.toDateString() === today.toDateString();
      };
      
      if (currentChild.dailyCheckInCompleted && currentChild.lastCheckInDate && 
          isToday(currentChild.lastCheckInDate)) {
        console.log("Daily check-in already completed for today");
        setAlreadyCompletedToday(true);
      } else {
        setAlreadyCompletedToday(false);
      }
    }
  }, [currentChild]);
  
  const scenarioQuestions = [
    {
      question: "Your friend won't let you join their game during recess. What would you do?",
      options: [
        { value: "ask", label: "Politely ask why you can't join" },
        { value: "other", label: "Find another game to play" },
        { value: "teacher", label: "Tell a teacher" },
        { value: "upset", label: "Get upset and tell them they're being mean" },
      ],
    },
    {
      question: "Someone in your class is being teased. What would you do?",
      options: [
        { value: "support", label: "Go support them and be friendly" },
        { value: "tell", label: "Tell a teacher about what you saw" },
        { value: "ignore", label: "Stay out of it to avoid trouble" },
        { value: "join", label: "Join in if everyone else is doing it" },
      ],
    },
    {
      question: "You accidentally broke something that belongs to someone else. What would you do?",
      options: [
        { value: "admit", label: "Tell them right away and offer to fix it" },
        { value: "hide", label: "Put it back and hope they don't notice" },
        { value: "blame", label: "Say someone else did it" },
        { value: "avoid", label: "Avoid them so you don't have to explain" },
      ],
    }
  ];
  
  const getScenarioQuestion = () => {
    if (!currentChildId) return scenarioQuestions[0];
    
    const childIdSum = currentChildId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const questionIndex = (childIdSum + dayOfYear) % scenarioQuestions.length;
    return scenarioQuestions[questionIndex];
  };
  
  const scenarioQuestion = getScenarioQuestion();
  
  const motivationalQuotes = [
    "Great job! Remember that sharing your feelings helps you grow stronger!",
    "You're doing amazing! Recognizing your emotions is the first step to managing them.",
    "Awesome check-in! Each day you learn more about yourself and your emotions.",
    "Well done! Your emotional awareness is growing every day.",
    "Fantastic! Understanding your feelings today helps you handle tomorrow better.",
  ];
  
  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };
  
  const nextStep = () => {
    if (step === 1 && !mood) {
      warningToast({
        title: "Selection needed",
        description: "Please select how you're feeling today"
      });
      return;
    }
    
    if (step === 2 && !energyLevel) {
      warningToast({
        title: "Selection needed",
        description: "Please select your energy level"
      });
      return;
    }
    
    if (step === 3 && !anxiety) {
      warningToast({
        title: "Selection needed",
        description: "Please select your worry level"
      });
      return;
    }
    
    if (step === 4 && !scenarioAnswer) {
      warningToast({
        title: "Selection needed",
        description: "Please select an answer to the scenario"
      });
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeCheckIn();
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const completeCheckIn = () => {
    if (currentChildId) {
      const currentDate = new Date().toISOString();
      markDailyCheckInComplete(currentChildId, currentDate);
      
      successToast({
        title: "Check-in Complete!",
        description: "Great job sharing how you feel today! You earned 10 XP!"
      });
      
      console.log({
        childId: currentChildId,
        date: new Date().toISOString().split('T')[0],
        mood: selectedFeeling || mood,
        energyLevel,
        anxiety,
        scenarioAnswer,
      });
      
      try {
        supabase
          .from('user_activity_logs')
          .insert([{
            user_id: currentChildId,
            user_type: 'child',
            action_type: 'daily_checkin_completed',
            action_details: {
              date: currentDate,
              mood: selectedFeeling || mood,
              xp_earned: 10
            }
          }]);
          
        supabase
          .from('child_progress')
          .select('xp_points')
          .eq('child_id', currentChildId)
          .single()
          .then(({ data }) => {
            if (data) {
              const currentXP = data.xp_points || 0;
              supabase
                .from('child_progress')
                .update({ xp_points: currentXP + 10 })
                .eq('child_id', currentChildId);
            }
          });
      } catch (error) {
        console.error("Error logging activity:", error);
      }
      
      setStep(totalSteps + 1);
      setAlreadyCompletedToday(true);
    }
  };
  
  if (!currentChild) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <h2 className="text-xl font-bold mb-2">No Active Profile</h2>
                <p className="text-gray-600 mb-4">
                  Please select or create a child profile first.
                </p>
                <Button
                  className="sprout-button"
                  onClick={() => navigate("/profile")}
                >
                  Go to Profiles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (alreadyCompletedToday) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold mb-2">Check-in Already Completed</h2>
                <p className="text-gray-600 mb-4">
                  You've already completed your check-in for today. Great job!
                </p>
                <div className="p-6 bg-gradient-to-r from-sprout-yellow/20 to-sprout-green/20 rounded-lg mb-6">
                  <p className="italic text-lg">"{getRandomQuote()}"</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    className="bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/journal")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Write in Journal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Daily Emotion Check-In
          </h1>
          <p className="text-gray-600 mt-2">
            Hi {currentChild?.nickname}! Let's talk about how you're feeling today.
          </p>
        </div>
        
        {step <= totalSteps && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
              <span className="text-sm font-medium">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sprout-purple transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">How are you feeling today?</h2>
                <RadioGroup value={mood} onValueChange={setMood} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="flex flex-col items-center">
                    <Label 
                      htmlFor="happy" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => setMood("happy")}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-colors ${
                        mood === "happy" ? "bg-sprout-green/20 border-2 border-sprout-green" : "bg-gray-100 hover:bg-gray-200"
                      }`}>
                        <Smile size={32} className="text-sprout-green" />
                      </div>
                      <span>Happy</span>
                    </Label>
                    <RadioGroupItem value="happy" id="happy" className="sr-only" />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Label 
                      htmlFor="calm" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => setMood("calm")}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-colors ${
                        mood === "calm" ? "bg-sprout-blue/20 border-2 border-sprout-blue" : "bg-gray-100 hover:bg-gray-200"
                      }`}>
                        <Smile size={32} className="text-sprout-blue" />
                      </div>
                      <span>Calm</span>
                    </Label>
                    <RadioGroupItem value="calm" id="calm" className="sr-only" />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Label 
                      htmlFor="neutral" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => setMood("neutral")}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-colors ${
                        mood === "neutral" ? "bg-gray-400/20 border-2 border-gray-400" : "bg-gray-100 hover:bg-gray-200"
                      }`}>
                        <Meh size={32} className="text-gray-500" />
                      </div>
                      <span>Neutral</span>
                    </Label>
                    <RadioGroupItem value="neutral" id="neutral" className="sr-only" />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Label 
                      htmlFor="sad" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => setMood("sad")}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-colors ${
                        mood === "sad" ? "bg-sprout-blue/20 border-2 border-sprout-blue" : "bg-gray-100 hover:bg-gray-200"
                      }`}>
                        <Frown size={32} className="text-sprout-blue" />
                      </div>
                      <span>Sad</span>
                    </Label>
                    <RadioGroupItem value="sad" id="sad" className="sr-only" />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Label 
                      htmlFor="angry" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => setMood("angry")}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-colors ${
                        mood === "angry" ? "bg-sprout-orange/20 border-2 border-sprout-orange" : "bg-gray-100 hover:bg-gray-200"
                      }`}>
                        <Angry size={32} className="text-sprout-orange" />
                      </div>
                      <span>Angry</span>
                    </Label>
                    <RadioGroupItem value="angry" id="angry" className="sr-only" />
                  </div>
                </RadioGroup>
                
                {mood && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in">
                    <h3 className="text-lg font-medium mb-3">How would you describe your {mood} feeling?</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {emotionFeelingMap[mood]?.feelings.map((feeling) => (
                        <button
                          key={feeling}
                          type="button"
                          className={`px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedFeeling === feeling
                              ? `bg-${emotionFeelingMap[mood].color}/20 border border-${emotionFeelingMap[mood].color} text-${emotionFeelingMap[mood].color}`
                              : "bg-white border border-gray-200 hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedFeeling(feeling)}
                        >
                          {feeling}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">How is your energy level today?</h2>
                <RadioGroup value={energyLevel} onValueChange={setEnergyLevel}>
                  <div className="grid grid-cols-1 gap-3">
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${energyLevel === "very-high" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setEnergyLevel("very-high")}>
                      <RadioGroupItem value="very-high" id="very-high" />
                      <Label htmlFor="very-high" className="flex-1 cursor-pointer">
                        <div className="font-medium">Very High Energy</div>
                        <div className="text-sm text-gray-500">I feel super energetic and can't sit still!</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${energyLevel === "high" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setEnergyLevel("high")}>
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="flex-1 cursor-pointer">
                        <div className="font-medium">High Energy</div>
                        <div className="text-sm text-gray-500">I feel active and ready to do things</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${energyLevel === "medium" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setEnergyLevel("medium")}>
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="flex-1 cursor-pointer">
                        <div className="font-medium">Medium Energy</div>
                        <div className="text-sm text-gray-500">I feel balanced - not too energetic, not too tired</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${energyLevel === "low" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setEnergyLevel("low")}>
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="flex-1 cursor-pointer">
                        <div className="font-medium">Low Energy</div>
                        <div className="text-sm text-gray-500">I feel a bit tired and moving slowly</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${energyLevel === "very-low" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setEnergyLevel("very-low")}>
                      <RadioGroupItem value="very-low" id="very-low" />
                      <Label htmlFor="very-low" className="flex-1 cursor-pointer">
                        <div className="font-medium">Very Low Energy</div>
                        <div className="text-sm text-gray-500">I feel extremely tired and don't want to do anything</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">How worried or nervous do you feel today?</h2>
                <RadioGroup value={anxiety} onValueChange={setAnxiety}>
                  <div className="grid grid-cols-1 gap-3">
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${anxiety === "not-at-all" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setAnxiety("not-at-all")}>
                      <RadioGroupItem value="not-at-all" id="not-at-all" />
                      <Label htmlFor="not-at-all" className="flex-1 cursor-pointer">
                        <div className="font-medium">Not worried at all</div>
                        <div className="text-sm text-gray-500">I feel calm and relaxed</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${anxiety === "slightly" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setAnxiety("slightly")}>
                      <RadioGroupItem value="slightly" id="slightly" />
                      <Label htmlFor="slightly" className="flex-1 cursor-pointer">
                        <div className="font-medium">A little worried</div>
                        <div className="text-sm text-gray-500">Something small is bothering me</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${anxiety === "somewhat" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setAnxiety("somewhat")}>
                      <RadioGroupItem value="somewhat" id="somewhat" />
                      <Label htmlFor="somewhat" className="flex-1 cursor-pointer">
                        <div className="font-medium">Somewhat worried</div>
                        <div className="text-sm text-gray-500">I've been thinking about something that worries me</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${anxiety === "very" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setAnxiety("very")}>
                      <RadioGroupItem value="very" id="very" />
                      <Label htmlFor="very" className="flex-1 cursor-pointer">
                        <div className="font-medium">Very worried</div>
                        <div className="text-sm text-gray-500">I can't stop thinking about something that's bothering me</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${anxiety === "extremely" ? "bg-sprout-green/10 border-sprout-green" : "bg-white hover:bg-gray-50"}`}
                      onClick={() => setAnxiety("extremely")}>
                      <RadioGroupItem value="extremely" id="extremely" />
                      <Label htmlFor="extremely" className="flex-1 cursor-pointer">
                        <div className="font-medium">Extremely worried</div>
                        <div className="text-sm text-gray-500">I feel overwhelmed with worry or fear</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Social Scenario</h2>
                <div className="p-4 bg-sprout-yellow/10 rounded-lg mb-4">
                  <p>{scenarioQuestion.question}</p>
                </div>
                
                <RadioGroup value={scenarioAnswer} onValueChange={setScenarioAnswer}>
                  <div className="grid grid-cols-1 gap-3">
                    {scenarioQuestion.options.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                          scenarioAnswer === option.value ? "bg-sprout-purple/10 border-sprout-purple" : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setScenarioAnswer(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {step === totalSteps + 1 && (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-3">Awesome job!</h2>
                <div className="p-6 bg-gradient-to-r from-sprout-yellow/20 to-sprout-green/20 rounded-lg mb-6">
                  <p className="italic text-lg">"{getRandomQuote()}"</p>
                </div>
                <p className="text-gray-600 mb-6">
                  You've completed your daily check-in. Keep up the great work!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    className="bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/journal")}
                  >
                    Write in Journal
                  </Button>
                </div>
              </div>
            )}
            
            {step <= totalSteps && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Back
                </Button>
                
                <Button
                  type="button"
                  className="bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
                  onClick={nextStep}
                >
                  {step === totalSteps ? "Complete" : "Next"}
                  {step !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DailyCheckIn;
