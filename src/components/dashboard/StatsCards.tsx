import { Card } from "@/components/ui/card";
import { ChildProfile } from "@/contexts/UserContext";
import { getBadgeInfo } from "@/utils/childUtils";
import SproutStageIcon from "./SproutStageIcon";

interface StatsCardsProps {
  currentChild: ChildProfile;
}

// Helper function to calculate level based on XP
const calculateLevel = (xp: number): { level: number; progress: number } => {
  const levelThresholds = [0, 50, 100, 200, 350, 500, 750, 1000, 1500, 2000];
  
  let level = 1;
  for (let i = 1; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i]) {
      level = i + 1;
    } else {
      // Calculate progress to next level
      const currentLevelXP = levelThresholds[i-1];
      const nextLevelXP = levelThresholds[i];
      const xpForCurrentLevel = xp - currentLevelXP;
      const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
      const progress = Math.floor((xpForCurrentLevel / xpRequiredForNextLevel) * 100);
      return { level, progress };
    }
  }
  
  // Max level
  return { level, progress: 100 };
};

const StatsCards = ({ currentChild }: StatsCardsProps) => {
  const badgeCount = currentChild.badges?.length || 0;
  const { level, progress } = calculateLevel(currentChild.xpPoints);
  
  // Calculate streak progress
  let streakProgressTarget = 3;
  if (currentChild.streakCount >= 15) {
    streakProgressTarget = 30;
  } else if (currentChild.streakCount >= 7) {
    streakProgressTarget = 15;
  } else if (currentChild.streakCount >= 3) {
    streakProgressTarget = 7;
  }
  
  const streakProgress = Math.min(Math.floor((currentChild.streakCount / streakProgressTarget) * 100), 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div className="p-6 rounded-3xl bg-white shadow-sm border border-sprout-purple/10 h-full">
        <div className="flex flex-col items-center text-center h-full justify-between">
          <SproutStageIcon 
            streakCount={currentChild.streakCount} 
            className="mb-3 h-12 w-12" 
          />
          <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Daily Streak</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{currentChild.streakCount} days</p>
          <div className="w-full mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-sprout-green to-emerald-400 h-2 rounded-full"
                style={{ width: `${streakProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white shadow-sm border border-sprout-purple/10 h-full">
        <div className="flex flex-col items-center text-center h-full justify-between">
          <img 
            src="/lovable-uploads/75c52b68-2b01-4868-85c4-6a84e59b813f.png"
            alt="Sprouting Learner"
            className="h-12 w-12 mb-3"
          />
          <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Experience Points</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{currentChild.xpPoints} XP</p>
          <div className="w-full mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-sprout-green to-emerald-400 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white shadow-sm border border-sprout-purple/10 h-full">
        <div className="flex flex-col items-center text-center h-full justify-between">
          <img 
            src="/lovable-uploads/82323b4f-cc61-4fcf-903d-43c507bac3cb.png"
            alt="Trophy"
            className="h-12 w-12 mb-3"
          />
          <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Badges Earned</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{badgeCount}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {badgeCount > 0 ? (
              currentChild.badges.slice(0, 3).map((badge, index) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <div 
                    key={index} 
                    className="w-8 h-8 rounded-full bg-sprout-purple/10 flex items-center justify-center text-sprout-purple"
                    title={badgeInfo.title}
                  >
                    {badgeInfo.icon}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No badges yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
