
import { useState, useEffect } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { Trophy, Check, Star, Award, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChildProfile } from "@/contexts/UserContext";
import { BADGES, getBadgeInfo } from "@/utils/childUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AchievementsSectionProps {
  currentChild: ChildProfile;
  currentChildId: string;
}

type BadgeFilterType = "all" | "unlocked" | "locked";

const AchievementsSection = ({ currentChild, currentChildId }: AchievementsSectionProps) => {
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [filterType, setFilterType] = useState<BadgeFilterType>("all");
  const { getTodayEntry } = useJournalEntries(currentChildId);
  
  useEffect(() => {
    const checkTodayJournalEntry = async () => {
      if (currentChildId) {
        const todayEntry = await getTodayEntry();
        setJournalCompleted(!!todayEntry);
      }
    };
    
    checkTodayJournalEntry();
  }, [currentChildId, getTodayEntry]);

  // List of all possible badges
  const allBadges = Object.values(BADGES).map(badgeId => {
    const badgeInfo = getBadgeInfo(badgeId);
    return {
      id: badgeId,
      title: badgeInfo.title,
      description: badgeInfo.description,
      icon: badgeInfo.icon,
      completed: currentChild.badges.includes(badgeId)
    };
  });

  // Sort badges: completed first, then alphabetically
  const sortedBadges = [...allBadges].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return a.title.localeCompare(b.title);
  });

  // Filter badges based on selected filter
  const filteredBadges = sortedBadges.filter(badge => {
    if (filterType === "all") return true;
    if (filterType === "unlocked") return badge.completed;
    if (filterType === "locked") return !badge.completed;
    return true;
  });

  // Earned badges count - used for display in stats
  const earnedBadgesCount = allBadges.filter(badge => badge.completed).length;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-sprout-orange" />
          Achievements
        </h2>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex rounded-md border overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${filterType === "all" ? "bg-sprout-purple text-white" : "bg-gray-100"}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 text-sm ${filterType === "unlocked" ? "bg-sprout-purple text-white" : "bg-gray-100"}`}
              onClick={() => setFilterType("unlocked")}
            >
              Unlocked
            </button>
            <button 
              className={`px-3 py-1 text-sm ${filterType === "locked" ? "bg-sprout-purple text-white" : "bg-gray-100"}`}
              onClick={() => setFilterType("locked")}
            >
              Locked
            </button>
          </div>
        </div>
      </div>
      
      {filteredBadges.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Award className="mx-auto h-10 w-10 mb-3 text-gray-300" />
          <p className="text-gray-500">No badges found with the selected filter.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`p-4 rounded-lg border transition-all hover:shadow-md 
                    ${badge.completed 
                      ? "bg-sprout-green/10 border-sprout-green" 
                      : "bg-gray-50 border-gray-200 opacity-75"}`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`text-4xl mb-2 ${!badge.completed ? "grayscale opacity-70" : ""}`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center justify-center gap-2">
                        {badge.title}
                        {badge.completed && <Check className="h-4 w-4 text-sprout-green" />}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                    </div>
                    {badge.completed && (
                      <Badge className="bg-sprout-green text-white mt-1">Unlocked!</Badge>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              {!badge.completed && (
                <TooltipContent>
                  <p>Complete {badge.description.toLowerCase()} to unlock!</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {filteredBadges.length === 0 && earnedBadgesCount === 0 && (
        <div className="text-center py-6 mt-4">
          <Award className="mx-auto h-8 w-8 mb-2 text-sprout-yellow" />
          <p className="text-gray-500">Complete activities to earn your first badge!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;
