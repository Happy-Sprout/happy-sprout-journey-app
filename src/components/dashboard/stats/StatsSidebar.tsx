
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
      <DailyStreakCard streakCount={currentChild.streakCount || 0} />
      <XPCard xpPoints={currentChild.xpPoints || 0} />
      <BadgesCard currentChild={currentChild} />
      <DailyInspirationCard />
    </div>
  );
};

export default StatsSidebar;
