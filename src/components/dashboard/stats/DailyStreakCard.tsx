
import { Card } from "@/components/ui/card";
import SproutStageIcon from "../SproutStageIcon";

interface DailyStreakCardProps {
  streakCount: number;
}

const DailyStreakCard = ({ streakCount }: DailyStreakCardProps) => {
  // Calculate streak progress
  let streakProgressTarget = 3;
  if (streakCount >= 15) {
    streakProgressTarget = 30;
  } else if (streakCount >= 7) {
    streakProgressTarget = 15;
  } else if (streakCount >= 3) {
    streakProgressTarget = 7;
  }
  
  const streakProgress = Math.min(Math.floor((streakCount / streakProgressTarget) * 100), 100);

  return (
    <Card className="p-3">
      <div className="flex flex-col items-center text-center">
        <SproutStageIcon 
          streakCount={streakCount} 
          className="mb-2 h-8 w-8" 
        />
        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Daily Streak</h3>
        <p className="text-xl font-bold text-gray-800 mt-1">{streakCount} days</p>
        <div className="w-full mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-sprout-green to-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${streakProgress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DailyStreakCard;
