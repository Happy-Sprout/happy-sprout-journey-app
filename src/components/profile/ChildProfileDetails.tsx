
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { ChildProfile } from "@/contexts/UserContext";

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Learning Styles</h4>
          <p className="text-left">
            {profile.learningStyles && profile.learningStyles.length > 0 
              ? profile.learningStyles.map(style => getLearningStyleLabel(style)).join(", ")
              : "Not specified"}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">SEL Strengths</h4>
          <p className="text-left">
            {profile.selStrengths && profile.selStrengths.length > 0 
              ? profile.selStrengths.map(strength => getSELStrengthLabel(strength)).join(", ")
              : "Not specified"}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">Interests</h4>
        <p className="text-left">{formatArrayToString(profile.interests)}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">Story Preferences</h4>
        <p className="text-left">{formatArrayToString(profile.storyPreferences)}</p>
      </div>

      {profile.selChallenges && profile.selChallenges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">SEL Challenges</h4>
          <p className="text-left">{formatArrayToString(profile.selChallenges)}</p>
        </div>
      )}
      
      <div>
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Relationship to Parent</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={onEditRelationship}
          >
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </div>
        <p className="text-left">{profile.relationshipToParent || "Not specified"}</p>
      </div>
    </div>
  );
};

export default ChildProfileDetails;
