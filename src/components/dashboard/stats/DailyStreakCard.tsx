
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Flame, Trophy, Target } from "lucide-react";
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

  const getStreakEmoji = () => {
    if (streakCount >= 30) return "🔥";
    if (streakCount >= 15) return "⭐";
    if (streakCount >= 7) return "🌟";
    if (streakCount >= 3) return "✨";
    return "🌱";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="p-4 bg-gradient-to-br from-sprout-green/5 to-emerald-50 border-sprout-green/20 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-3 relative"
          >
            <SproutStageIcon 
              streakCount={streakCount} 
              className="h-10 w-10" 
            />
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 text-lg"
            >
              {getStreakEmoji()}
            </motion.span>
          </motion.div>
          
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            <Flame className="inline h-3 w-3 mr-1 text-orange-500" />
            Daily Streak
          </h3>
          
          <motion.p 
            key={streakCount}
            initial={{ scale: 1.2, color: "#10b981" }}
            animate={{ scale: 1, color: "#374151" }}
            className="text-2xl font-bold mb-2"
          >
            {streakCount} days
          </motion.p>
          
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{streakProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${streakProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-sprout-green via-emerald-400 to-green-500 h-2 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Goal: {streakProgressTarget} days
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DailyStreakCard;
