
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { avatarOptions } from "@/constants/profileOptions";
import { Edit, Trash2, UserCheck } from "lucide-react";
import ChildProfileDetails from "./ChildProfileDetails";
import { motion } from "framer-motion";

interface ChildProfilesListProps {
  onDeleteProfile: (id: string) => void;
  onEditRelationship: (id: string, currentValue: string | undefined) => void;
}

const ChildProfilesList = ({ onDeleteProfile, onEditRelationship }: ChildProfilesListProps) => {
  const navigate = useNavigate();
  const { childProfiles, currentChildId, setCurrentChildId } = useUser();

  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return avatarOptions[0].src;
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.src : avatarOptions[0].src;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {childProfiles.map((profile) => (
        <Card key={profile.id} className={
          profile.id === currentChildId
            ? "border-2 border-sprout-purple"
            : ""
        }>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <CardTitle className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage 
                    src={getAvatarImage(profile.avatar)} 
                    alt={profile.nickname}
                    onError={(e) => {
                      // When image fails to load, we manually show the fallback
                      const fallbackEl = e.currentTarget.nextElementSibling;
                      if (fallbackEl) {
                        fallbackEl.setAttribute('data-state', 'visible');
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                  <AvatarFallback data-state="hidden">{profile.nickname.substring(0, 2)}</AvatarFallback>
                </Avatar>
                {profile.nickname}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {profile.id === currentChildId && (
                  <Badge variant="outline" className="bg-sprout-purple text-white">
                    Active Profile
                  </Badge>
                )}
                {profile.creationStatus && (
                  <Badge className={profile.creationStatus === 'completed' ? 'bg-green-500' : 'bg-amber-500'}>
                    {profile.creationStatus === 'completed' ? 'Complete' : 'Pending'}
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription className="text-left">
              Age: {profile.age} • Grade: {profile.grade}
              {profile.gender && ` • Gender: ${profile.gender}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChildProfileDetails 
              profile={profile} 
              onEditRelationship={() => onEditRelationship(profile.id, profile.relationshipToParent)}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-2">
              {profile.id !== currentChildId && (
                <motion.div
                  initial={profile.id === currentChildId ? {} : { scale: 1.05 }}
                  animate={profile.id === currentChildId ? {} : { scale: 1 }}
                  transition={{ 
                    repeat: profile.id === currentChildId ? 0 : 2,
                    repeatType: "reverse",
                    duration: 0.5
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentChildId(profile.id)}
                    className="text-sprout-green border-sprout-green hover:bg-sprout-green/10 w-full sm:w-auto"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Make Active
                  </Button>
                </motion.div>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(`/edit-profile/${profile.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => onDeleteProfile(profile.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChildProfilesList;
