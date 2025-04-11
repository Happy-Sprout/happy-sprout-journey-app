
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AnxietyLevelStepProps {
  anxiety: string;
  setAnxiety: (level: string) => void;
}

const AnxietyLevelStep = ({ anxiety, setAnxiety }: AnxietyLevelStepProps) => {
  return (
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
  );
};

export default AnxietyLevelStep;
