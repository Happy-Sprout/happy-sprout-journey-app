
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
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching child profiles:", error);
        return;
      }
      
      // Transform the data to match the ChildProfile type
      const formattedProfiles = data.map(profile => ({
        id: profile.id,
        nickname: profile.nickname,
        age: profile.age,
        gender: profile.gender,
        grade: profile.grade,
        school: profile.school,
        interests: profile.interests,
        challenges: profile.challenges,
        avatar: profile.avatar,
        creationStatus: profile.creation_status,
        createdAt: profile.created_at,
        dailyCheckInCompleted: profile.daily_check_in_completed,
        lastCheckInDate: profile.last_check_in_date,
        dateOfBirth: profile.date_of_birth,
        relationshipToParent: profile.relationship_to_parent,
        xpPoints: profile.xp_points || 0,
        streakCount: profile.streak_count || 0,
        badges: profile.badges || [],
        learningStyles: profile.learning_styles || [],
        selStrengths: profile.sel_strengths || [],
        storyPreferences: profile.story_preferences || [],
        selChallenges: profile.sel_challenges || [],
      }));
      
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
      const { data, error } = await supabase
        .from("children")
        .insert([
          {
            parent_id: user.id,
            nickname: profile.nickname,
            age: profile.age,
            gender: profile.gender,
            grade: profile.grade,
            school: profile.school,
            interests: profile.interests,
            challenges: profile.challenges,
            avatar: profile.avatar,
            creation_status: profile.creationStatus,
            daily_check_in_completed: false,
            xp_points: 0,
            streak_count: 0,
            badges: [],
            date_of_birth: profile.dateOfBirth,
            relationship_to_parent: profile.relationshipToParent,
            learning_styles: profile.learningStyles,
            sel_strengths: profile.selStrengths,
            story_preferences: profile.storyPreferences,
            sel_challenges: profile.selChallenges,
          },
        ])
        .select();
        
      if (error) {
        console.error("Error adding child profile:", error);
        return;
      }
      
      await refreshChildProfiles();
      
      // Set the newly created profile as current
      if (data && data.length > 0) {
        setCurrentChildId(data[0].id);
      }
      
    } catch (error) {
      console.error("Error in addChildProfile:", error);
    }
  };

  const updateChildProfile = async (id: string, profile: Partial<ChildProfile>) => {
    if (!user) return;
    
    try {
      // Convert the profile object to the database schema
      const dbProfile: any = {};
      
      if (profile.nickname !== undefined) dbProfile.nickname = profile.nickname;
      if (profile.age !== undefined) dbProfile.age = profile.age;
      if (profile.gender !== undefined) dbProfile.gender = profile.gender;
      if (profile.grade !== undefined) dbProfile.grade = profile.grade;
      if (profile.school !== undefined) dbProfile.school = profile.school;
      if (profile.interests !== undefined) dbProfile.interests = profile.interests;
      if (profile.challenges !== undefined) dbProfile.challenges = profile.challenges;
      if (profile.avatar !== undefined) dbProfile.avatar = profile.avatar;
      if (profile.creationStatus !== undefined) dbProfile.creation_status = profile.creationStatus;
      if (profile.dailyCheckInCompleted !== undefined) dbProfile.daily_check_in_completed = profile.dailyCheckInCompleted;
      if (profile.lastCheckInDate !== undefined) dbProfile.last_check_in_date = profile.lastCheckInDate;
      if (profile.xpPoints !== undefined) dbProfile.xp_points = profile.xpPoints;
      if (profile.streakCount !== undefined) dbProfile.streak_count = profile.streakCount;
      if (profile.badges !== undefined) dbProfile.badges = profile.badges;
      if (profile.dateOfBirth !== undefined) dbProfile.date_of_birth = profile.dateOfBirth;
      if (profile.relationshipToParent !== undefined) dbProfile.relationship_to_parent = profile.relationshipToParent;
      if (profile.learningStyles !== undefined) dbProfile.learning_styles = profile.learningStyles;
      if (profile.selStrengths !== undefined) dbProfile.sel_strengths = profile.selStrengths;
      if (profile.storyPreferences !== undefined) dbProfile.story_preferences = profile.storyPreferences;
      if (profile.selChallenges !== undefined) dbProfile.sel_challenges = profile.selChallenges;
      
      const { error } = await supabase
        .from("children")
        .update(dbProfile)
        .eq("id", id)
        .eq("parent_id", user.id);
        
      if (error) {
        console.error("Error updating child profile:", error);
        return;
      }
      
      await refreshChildProfiles();
      
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
