
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChildProfile } from "@/contexts/UserContext";
import ReactAvatar from "react-avatar";
import { getAvatarImage, isInitialAvatar, getAvatarColor, getFallbackIcon } from "@/utils/avatarUtils";

interface WelcomeHeaderProps {
  currentChild: ChildProfile;
}

const WelcomeHeader = ({ currentChild }: WelcomeHeaderProps) => {
  const avatarSrc = getAvatarImage(currentChild.avatar);
  const isInitial = isInitialAvatar(currentChild.avatar);
  
  console.log(`WelcomeHeader - Avatar:`, currentChild.avatar, "Image source:", avatarSrc);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {isInitial ? (
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: getAvatarColor(currentChild.avatar) }}>
              <ReactAvatar
                name={currentChild.nickname}
                size="64"
                round={true}
                color={getAvatarColor(currentChild.avatar)}
              />
            </div>
          ) : avatarSrc ? (
            <AvatarImage 
              src={avatarSrc} 
              alt={currentChild.nickname}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gray-100">
              {getFallbackIcon(currentChild.avatar)}
            </AvatarFallback>
          )}
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
