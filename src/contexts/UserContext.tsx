
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@supabase/supabase-js";

// Types for child profiles
export type ChildProfile = {
  id: string;
  nickname: string;
  age: number;
  gender?: string;
  grade?: string;
  school?: string;
  interests?: string[];
  challenges?: string[];
  avatar?: string;
  creationStatus?: "pending" | "completed";
  createdAt: string;
  dailyCheckInCompleted?: boolean;
  lastCheckInDate?: string;
  xpPoints: number;
  streakCount: number;
  badges: string[];
  dateOfBirth?: string;
  learningStyles?: string[];
  selStrengths?: string[];
  storyPreferences?: string[];
  selChallenges?: string[];
  relationshipToParent?: string;
};

// Types for parent profiles
export type ParentInfo = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  emergencyContact: string;
  additionalInfo?: string;
};

type UserContextType = {
  user: User | null;
  childProfiles: ChildProfile[];
  parentInfo: ParentInfo | null;
  currentChildId: string | null;
  isLoggedIn: boolean;
  addChildProfile: (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => Promise<void>;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => Promise<void>;
  removeChildProfile: (id: string) => Promise<void>;
  setParentInfo: (profile: ParentInfo) => void;
  updateParentInfo: (info: Partial<ParentInfo>) => void;
  setCurrentChildId: (id: string | null) => void;
  getCurrentChild: () => ChildProfile | null;
  markDailyCheckInComplete: (childId: string, date?: string) => void;
  refreshChildProfiles: () => Promise<void>;
  logout: () => Promise<void>;
  calculateAgeFromDOB: (dob: string) => number;
  deleteChildProfile: (id: string) => Promise<void>;
  setRelationshipToParent: (childId: string, relationship: string) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const user = session?.user || null;
  const navigate = useNavigate();
  
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  
  const isLoggedIn = !!user;
  
  // Load child profiles when user changes
  useEffect(() => {
    if (user) {
      refreshChildProfiles();
      fetchParentInfo();
    } else {
      setChildProfiles([]);
      setParentInfo(null);
      setCurrentChildId(null);
    }
  }, [user]);

  // Save currentChildId to localStorage
  useEffect(() => {
    if (currentChildId) {
      localStorage.setItem("currentChildId", currentChildId);
    } else {
      localStorage.removeItem("currentChildId");
    }
  }, [currentChildId]);

  // Load currentChildId from localStorage on initial load
  useEffect(() => {
    const savedChildId = localStorage.getItem("currentChildId");
    if (savedChildId) {
      setCurrentChildId(savedChildId);
    }
  }, []);

  const refreshChildProfiles = async () => {
    if (!user) return;
    
    try {
      // First, fetch the basic child data
      const { data: childrenData, error: childrenError } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });
        
      if (childrenError) {
        console.error("Error fetching child profiles:", childrenError);
        return;
      }
      
      if (!childrenData || childrenData.length === 0) {
        setChildProfiles([]);
        return;
      }
      
      // Now prepare to fetch additional data for each child
      const formattedProfiles: ChildProfile[] = [];
      
      for (const child of childrenData) {
        // Fetch preferences data
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("child_preferences")
          .select("*")
          .eq("child_id", child.id)
          .maybeSingle();
          
        if (preferencesError) {
          console.error("Error fetching preferences:", preferencesError);
        }
        
        // Fetch progress data
        const { data: progressData, error: progressError } = await supabase
          .from("child_progress")
          .select("*")
          .eq("child_id", child.id)
          .maybeSingle();
          
        if (progressError) {
          console.error("Error fetching progress:", progressError);
        }
        
        // Build the profile by combining data from different tables
        formattedProfiles.push({
          id: child.id,
          nickname: child.nickname,
          age: child.age,
          gender: child.gender,
          grade: child.grade,
          avatar: child.avatar,
          creationStatus: child.creation_status as "pending" | "completed",
          createdAt: child.created_at,
          dateOfBirth: child.date_of_birth,
          relationshipToParent: child.relationship_to_parent,
          // Data from child_preferences table
          interests: preferencesData?.interests || [],
          challenges: preferencesData?.challenges || [],
          learningStyles: preferencesData?.learning_styles || [],
          selStrengths: preferencesData?.strengths || [],
          storyPreferences: preferencesData?.story_preferences || [],
          selChallenges: preferencesData?.challenges || [],
          // Data from child_progress table
          dailyCheckInCompleted: progressData?.daily_check_in_completed || false,
          lastCheckInDate: progressData?.last_check_in || "",
          xpPoints: progressData?.xp_points || 0,
          streakCount: progressData?.streak_count || 0,
          badges: progressData?.badges || []
        });
      }
      
      setChildProfiles(formattedProfiles);
      
      // If no current child selected and we have profiles, select the first one
      if (!currentChildId && formattedProfiles.length > 0) {
        setCurrentChildId(formattedProfiles[0].id);
      }
      
    } catch (error) {
      console.error("Error in refreshChildProfiles:", error);
    }
  };
  
  const fetchParentInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("parents")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching parent profile:", error);
        return;
      }
      
      if (data) {
        setParentInfo({
          id: data.id,
          name: data.name,
          relationship: data.relationship,
          email: data.email,
          emergencyContact: data.emergency_contact,
          additionalInfo: data.additional_info,
        });
      }
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
    }
  };

  const addChildProfile = async (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => {
    if (!user) return;
    
    try {
      // 1. Insert into children table
      const { data: childData, error: childError } = await supabase
        .from("children")
        .insert([
          {
            parent_id: user.id,
            nickname: profile.nickname,
            age: profile.age,
            gender: profile.gender,
            grade: profile.grade,
            avatar: profile.avatar,
            creation_status: profile.creationStatus,
            date_of_birth: profile.dateOfBirth,
            relationship_to_parent: profile.relationshipToParent
          }
        ])
        .select();
        
      if (childError || !childData || childData.length === 0) {
        console.error("Error adding child profile:", childError);
        return;
      }
      
      const childId = childData[0].id;
      
      // 2. Insert into child_preferences table
      const { error: prefError } = await supabase
        .from("child_preferences")
        .insert([{
          child_id: childId,
          interests: profile.interests || [],
          challenges: profile.challenges || [],
          learning_styles: profile.learningStyles || [],
          strengths: profile.selStrengths || [],
          story_preferences: profile.storyPreferences || []
        }]);
        
      if (prefError) {
        console.error("Error adding preferences:", prefError);
      }
      
      // 3. Insert into child_progress table
      const { error: progressError } = await supabase
        .from("child_progress")
        .insert([{
          child_id: childId,
          daily_check_in_completed: false,
          xp_points: 0,
          streak_count: 0,
          badges: []
        }]);
        
      if (progressError) {
        console.error("Error adding progress:", progressError);
      }
      
      await refreshChildProfiles();
      
      // Set the newly created profile as current
      if (childId) {
        setCurrentChildId(childId);
      }
      
    } catch (error) {
      console.error("Error in addChildProfile:", error);
    }
  };

  const updateChildProfile = async (id: string, profile: Partial<ChildProfile>) => {
    if (!user) return;
    
    try {
      // Update different tables based on what properties are being updated
      
      // 1. Update children table if needed
      if (
        profile.nickname !== undefined ||
        profile.age !== undefined ||
        profile.gender !== undefined ||
        profile.grade !== undefined ||
        profile.avatar !== undefined ||
        profile.creationStatus !== undefined ||
        profile.dateOfBirth !== undefined ||
        profile.relationshipToParent !== undefined
      ) {
        const childUpdate: any = {};
        
        if (profile.nickname !== undefined) childUpdate.nickname = profile.nickname;
        if (profile.age !== undefined) childUpdate.age = profile.age;
        if (profile.gender !== undefined) childUpdate.gender = profile.gender;
        if (profile.grade !== undefined) childUpdate.grade = profile.grade;
        if (profile.avatar !== undefined) childUpdate.avatar = profile.avatar;
        if (profile.creationStatus !== undefined) childUpdate.creation_status = profile.creationStatus;
        if (profile.dateOfBirth !== undefined) childUpdate.date_of_birth = profile.dateOfBirth;
        if (profile.relationshipToParent !== undefined) childUpdate.relationship_to_parent = profile.relationshipToParent;
        
        const { error } = await supabase
          .from("children")
          .update(childUpdate)
          .eq("id", id)
          .eq("parent_id", user.id);
          
        if (error) {
          console.error("Error updating child:", error);
          return;
        }
      }
      
      // 2. Update child_preferences table if needed
      if (
        profile.interests !== undefined ||
        profile.challenges !== undefined ||
        profile.learningStyles !== undefined ||
        profile.selStrengths !== undefined ||
        profile.storyPreferences !== undefined ||
        profile.selChallenges !== undefined
      ) {
        const prefUpdate: any = {};
        
        if (profile.interests !== undefined) prefUpdate.interests = profile.interests;
        if (profile.challenges !== undefined) prefUpdate.challenges = profile.challenges;
        if (profile.learningStyles !== undefined) prefUpdate.learning_styles = profile.learningStyles;
        if (profile.selStrengths !== undefined) prefUpdate.strengths = profile.selStrengths;
        if (profile.storyPreferences !== undefined) prefUpdate.story_preferences = profile.storyPreferences;
        if (profile.selChallenges !== undefined) prefUpdate.challenges = profile.selChallenges;
        
        const { error } = await supabase
          .from("child_preferences")
          .update(prefUpdate)
          .eq("child_id", id);
          
        if (error) {
          console.error("Error updating preferences:", error);
        }
      }
      
      // 3. Update child_progress table if needed
      if (
        profile.dailyCheckInCompleted !== undefined ||
        profile.lastCheckInDate !== undefined ||
        profile.xpPoints !== undefined ||
        profile.streakCount !== undefined ||
        profile.badges !== undefined
      ) {
        const progressUpdate: any = {};
        
        if (profile.dailyCheckInCompleted !== undefined) progressUpdate.daily_check_in_completed = profile.dailyCheckInCompleted;
        if (profile.lastCheckInDate !== undefined) progressUpdate.last_check_in = profile.lastCheckInDate;
        if (profile.xpPoints !== undefined) progressUpdate.xp_points = profile.xpPoints;
        if (profile.streakCount !== undefined) progressUpdate.streak_count = profile.streakCount;
        if (profile.badges !== undefined) progressUpdate.badges = profile.badges;
        
        const { error } = await supabase
          .from("child_progress")
          .update(progressUpdate)
          .eq("child_id", id);
          
        if (error) {
          console.error("Error updating progress:", error);
        }
      }
      
      // Update local state
      setChildProfiles(prev => 
        prev.map(child => 
          child.id === id 
            ? { ...child, ...profile } 
            : child
        )
      );
      
    } catch (error) {
      console.error("Error in updateChildProfile:", error);
    }
  };

  const removeChildProfile = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", id)
        .eq("parent_id", user.id);
        
      if (error) {
        console.error("Error removing child profile:", error);
        return;
      }
      
      // Clear current child if it's the one being removed
      if (currentChildId === id) {
        setCurrentChildId(null);
      }
      
      await refreshChildProfiles();
      
    } catch (error) {
      console.error("Error in removeChildProfile:", error);
    }
  };

  const deleteChildProfile = removeChildProfile; // Alias for compatibility

  const getCurrentChild = () => {
    return childProfiles.find(child => child.id === currentChildId) || null;
  };

  const markDailyCheckInComplete = (childId: string, date = new Date().toISOString()) => {
    // Update the local state
    setChildProfiles(prev => 
      prev.map(child => 
        child.id === childId 
          ? { 
              ...child, 
              dailyCheckInCompleted: true,
              lastCheckInDate: date
            } 
          : child
      )
    );
    
    // Update in the database
    updateChildProfile(childId, { 
      dailyCheckInCompleted: true,
      lastCheckInDate: date
    });
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

  const updateParentInfo = async (info: Partial<ParentInfo>) => {
    if (!user || !parentInfo) return;
    
    try {
      const dbProfile: any = {};
      
      if (info.name !== undefined) dbProfile.name = info.name;
      if (info.relationship !== undefined) dbProfile.relationship = info.relationship;
      if (info.email !== undefined) dbProfile.email = info.email;
      if (info.emergencyContact !== undefined) dbProfile.emergency_contact = info.emergencyContact;
      if (info.additionalInfo !== undefined) dbProfile.additional_info = info.additionalInfo;
      
      const { error } = await supabase
        .from("parents")
        .update(dbProfile)
        .eq("id", parentInfo.id);
        
      if (error) {
        console.error("Error updating parent info:", error);
        return;
      }
      
      setParentInfo(prev => prev ? { ...prev, ...info } : null);
      
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
    }
  };

  const setRelationshipToParent = async (childId: string, relationship: string) => {
    await updateChildProfile(childId, { relationshipToParent: relationship });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      setChildProfiles([]);
      setParentInfo(null);
      setCurrentChildId(null);
      navigate("/");
    }
  };

  const value = {
    user,
    childProfiles,
    parentInfo,
    currentChildId,
    isLoggedIn,
    addChildProfile,
    updateChildProfile,
    removeChildProfile,
    deleteChildProfile,
    setParentInfo,
    updateParentInfo,
    setCurrentChildId,
    getCurrentChild,
    markDailyCheckInComplete,
    refreshChildProfiles,
    logout,
    calculateAgeFromDOB,
    setRelationshipToParent,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
