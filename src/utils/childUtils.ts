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

export const calculateStreak = (lastCheckInDate: string | undefined): { 
  newStreak: number, 
  shouldIncrement: boolean 
} => {
  if (!lastCheckInDate) {
    // First time checking in, start streak at 1
    return { newStreak: 1, shouldIncrement: false };
  }
  
  const lastDate = new Date(lastCheckInDate);
  const today = new Date();
  
  if (isYesterday(lastDate)) {
    // User checked in yesterday, streak should increment
    return { newStreak: 0, shouldIncrement: true };
  }
  
  if (isSameDay(lastDate, today)) {
    // User already checked in today, maintain current streak
    return { newStreak: 0, shouldIncrement: false };
  }
  
  // User missed a day (or more), streak should reset to 1 for today's check-in
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
    
    const { newStreak, shouldIncrement } = calculateStreak(currentChild.lastCheckInDate);
    
    // Calculate the updated streak count
    const updatedStreakCount = shouldIncrement 
      ? currentChild.streakCount + 1 
      : newStreak > 0 ? newStreak : currentChild.streakCount;
      
    const shouldAwardXP = !isSameDay(
      currentChild.lastCheckInDate ? new Date(currentChild.lastCheckInDate) : new Date(0), 
      new Date()
    );
    
    const xpIncrement = shouldAwardXP ? 10 : 0;
    
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
  CONSISTENCY_CHAMP: "consistency_champ",
  SELF_AWARENESS_MILESTONE: "self_awareness_milestone",
  SELF_MANAGEMENT_MILESTONE: "self_management_milestone",
  SOCIAL_AWARENESS_MILESTONE: "social_awareness_milestone",
  RELATIONSHIP_SKILLS_MILESTONE: "relationship_skills_milestone",
  DECISION_MAKING_MILESTONE: "decision_making_milestone",
  SEL_GROWTH_CHAMPION: "sel_growth_champion"
};

export function checkForBadgeUnlocks(
  profile: ChildProfile, 
  metrics: {
    dailyCheckIn?: boolean;
    journalEntry?: boolean;
    allActivities?: boolean;
    streakCount?: number;
    xpPoints?: number;
    selScores?: {
      selfAwareness?: number;
      selfManagement?: number;
      socialAwareness?: number;
      relationshipSkills?: number;
      responsibleDecisionMaking?: number;
    };
  }
): string[] {
  const currentBadges = profile.badges || [];
  const newBadges: string[] = [];
  
  const addBadgeIfNew = (badge: string) => {
    if (!currentBadges.includes(badge)) {
      newBadges.push(badge);
      console.log(`New badge unlocked: ${badge}`);
    }
  };
  
  if (!currentBadges.includes(BADGES.FIRST_LOGIN)) {
    addBadgeIfNew(BADGES.FIRST_LOGIN);
  }
  
  if (profile.creationStatus === "completed" && !currentBadges.includes(BADGES.PROFILE_CREATOR)) {
    addBadgeIfNew(BADGES.PROFILE_CREATOR);
  }
  
  if (metrics.dailyCheckIn && !currentBadges.includes(BADGES.DAILY_HERO)) {
    addBadgeIfNew(BADGES.DAILY_HERO);
  }
  
  if (metrics.journalEntry && !currentBadges.includes(BADGES.JOURNAL_STARTER)) {
    addBadgeIfNew(BADGES.JOURNAL_STARTER);
  }
  
  if (metrics.allActivities && !currentBadges.includes(BADGES.TRIO_CHAMP)) {
    addBadgeIfNew(BADGES.TRIO_CHAMP);
  }
  
  if (metrics.streakCount) {
    if (metrics.streakCount >= 3 && !currentBadges.includes(BADGES.THREE_DAY_STREAK)) {
      addBadgeIfNew(BADGES.THREE_DAY_STREAK);
    }
    
    if (metrics.streakCount >= 7 && !currentBadges.includes(BADGES.WEEK_STREAK)) {
      addBadgeIfNew(BADGES.WEEK_STREAK);
    }
    
    if (metrics.streakCount >= 15 && !currentBadges.includes(BADGES.HALF_MONTH_STREAK)) {
      addBadgeIfNew(BADGES.HALF_MONTH_STREAK);
    }
    
    const hasThreeDayBadge = currentBadges.includes(BADGES.THREE_DAY_STREAK) || newBadges.includes(BADGES.THREE_DAY_STREAK);
    const hasWeekBadge = currentBadges.includes(BADGES.WEEK_STREAK) || newBadges.includes(BADGES.WEEK_STREAK);
    const hasHalfMonthBadge = currentBadges.includes(BADGES.HALF_MONTH_STREAK) || newBadges.includes(BADGES.HALF_MONTH_STREAK);
    
    if (hasThreeDayBadge && hasWeekBadge && hasHalfMonthBadge && !currentBadges.includes(BADGES.CONSISTENCY_CHAMP)) {
      addBadgeIfNew(BADGES.CONSISTENCY_CHAMP);
    }
  }
  
  if (metrics.xpPoints) {
    if (metrics.xpPoints >= 50 && !currentBadges.includes(BADGES.XP_COLLECTOR_50)) {
      addBadgeIfNew(BADGES.XP_COLLECTOR_50);
    }
    
    if (metrics.xpPoints >= 100 && !currentBadges.includes(BADGES.LEVEL_UP)) {
      addBadgeIfNew(BADGES.LEVEL_UP);
    }
  }
  
  if (metrics.selScores) {
    if (metrics.selScores.selfAwareness && 
        metrics.selScores.selfAwareness >= 0.7 && 
        !currentBadges.includes(BADGES.SELF_AWARENESS_MILESTONE)) {
      addBadgeIfNew(BADGES.SELF_AWARENESS_MILESTONE);
    }
    
    if (metrics.selScores.selfManagement && 
        metrics.selScores.selfManagement >= 0.7 && 
        !currentBadges.includes(BADGES.SELF_MANAGEMENT_MILESTONE)) {
      addBadgeIfNew(BADGES.SELF_MANAGEMENT_MILESTONE);
    }
    
    if (metrics.selScores.socialAwareness && 
        metrics.selScores.socialAwareness >= 0.7 && 
        !currentBadges.includes(BADGES.SOCIAL_AWARENESS_MILESTONE)) {
      addBadgeIfNew(BADGES.SOCIAL_AWARENESS_MILESTONE);
    }
    
    if (metrics.selScores.relationshipSkills && 
        metrics.selScores.relationshipSkills >= 0.7 && 
        !currentBadges.includes(BADGES.RELATIONSHIP_SKILLS_MILESTONE)) {
      addBadgeIfNew(BADGES.RELATIONSHIP_SKILLS_MILESTONE);
    }
    
    if (metrics.selScores.responsibleDecisionMaking && 
        metrics.selScores.responsibleDecisionMaking >= 0.7 && 
        !currentBadges.includes(BADGES.DECISION_MAKING_MILESTONE)) {
      addBadgeIfNew(BADGES.DECISION_MAKING_MILESTONE);
    }
    
    const hasSelfAwarenessBadge = currentBadges.includes(BADGES.SELF_AWARENESS_MILESTONE) || newBadges.includes(BADGES.SELF_AWARENESS_MILESTONE);
    const hasSelfManagementBadge = currentBadges.includes(BADGES.SELF_MANAGEMENT_MILESTONE) || newBadges.includes(BADGES.SELF_MANAGEMENT_MILESTONE);
    const hasSocialAwarenessBadge = currentBadges.includes(BADGES.SOCIAL_AWARENESS_MILESTONE) || newBadges.includes(BADGES.SOCIAL_AWARENESS_MILESTONE);
    const hasRelationshipSkillsBadge = currentBadges.includes(BADGES.RELATIONSHIP_SKILLS_MILESTONE) || newBadges.includes(BADGES.RELATIONSHIP_SKILLS_MILESTONE);
    const hasDecisionMakingBadge = currentBadges.includes(BADGES.DECISION_MAKING_MILESTONE) || newBadges.includes(BADGES.DECISION_MAKING_MILESTONE);
    
    if (hasSelfAwarenessBadge && hasSelfManagementBadge && hasSocialAwarenessBadge && 
        hasRelationshipSkillsBadge && hasDecisionMakingBadge && 
        !currentBadges.includes(BADGES.SEL_GROWTH_CHAMPION)) {
      addBadgeIfNew(BADGES.SEL_GROWTH_CHAMPION);
    }
  }
  
  return newBadges;
}

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
    },
    [BADGES.SELF_AWARENESS_MILESTONE]: {
      title: "Self-Awareness Master",
      description: "Achieved a high level of self-awareness",
      icon: "🧠"
    },
    [BADGES.SELF_MANAGEMENT_MILESTONE]: {
      title: "Emotion Manager",
      description: "Demonstrated excellent self-management skills",
      icon: "🧘"
    },
    [BADGES.SOCIAL_AWARENESS_MILESTONE]: {
      title: "Empathy Expert",
      description: "Developed strong social awareness capabilities",
      icon: "👥"
    },
    [BADGES.RELATIONSHIP_SKILLS_MILESTONE]: {
      title: "Friendship Builder",
      description: "Excelled at building quality relationships",
      icon: "🤝"
    },
    [BADGES.DECISION_MAKING_MILESTONE]: {
      title: "Wise Decider",
      description: "Made consistently responsible decisions",
      icon: "🧩"
    },
    [BADGES.SEL_GROWTH_CHAMPION]: {
      title: "SEL Growth Champion",
      description: "Mastered all five areas of social-emotional learning",
      icon: "🏆"
    }
  };
  
  return badges[badgeId] || {
    title: "Unknown Badge",
    description: "This badge is a mystery",
    icon: "❓"
  };
}
