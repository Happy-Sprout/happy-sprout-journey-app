
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Zap, Crown } from "lucide-react";

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
        return { level, progress, nextLevelXP, xpForCurrentLevel, xpRequiredForNextLevel };
      }
    }
    return { level, progress: 100, nextLevelXP: 0, xpForCurrentLevel: 0, xpRequiredForNextLevel: 0 };
  };

  const { level, progress, nextLevelXP, xpForCurrentLevel, xpRequiredForNextLevel } = calculateLevel(xpPoints);

  const getLevelIcon = () => {
    if (level >= 8) return Crown;
    if (level >= 5) return Star;
    return Zap;
  };

  const LevelIcon = getLevelIcon();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-3 relative"
          >
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-full">
              <LevelIcon className="h-6 w-6 text-white" />
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              <span className="text-xs font-bold text-yellow-800">{level}</span>
            </motion.div>
          </motion.div>
          
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            <Zap className="inline h-3 w-3 mr-1 text-purple-500" />
            Experience Points
          </h3>
          
          <motion.p 
            key={xpPoints}
            initial={{ scale: 1.2, color: "#8b5cf6" }}
            animate={{ scale: 1, color: "#374151" }}
            className="text-2xl font-bold mb-1"
          >
            {xpPoints} XP
          </motion.p>
          
          <p className="text-xs text-purple-600 font-semibold mb-2">
            Level {level}
          </p>
          
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress > 0 ? `${xpForCurrentLevel}/${xpRequiredForNextLevel}` : 'Max Level'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 h-2 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </motion.div>
            </div>
            {progress < 100 && (
              <p className="text-xs text-gray-500 mt-1">
                {xpRequiredForNextLevel - xpForCurrentLevel} XP to next level
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default XPCard;
