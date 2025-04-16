
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { avatarOptions } from "@/constants/profileOptions";
import { Edit, Trash2, UserCheck, Cat, Bird, Dog, Rabbit, Sprout, User } from "lucide-react";
import ChildProfileDetails from "./ChildProfileDetails";
import { motion } from "framer-motion";
import ReactAvatar from "react-avatar";

interface ChildProfilesListProps {
  onDeleteProfile: (id: string) => void;
  onEditRelationship: (id: string, currentValue: string | undefined) => void;
}

const ChildProfilesList = ({ onDeleteProfile, onEditRelationship }: ChildProfilesListProps) => {
  const navigate = useNavigate();
  const { childProfiles, currentChildId, setCurrentChildId } = useUser();

  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return null;
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.src : null;
  };

  const getAvatarColor = (avatarId?: string) => {
    if (!avatarId || !avatarId.startsWith('initial')) return "#6366F1";
    
    switch (avatarId) {
      case 'initial1': return "#6366F1"; // Indigo
      case 'initial2': return "#8B5CF6"; // Violet
      case 'initial3': return "#EC4899"; // Pink
      case 'initial4': return "#F59E0B"; // Amber
      case 'initial5': return "#10B981"; // Emerald
      default: return "#6366F1";
    }
  };

  const getAvatarFallbackIcon = (avatarId?: string) => {
    if (!avatarId) return <User className="h-5 w-5 text-gray-500" />;
    
    const avatar = avatarOptions.find(a => a.id === avatarId);
    const iconName = avatar?.icon;
    
    switch (iconName) {
      case 'sprout':
        return <Sprout className="h-5 w-5 text-sprout-green" />;
      case 'cat':
        return <Cat className="h-5 w-5 text-amber-700" />; 
      case 'rabbit':
        return <Rabbit className="h-5 w-5 text-orange-500" />; 
      case 'bird':
        return <Bird className="h-5 w-5 text-blue-500" />;
      case 'dog':
        return <Dog className="h-5 w-5 text-amber-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const isInitialAvatar = (avatarId?: string) => {
    return avatarId?.startsWith('initial') || false;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {childProfiles.map((profile) => {
        const avatarSrc = getAvatarImage(profile.avatar);
        const isInitial = isInitialAvatar(profile.avatar);
        
        console.log(`Profile ${profile.id} avatar:`, profile.avatar, "Image source:", avatarSrc);
        
        return (
          <Card key={profile.id} className={
            profile.id === currentChildId
              ? "border-2 border-sprout-purple"
              : ""
          }>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <CardTitle className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    {isInitial ? (
                      <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: getAvatarColor(profile.avatar) }}>
                        <ReactAvatar
                          name={profile.nickname}
                          size="32"
                          round={true}
                          color={getAvatarColor(profile.avatar)}
                        />
                      </div>
                    ) : avatarSrc ? (
                      <AvatarImage 
                        src={avatarSrc} 
                        alt={profile.nickname}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        {getAvatarFallbackIcon(profile.avatar)}
                      </AvatarFallback>
                    )}
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
        );
      })}
    </div>
  );
};

export default ChildProfilesList;
