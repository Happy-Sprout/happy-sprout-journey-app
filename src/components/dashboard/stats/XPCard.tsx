
import { Card } from "@/components/ui/card";

interface XPCardProps {
  xpPoints: number;
}

const XPCard = ({ xpPoints }: XPCardProps) => {
  // Calculate level based on XP
  const calculateLevel = (xp: number) => {
    const levelThresholds = [0, 50, 100, 200, 350, 500, 750, 1000, 1500, 2000];
    
    let level = 1;
    for (let i = 1; i < levelThresholds.length; i++) {
      if (xp >= levelThresholds[i]) {
        level = i + 1;
      } else {
        const currentLevelXP = levelThresholds[i-1];
        const nextLevelXP = levelThresholds[i];
        const xpForCurrentLevel = xp - currentLevelXP;
        const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
        const progress = Math.floor((xpForCurrentLevel / xpRequiredForNextLevel) * 100);
        return { level, progress };
      }
    }
    return { level, progress: 100 };
  };

  const { progress } = calculateLevel(xpPoints);

  return (
    <Card className="p-3">
      <div className="flex flex-col items-center text-center">
        <img 
          src="/lovable-uploads/75c52b68-2b01-4868-85c4-6a84e59b813f.png"
          alt="Experience Points"
          className="h-8 w-8 mb-2"
        />
        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Experience Points</h3>
        <p className="text-xl font-bold text-gray-800 mt-1">{xpPoints} XP</p>
        <div className="w-full mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-sprout-green to-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default XPCard;
