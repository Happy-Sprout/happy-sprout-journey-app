
import { useState, useEffect } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { Trophy, Check, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChildProfile } from "@/contexts/UserContext";

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

  const achievements = [
    { 
      title: "First Login", 
      description: "Completed your first login", 
      icon: "🏆", 
      completed: true 
    },
    { 
      title: "Profile Creator", 
      description: "Created your profile", 
      icon: "🎨", 
      completed: currentChild ? !!currentChild.creationStatus : false 
    },
    { 
      title: "Emotion Explorer", 
      description: "Completed first daily check-in", 
      icon: "😊", 
      completed: currentChild ? !!currentChild.dailyCheckInCompleted : false 
    },
    { 
      title: "Journal Master", 
      description: "Created your first journal entry", 
      icon: "📝", 
      completed: journalCompleted
    },
    { 
      title: "Week Streak", 
      description: "Completed check-ins for 7 days in a row", 
      icon: "🔥", 
      completed: currentChild ? currentChild.streakCount >= 7 : false 
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-sprout-orange" />
        Achievements
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border ${
              achievement.completed 
                ? 'bg-sprout-green/10 border-sprout-green' 
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {achievement.title}
                  {achievement.completed && (
                    <Check className="h-4 w-4 text-sprout-green" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-sprout-yellow" />
          What's Next
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {achievements.filter(a => !a.completed).map((nextAchievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="text-xl text-gray-400">{nextAchievement.icon}</div>
                  <div>
                    <h4 className="font-medium">{nextAchievement.title}</h4>
                    <p className="text-sm text-gray-500">{nextAchievement.description}</p>
                  </div>
                </div>
              ))}
              {achievements.filter(a => !a.completed).length === 0 && (
                <p className="text-center text-gray-500">Great job! You've completed all the beginning achievements!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementsSection;
