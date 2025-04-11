
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const NoActiveProfilePrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-bold mb-2">No Active Profile</h2>
            <p className="text-gray-600 mb-4">
              Please select or create a child profile first.
            </p>
            <Button
              className="sprout-button"
              onClick={() => navigate("/profile")}
            >
              Go to Profiles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoActiveProfilePrompt;
