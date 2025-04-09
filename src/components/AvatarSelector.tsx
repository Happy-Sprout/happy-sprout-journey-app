
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { avatarOptions } from "@/constants/profileOptions";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onChange: (avatarId: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onChange }: AvatarSelectorProps) => {
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
              <AvatarImage src={avatar.src} alt={avatar.name} />
              <AvatarFallback>{avatar.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-center">{avatar.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
