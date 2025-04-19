
import { Trophy, Award, Check, Filter } from "lucide-react";
import { ChildProfile } from "@/types/childProfile";
import { BADGES, getBadgeInfo } from "@/utils/childUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

type BadgeFilterType = "all" | "unlocked" | "locked";

interface AchievementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentChild: ChildProfile;
}

export const AchievementsDialog = ({ 
  open, 
  onOpenChange, 
  currentChild 
}: AchievementsDialogProps) => {
  const [filterType, setFilterType] = useState<BadgeFilterType>("all");
  
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

  const filteredBadges = allBadges.filter(badge => {
    if (filterType === "all") return true;
    if (filterType === "unlocked") return badge.completed;
    if (filterType === "locked") return !badge.completed;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-sprout-orange" />
            Achievements
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-end space-x-2 mb-4">
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

        {filteredBadges.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <Award className="mx-auto h-10 w-10 mb-3 text-gray-300" />
            <p className="text-gray-500">No badges found with the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        )}
      </DialogContent>
    </Dialog>
  );
};
