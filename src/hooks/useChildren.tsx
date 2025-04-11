
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useParent } from "./useParent";
import * as childrenDb from "@/utils/childrenDb";

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

type ChildrenContextType = {
  childProfiles: ChildProfile[];
  setChildProfiles: (profiles: ChildProfile[]) => void;
  addChildProfile: (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => Promise<void>;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => Promise<void>;
  deleteChildProfile: (id: string) => Promise<void>;
  currentChildId: string | null;
  setCurrentChildId: (id: string | null) => void;
  getCurrentChild: () => ChildProfile | undefined;
  calculateAgeFromDOB: (dob: string) => number;
  markDailyCheckInComplete: (childId: string, date?: string) => void;
  fetchChildProfiles: (userId: string) => Promise<void>;
  setRelationshipToParent: (childId: string, relationship: string) => Promise<void>;
};

const ChildrenContext = createContext<ChildrenContextType>({
  childProfiles: [],
  setChildProfiles: () => {},
  addChildProfile: async () => {},
  updateChildProfile: async () => {},
  deleteChildProfile: async () => {},
  currentChildId: null,
  setCurrentChildId: () => {},
  getCurrentChild: () => undefined,
  calculateAgeFromDOB: () => 0,
  markDailyCheckInComplete: () => {},
  fetchChildProfiles: async () => {},
  setRelationshipToParent: async () => {},
});

export const ChildrenProvider = ({ children }: { children: ReactNode }) => {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { parentInfo } = useParent();
  
  useEffect(() => {
    if (user?.id) {
      fetchChildProfiles(user.id);
    }
  }, [user, parentInfo]);
  
  useEffect(() => {
    const savedChildId = localStorage.getItem("currentChildId");
    if (savedChildId) {
      setCurrentChildId(savedChildId);
    }
  }, []);

  useEffect(() => {
    if (currentChildId) {
      localStorage.setItem("currentChildId", currentChildId);
    } else {
      localStorage.removeItem("currentChildId");
    }
  }, [currentChildId]);
  
  const fetchChildProfiles = async (parentId: string) => {
    if (!parentInfo) {
      console.log("Parent info not available yet, will fetch children later");
      return;
    }
    
    try {
      const profiles = await childrenDb.fetchChildrenProfiles(parentId);
      setChildProfiles(profiles);
      
      if (!currentChildId && profiles.length > 0) {
        console.log("Setting current child to first profile:", profiles[0].id);
        setCurrentChildId(profiles[0].id);
      }
    } catch (error) {
      console.error("Error in fetchChildProfiles:", error);
    }
  };
  
  const addChildProfile = async (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => {
    if (!user || !parentInfo) {
      console.error("Cannot add child profile: no user logged in or parent profile not created");
      toast({
        title: "Error",
        description: "Parent profile must be created before adding a child. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create child profile in the database
      const childId = await childrenDb.createChildProfile(user.id, profile);
      
      // Refresh child profiles
      try {
        if (user.id) {
          await fetchChildProfiles(user.id);
        }
        
        // Show success message
        toast({
          title: "Success",
          description: `Profile for ${profile.nickname} created successfully!`
        });
        
        // Set the newly created profile as current
        setCurrentChildId(childId);
      } catch (error) {
        console.error("Error fetching updated profiles:", error);
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
      
      await childrenDb.updateChildProfile(id, updatedInfo);
      
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
      await childrenDb.deleteChildProfile(id);
      
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

  const markDailyCheckInComplete = (childId: string, date = new Date().toISOString()) => {
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
        })
        .catch(error => {
          console.error("Error marking daily check-in:", error);
        });
    } catch (error) {
      console.error("Error in markDailyCheckInComplete:", error);
    }
  };

  const setRelationshipToParent = async (childId: string, relationship: string) => {
    await updateChildProfile(childId, { relationshipToParent: relationship });
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
