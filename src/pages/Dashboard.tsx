
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import NoActiveChildPrompt from "@/components/dashboard/NoActiveChildPrompt";
import ChildProfileSelector from "@/components/dashboard/ChildProfileSelector";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import DailyActivities from "@/components/dashboard/DailyActivities";
import AchievementsSection from "@/components/dashboard/AchievementsSection";
import WelcomePrompt from "@/components/dashboard/WelcomePrompt";

const Dashboard = () => {
  const { childProfiles, getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4">
        {childProfiles.length === 0 ? (
          <WelcomePrompt />
        ) : (
          <>
            {(!currentChildId || !getCurrentChild()) && childProfiles.length > 0 ? (
              <NoActiveChildPrompt />
            ) : null}
            
            {!currentChildId && childProfiles.length > 0 && (
              <ChildProfileSelector />
            )}
            
            {currentChild && (
              <>
                <WelcomeHeader currentChild={currentChild} />
                
                <StatsCards currentChild={currentChild} />
                
                <DailyActivities 
                  currentChild={currentChild}
                  currentChildId={currentChildId!}
                />

                <AchievementsSection 
                  currentChild={currentChild}
                  currentChildId={currentChildId!}
                />
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
