
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, Trophy, Star } from "lucide-react";
import { getBadgeInfo } from "@/utils/childUtils";
import { AchievementsDialog } from "../achievements/AchievementsDialog";
import { ChildProfile } from "@/types/childProfile";

interface BadgesCardProps {
  currentChild: ChildProfile;
}

const BadgesCard = ({ currentChild }: BadgesCardProps) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const badges = currentChild.badges || [];
  const badgeCount = badges.length;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card 
          className="p-4 cursor-pointer bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:shadow-lg transition-all duration-300"
          onClick={() => setShowAchievements(true)}
          tabIndex={0}
          role="button"
          aria-haspopup="dialog"
          aria-expanded={showAchievements}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowAchievements(true);
            }
          }}
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-3 relative"
            >
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
              {badgeCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white">{badgeCount}</span>
                </motion.div>
              )}
            </motion.div>
            
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              <Trophy className="inline h-3 w-3 mr-1 text-yellow-600" />
              Badges Earned
            </h3>
            
            <motion.p 
              key={badgeCount}
              initial={{ scale: 1.2, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#374151" }}
              className="text-2xl font-bold mb-2"
            >
              {badgeCount}
            </motion.p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {badgeCount > 0 ? (
                badges.slice(0, 4).map((badge, index) => {
                  const badgeInfo = getBadgeInfo(badge);
                  return (
                    <motion.div 
                      key={index}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                      title={badgeInfo.title}
                    >
                      {badgeInfo.icon}
                    </motion.div>
                  );
                })
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-500 flex items-center"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Ready to earn badges!
                </motion.p>
              )}
              {badgeCount > 4 && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold"
                >
                  +{badgeCount - 4}
                </motion.div>
              )}
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-gray-500 mt-2"
            >
              Click to view all achievements
            </motion.p>
          </div>
        </Card>
      </motion.div>

      <AchievementsDialog
        open={showAchievements}
        onOpenChange={setShowAchievements}
        currentChild={currentChild}
      />
    </>
  );
};

export default BadgesCard;
