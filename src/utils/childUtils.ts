
import { ChildProfile } from "@/types/childProfile";
import * as childrenDb from "@/utils/childrenDb";
import { isSameDay, isYesterday, differenceInDays } from "date-fns";

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

// Check if a check-in streak should be continued or reset
export const calculateStreak = (lastCheckInDate: string | undefined): { 
  newStreak: number, 
  shouldIncrement: boolean 
} => {
  // If there's no previous check-in date, this is the first check-in
  if (!lastCheckInDate) {
    return { newStreak: 1, shouldIncrement: false };
  }
  
  const lastDate = new Date(lastCheckInDate);
  const today = new Date();
  
  // Check if the last check-in was yesterday (consecutive day)
  if (isYesterday(lastDate)) {
    return { newStreak: 0, shouldIncrement: true }; // Will be incremented in the caller
  }
  
  // Check if the last check-in was today already (no streak change)
  if (isSameDay(lastDate, today)) {
    return { newStreak: 0, shouldIncrement: false }; // No change, already checked in today
  }
  
  // If more than 1 day has passed, reset streak
  return { newStreak: 1, shouldIncrement: false };
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
    
    // Calculate streak based on last check-in date
    const { newStreak, shouldIncrement } = calculateStreak(currentChild.lastCheckInDate);
    
    // Calculate the new streak count
    const updatedStreakCount = shouldIncrement 
      ? currentChild.streakCount + 1 
      : newStreak > 0 ? newStreak : currentChild.streakCount;
      
    // Only award XP if this is the first check-in today
    const shouldAwardXP = !isSameDay(
      currentChild.lastCheckInDate ? new Date(currentChild.lastCheckInDate) : new Date(0), 
      new Date()
    );
    
    const xpIncrement = shouldAwardXP ? 10 : 0;
    
    // Determine if user should get streak XP bonuses
    let streakBonus = 0;
    if (shouldIncrement) {
      if (updatedStreakCount === 3) streakBonus = 10;
      else if (updatedStreakCount === 7) streakBonus = 15;
      else if (updatedStreakCount === 15) streakBonus = 25;
    }
    
    const totalXpIncrement = xpIncrement + streakBonus;
    
    console.log("Streak calculation:", {
      lastCheckInDate: currentChild.lastCheckInDate,
      newStreak,
      shouldIncrement,
      updatedStreakCount,
      shouldAwardXP,
      xpIncrement,
      streakBonus,
      totalXpIncrement
    });
    
    // Check for badge unlocks
    const newBadges = checkForBadgeUnlocks(currentChild, {
      dailyCheckIn: true,
      streakCount: updatedStreakCount,
      xpPoints: currentChild.xpPoints + totalXpIncrement
    });
    
    const combinedBadges = [...(currentChild.badges || []), ...newBadges];
    
    childrenDb.markDailyCheckInComplete(
      childId, 
      currentChild, 
      date, 
      updatedStreakCount, 
      totalXpIncrement,
      combinedBadges
    )
      .then(() => {
        console.log("Daily check-in marked as complete successfully");
        
        // Update the local state as well
        const updatedProfiles = childProfiles.map(profile => 
          profile.id === childId 
            ? { 
                ...profile, 
                dailyCheckInCompleted: true, 
                lastCheckInDate: date,
                streakCount: updatedStreakCount,
                xpPoints: profile.xpPoints + totalXpIncrement,
                badges: combinedBadges
              } 
            : profile
        );
        
        setChildProfiles(updatedProfiles);
      })
      .catch(error => {
        console.error("Error marking daily check-in:", error);
      });
  } catch (error) {
    console.error("Error in markDailyCheckInComplete:", error);
  }
};

// Define available badges
export const BADGES = {
  FIRST_LOGIN: "first_login",
  PROFILE_CREATOR: "profile_creator",
  DAILY_HERO: "daily_hero",
  JOURNAL_STARTER: "journal_starter",
  TRIO_CHAMP: "trio_champ",
  THREE_DAY_STREAK: "three_day_streak",
  WEEK_STREAK: "week_streak",
  HALF_MONTH_STREAK: "half_month_streak",
  XP_COLLECTOR_50: "xp_collector_50",
  LEVEL_UP: "level_up",
  CONSISTENCY_CHAMP: "consistency_champ"
};

// Check if a child should earn new badges
export function checkForBadgeUnlocks(
  profile: ChildProfile, 
  metrics: {
    dailyCheckIn?: boolean;
    journalEntry?: boolean;
    allActivities?: boolean;
    streakCount?: number;
    xpPoints?: number;
  }
): string[] {
  const currentBadges = profile.badges || [];
  const newBadges: string[] = [];
  
  // Helper to add badge if not already earned
  const addBadgeIfNew = (badge: string) => {
    if (!currentBadges.includes(badge)) {
      newBadges.push(badge);
      console.log(`New badge unlocked: ${badge}`);
    }
  };
  
  // First login - this could be set elsewhere during initial auth
  if (!currentBadges.includes(BADGES.FIRST_LOGIN)) {
    addBadgeIfNew(BADGES.FIRST_LOGIN);
  }
  
  // Profile creator - awarded when profile is complete
  if (profile.creationStatus === "completed" && !currentBadges.includes(BADGES.PROFILE_CREATOR)) {
    addBadgeIfNew(BADGES.PROFILE_CREATOR);
  }
  
  // Daily hero - for completing a daily check-in
  if (metrics.dailyCheckIn && !currentBadges.includes(BADGES.DAILY_HERO)) {
    addBadgeIfNew(BADGES.DAILY_HERO);
  }
  
  // Journal starter - for completing a journal entry
  if (metrics.journalEntry && !currentBadges.includes(BADGES.JOURNAL_STARTER)) {
    addBadgeIfNew(BADGES.JOURNAL_STARTER);
  }
  
  // Trio champ - for completing all activities in one day
  if (metrics.allActivities && !currentBadges.includes(BADGES.TRIO_CHAMP)) {
    addBadgeIfNew(BADGES.TRIO_CHAMP);
  }
  
  // Streak badges
  if (metrics.streakCount) {
    // 3-day streak
    if (metrics.streakCount >= 3 && !currentBadges.includes(BADGES.THREE_DAY_STREAK)) {
      addBadgeIfNew(BADGES.THREE_DAY_STREAK);
    }
    
    // Week streak
    if (metrics.streakCount >= 7 && !currentBadges.includes(BADGES.WEEK_STREAK)) {
      addBadgeIfNew(BADGES.WEEK_STREAK);
    }
    
    // Half-month streak
    if (metrics.streakCount >= 15 && !currentBadges.includes(BADGES.HALF_MONTH_STREAK)) {
      addBadgeIfNew(BADGES.HALF_MONTH_STREAK);
    }
    
    // Consistency champ - earn all three streak badges
    const hasThreeDayBadge = currentBadges.includes(BADGES.THREE_DAY_STREAK) || newBadges.includes(BADGES.THREE_DAY_STREAK);
    const hasWeekBadge = currentBadges.includes(BADGES.WEEK_STREAK) || newBadges.includes(BADGES.WEEK_STREAK);
    const hasHalfMonthBadge = currentBadges.includes(BADGES.HALF_MONTH_STREAK) || newBadges.includes(BADGES.HALF_MONTH_STREAK);
    
    if (hasThreeDayBadge && hasWeekBadge && hasHalfMonthBadge && !currentBadges.includes(BADGES.CONSISTENCY_CHAMP)) {
      addBadgeIfNew(BADGES.CONSISTENCY_CHAMP);
    }
  }
  
  // XP badges
  if (metrics.xpPoints) {
    // XP Collector badge - 50 XP
    if (metrics.xpPoints >= 50 && !currentBadges.includes(BADGES.XP_COLLECTOR_50)) {
      addBadgeIfNew(BADGES.XP_COLLECTOR_50);
    }
    
    // Level up badge - for reaching level 2 (100 XP)
    if (metrics.xpPoints >= 100 && !currentBadges.includes(BADGES.LEVEL_UP)) {
      addBadgeIfNew(BADGES.LEVEL_UP);
    }
  }
  
  return newBadges;
}

// Helper function to get badge display info based on badge ID
export function getBadgeInfo(badgeId: string) {
  const badges = {
    [BADGES.FIRST_LOGIN]: {
      title: "First Login",
      description: "Logged in for the first time",
      icon: "🎉"
    },
    [BADGES.PROFILE_CREATOR]: {
      title: "Profile Creator",
      description: "Completed your profile setup",
      icon: "🧑‍🎨"
    },
    [BADGES.DAILY_HERO]: {
      title: "Daily Hero",
      description: "Completed your first daily check-in",
      icon: "📅"
    },
    [BADGES.JOURNAL_STARTER]: {
      title: "Journal Starter",
      description: "Submitted your first journal entry",
      icon: "✍️"
    },
    [BADGES.TRIO_CHAMP]: {
      title: "Trio Champ",
      description: "Completed all 3 activities in one day",
      icon: "🔁"
    },
    [BADGES.THREE_DAY_STREAK]: {
      title: "3-Day Streak",
      description: "Completed activities for 3 consecutive days",
      icon: "🔥"
    },
    [BADGES.WEEK_STREAK]: {
      title: "Week Streak",
      description: "Completed activities for 7 consecutive days",
      icon: "📆"
    },
    [BADGES.HALF_MONTH_STREAK]: {
      title: "Half-Month Streak",
      description: "Completed activities for 15 consecutive days",
      icon: "🏅"
    },
    [BADGES.XP_COLLECTOR_50]: {
      title: "XP Collector (50)",
      description: "Earned a total of 50 XP",
      icon: "🧠"
    },
    [BADGES.LEVEL_UP]: {
      title: "Level Up",
      description: "Reached Level 2 in XP progression",
      icon: "🌱"
    },
    [BADGES.CONSISTENCY_CHAMP]: {
      title: "Consistency Champ",
      description: "Earned all three streak badges",
      icon: "🎁"
    }
  };
  
  return badges[badgeId] || {
    title: "Unknown Badge",
    description: "This badge is a mystery",
    icon: "❓"
  };
}
