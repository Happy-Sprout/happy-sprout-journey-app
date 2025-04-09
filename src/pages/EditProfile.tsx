
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
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

const EditProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { childProfiles, updateChildProfile, calculateAgeFromDOB } = useUser();
  
  // Find the profile to edit
  const profile = childProfiles.find(p => p.id === id);
  
  // Form state
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
  const [selectedLearningStyles, setSelectedLearningStyles] = useState<string[]>([]);
  const [selectedSELStrengths, setSelectedSELStrengths] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStoryPreferences, setSelectedStoryPreferences] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  
  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setAge(profile.age);
      setDateOfBirth(profile.dateOfBirth);
      setGender(profile.gender || "");
      setGrade(profile.grade);
      setSelectedAvatar(profile.avatar || "avatar1");
      setSelectedLearningStyles(profile.learningStyles || []);
      setSelectedSELStrengths(profile.selStrengths || []);
      setSelectedInterests(profile.interests);
      setSelectedStoryPreferences(profile.storyPreferences);
      setSelectedChallenges(profile.selChallenges);
    } else {
      // If profile not found, redirect to profiles page
      toast({
        title: "Profile not found",
        description: "The profile you're trying to edit doesn't exist.",
        variant: "destructive",
      });
      navigate("/profile");
    }
  }, [profile, navigate, toast]);
  
  // Update age when date of birth changes
  useEffect(() => {
    if (dateOfBirth) {
      const calculatedAge = calculateAgeFromDOB(dateOfBirth);
      setAge(calculatedAge);
    }
  }, [dateOfBirth, calculateAgeFromDOB]);
  
  // Toggle handlers for multi-select options
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
  
  // Options for interests and stories
  const interestOptions = [
    { value: "art", label: "Art", icon: "🎨" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "sports", label: "Sports", icon: "🏀" },
    { value: "reading", label: "Reading", icon: "📚" },
    { value: "videogames", label: "Video Games", icon: "🎮" },
    { value: "science", label: "Science", icon: "🔬" },
    { value: "cooking", label: "Cooking", icon: "🍳" },
  ];
  
  const storyOptions = [
    { value: "superheroes", label: "Superheroes", icon: "🦸‍♂️" },
    { value: "fantasy", label: "Fantasy & Magic", icon: "🧙‍♀️" },
    { value: "adventure", label: "Adventure & Action", icon: "🚀" },
    { value: "comedy", label: "Funny/Comedy", icon: "😂" },
    { value: "rolemodels", label: "Real-life stories & Role Models", icon: "🌟" },
    { value: "mystery", label: "Mystery & Problem-Solving", icon: "🕵️‍♂️" },
  ];
  
  const challengeOptions = [
    { value: "emotions", label: "Managing emotions when upset or angry" },
    { value: "social", label: "Talking to new people and making friends" },
    { value: "focus", label: "Staying focused and avoiding distractions" },
    { value: "stress", label: "Handling stress and anxiety" },
    { value: "speaking", label: "Speaking up and sharing ideas" },
    { value: "peerpressure", label: "Dealing with peer pressure and conflicts" },
  ];
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    // Validate form
    if (!nickname || !dateOfBirth || !grade) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedLearningStyles.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one learning style",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedSELStrengths.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one SEL strength",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedInterests.length === 0 || selectedStoryPreferences.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one interest and story preference",
        variant: "destructive",
      });
      return;
    }
    
    // Update profile
    updateChildProfile(id, {
      nickname,
      age: age || 0,
      dateOfBirth,
      gender,
      grade,
      avatar: selectedAvatar,
      learningStyles: selectedLearningStyles,
      selStrengths: selectedSELStrengths,
      interests: selectedInterests,
      storyPreferences: selectedStoryPreferences,
      selChallenges: selectedChallenges,
      creationStatus: 'completed',
    });
    
    toast({
      title: "Profile updated!",
      description: `${nickname}'s profile has been updated successfully.`,
    });
    
    navigate("/profile");
  };
  
  if (!profile) {
    return <Layout requireAuth><div>Loading...</div></Layout>;
  }
  
  return (
    <Layout requireAuth>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update {profile.nickname}'s information</p>
        </div>
        
        <div className="sprout-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname">What should we call you? <span className="text-red-500">*</span></Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className="sprout-input"
                  />
                </div>
                
                <AvatarSelector 
                  selectedAvatar={selectedAvatar} 
                  onChange={setSelectedAvatar} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age !== null ? age.toString() : ''}
                      readOnly
                      className="sprout-input bg-gray-50"
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
              
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Learning Preferences</h2>
                
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
              
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Interests and Challenges</h2>
                
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
                        <input 
                          type="checkbox" 
                          id={`interest-${option.value}`}
                          checked={selectedInterests.includes(option.value)}
                          onChange={() => toggleInterest(option.value)}
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
                        <input 
                          type="checkbox" 
                          id={`story-${option.value}`}
                          checked={selectedStoryPreferences.includes(option.value)}
                          onChange={() => toggleStoryPreference(option.value)}
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
                        <input 
                          type="checkbox" 
                          id={`challenge-${option.value}`}
                          checked={selectedChallenges.includes(option.value)}
                          onChange={() => toggleChallenge(option.value)}
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
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="sprout-button"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
