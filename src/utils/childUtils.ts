
import { ChildProfile } from "@/types/childProfile";
import * as childrenDb from "@/utils/childrenDb";

export const getCurrentChild = (childProfiles: ChildProfile[], currentChildId: string | null): ChildProfile | undefined => {
  return childProfiles.find((profile) => profile.id === currentChildId);
};

export const calculateAgeFromDOB = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const markDailyCheckInComplete = (
  childId: string, 
  childProfiles: ChildProfile[],
  setChildProfiles: (profiles: ChildProfile[]) => void,
  date = new Date().toISOString()
) => {
  try {
    console.log("Marking daily check-in as complete for child:", childId);
    const currentChild = childProfiles.find(child => child.id === childId);
    if (!currentChild) {
      console.error("Child not found:", childId);
      return;
    }
    
    childrenDb.markDailyCheckInComplete(childId, currentChild, date)
      .then(() => {
        console.log("Daily check-in marked as complete successfully");
        
        // Update the local state as well
        setChildProfiles(prevProfiles => 
          prevProfiles.map(profile => 
            profile.id === childId 
              ? { 
                  ...profile, 
                  dailyCheckInCompleted: true, 
                  lastCheckInDate: date,
                  streakCount: profile.streakCount + 1,
                  xpPoints: profile.xpPoints + 10
                } 
              : profile
          )
        );
      })
      .catch(error => {
        console.error("Error marking daily check-in:", error);
      });
  } catch (error) {
    console.error("Error in markDailyCheckInComplete:", error);
  }
};
