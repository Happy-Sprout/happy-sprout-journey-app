import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Trophy, Star } from "lucide-react";
import { ChildProfile } from "@/contexts/UserContext";
import { getBadgeInfo } from "@/utils/childUtils";

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
  
  // Calculate streak progress (toward next milestone)
  let streakProgressTarget = 3; // Default: working toward 3-day streak
  if (currentChild.streakCount >= 15) {
    streakProgressTarget = 30; // Next milestone after 15 is 30
  } else if (currentChild.streakCount >= 7) {
    streakProgressTarget = 15; // Working toward 15-day streak
  } else if (currentChild.streakCount >= 3) {
    streakProgressTarget = 7; // Working toward 7-day streak
  }
  
  const streakProgress = Math.min(Math.floor((currentChild.streakCount / streakProgressTarget) * 100), 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Award className="h-8 w-8 text-sprout-orange mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Daily Streak</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{currentChild.streakCount} days</p>
          <div className="w-full mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-sprout-orange to-sprout-yellow h-1.5 rounded-full"
                style={{ width: `${streakProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Star className="h-8 w-8 text-sprout-green mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Experience Points</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{currentChild.xpPoints} XP</p>
          <div className="w-full mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-sprout-green to-emerald-400 h-1.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Trophy className="h-8 w-8 text-sprout-purple mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Badges Earned</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{badgeCount}</p>
          <div className="flex flex-wrap justify-center gap-1 mt-3">
            {badgeCount > 0 ? (
              currentChild.badges.slice(0, 3).map((badge, index) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <div 
                    key={index} 
                    className="w-6 h-6 rounded-full bg-sprout-purple/10 flex items-center justify-center text-sprout-purple"
                    title={badgeInfo.title}
                  >
                    {badgeInfo.icon}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No badges yet</p>
            )}
            {badgeCount > 3 && (
              <div className="w-6 h-6 rounded-full bg-sprout-purple/10 flex items-center justify-center text-sprout-purple">
                +{badgeCount - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
