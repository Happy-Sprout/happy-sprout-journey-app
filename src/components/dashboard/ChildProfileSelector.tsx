
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { avatarOptions } from "@/constants/profileOptions";
import { Cat, Bird, Dog, Rabbit, Sprout, User } from "lucide-react";

const ChildProfileSelector = () => {
  const { childProfiles, setCurrentChildId } = useUser();

  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return avatarOptions[0].src;
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.src : avatarOptions[0].src;
  };

  const getAvatarIcon = (avatarId?: string) => {
    if (!avatarId) return 'sprout';
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar?.icon || 'sprout';
  };

  const getFallbackIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sprout':
        return <Sprout className="h-6 w-6 text-sprout-green" />;
      case 'bear':
        return <Cat className="h-6 w-6 text-amber-700" />; // Using Cat instead of Bear
      case 'fox':
        return <Rabbit className="h-6 w-6 text-orange-500" />; // Using Rabbit instead of Fox
      case 'lion':
        return <Bird className="h-6 w-6 text-yellow-600" />; // Using Bird as Lion is not in Lucide
      case 'bird':
        return <Bird className="h-6 w-6 text-blue-500" />;
      case 'dog':
        return <Dog className="h-6 w-6 text-amber-500" />;
      default:
        return <User className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="mb-8 sprout-card">
      <h2 className="text-xl font-bold mb-4">Select a Child Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {childProfiles.map(profile => (
          <motion.div 
            key={profile.id}
            className="p-4 bg-white rounded-lg border-2 border-sprout-purple/20 hover:border-sprout-purple cursor-pointer transition-all hover:shadow-md"
            onClick={() => setCurrentChildId(profile.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 mb-2">
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
                <AvatarFallback className="bg-gray-100" data-state="hidden">
                  {getFallbackIcon(getAvatarIcon(profile.avatar))}
                </AvatarFallback>
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
        ))}
      </div>
    </div>
  );
};

export default ChildProfileSelector;
