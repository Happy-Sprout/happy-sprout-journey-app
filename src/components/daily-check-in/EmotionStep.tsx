
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Smile, Frown, Angry, Meh, Check, CircleCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setSelectedFeeling("");
  }, [mood, setSelectedFeeling]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-sprout-purple">How are you feeling today?</h2>
      <RadioGroup value={mood} onValueChange={setMood} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { value: "happy", icon: <Smile size={32} className="text-sprout-green" />, label: "Happy", selectedBg: "bg-sprout-green/20", selectedBorder: "border-sprout-green", shadowColor: "shadow-sprout-green/30" },
          { value: "calm", icon: <Smile size={32} className="text-sprout-blue" />, label: "Calm", selectedBg: "bg-sprout-blue/20", selectedBorder: "border-sprout-blue", shadowColor: "shadow-sprout-blue/30" },
          { value: "neutral", icon: <Meh size={32} className="text-gray-500" />, label: "Neutral", selectedBg: "bg-gray-200", selectedBorder: "border-gray-500", shadowColor: "shadow-gray-500/30" },
          { value: "sad", icon: <Frown size={32} className="text-sprout-blue" />, label: "Sad", selectedBg: "bg-sprout-blue/20", selectedBorder: "border-sprout-blue", shadowColor: "shadow-sprout-blue/30" },
          { value: "angry", icon: <Angry size={32} className="text-sprout-orange" />, label: "Angry", selectedBg: "bg-sprout-orange/20", selectedBorder: "border-sprout-orange", shadowColor: "shadow-sprout-orange/30" }
        ].map(({ value, icon, label, selectedBg, selectedBorder, shadowColor }) => (
          <div key={value} className="flex flex-col items-center">
            <Label 
              htmlFor={value} 
              className="cursor-pointer flex flex-col items-center gap-2 relative"
              onClick={() => setMood(value)}
            >
              <div className={`
                w-16 h-16 flex items-center justify-center rounded-full mb-2 transition-all duration-300 relative
                ${mood === value 
                  ? `${selectedBg} border-2 ${selectedBorder} ${shadowColor} shadow-lg animate-pulse` 
                  : "bg-gray-100 hover:bg-gray-200"
                }
              `}>
                {icon}
                {mood === value && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border-2 border-sprout-purple">
                    <CircleCheck size={16} className="text-sprout-purple" />
                  </div>
                )}
              </div>
              <span className="text-center">{label}</span>
            </Label>
            <RadioGroupItem value={value} id={value} className="sr-only" />
          </div>
        ))}
      </RadioGroup>
      
      {mood && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-sprout-purple">How would you describe your {mood} feeling?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {emotionFeelingMap[mood]?.feelings.map((feeling) => {
              const isSelected = selectedFeeling === feeling;
              const colorClass = emotionFeelingMap[mood].color;
              
              return (
                <button
                  key={feeling}
                  type="button"
                  className={`
                    px-3 py-2 text-sm rounded-md transition-colors min-h-[45px] 
                    whitespace-normal text-center relative
                    ${isSelected
                      ? `bg-${colorClass}/20 border-2 border-${colorClass} text-${colorClass} shadow-md`
                      : "bg-white border border-gray-200 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => setSelectedFeeling(feeling)}
                >
                  <span className="block truncate">{feeling}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-sprout-purple">
                      <Check size={10} className="text-sprout-purple" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionStep;
