
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { avatarOptions } from "@/constants/profileOptions";
import { Cat, Bird, Dog, Rabbit, Sprout, User, Check } from "lucide-react";
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
        return <User className="h-8 w-8 text-gray-500" />;
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

  // Different avatar types for better variety
  const initialAvatars = [
    { id: 'initial1', name: 'Initial Avatar 1', color: "#6366F1" },
    { id: 'initial2', name: 'Initial Avatar 2', color: "#8B5CF6" },
    { id: 'initial3', name: 'Initial Avatar 3', color: "#EC4899" },
    { id: 'initial4', name: 'Initial Avatar 4', color: "#F59E0B" },
    { id: 'initial5', name: 'Initial Avatar 5', color: "#10B981" },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium block">Choose Your Avatar</Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Animal avatars */}
        {avatarOptions.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => onChange(avatar.id)}
            className={`cursor-pointer flex flex-col items-center p-3 rounded-lg transition-all hover:bg-gray-50 relative ${
              selectedAvatar === avatar.id
                ? "bg-sprout-purple/20 border-2 border-sprout-purple shadow-sm"
                : "bg-white border border-gray-200"
            }`}
          >
            {selectedAvatar === avatar.id && (
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
                {getAvatarFallbackIcon(avatar.icon)}
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
            onClick={() => onChange(avatar.id)}
            className={`cursor-pointer flex flex-col items-center p-3 rounded-lg transition-all hover:bg-gray-50 relative ${
              selectedAvatar === avatar.id
                ? "bg-sprout-purple/20 border-2 border-sprout-purple shadow-sm"
                : "bg-white border border-gray-200"
            }`}
          >
            {selectedAvatar === avatar.id && (
              <div className="absolute top-1 right-1 bg-sprout-purple text-white rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}
            <div className="h-16 w-16 mb-2 rounded-full overflow-hidden flex items-center justify-center">
              <ReactAvatar
                name={getAvatarName(selectedAvatar)}
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
