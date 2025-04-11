
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { avatarOptions } from "@/constants/profileOptions";
import { Cat, Bird, Dog, Rabbit, Sprout, User } from "lucide-react";

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
        return <Cat className="h-8 w-8 text-amber-700" />; // Using Cat instead of Bear
      case 'rabbit':
        return <Rabbit className="h-8 w-8 text-orange-500" />; // Using Rabbit instead of Fox
      case 'bird':
        return <Bird className="h-8 w-8 text-blue-500" />;
      case 'dog':
        return <Dog className="h-8 w-8 text-amber-500" />;
      default:
        return <Sprout className="h-8 w-8 text-sprout-green" />;
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium block">Choose Your Avatar</Label>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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
      </div>
    </div>
  );
};

export default AvatarSelector;
