import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import AvatarSelector from "@/components/AvatarSelector";
import MultipleCheckboxGroup from "@/components/MultipleCheckboxGroup";
import { 
  gradeOptions, 
  learningStyleOptions,
  selStrengthOptions 
} from "@/constants/profileOptions";

type Option = {
  value: string;
  label: string;
  icon?: string;
};

const CreateProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addChildProfile, setCurrentChildId, calculateAgeFromDOB } = useUser();
  
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
  const [age, setAge] = useState<number | null>(null);
  
  const [selectedLearningStyles, setSelectedLearningStyles] = useState<string[]>([]);
  const [selectedSELStrengths, setSelectedSELStrengths] = useState<string[]>([]);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStoryPreferences, setSelectedStoryPreferences] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [otherInterests, setOtherInterests] = useState("");
  const [showOtherInterests, setShowOtherInterests] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const interestOptions: Option[] = [
    { value: "art", label: "Art", icon: "🎨" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "sports", label: "Sports", icon: "🏀" },
    { value: "reading", label: "Reading", icon: "📚" },
    { value: "videogames", label: "Video Games", icon: "🎮" },
    { value: "science", label: "Science", icon: "🔬" },
    { value: "cooking", label: "Cooking", icon: "🍳" },
    { value: "other", label: "Other", icon: "➕" },
  ];
  
  const storyOptions: Option[] = [
    { value: "superheroes", label: "Superheroes", icon: "🦸‍♂️" },
    { value: "fantasy", label: "Fantasy & Magic", icon: "🧙‍♀️" },
    { value: "adventure", label: "Adventure & Action", icon: "🚀" },
    { value: "comedy", label: "Funny/Comedy", icon: "😂" },
    { value: "rolemodels", label: "Real-life stories & Role Models", icon: "🌟" },
    { value: "mystery", label: "Mystery & Problem-Solving", icon: "🕵️‍♂️" },
  ];
  
  const challengeOptions: Option[] = [
    { value: "emotions", label: "Managing emotions when upset or angry" },
    { value: "social", label: "Talking to new people and making friends" },
    { value: "focus", label: "Staying focused and avoiding distractions" },
    { value: "stress", label: "Handling stress and anxiety" },
    { value: "speaking", label: "Speaking up and sharing ideas" },
    { value: "peerpressure", label: "Dealing with peer pressure and conflicts" },
  ];

  useEffect(() => {
    if (dateOfBirth) {
      const calculatedAge = calculateAgeFromDOB(dateOfBirth);
      setAge(calculatedAge);
    }
  }, [dateOfBirth, calculateAgeFromDOB]);
  
  const toggleInterest = (value: string) => {
    if (value === "other") {
      setShowOtherInterests(!showOtherInterests);
      if (selectedInterests.includes("other")) {
        setSelectedInterests(prev => 
          prev.filter(i => i !== "other")
        );
        setOtherInterests("");
      } else {
        setSelectedInterests(prev => [...prev, "other"]);
      }
    } else {
      setSelectedInterests(prev => 
        prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
      );
    }
  };
  
  const toggleStoryPreference = (value: string) => {
    setSelectedStoryPreferences(prev => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };
  
  const toggleChallenge = (value: string) => {
    setSelectedChallenges(prev => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const toggleLearningStyle = (value: string) => {
    setSelectedLearningStyles(prev => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const toggleSELStrength = (value: string) => {
    setSelectedSELStrengths(prev => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };
  
  const parseOtherInterests = () => {
    if (!otherInterests) return [];
    return otherInterests.split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      if (!nickname || !dateOfBirth || !grade) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (selectedLearningStyles.length === 0 || selectedSELStrengths.length === 0) {
        toast({
          title: "Missing information",
          description: "Please select at least one learning style and SEL strength",
          variant: "destructive",
        });
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0 || selectedStoryPreferences.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one interest and story preference",
        variant: "destructive",
      });
      return;
    }
    
    let allInterests = [...selectedInterests];
    if (showOtherInterests) {
      allInterests = allInterests.filter(i => i !== "other");
      allInterests = [...allInterests, ...parseOtherInterests()];
    }
    
    const newProfile = {
      nickname,
      age: age || 0,
      dateOfBirth,
      gender,
      grade,
      learningStyles: selectedLearningStyles,
      selStrengths: selectedSELStrengths,
      avatar: selectedAvatar,
      interests: allInterests,
      storyPreferences: selectedStoryPreferences,
      selChallenges: selectedChallenges,
      creationStatus: 'completed' as const,
      dailyCheckInCompleted: false,
    };
    
    console.log("Creating new profile:", newProfile);
    
    try {
      const childId = await addChildProfile(newProfile);
      
      if (childId) {
        console.log("Setting current child to new profile:", childId);
        setCurrentChildId(childId);
        
        toast({
          title: "Profile created!",
          description: `${nickname}'s profile has been created successfully.`,
        });
        
        setTimeout(() => {
          navigate("/profile");
        }, 300);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "There was an error creating the profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout requireAuth>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Child Profile</h1>
          <p className="text-gray-600 mt-2">Let's set up a profile for your child</p>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep > index + 1 
                      ? "bg-sprout-green text-white" 
                      : currentStep === index + 1 
                        ? "bg-sprout-purple text-white" 
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div className="text-xs text-gray-500">
                  {index === 0 ? "Basic Info" : index === 1 ? "Learning Style" : "Interests"}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 h-1 bg-gray-200 w-full rounded"></div>
            <div 
              className="absolute top-0 h-1 bg-sprout-purple rounded transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="sprout-card">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="nickname">What should we call you? <span className="text-red-500">*</span></Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className="sprout-input"
                    placeholder="Your name in the app"
                  />
                </div>

                <AvatarSelector 
                  selectedAvatar={selectedAvatar} 
                  onChange={setSelectedAvatar} 
                />
                
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="sprout-input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <RadioGroup value={gender} onValueChange={setGender}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other/Prefer not to say</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level <span className="text-red-500">*</span></Label>
                    <Select value={grade} onValueChange={setGrade} required>
                      <SelectTrigger id="grade" className="sprout-input">
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Learning Preferences</h2>
                
                <div className="space-y-6">
                  <MultipleCheckboxGroup
                    label="Preferred Learning Styles"
                    options={learningStyleOptions}
                    selectedValues={selectedLearningStyles}
                    onChange={toggleLearningStyle}
                    required={true}
                  />
                  
                  <MultipleCheckboxGroup
                    label="Which SEL areas are you strongest in?"
                    options={selStrengthOptions}
                    selectedValues={selectedSELStrengths}
                    onChange={toggleSELStrength}
                    required={true}
                  />
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Interests and Challenges</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium block mb-3">
                      What are your interests and hobbies? <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map(option => (
                        <div
                          key={option.value}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                            selectedInterests.includes(option.value) 
                              ? "bg-sprout-purple/10 border-sprout-purple" 
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => toggleInterest(option.value)}
                        >
                          <Checkbox 
                            id={`interest-${option.value}`}
                            checked={selectedInterests.includes(option.value)}
                            onCheckedChange={() => toggleInterest(option.value)}
                            className="mr-2"
                          />
                          <label htmlFor={`interest-${option.value}`} className="cursor-pointer flex-1">
                            {option.icon && <span className="mr-2">{option.icon}</span>}
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {showOtherInterests && (
                      <div className="mt-3">
                        <Label htmlFor="other-interests" className="text-sm">
                          Enter your other interests (comma-separated)
                        </Label>
                        <Input
                          id="other-interests"
                          value={otherInterests}
                          onChange={(e) => setOtherInterests(e.target.value)}
                          placeholder="Dancing, painting, hiking, etc."
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium block mb-3">
                      What kind of stories or characters do you enjoy? <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {storyOptions.map(option => (
                        <div
                          key={option.value}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                            selectedStoryPreferences.includes(option.value) 
                              ? "bg-sprout-purple/10 border-sprout-purple" 
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => toggleStoryPreference(option.value)}
                        >
                          <Checkbox 
                            id={`story-${option.value}`}
                            checked={selectedStoryPreferences.includes(option.value)}
                            onCheckedChange={() => toggleStoryPreference(option.value)}
                            className="mr-2"
                          />
                          <label htmlFor={`story-${option.value}`} className="cursor-pointer flex-1">
                            {option.icon && <span className="mr-2">{option.icon}</span>}
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium block mb-3">
                      What SEL challenges do you currently experience? (Optional)
                    </Label>
                    <div className="space-y-3">
                      {challengeOptions.map(option => (
                        <div
                          key={option.value}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                            selectedChallenges.includes(option.value) 
                              ? "bg-sprout-purple/10 border-sprout-purple" 
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => toggleChallenge(option.value)}
                        >
                          <Checkbox 
                            id={`challenge-${option.value}`}
                            checked={selectedChallenges.includes(option.value)}
                            onCheckedChange={() => toggleChallenge(option.value)}
                            className="mr-2"
                          />
                          <label htmlFor={`challenge-${option.value}`} className="cursor-pointer flex-1">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  className="sprout-button"
                  onClick={nextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="sprout-button"
                >
                  Create Profile
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProfile;
