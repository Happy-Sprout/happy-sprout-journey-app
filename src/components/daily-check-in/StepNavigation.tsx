
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StepNavigationProps {
  step: number;
  totalSteps: number;
  prevStep: () => void;
  nextStep: () => void;
}

const StepNavigation = ({ step, totalSteps, prevStep, nextStep }: StepNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={prevStep}
        disabled={step === 1}
      >
        Back
      </Button>
      
      <Button
        type="button"
        className="bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
        onClick={nextStep}
      >
        {step === totalSteps ? "Complete" : "Next"}
        {step !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

export default StepNavigation;
