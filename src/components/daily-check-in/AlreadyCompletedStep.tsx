
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

interface AlreadyCompletedStepProps {
  getRandomQuote: () => string;
}

const AlreadyCompletedStep = ({ getRandomQuote }: AlreadyCompletedStepProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold mb-2">Check-in Already Completed</h2>
      <p className="text-gray-600 mb-4">
        You've already completed your check-in for today. Great job!
      </p>
      <div className="p-6 bg-gradient-to-r from-sprout-yellow/20 to-sprout-green/20 rounded-lg mb-6">
        <p className="italic text-lg">"{getRandomQuote()}"</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          className="bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/journal")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Write in Journal
        </Button>
      </div>
    </div>
  );
};

export default AlreadyCompletedStep;
