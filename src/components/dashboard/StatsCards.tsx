
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp } from "lucide-react";
import { ChildProfile } from "@/contexts/UserContext";

interface StatsCardsProps {
  currentChild: ChildProfile;
}

const StatsCards = ({ currentChild }: StatsCardsProps) => {
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
          <p className="text-xs text-muted-foreground">Keep the streak going!</p>
          <Progress value={20} className="h-2 mt-3" />
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
          <p className="text-xs text-muted-foreground">Level 1 - Growing Seedling</p>
          <Progress value={40} className="h-2 mt-3" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          <div className="h-4 w-4 rounded-full bg-sprout-purple text-white flex items-center justify-center">
            <Award className="h-3 w-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentChild.badges.length}</div>
          <p className="text-xs text-muted-foreground">Keep going to earn more!</p>
          <div className="flex mt-3">
            {currentChild.badges.length === 0 ? (
              <div className="text-sm text-gray-500">No badges yet</div>
            ) : (
              currentChild.badges.map((badge, index) => (
                <div key={index} className="mr-2">🏆</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
