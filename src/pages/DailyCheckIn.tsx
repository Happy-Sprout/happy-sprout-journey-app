
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { Frown, Meh, Smile, Heart, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Emotion levels
const emotions = [
  { value: "veryHappy", label: "Very Happy", emoji: "😄", description: "I'm having a great day!" },
  { value: "happy", label: "Happy", emoji: "🙂", description: "I'm feeling good." },
  { value: "neutral", label: "Neutral", emoji: "😐", description: "I'm feeling okay." },
  { value: "sad", label: "Sad", emoji: "😞", description: "I'm feeling a bit down." },
  { value: "verySad", label: "Very Sad", emoji: "😢", description: "I'm having a tough day." },
];

// Mock role-play scenarios
const rolePlayScenarios = [
  {
    id: 1,
    scenario: "Your friend is playing with a toy you really want to play with too. What would you do?",
    options: [
      { value: "a", text: "Grab the toy because I want it now" },
      { value: "b", text: "Politely ask if we can take turns with the toy" },
      { value: "c", text: "Walk away and find something else to play with" },
      { value: "d", text: "Tell a grown-up that my friend won't share" }
    ],
    correct: "b"
  },
  {
    id: 2,
    scenario: "You see a classmate sitting alone at lunch. What would you do?",
    options: [
      { value: "a", text: "Ignore them because I want to sit with my own friends" },
      { value: "b", text: "Feel bad for them but don't do anything" },
      { value: "c", text: "Ask them if they would like to join you and your friends" },
      { value: "d", text: "Tell a teacher that the student is sitting alone" }
    ],
    correct: "c"
  },
  {
    id: 3,
    scenario: "You made a mistake on your homework. How do you feel?",
    options: [
      { value: "a", text: "Upset and angry at myself - I should have done better" },
      { value: "b", text: "Worried that I'll get in trouble" },
      { value: "c", text: "It's okay - everyone makes mistakes and I can learn from this" },
      { value: "d", text: "I don't care about the mistake" }
    ],
    correct: "c"
  }
];

// Mock motivational quotes
const motivationalQuotes = [
  "You are braver than you believe, stronger than you seem, and smarter than you think.",
  "Every day is a new beginning. Take a deep breath and start again.",
  "Kind words can be short and easy to speak, but their echoes are truly endless.",
  "Believe you can and you're halfway there.",
  "You don't have to be perfect to be amazing.",
  "Your feelings matter, and so do you!",
  "Be the reason someone smiles today.",
  "When you feel like giving up, remember why you started.",
  "A little progress each day adds up to big results."
];

const DailyCheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentChild, updateChildProfile } = useUser();
  const currentChild = getCurrentChild();
  
  // Check-in states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<typeof rolePlayScenarios[0] | null>(null);
  const [scenarioAnswer, setScenarioAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completionQuote, setCompletionQuote] = useState("");
  
  // Select a random scenario for this check-in
  useState(() => {
    const randomIndex = Math.floor(Math.random() * rolePlayScenarios.length);
    setSelectedScenario(rolePlayScenarios[randomIndex]);
  });
  
  // Handle emotion selection
  const handleEmotionSelect = (value: string) => {
    setSelectedEmotion(value);
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedEmotion) {
      toast({
        title: "Please select how you're feeling",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 2 && !confidenceLevel) {
      toast({
        title: "Please select your confidence level",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 3 && !scenarioAnswer) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 3) {
      // Check if answer is correct
      if (selectedScenario) {
        setIsCorrect(scenarioAnswer === selectedScenario.correct);
      }
      
      // Set random completion quote
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCompletionQuote(motivationalQuotes[randomIndex]);
      
      // Update child profile
      if (currentChild) {
        updateChildProfile(currentChild.id, {
          streakCount: currentChild.streakCount + 1,
          xpPoints: currentChild.xpPoints + 10,
        });
      }
    }
    
    setCurrentStep(current => current + 1);
  };
  
  // Handle scenario answer selection
  const handleScenarioAnswerSelect = (value: string) => {
    setScenarioAnswer(value);
  };
  
  // Finish check-in and navigate to dashboard
  const handleFinish = () => {
    toast({
      title: "Daily Check-in Complete!",
      description: "Great job on completing your daily check-in.",
    });
    navigate("/dashboard");
  };
  
  // Handle back button
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(current => current - 1);
    } else {
      navigate("/dashboard");
    }
  };
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold mb-2">Daily Check-In</h1>
        <p className="text-gray-600 mb-8">
          Let's take a moment to check in with your feelings and thoughts today.
        </p>
        
        {/* Step 1: Emotion Selection */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
              <CardDescription>Select the emoji that best matches your mood right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                {emotions.map((emotion) => (
                  <div
                    key={emotion.value}
                    className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedEmotion === emotion.value
                        ? "border-sprout-purple bg-sprout-purple/10"
                        : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleEmotionSelect(emotion.value)}
                  >
                    <div className="text-4xl mb-2">{emotion.emoji}</div>
                    <div className="font-medium text-center">{emotion.label}</div>
                    <div className="text-xs text-center text-gray-500 mt-1">{emotion.description}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button className="sprout-button" onClick={handleNextStep}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Confidence Level */}
        {currentStep === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>How confident do you feel today?</CardTitle>
              <CardDescription>Select the level that best matches how you feel about yourself right now</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={confidenceLevel} 
                onValueChange={setConfidenceLevel}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="very" id="very" />
                  <Label htmlFor="very" className="cursor-pointer flex-1">
                    <div className="font-medium flex items-center">
                      <span className="mr-2">💪</span> Very Confident
                    </div>
                    <p className="text-sm text-gray-500">I feel like I can handle anything today!</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="somewhat" id="somewhat" />
                  <Label htmlFor="somewhat" className="cursor-pointer flex-1">
                    <div className="font-medium flex items-center">
                      <span className="mr-2">🙂</span> Somewhat Confident
                    </div>
                    <p className="text-sm text-gray-500">I feel good, but have some doubts.</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral" className="cursor-pointer flex-1">
                    <div className="font-medium flex items-center">
                      <span className="mr-2">😐</span> Neutral
                    </div>
                    <p className="text-sm text-gray-500">I don't feel particularly confident or unconfident.</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="not-very" id="not-very" />
                  <Label htmlFor="not-very" className="cursor-pointer flex-1">
                    <div className="font-medium flex items-center">
                      <span className="mr-2">😕</span> Not Very Confident
                    </div>
                    <p className="text-sm text-gray-500">I'm feeling a bit unsure of myself today.</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="not-at-all" id="not-at-all" />
                  <Label htmlFor="not-at-all" className="cursor-pointer flex-1">
                    <div className="font-medium flex items-center">
                      <span className="mr-2">😟</span> Not Confident At All
                    </div>
                    <p className="text-sm text-gray-500">I'm really doubting myself today.</p>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button className="sprout-button" onClick={handleNextStep}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Role-Play Scenario */}
        {currentStep === 3 && selectedScenario && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Social Scenario</CardTitle>
              <CardDescription>Let's think about what you would do in this situation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-sprout-yellow/20 rounded-lg mb-6">
                <h3 className="font-medium mb-2">{selectedScenario.scenario}</h3>
                <RadioGroup 
                  value={scenarioAnswer} 
                  onValueChange={handleScenarioAnswerSelect}
                  className="space-y-3 mt-4"
                >
                  {selectedScenario.options.map(option => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={`scenario-${option.value}`} />
                      <Label
                        htmlFor={`scenario-${option.value}`}
                        className="cursor-pointer flex-1"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button className="sprout-button" onClick={handleNextStep}>
                  Submit Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: Completion/Feedback */}
        {currentStep === 4 && selectedScenario && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Great Job!</CardTitle>
              <CardDescription>Thanks for completing your daily check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Your answer:</h3>
                <div className={`p-4 rounded-lg ${
                  isCorrect 
                    ? "bg-green-100 border border-green-200" 
                    : "bg-orange-100 border border-orange-200"
                }`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <Heart className="w-5 h-5 mr-2 text-green-600 mt-1" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 text-orange-600 mt-1" />
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedScenario.options.find(o => o.value === scenarioAnswer)?.text}
                      </p>
                      {isCorrect ? (
                        <p className="text-sm text-green-700 mt-1">
                          That's a great choice! Asking to take turns is a kind and respectful way to handle the situation.
                        </p>
                      ) : (
                        <p className="text-sm text-orange-700 mt-1">
                          That's one way to handle it. Remember that asking politely to take turns is often the most helpful approach.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-sprout-yellow/30 to-sprout-orange/30 rounded-lg mb-6">
                <h3 className="font-medium mb-2 text-center">Today's Inspiration</h3>
                <p className="italic text-center">"{completionQuote}"</p>
              </div>
              
              <div className="bg-sprout-purple/10 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-sprout-purple" />
                  Progress Update
                </h3>
                <p className="text-sm">You've completed your daily check-in! You earned +10 XP and added 1 day to your streak.</p>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button className="sprout-button" onClick={handleFinish}>
                  Finish
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

// Missing component imports
const Award = (props: any) => {
  return <span {...props} />;
};

export default DailyCheckIn;
