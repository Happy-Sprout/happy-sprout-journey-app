
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@supabase/supabase-js";

// Types for child profiles
type ChildProfile = {
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
  lastCheckInDate?: string; // Add lastCheckInDate property
  xpPoints: number;
  streakCount: number;
  badges: string[];
};

// Types for parent profiles
type ParentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  preferences?: {
    notifications?: boolean;
    emailUpdates?: boolean;
    childProgressReports?: boolean;
  };
};

type UserContextType = {
  user: User | null;
  childProfiles: ChildProfile[];
  parentProfile: ParentProfile | null;
  currentChildId: string | null;
  addChildProfile: (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => Promise<void>;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => Promise<void>;
  removeChildProfile: (id: string) => Promise<void>;
  setParentProfile: (profile: ParentProfile) => void;
  setCurrentChildId: (id: string | null) => void;
  getCurrentChild: () => ChildProfile | null;
  markDailyCheckInComplete: (childId: string, date?: string) => void;
  refreshChildProfiles: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const user = session?.user || null;
  const navigate = useNavigate();
  
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  
  // Load child profiles when user changes
  useEffect(() => {
    if (user) {
      refreshChildProfiles();
      fetchParentProfile();
    } else {
      setChildProfiles([]);
      setParentProfile(null);
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
        .from("child_profiles")
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
        xpPoints: profile.xp_points || 0,
        streakCount: profile.streak_count || 0,
        badges: profile.badges || [],
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
  
  const fetchParentProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching parent profile:", error);
        return;
      }
      
      if (data) {
        setParentProfile({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          preferences: data.preferences,
        });
      }
    } catch (error) {
      console.error("Error in fetchParentProfile:", error);
    }
  };

  const addChildProfile = async (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("child_profiles")
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
      
      const { error } = await supabase
        .from("child_profiles")
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
        .from("child_profiles")
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
              lastCheckInDate: date // Store the date of completion
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

  const value = {
    user,
    childProfiles,
    parentProfile,
    currentChildId,
    addChildProfile,
    updateChildProfile,
    removeChildProfile,
    setParentProfile,
    setCurrentChildId,
    getCurrentChild,
    markDailyCheckInComplete,
    refreshChildProfiles,
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

