
import { useState, useEffect } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { Trophy, Check, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChildProfile } from "@/contexts/UserContext";
import { BADGES, getBadgeInfo } from "@/utils/childUtils";

interface AchievementsSectionProps {
  currentChild: ChildProfile;
  currentChildId: string;
}

const AchievementsSection = ({ currentChild, currentChildId }: AchievementsSectionProps) => {
  const [journalCompleted, setJournalCompleted] = useState(false);
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

  // Earned badges
  const earnedBadges = sortedBadges.filter(badge => badge.completed);
  
  // Upcoming badges (not yet earned)
  const upcomingBadges = sortedBadges.filter(badge => !badge.completed);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-sprout-orange" />
        Achievements
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {earnedBadges.map((badge, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg border bg-sprout-green/10 border-sprout-green"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{badge.icon}</div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {badge.title}
                  <Check className="h-4 w-4 text-sprout-green" />
                </h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {earnedBadges.length === 0 && (
          <div className="col-span-full text-center py-6 text-gray-500">
            <Award className="mx-auto h-8 w-8 mb-2 text-sprout-yellow" />
            <p>Complete activities to earn your first badge!</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-sprout-yellow" />
          Badges to Unlock
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {upcomingBadges.slice(0, 5).map((nextBadge, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="text-xl text-gray-400">{nextBadge.icon}</div>
                  <div>
                    <h4 className="font-medium">{nextBadge.title}</h4>
                    <p className="text-sm text-gray-500">{nextBadge.description}</p>
                  </div>
                </div>
              ))}
              {upcomingBadges.length === 0 && (
                <p className="text-center text-gray-500">Great job! You've earned all available badges!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementsSection;
