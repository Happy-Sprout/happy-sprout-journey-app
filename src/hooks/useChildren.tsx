
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/hooks/useAuth";

export type ChildProfile = {
  id: string;
  nickname: string;
  age: number;
  dateOfBirth: string;
  gender?: string;
  grade: string;
  learningStyles?: string[];
  selStrengths?: string[];
  avatar?: string;
  interests: string[];
  storyPreferences: string[];
  selChallenges: string[];
  streakCount: number;
  xpPoints: number;
  badges: string[];
  creationStatus?: 'completed' | 'pending';
  dailyCheckInCompleted?: boolean;
  relationshipToParent?: string;
};

type ChildrenContextType = {
  childProfiles: ChildProfile[];
  setChildProfiles: (profiles: ChildProfile[]) => void;
  addChildProfile: (profile: ChildProfile) => void;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => void;
  deleteChildProfile: (id: string) => void;
  currentChildId: string | null;
  setCurrentChildId: (id: string | null) => void;
  getCurrentChild: () => ChildProfile | undefined;
  calculateAgeFromDOB: (dob: string) => number;
  markDailyCheckInComplete: (id: string) => void;
  setRelationshipToParent: (childId: string, relationship: string) => void;
  fetchChildProfiles: (parentId: string) => Promise<void>;
};

const ChildrenContext = createContext<ChildrenContextType>({
  childProfiles: [],
  setChildProfiles: () => {},
  addChildProfile: () => {},
  updateChildProfile: () => {},
  deleteChildProfile: () => {},
  currentChildId: null,
  setCurrentChildId: () => {},
  getCurrentChild: () => undefined,
  calculateAgeFromDOB: () => 0,
  markDailyCheckInComplete: () => {},
  setRelationshipToParent: () => {},
  fetchChildProfiles: async () => {},
});

export const ChildrenProvider = ({ children }: { children: ReactNode }) => {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.id) {
      fetchChildProfiles(user.id);
    }
  }, [user]);
  
  const fetchChildProfiles = async (parentId: string) => {
    try {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId);
        
      if (childrenError) {
        console.error("Error fetching children:", childrenError);
        return;
      }
      
      if (!childrenData || childrenData.length === 0) {
        setChildProfiles([]);
        return;
      }
      
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
          relationshipToParent: child.relationship_to_parent,
          learningStyles: preferencesData?.learning_styles || [],
          selStrengths: preferencesData?.strengths || [],
          interests: preferencesData?.interests || [],
          storyPreferences: preferencesData?.story_preferences || [],
          selChallenges: preferencesData?.challenges || [],
          streakCount: progressData?.streak_count || 0,
          xpPoints: progressData?.xp_points || 0,
          badges: progressData?.badges || [],
          dailyCheckInCompleted: progressData?.daily_check_in_completed || false
        });
      }
      
      setChildProfiles(profiles);
      
      if (!currentChildId && profiles.length > 0) {
        setCurrentChildId(profiles[0].id);
      }
    } catch (error) {
      console.error("Error in fetchChildProfiles:", error);
    }
  };
  
  const addChildProfile = async (profile: ChildProfile) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a child profile",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // First, generate UUID if not provided
      const childId = profile.id || uuidv4();
      
      // Create child record
      const { error: childError } = await supabase
        .from('children')
        .insert([{
          id: childId,
          parent_id: user.id,
          nickname: profile.nickname,
          age: profile.age,
          date_of_birth: profile.dateOfBirth,
          gender: profile.gender || null,
          grade: profile.grade,
          avatar: profile.avatar || null,
          creation_status: profile.creationStatus || 'pending',
          relationship_to_parent: profile.relationshipToParent || null
        }]);
        
      if (childError) {
        console.error("Error adding child:", childError);
        toast({
          title: "Error",
          description: "Could not add child profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Create preferences
      const { error: prefError } = await supabase
        .from('child_preferences')
        .insert([{
          child_id: childId,
          learning_styles: profile.learningStyles || [],
          strengths: profile.selStrengths || [],
          interests: profile.interests || [],
          story_preferences: profile.storyPreferences || [],
          challenges: profile.selChallenges || []
        }]);
        
      if (prefError) {
        console.error("Error adding preferences:", prefError);
      }
        
      // Create progress record
      const { error: progressError } = await supabase
        .from('child_progress')
        .insert([{
          child_id: childId,
          streak_count: profile.streakCount || 0,
          xp_points: profile.xpPoints || 0,
          badges: profile.badges || [],
          daily_check_in_completed: profile.dailyCheckInCompleted || false
        }]);
      
      if (progressError) {
        console.error("Error adding progress:", progressError);
      }
      
      // Update local state
      const newProfile = {...profile, id: childId};
      setChildProfiles((prev) => [...prev, newProfile]);
      
      toast({
        title: "Success",
        description: `Profile for ${profile.nickname} created successfully!`
      });
      
      if (childProfiles.length === 0) {
        setCurrentChildId(childId);
      }
    } catch (error) {
      console.error("Error in addChildProfile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateChildProfile = async (id: string, updatedInfo: Partial<ChildProfile>) => {
    try {
      const childIndex = childProfiles.findIndex((profile) => profile.id === id);
      if (childIndex === -1) return;
      
      const currentChild = childProfiles[childIndex];
      const updatedChild = { ...currentChild, ...updatedInfo };
      
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
          toast({
            title: "Error",
            description: "Could not update profile. Please try again.",
            variant: "destructive"
          });
          return;
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
        updatedInfo.dailyCheckInCompleted !== undefined
      ) {
        const progressUpdate: any = {};
        if (updatedInfo.streakCount !== undefined) progressUpdate.streak_count = updatedInfo.streakCount;
        if (updatedInfo.xpPoints !== undefined) progressUpdate.xp_points = updatedInfo.xpPoints;
        if (updatedInfo.badges !== undefined) progressUpdate.badges = updatedInfo.badges;
        if (updatedInfo.dailyCheckInCompleted !== undefined) {
          progressUpdate.daily_check_in_completed = updatedInfo.dailyCheckInCompleted;
          if (updatedInfo.dailyCheckInCompleted) {
            progressUpdate.last_check_in = new Date().toISOString();
          }
        }
        
        const { error } = await supabase
          .from('child_progress')
          .update(progressUpdate)
          .eq('child_id', id);
          
        if (error) {
          console.error("Error updating progress:", error);
        }
      }
      
      setChildProfiles((prev) =>
        prev.map((profile) =>
          profile.id === id ? { ...profile, ...updatedInfo } : profile
        )
      );
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error("Error in updateChildProfile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteChildProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting child:", error);
        toast({
          title: "Error",
          description: "Could not delete profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setChildProfiles((prev) => prev.filter((profile) => profile.id !== id));
      
      if (currentChildId === id) {
        const remainingProfiles = childProfiles.filter(profile => profile.id !== id);
        setCurrentChildId(remainingProfiles.length > 0 ? remainingProfiles[0].id : null);
      }
      
      toast({
        title: "Success",
        description: "Profile deleted successfully!"
      });
    } catch (error) {
      console.error("Error in deleteChildProfile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCurrentChild = () => {
    return childProfiles.find((profile) => profile.id === currentChildId);
  };

  const calculateAgeFromDOB = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const markDailyCheckInComplete = (id: string) => {
    updateChildProfile(id, { 
      dailyCheckInCompleted: true,
      streakCount: (getCurrentChild()?.streakCount || 0) + 1,
      xpPoints: (getCurrentChild()?.xpPoints || 0) + 10
    });
  };

  const setRelationshipToParent = (childId: string, relationship: string) => {
    updateChildProfile(childId, { relationshipToParent: relationship });
  };

  return (
    <ChildrenContext.Provider
      value={{
        childProfiles,
        setChildProfiles,
        addChildProfile,
        updateChildProfile,
        deleteChildProfile,
        currentChildId,
        setCurrentChildId,
        getCurrentChild,
        calculateAgeFromDOB,
        markDailyCheckInComplete,
        setRelationshipToParent,
        fetchChildProfiles
      }}
    >
      {children}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => useContext(ChildrenContext);
