
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { avatarOptions } from "@/constants/profileOptions";
import { Cat, Bird, Dog, Rabbit, Sprout, User } from "lucide-react";
import ReactAvatar from "react-avatar";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onChange: (avatarId: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onChange }: AvatarSelectorProps) => {
  // Function to render the appropriate icon based on avatar type
  const getAvatarFallbackIcon = (iconName?: string) => {
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
        return <Sprout className="h-8 w-8 text-sprout-green" />;
    }
  };

  // Convert avatar ID to name for initial-based avatars
  const getAvatarName = (avatarId: string) => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar?.name || "Happy Sprout";
  };
  
  // Get color for initial-based avatars
  const getAvatarColor = (avatarId: string) => {
    switch (avatarId) {
      case 'initial1': return "#6366F1"; // Indigo
      case 'initial2': return "#8B5CF6"; // Violet
      case 'initial3': return "#EC4899"; // Pink
      case 'initial4': return "#F59E0B"; // Amber
      case 'initial5': return "#10B981"; // Emerald
      default: return "#6366F1";
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium block">Choose Your Avatar</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Animal avatars */}
        {avatarOptions.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => onChange(avatar.id)}
            className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition-all ${
              selectedAvatar === avatar.id
                ? "bg-sprout-purple/20 border-2 border-sprout-purple"
                : "bg-white hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage 
                src={avatar.src} 
                alt={avatar.name} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100">
                {getAvatarFallbackIcon(avatar.icon)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-center">{avatar.name}</span>
          </div>
        ))}
        
        {/* Initial-based avatars */}
        {['initial1', 'initial2', 'initial3', 'initial4', 'initial5'].map((avatarId) => (
          <div
            key={avatarId}
            onClick={() => onChange(avatarId)}
            className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition-all ${
              selectedAvatar === avatarId
                ? "bg-sprout-purple/20 border-2 border-sprout-purple"
                : "bg-white hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="h-16 w-16 mb-2 rounded-full overflow-hidden flex items-center justify-center">
              <ReactAvatar
                name={getAvatarName(avatarId)}
                size="64"
                round={true}
                color={getAvatarColor(avatarId)}
              />
            </div>
            <span className="text-xs text-center">Initials {avatarId.replace('initial', '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
