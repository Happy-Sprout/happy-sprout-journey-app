
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarOptions } from "@/constants/profileOptions";
import { ChildProfile } from "@/contexts/UserContext";

interface WelcomeHeaderProps {
  currentChild: ChildProfile;
}

const WelcomeHeader = ({ currentChild }: WelcomeHeaderProps) => {
  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return avatarOptions[0].src;
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.src : avatarOptions[0].src;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={getAvatarImage(currentChild.avatar)} alt={currentChild.nickname} />
          <AvatarFallback>{currentChild.nickname.substring(0, 2)}</AvatarFallback>
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
