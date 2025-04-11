
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarOptions } from "@/constants/profileOptions";
import { ChildProfile } from "@/contexts/UserContext";
import { Cat, Dog, Bird, Sprout, User, Rabbit } from "lucide-react";

interface WelcomeHeaderProps {
  currentChild: ChildProfile;
}

const WelcomeHeader = ({ currentChild }: WelcomeHeaderProps) => {
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
        return <Sprout className="h-8 w-8 text-sprout-green" />;
      case 'cat':
        return <Cat className="h-8 w-8 text-amber-700" />;
      case 'rabbit':
        return <Rabbit className="h-8 w-8 text-orange-500" />;
      case 'bird':
        return <Bird className="h-8 w-8 text-blue-500" />;
      case 'dog':
        return <Dog className="h-8 w-8 text-amber-500" />;
      default:
        return <User className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={getAvatarImage(currentChild.avatar)} 
            alt={currentChild.nickname}
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-100">
            {getFallbackIcon(getAvatarIcon(currentChild.avatar))}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {currentChild.nickname}!</h1>
          <p className="text-gray-600">Let's continue growing your emotional skills today.</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
