
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { warningToast, successToast } from "@/components/ui/toast-extensions";

// Import utility functions
import { 
  getScenarioQuestion,
  getRandomQuote,
  isCheckInCompletedToday
} from "@/utils/checkInUtils";

// Import components
import CheckInHeader from "@/components/daily-check-in/CheckInHeader";
import ProgressBar from "@/components/daily-check-in/ProgressBar";
import EmotionStep from "@/components/daily-check-in/EmotionStep";
import EnergyLevelStep from "@/components/daily-check-in/EnergyLevelStep";
import AnxietyLevelStep from "@/components/daily-check-in/AnxietyLevelStep";
import ScenarioStep from "@/components/daily-check-in/ScenarioStep";
import CompletionStep from "@/components/daily-check-in/CompletionStep";
import AlreadyCompletedStep from "@/components/daily-check-in/AlreadyCompletedStep";
import NoActiveProfilePrompt from "@/components/daily-check-in/NoActiveProfilePrompt";
import StepNavigation from "@/components/daily-check-in/StepNavigation";

const DailyCheckIn = () => {
  const { toast } = useToast();
  const { 
    getCurrentChild, 
    currentChildId, 
    markDailyCheckInComplete, 
    childProfiles, 
    setChildProfiles
  } = useUser();
  
  const currentChild = getCurrentChild();
  
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [anxiety, setAnxiety] = useState("");
  const [scenarioAnswer, setScenarioAnswer] = useState("");
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState("");
  
  const totalSteps = 4;
  const scenarioQuestion = getScenarioQuestion(currentChildId);

  useEffect(() => {
    if (currentChild) {
      setAlreadyCompletedToday(isCheckInCompletedToday(currentChild));
    }
  }, [currentChild]);
  
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
  
  const completeCheckIn = async () => {
    if (!currentChildId) {
      warningToast({
        title: "Error",
        description: "No child profile selected. Please select a profile first."
      });
      return;
    }

    try {
      const currentDate = new Date().toISOString();
      console.log("Marking daily check-in as complete with date:", currentDate);
      
      console.log("Check-in data:", {
        childId: currentChildId,
        date: new Date().toISOString().split('T')[0],
        mood: selectedFeeling || mood,
        energyLevel,
        anxiety,
        scenarioAnswer,
      });

      // Single call to markDailyCheckInComplete handles all database operations
      await markDailyCheckInComplete(currentChildId, currentDate);
      
      successToast({
        title: "Check-in Complete!",
        description: "Great job sharing how you feel today! You earned 10 XP!"
      });
      
      // Update local state to show completion immediately
      if (childProfiles.length > 0) {
        const updatedProfiles = childProfiles.map(profile => {
          if (profile.id === currentChildId) {
            return {
              ...profile,
              dailyCheckInCompleted: true,
              lastCheckInDate: currentDate
            };
          }
          return profile;
        });
        setChildProfiles(updatedProfiles);
      }
      
      setStep(totalSteps + 1);
      setAlreadyCompletedToday(true);
    } catch (error) {
      console.error("Error completing daily check-in:", error);
      warningToast({
        title: "Check-in Failed",
        description: "There was an error saving your check-in. Please try again."
      });
    }
  };
  
  if (!currentChild) {
    return (
      <Layout requireAuth>
        <NoActiveProfilePrompt />
      </Layout>
    );
  }

  if (alreadyCompletedToday) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="pt-6">
              <AlreadyCompletedStep getRandomQuote={getRandomQuote} />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <CheckInHeader currentChild={currentChild} />
        
        {step <= totalSteps && (
          <ProgressBar step={step} totalSteps={totalSteps} />
        )}
        
        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <EmotionStep 
                mood={mood} 
                setMood={setMood}
                selectedFeeling={selectedFeeling}
                setSelectedFeeling={setSelectedFeeling}
              />
            )}
            
            {step === 2 && (
              <EnergyLevelStep 
                energyLevel={energyLevel} 
                setEnergyLevel={setEnergyLevel} 
              />
            )}
            
            {step === 3 && (
              <AnxietyLevelStep 
                anxiety={anxiety} 
                setAnxiety={setAnxiety} 
              />
            )}
            
            {step === 4 && (
              <ScenarioStep 
                scenarioQuestion={scenarioQuestion}
                scenarioAnswer={scenarioAnswer}
                setScenarioAnswer={setScenarioAnswer}
              />
            )}
            
            {step === totalSteps + 1 && (
              <CompletionStep getRandomQuote={getRandomQuote} />
            )}
            
            {step <= totalSteps && (
              <StepNavigation 
                step={step}
                totalSteps={totalSteps}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DailyCheckIn;
