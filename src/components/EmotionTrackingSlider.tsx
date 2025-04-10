
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Smile, Meh, Frown } from "lucide-react";

interface EmotionTrackingSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  required?: boolean;
}

const EmotionTrackingSlider = ({
  value,
  onChange,
  label,
  min = 1,
  max = 10,
  step = 1,
  leftLabel = "Low",
  rightLabel = "High",
  required = false,
}: EmotionTrackingSliderProps) => {
  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  // Calculate which emoji to show based on the value
  const getEmoji = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    
    if (percentage < 33) {
      return <Frown className="text-red-500" />;
    } else if (percentage < 66) {
      return <Meh className="text-amber-500" />;
    } else {
      return <Smile className="text-green-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-left">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="h-6 w-6 flex items-center justify-center">
          {getEmoji()}
        </div>
      </div>
      
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="my-2"
      />
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>{leftLabel}</span>
        <span>{value}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

export default EmotionTrackingSlider;
