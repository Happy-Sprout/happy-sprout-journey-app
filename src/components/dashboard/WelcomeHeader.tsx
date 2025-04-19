
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

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 justify-center md:justify-start">
        <Avatar className="h-12 w-12 ring-4 ring-white shadow-md">
          {isInitial ? (
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: getAvatarColor(currentChild.avatar) }}>
              <ReactAvatar
                name={currentChild.nickname}
                size="48"
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
          <p className="text-gray-600 font-medium">Good morning,</p>
          <h1 className="text-2xl md:text-3xl font-bold text-sprout-purple">{currentChild.nickname}!</h1>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
