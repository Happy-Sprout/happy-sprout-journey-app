
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReactAvatar from "react-avatar";
import { getAvatarImage, isInitialAvatar, getAvatarColor, getFallbackIcon, hasValidImageSource } from "@/utils/avatarUtils";

const ChildProfileSelector = () => {
  const { childProfiles, setCurrentChildId } = useUser();

  return (
    <div className="mb-8 sprout-card">
      <h2 className="text-xl font-bold mb-4">Select a Child Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {childProfiles.map(profile => {
          const avatarSrc = getAvatarImage(profile.avatar);
          const isInitial = isInitialAvatar(profile.avatar);
          const hasImage = hasValidImageSource(profile.avatar);
          
          console.log(`ChildProfileSelector - Profile ${profile.id} avatar:`, profile.avatar, 
            "Image source:", avatarSrc, 
            "Is initial:", isInitial, 
            "Has valid image:", hasImage);
          
          return (
            <motion.div 
              key={profile.id}
              className="p-4 bg-white rounded-lg border-2 border-sprout-purple/20 hover:border-sprout-purple cursor-pointer transition-all hover:shadow-md"
              onClick={() => setCurrentChildId(profile.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-2">
                  {isInitial ? (
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: getAvatarColor(profile.avatar) }}>
                      <ReactAvatar
                        name={profile.nickname}
                        size="64"
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
                    <AvatarFallback className="bg-gray-100">
                      {getFallbackIcon(profile.avatar)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="font-bold text-lg">{profile.nickname}</h3>
                <p className="text-sm text-gray-500">Age: {profile.age}</p>
                <p className="text-sm text-gray-500">Grade: {profile.grade}</p>
                {profile.creationStatus && (
                  <Badge className={profile.creationStatus === 'completed' ? 'bg-green-500' : 'bg-amber-500'}>
                    {profile.creationStatus === 'completed' ? 'Complete' : 'Pending'}
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChildProfileSelector;
