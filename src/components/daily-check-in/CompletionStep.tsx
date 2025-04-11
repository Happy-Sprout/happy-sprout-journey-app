
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

interface CompletionStepProps {
  getRandomQuote: () => string;
}

const CompletionStep = ({ getRandomQuote }: CompletionStepProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-3">Awesome job!</h2>
      <div className="p-6 bg-gradient-to-r from-sprout-yellow/20 to-sprout-green/20 rounded-lg mb-6">
        <p className="italic text-lg">"{getRandomQuote()}"</p>
      </div>
      <p className="text-gray-600 mb-6">
        You've completed your daily check-in. Keep up the great work!
      </p>
      
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
          Write in Journal
        </Button>
      </div>
    </div>
  );
};

export default CompletionStep;
