
import { useState } from "react";
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

// Define types for multi-select options
type Option = {
  value: string;
  label: string;
  icon?: string;
};

const CreateProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addChildProfile, setCurrentChildId } = useUser();
  
  // Basic Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [grade, setGrade] = useState("");
  
  // Learning Preferences
  const [learningStyle, setLearningStyle] = useState("");
  const [strongestSEL, setStrongestSEL] = useState("");
  
  // Interests & Challenges
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStoryPreferences, setSelectedStoryPreferences] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  
  // Step navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Options for multi-select fields
  const interestOptions: Option[] = [
    { value: "art", label: "Art", icon: "🎨" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "sports", label: "Sports", icon: "🏀" },
    { value: "reading", label: "Reading", icon: "📚" },
    { value: "videogames", label: "Video Games", icon: "🎮" },
    { value: "science", label: "Science", icon: "🔬" },
    { value: "cooking", label: "Cooking", icon: "🍳" },
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
  
  // Toggle selection for multi-select options
  const toggleInterest = (value: string) => {
    setSelectedInterests(prev => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
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
  
  // Step navigation
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic information
      if (!firstName || !nickname || !age || !dateOfBirth || !grade) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      // Validate learning preferences
      if (!learningStyle || !strongestSEL) {
        toast({
          title: "Missing information",
          description: "Please select your learning style and strongest SEL area",
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
  
  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate final step
    if (selectedInterests.length === 0 || selectedStoryPreferences.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one interest and story preference",
        variant: "destructive",
      });
      return;
    }
    
    // Create profile
    const newProfile = {
      id: uuidv4(),
      firstName,
      lastName,
      nickname,
      age: parseInt(age),
      dateOfBirth,
      gender,
      grade,
      learningStyle,
      strongestSEL,
      interests: selectedInterests,
      storyPreferences: selectedStoryPreferences,
      selChallenges: selectedChallenges,
      streakCount: 0,
      xpPoints: 0,
      badges: [],
    };
    
    // Add profile to context
    addChildProfile(newProfile);
    setCurrentChildId(newProfile.id);
    
    toast({
      title: "Profile created!",
      description: `${nickname}'s profile has been created successfully.`,
    });
    
    navigate("/dashboard");
  };
  
  return (
    <Layout requireAuth>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Child Profile</h1>
          <p className="text-gray-600 mt-2">Let's set up a profile for your child</p>
        </div>
        
        {/* Progress indicator */}
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
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="sprout-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name (Optional)</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="sprout-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname <span className="text-red-500">*</span></Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className="sprout-input"
                    placeholder="What should we call your child?"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                    <Input
                      id="age"
                      type="number"
                      min="5"
                      max="16"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                      className="sprout-input"
                    />
                  </div>
                  
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
                    <Input
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="sprout-input"
                      placeholder="e.g., 3rd Grade"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Learning Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Learning Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium block mb-3">
                      Preferred Learning Style <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup value={learningStyle} onValueChange={setLearningStyle} className="space-y-3">
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="visual" id="visual" className="mt-1" />
                        <div>
                          <Label htmlFor="visual" className="font-medium">Visual</Label>
                          <p className="text-sm text-gray-500">I learn best with pictures, charts, and videos</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="auditory" id="auditory" className="mt-1" />
                        <div>
                          <Label htmlFor="auditory" className="font-medium">Auditory</Label>
                          <p className="text-sm text-gray-500">I learn best by listening to explanations and discussions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="kinesthetic" id="kinesthetic" className="mt-1" />
                        <div>
                          <Label htmlFor="kinesthetic" className="font-medium">Kinesthetic</Label>
                          <p className="text-sm text-gray-500">I learn best by doing hands-on activities</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="mixed" id="mixed" className="mt-1" />
                        <div>
                          <Label htmlFor="mixed" className="font-medium">Mixed</Label>
                          <p className="text-sm text-gray-500">I learn using a combination of methods</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="mt-6">
                    <Label className="text-base font-medium block mb-3">
                      Which SEL area is your child strongest in? <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup value={strongestSEL} onValueChange={setStrongestSEL} className="space-y-3">
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="self-awareness" id="self-awareness" className="mt-1" />
                        <div>
                          <Label htmlFor="self-awareness" className="font-medium">Self-awareness</Label>
                          <p className="text-sm text-gray-500">Understanding emotions and thoughts</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="self-management" id="self-management" className="mt-1" />
                        <div>
                          <Label htmlFor="self-management" className="font-medium">Self-management</Label>
                          <p className="text-sm text-gray-500">Controlling emotions and behaviors</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="social-awareness" id="social-awareness" className="mt-1" />
                        <div>
                          <Label htmlFor="social-awareness" className="font-medium">Social awareness</Label>
                          <p className="text-sm text-gray-500">Understanding and respecting others</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="relationship-skills" id="relationship-skills" className="mt-1" />
                        <div>
                          <Label htmlFor="relationship-skills" className="font-medium">Relationship skills</Label>
                          <p className="text-sm text-gray-500">Making and keeping friends, teamwork</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="decision-making" id="decision-making" className="mt-1" />
                        <div>
                          <Label htmlFor="decision-making" className="font-medium">Responsible decision-making</Label>
                          <p className="text-sm text-gray-500">Making good choices</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <RadioGroupItem value="unaware" id="unaware" className="mt-1" />
                        <div>
                          <Label htmlFor="unaware" className="font-medium">Unaware</Label>
                          <p className="text-sm text-gray-500">I'm not sure yet</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Interests and Challenges */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Interests and Challenges</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium block mb-3">
                      What are your child's interests and hobbies? <span className="text-red-500">*</span>
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
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium block mb-3">
                      What kind of stories or characters does your child enjoy? <span className="text-red-500">*</span>
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
                      What SEL challenges does your child currently experience? (Optional)
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
            
            {/* Navigation buttons */}
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
