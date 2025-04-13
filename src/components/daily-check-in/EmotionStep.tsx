import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Smile, Frown, Angry, Meh } from "lucide-react";

export const emotionFeelingMap = {
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

interface EmotionStepProps {
  mood: string;
  setMood: (mood: string) => void;
  selectedFeeling: string;
  setSelectedFeeling: (feeling: string) => void;
}

const EmotionStep = ({ mood, setMood, selectedFeeling, setSelectedFeeling }: EmotionStepProps) => {
  useEffect(() => {
    setSelectedFeeling("");
  }, [mood, setSelectedFeeling]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">How are you feeling today?</h2>
      <RadioGroup value={mood} onValueChange={setMood} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { value: "happy", icon: <Smile size={32} className="text-sprout-green" />, label: "Happy", selectedBg: "bg-sprout-green/20", selectedBorder: "border-sprout-green" },
          { value: "calm", icon: <Smile size={32} className="text-sprout-blue" />, label: "Calm", selectedBg: "bg-sprout-blue/20", selectedBorder: "border-sprout-blue" },
          { value: "neutral", icon: <Meh size={32} className="text-gray-500" />, label: "Neutral", selectedBg: "bg-gray-400/30", selectedBorder: "border-gray-600" },
          { value: "sad", icon: <Frown size={32} className="text-sprout-blue" />, label: "Sad", selectedBg: "bg-sprout-blue/20", selectedBorder: "border-sprout-blue" },
          { value: "angry", icon: <Angry size={32} className="text-sprout-orange" />, label: "Angry", selectedBg: "bg-sprout-orange/20", selectedBorder: "border-sprout-orange" }
        ].map(({ value, icon, label, selectedBg, selectedBorder }) => (
          <div key={value} className="flex flex-col items-center">
            <Label 
              htmlFor={value} 
              className="cursor-pointer flex flex-col items-center gap-2"
              onClick={() => setMood(value)}
            >
              <div className={`
                w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-all duration-300
                ${mood === value 
                  ? `${selectedBg} border-2 ${selectedBorder} animate-pulse` 
                  : "bg-gray-100 hover:bg-gray-200"
                }
              `}>
                {icon}
              </div>
              <span>{label}</span>
            </Label>
            <RadioGroupItem value={value} id={value} className="sr-only" />
          </div>
        ))}
      </RadioGroup>
      
      {mood && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in">
          <h3 className="text-lg font-medium mb-3">How would you describe your {mood} feeling?</h3>
          <div className="grid grid-cols-3 gap-2">
            {emotionFeelingMap[mood]?.feelings.map((feeling) => (
              <button
                key={feeling}
                type="button"
                className={`px-3 py-2 text-sm rounded-md transition-colors min-h-[45px] whitespace-normal text-center ${
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
  );
};

export default EmotionStep;
