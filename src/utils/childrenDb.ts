import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { ChildProfile } from "@/hooks/useChildren";

export async function fetchChildrenProfiles(parentId: string) {
  try {
    console.log("Fetching child profiles for parent:", parentId);
    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId);
      
    if (childrenError) {
      console.error("Error fetching children:", childrenError);
      return [];
    }
    
    if (!childrenData || childrenData.length === 0) {
      console.log("No child profiles found for parent:", parentId);
      return [];
    }
    
    console.log("Children data found:", childrenData);
    const profiles: ChildProfile[] = [];
    
    for (const child of childrenData) {
      if (!child || !child.id) continue;

      const { data: preferencesData, error: preferencesError } = await supabase
        .from('child_preferences')
        .select('*')
        .eq('child_id', child.id)
        .maybeSingle();

      if (preferencesError) {
        console.error("Error fetching preferences:", preferencesError);
      }
        
      const { data: progressData, error: progressError } = await supabase
        .from('child_progress')
        .select('*')
        .eq('child_id', child.id)
        .maybeSingle();
        
      if (progressError) {
        console.error("Error fetching progress:", progressError);
      }

      profiles.push({
        id: child.id,
        nickname: child.nickname || '',
        age: child.age || 0,
        dateOfBirth: child.date_of_birth || '',
        gender: child.gender,
        grade: child.grade || '',
        avatar: child.avatar,
        creationStatus: (child.creation_status as 'completed' | 'pending') || 'pending',
        createdAt: child.created_at,
        relationshipToParent: child.relationship_to_parent,
        learningStyles: preferencesData?.learning_styles || [],
        selStrengths: preferencesData?.strengths || [],
        interests: preferencesData?.interests || [],
        storyPreferences: preferencesData?.story_preferences || [],
        selChallenges: preferencesData?.challenges || [],
        streakCount: progressData?.streak_count || 0,
        xpPoints: progressData?.xp_points || 0,
        badges: progressData?.badges || [],
        dailyCheckInCompleted: progressData?.daily_check_in_completed || false,
        lastCheckInDate: progressData?.last_check_in || '',
      });
    }
    
    console.log("Processed child profiles:", profiles);
    return profiles;
  } catch (error) {
    console.error("Error in fetchChildrenProfiles:", error);
    return [];
  }
}

export async function createChildProfile(
  userId: string, 
  profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">
) {
  try {
    const childId = uuidv4();
    console.log("Adding child profile with ID:", childId);
    
    const { error: childError } = await supabase
      .from('children')
      .insert({
        id: childId,
        parent_id: userId,
        nickname: profile.nickname,
        age: profile.age,
        date_of_birth: profile.dateOfBirth,
        gender: profile.gender || null,
        grade: profile.grade,
        avatar: profile.avatar || null,
        creation_status: profile.creationStatus || 'pending',
        relationship_to_parent: profile.relationshipToParent || null
      });
      
    if (childError) {
      console.error("Error adding child:", childError);
      throw childError;
    }
    
    try {
      const { error: prefError } = await supabase
        .from('child_preferences')
        .insert({
          child_id: childId,
          learning_styles: profile.learningStyles || [],
          strengths: profile.selStrengths || [],
          interests: profile.interests || [],
          story_preferences: profile.storyPreferences || [],
          challenges: profile.selChallenges || []
        });
        
      if (prefError) {
        console.error("Error adding preferences:", prefError);
      }
    } catch (error) {
      console.error("Error inserting preferences:", error);
    }
    
    try {
      const { error: progressError } = await supabase
        .from('child_progress')
        .insert({
          child_id: childId,
          streak_count: 0,
          xp_points: 0,
          badges: [],
          daily_check_in_completed: false
        });
      
      if (progressError) {
        console.error("Error adding progress:", progressError);
      }
    } catch (error) {
      console.error("Error inserting progress:", error);
    }
    
    // Log activity
    try {
      await supabase
        .from('user_activity_logs')
        .insert([
          {
            user_id: userId,
            user_type: 'parent', 
            action_type: 'child_profile_created',
            action_details: {
              child_id: childId,
              nickname: profile.nickname
            }
          }
        ]);
    } catch (logError) {
      console.error("Error logging profile creation:", logError);
      // Non-blocking error, continue with the flow
    }
    
    return childId;
  } catch (error) {
    console.error("Error in createChildProfile:", error);
    throw error;
  }
}

export async function updateChildProfile(id: string, updatedInfo: Partial<ChildProfile>) {
  try {
    if (
      updatedInfo.nickname !== undefined ||
      updatedInfo.age !== undefined ||
      updatedInfo.dateOfBirth !== undefined ||
      updatedInfo.gender !== undefined ||
      updatedInfo.grade !== undefined ||
      updatedInfo.avatar !== undefined ||
      updatedInfo.creationStatus !== undefined ||
      updatedInfo.relationshipToParent !== undefined
    ) {
      const childUpdate: any = {};
      if (updatedInfo.nickname !== undefined) childUpdate.nickname = updatedInfo.nickname;
      if (updatedInfo.age !== undefined) childUpdate.age = updatedInfo.age;
      if (updatedInfo.dateOfBirth !== undefined) childUpdate.date_of_birth = updatedInfo.dateOfBirth;
      if (updatedInfo.gender !== undefined) childUpdate.gender = updatedInfo.gender;
      if (updatedInfo.grade !== undefined) childUpdate.grade = updatedInfo.grade;
      if (updatedInfo.avatar !== undefined) childUpdate.avatar = updatedInfo.avatar;
      if (updatedInfo.creationStatus !== undefined) childUpdate.creation_status = updatedInfo.creationStatus;
      if (updatedInfo.relationshipToParent !== undefined) childUpdate.relationship_to_parent = updatedInfo.relationshipToParent;
      
      const { error } = await supabase
        .from('children')
        .update(childUpdate)
        .eq('id', id);
        
      if (error) {
        console.error("Error updating child:", error);
        throw error;
      }
    }
    
    if (
      updatedInfo.learningStyles !== undefined ||
      updatedInfo.selStrengths !== undefined ||
      updatedInfo.interests !== undefined ||
      updatedInfo.storyPreferences !== undefined ||
      updatedInfo.selChallenges !== undefined
    ) {
      const prefUpdate: any = {};
      if (updatedInfo.learningStyles !== undefined) prefUpdate.learning_styles = updatedInfo.learningStyles;
      if (updatedInfo.selStrengths !== undefined) prefUpdate.strengths = updatedInfo.selStrengths;
      if (updatedInfo.interests !== undefined) prefUpdate.interests = updatedInfo.interests;
      if (updatedInfo.storyPreferences !== undefined) prefUpdate.story_preferences = updatedInfo.storyPreferences;
      if (updatedInfo.selChallenges !== undefined) prefUpdate.challenges = updatedInfo.selChallenges;
      
      const { error } = await supabase
        .from('child_preferences')
        .update(prefUpdate)
        .eq('child_id', id);
        
      if (error) {
        console.error("Error updating preferences:", error);
      }
    }
    
    if (
      updatedInfo.streakCount !== undefined ||
      updatedInfo.xpPoints !== undefined ||
      updatedInfo.badges !== undefined ||
      updatedInfo.dailyCheckInCompleted !== undefined ||
      updatedInfo.lastCheckInDate !== undefined
    ) {
      const progressUpdate: any = {};
      if (updatedInfo.streakCount !== undefined) progressUpdate.streak_count = updatedInfo.streakCount;
      if (updatedInfo.xpPoints !== undefined) progressUpdate.xp_points = updatedInfo.xpPoints;
      if (updatedInfo.badges !== undefined) progressUpdate.badges = updatedInfo.badges;
      if (updatedInfo.dailyCheckInCompleted !== undefined) progressUpdate.daily_check_in_completed = updatedInfo.dailyCheckInCompleted;
      if (updatedInfo.lastCheckInDate !== undefined) progressUpdate.last_check_in = updatedInfo.lastCheckInDate;
      
      const { error } = await supabase
        .from('child_progress')
        .update(progressUpdate)
        .eq('child_id', id);
        
      if (error) {
        console.error("Error updating progress:", error);
      }
    }
  } catch (error) {
    console.error("Error in updateChildProfile:", error);
    throw error;
  }
}

export async function deleteChildProfile(id: string) {
  try {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting child:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteChildProfile:", error);
    throw error;
  }
}

export async function markDailyCheckInComplete(
  childId: string, 
  currentChild: ChildProfile,
  date = new Date().toISOString(),
  updatedStreakCount: number,
  xpIncrement: number,
  badges: string[]
) {
  try {
    console.log("markDailyCheckInComplete called with:", { 
      childId, 
      date,
      updatedStreakCount,
      xpIncrement,
      badges
    });
    
    const updateData = { 
      dailyCheckInCompleted: true,
      lastCheckInDate: date,
      streakCount: updatedStreakCount,
      xpPoints: (currentChild.xpPoints || 0) + xpIncrement,
      badges: badges
    };
    
    console.log("Updating child profile with:", updateData);
    
    const { data, error } = await supabase
      .from('child_progress')
      .update({ 
        daily_check_in_completed: true,
        last_check_in: date,
        streak_count: updatedStreakCount,
        xp_points: (currentChild.xpPoints || 0) + xpIncrement,
        badges: badges
      })
      .eq('child_id', childId);
      
    if (error) {
      console.error("Error updating child progress:", error);
      throw error;
    }
    
    console.log("Child progress updated successfully:", data);
    
    try {
      await supabase
        .from('user_activity_logs')
        .insert([{
          user_id: childId,
          user_type: 'child',
          action_type: 'daily_check_in_completed',
          action_details: {
            date: date,
            streakCount: updatedStreakCount,
            xpEarned: xpIncrement,
            badges: badges.filter(badge => !currentChild.badges.includes(badge)) // Only log new badges
          }
        }]);
      console.log("Daily check-in logged successfully");
    } catch (error) {
      console.error("Error logging check-in:", error);
    }
    
    return data;
  } catch (error) {
    console.error("Error in markDailyCheckInComplete:", error);
    throw error;
  }
}
