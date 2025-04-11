
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EnergyLevelStepProps {
  energyLevel: string;
  setEnergyLevel: (level: string) => void;
}

const EnergyLevelStep = ({ energyLevel, setEnergyLevel }: EnergyLevelStepProps) => {
  return (
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
  );
};

export default EnergyLevelStep;
