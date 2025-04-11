
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface ScenarioQuestion {
  question: string;
  options: {
    value: string;
    label: string;
  }[];
}

interface ScenarioStepProps {
  scenarioQuestion: ScenarioQuestion;
  scenarioAnswer: string;
  setScenarioAnswer: (answer: string) => void;
}

const ScenarioStep = ({ scenarioQuestion, scenarioAnswer, setScenarioAnswer }: ScenarioStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Social Scenario</h2>
      <div className="p-4 bg-sprout-yellow/10 rounded-lg mb-4">
        <p>{scenarioQuestion.question}</p>
      </div>
      
      <RadioGroup value={scenarioAnswer} onValueChange={setScenarioAnswer}>
        <div className="grid grid-cols-1 gap-3">
          {scenarioQuestion.options.map((option) => (
            <div
              key={option.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                scenarioAnswer === option.value ? "bg-sprout-purple/10 border-sprout-purple" : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => setScenarioAnswer(option.value)}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default ScenarioStep;
