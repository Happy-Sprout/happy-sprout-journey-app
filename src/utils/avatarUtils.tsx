
import { avatarOptions } from "@/constants/profileOptions";
import { Cat, Bird, Dog, Rabbit, Sprout, User } from "lucide-react";
import { ReactNode } from "react";

/**
 * Get the image source for an avatar by its ID
 */
export const getAvatarImage = (avatarId?: string): string | null => {
  if (!avatarId) return null;
  
  // For image-based avatars from the predefined options
  const avatar = avatarOptions.find(a => a.id === avatarId);
  
  // Debug logging to help trace issues
  console.log(`getAvatarImage called for ${avatarId}, found:`, avatar?.src || "no source");
  
  if (avatar && avatar.src && avatar.src !== '/placeholder.svg') {
    return avatar.src;
  }
  
  // Return null for placeholder or missing images
  return null;
};

/**
 * Check if an avatar ID represents an initial-based avatar
 */
export const isInitialAvatar = (avatarId?: string): boolean => {
  return avatarId?.startsWith('initial') || false;
};

/**
 * Get the color for an initial-based avatar
 */
export const getAvatarColor = (avatarId?: string): string => {
  if (!avatarId || !avatarId.startsWith('initial')) return "#6366F1";
  
  switch (avatarId) {
    case 'initial1': return "#6366F1"; // Indigo
    case 'initial2': return "#8B5CF6"; // Violet
    case 'initial3': return "#EC4899"; // Pink
    case 'initial4': return "#F59E0B"; // Amber
    case 'initial5': return "#10B981"; // Emerald
    default: return "#6366F1";
  }
};

/**
 * Get the fallback icon for an avatar by its ID
 */
export const getFallbackIcon = (avatarId?: string): ReactNode => {
  if (!avatarId) return <Sprout strokeWidth={2} size={24} className="text-sprout-green" />;
  
  const avatar = avatarOptions.find(a => a.id === avatarId);
  const iconName = avatar?.icon;
  
  switch (iconName) {
    case 'sprout':
      return <Sprout strokeWidth={2} size={24} className="text-sprout-green" />;
    case 'cat':
      return <Cat strokeWidth={2} size={24} className="text-amber-700" />;
    case 'rabbit':
      return <Rabbit strokeWidth={2} size={24} className="text-orange-500" />;
    case 'bird':
      return <Bird strokeWidth={2} size={24} className="text-blue-500" />;
    case 'dog':
      return <Dog strokeWidth={2} size={24} className="text-amber-500" />;
    default:
      return <User strokeWidth={2} size={24} className="text-gray-500" />;
  }
};

/**
 * Determine if an avatar ID represents an image-based avatar with a valid source
 */
export const hasValidImageSource = (avatarId?: string): boolean => {
  if (!avatarId) return false;
  if (isInitialAvatar(avatarId)) return false;
  
  const source = getAvatarImage(avatarId);
  return source !== null;
};
