import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { ChildProfile } from "@/contexts/UserContext";
import { 
  Eye, Book, PaintBucket, Brain, Heart, Puzzle
} from "lucide-react";

interface ChildProfileDetailsProps {
  profile: ChildProfile;
  onEditRelationship: () => void;
}

const ChildProfileDetails = ({ profile, onEditRelationship }: ChildProfileDetailsProps) => {
  // Helper functions
  const getLearningStyleLabel = (style: string | undefined) => {
    switch (style) {
      case "visual":
        return "Visual Learner";
      case "auditory":
        return "Auditory Learner";
      case "kinesthetic":
        return "Kinesthetic Learner";
      case "mixed":
        return "Mixed Learning Style";
      default:
        return "Not specified";
    }
  };

  const getSELStrengthLabel = (strength: string | undefined) => {
    switch (strength) {
      case "self-awareness":
        return "Self-Awareness";
      case "self-management":
        return "Self-Management";
      case "social-awareness":
        return "Social Awareness";
      case "relationship-skills":
        return "Relationship Skills";
      case "decision-making":
        return "Responsible Decision-Making";
      case "unaware":
        return "Still Exploring";
      default:
        return "Not specified";
    }
  };

  const formatArrayToString = (array: string[] | undefined) => {
    return array?.join(", ") || "None selected";
  };

  return (
    <div className="space-y-6 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-sprout-purple/5 p-4 rounded-lg border border-sprout-purple/10">
          <div className="flex items-center mb-2">
            <Eye className="h-5 w-5 text-sprout-purple mr-2" />
            <h4 className="text-sm font-medium text-sprout-purple">Learning Styles</h4>
          </div>
          <p className="text-left text-gray-700">
            {profile.learningStyles && profile.learningStyles.length > 0 
              ? profile.learningStyles.map(style => getLearningStyleLabel(style)).join(", ")
              : "Not specified"}
          </p>
        </div>
        
        <div className="bg-sprout-green/5 p-4 rounded-lg border border-sprout-green/10">
          <div className="flex items-center mb-2">
            <Brain className="h-5 w-5 text-sprout-green mr-2" />
            <h4 className="text-sm font-medium text-sprout-green">SEL Strengths</h4>
          </div>
          <p className="text-left text-gray-700">
            {profile.selStrengths && profile.selStrengths.length > 0 
              ? profile.selStrengths.map(strength => getSELStrengthLabel(strength)).join(", ")
              : "Not specified"}
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <div className="flex items-center mb-2">
          <PaintBucket className="h-5 w-5 text-yellow-600 mr-2" />
          <h4 className="text-sm font-medium text-yellow-600">Interests</h4>
        </div>
        <p className="text-left text-gray-700">{formatArrayToString(profile.interests)}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center mb-2">
          <Book className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="text-sm font-medium text-blue-600">Story Preferences</h4>
        </div>
        <p className="text-left text-gray-700">{formatArrayToString(profile.storyPreferences)}</p>
      </div>

      {profile.selChallenges && profile.selChallenges.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center mb-2">
            <Puzzle className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="text-sm font-medium text-purple-600">SEL Challenges</h4>
          </div>
          <p className="text-left text-gray-700">{formatArrayToString(profile.selChallenges)}</p>
        </div>
      )}
      
      <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-pink-600 mr-2" />
            <h4 className="text-sm font-medium text-pink-600">Relationship to Parent</h4>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-xs border-pink-200 hover:bg-pink-100 text-pink-700"
            onClick={onEditRelationship}
          >
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </div>
        <p className="text-left text-gray-700">{profile.relationshipToParent || "Not specified"}</p>
      </div>

      {profile.is_assessment_feature_enabled && (
        <div className="mt-1">
          <span className="text-sprout-green text-sm">
            ✓ Pre/Post SEL Assessment enabled
          </span>
        </div>
      )}
    </div>
  );
};

export default ChildProfileDetails;
