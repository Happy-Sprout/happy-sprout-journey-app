
import { ChildProfile } from "@/types/childProfile";
import DailyStreakCard from "./DailyStreakCard";
import XPCard from "./XPCard";
import BadgesCard from "./BadgesCard";
import DailyInspirationCard from "./DailyInspirationCard";

interface StatsSidebarProps {
  currentChild: ChildProfile;
}

const StatsSidebar = ({ currentChild }: StatsSidebarProps) => {
  return (
    <div className="space-y-4">
      <DailyStreakCard streakCount={currentChild.streakCount} />
      <XPCard xpPoints={currentChild.xpPoints} />
      <BadgesCard badges={currentChild.badges || []} />
      <DailyInspirationCard />
    </div>
  );
};

export default StatsSidebar;
