
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Trophy } from "lucide-react";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
          <div className="h-4 w-4 rounded-full bg-sprout-orange text-white flex items-center justify-center">
            <Award className="h-3 w-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentChild.streakCount} days</div>
          <p className="text-xs text-muted-foreground">
            {currentChild.streakCount >= 15 
              ? "Amazing consistency!" 
              : currentChild.streakCount >= 7 
                ? `${15 - currentChild.streakCount} days until half-month badge` 
                : currentChild.streakCount >= 3 
                  ? `${7 - currentChild.streakCount} days until week badge` 
                  : `${3 - currentChild.streakCount} days until 3-day badge`}
          </p>
          <Progress value={streakProgress} className="h-2 mt-3" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
          <div className="h-4 w-4 rounded-full bg-sprout-green text-white flex items-center justify-center">
            <TrendingUp className="h-3 w-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentChild.xpPoints} XP</div>
          <p className="text-xs text-muted-foreground">Level {level} - {level === 1 ? "Growing Seedling" : level === 2 ? "Sprouting Learner" : level === 3 ? "Budding Explorer" : "Thriving Champion"}</p>
          <Progress value={progress} className="h-2 mt-3" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          <div className="h-4 w-4 rounded-full bg-sprout-purple text-white flex items-center justify-center">
            <Trophy className="h-3 w-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{badgeCount}</div>
          <p className="text-xs text-muted-foreground">Keep going to earn more!</p>
          <div className="flex flex-wrap mt-3 gap-1">
            {badgeCount > 0 ? (
              currentChild.badges.slice(0, 5).map((badge, index) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <div key={index} className="flex items-center justify-center w-8 h-8 rounded-full bg-sprout-yellow/10 text-sprout-orange" title={badgeInfo.title}>
                    <span>{badgeInfo.icon}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500">No badges yet</div>
            )}
            {badgeCount > 5 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sprout-purple/10 text-sprout-purple" title="More badges">
                <span>+{badgeCount - 5}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
