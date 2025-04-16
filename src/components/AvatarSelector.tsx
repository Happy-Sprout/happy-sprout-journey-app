
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { avatarOptions } from "@/constants/profileOptions";
import { Check } from "lucide-react";
import ReactAvatar from "react-avatar";
import { getFallbackIcon, getAvatarColor } from "@/utils/avatarUtils";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onChange: (avatarId: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onChange }: AvatarSelectorProps) => {
  // Track the current selected avatar to ensure it persists in UI
  const [currentAvatar, setCurrentAvatar] = useState(selectedAvatar);

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentAvatar(selectedAvatar);
  }, [selectedAvatar]);

  // Function to handle avatar selection
  const handleAvatarSelect = (avatarId: string) => {
    setCurrentAvatar(avatarId);
    onChange(avatarId);
  };
  
  // Convert avatar ID to name for initial-based avatars
  const getAvatarName = (avatarId: string) => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar?.name || "Happy Sprout";
  };

  // Different avatar types for better variety
  const initialAvatars = [
    { id: 'initial1', name: 'Initial Avatar 1', color: "#6366F1" },
    { id: 'initial2', name: 'Initial Avatar 2', color: "#8B5CF6" },
    { id: 'initial3', name: 'Initial Avatar 3', color: "#EC4899" },
    { id: 'initial4', name: 'Initial Avatar 4', color: "#F59E0B" },
    { id: 'initial5', name: 'Initial Avatar 5', color: "#10B981" },
  ];

  // Debug logging to track avatar state
  console.log("AvatarSelector - Selected avatar:", selectedAvatar);
  console.log("AvatarSelector - Current avatar:", currentAvatar);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium block">Choose Your Avatar</Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Animal avatars */}
        {avatarOptions.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => handleAvatarSelect(avatar.id)}
            className={`cursor-pointer flex flex-col items-center p-3 rounded-lg transition-all hover:bg-gray-50 relative ${
              currentAvatar === avatar.id
                ? "bg-sprout-purple/20 border-2 border-sprout-purple shadow-sm"
                : "bg-white border border-gray-200"
            }`}
          >
            {currentAvatar === avatar.id && (
              <div className="absolute top-1 right-1 bg-sprout-purple text-white rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage 
                src={avatar.src} 
                alt={avatar.name} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100">
                {getFallbackIcon(avatar.id)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-center line-clamp-1">{avatar.name}</span>
          </div>
        ))}
      </div>

      <Label className="text-base font-medium block mt-6 mb-2">Initial-Based Avatars</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Initial-based avatars with better styling */}
        {initialAvatars.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => handleAvatarSelect(avatar.id)}
            className={`cursor-pointer flex flex-col items-center p-3 rounded-lg transition-all hover:bg-gray-50 relative ${
              currentAvatar === avatar.id
                ? "bg-sprout-purple/20 border-2 border-sprout-purple shadow-sm"
                : "bg-white border border-gray-200"
            }`}
          >
            {currentAvatar === avatar.id && (
              <div className="absolute top-1 right-1 bg-sprout-purple text-white rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}
            <div className="h-16 w-16 mb-2 rounded-full overflow-hidden flex items-center justify-center">
              <ReactAvatar
                name={getAvatarName(currentAvatar)}
                size="64"
                round={true}
                color={avatar.color}
              />
            </div>
            <span className="text-xs text-center">Colorful Initials {avatar.id.replace('initial', '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
