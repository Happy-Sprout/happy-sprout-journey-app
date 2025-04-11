
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WelcomePrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Welcome to Happy Sprout!</h1>
      <p className="text-gray-600 mb-8">Let's get started by creating a profile for your child</p>
      <Button 
        className="sprout-button"
        onClick={() => navigate("/create-profile")}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Child Profile
      </Button>
    </div>
  );
};

export default WelcomePrompt;
