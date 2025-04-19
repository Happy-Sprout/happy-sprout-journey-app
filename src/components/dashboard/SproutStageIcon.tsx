
interface SproutStageIconProps {
  streakCount: number;
  className?: string;
}

const SproutStageIcon = ({ streakCount, className = "" }: SproutStageIconProps) => {
  const getStageIcon = () => {
    if (streakCount >= 15) {
      return "/lovable-uploads/82323b4f-cc61-4fcf-903d-43c507bac3cb.png"; // Four-Leaf Young Plant
    } else if (streakCount >= 7) {
      return "/lovable-uploads/75c52b68-2b01-4868-85c4-6a84e59b813f.png"; // Two-Leaf Seedling
    }
    return "/lovable-uploads/8553a77a-7c02-4fac-81e0-9a434e82ad19.png"; // Tiny Sprout
  };

  return (
    <img 
      src={getStageIcon()} 
      alt={`Streak stage ${streakCount} days`}
      className={`h-8 w-8 ${className}`}
    />
  );
};

export default SproutStageIcon;
