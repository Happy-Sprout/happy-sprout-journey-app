import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useParent } from "./useParent";
import * as childrenDb from "@/utils/childrenDb";
import { getCurrentChild, calculateAgeFromDOB, markDailyCheckInComplete } from "@/utils/childUtils";
import { setRelationshipToParent as setChildRelationship } from "@/utils/childRelationshipUtils";
import { ChildProfile, ChildrenContextType } from "@/types/childProfile";

const ChildrenContext = createContext<ChildrenContextType>({
  childProfiles: [],
  setChildProfiles: () => {},
  addChildProfile: async () => undefined,
  updateChildProfile: async () => {},
  deleteChildProfile: async () => {},
  currentChildId: null,
  setCurrentChildId: () => {},
  getCurrentChild: () => undefined,
  calculateAgeFromDOB: () => 0,
  markDailyCheckInComplete: () => {},
  fetchChildProfiles: async () => {},
  setRelationshipToParent: async () => {},
  isSubmittingProfile: false
});

export const ChildrenProvider = ({ children }: { children: ReactNode }) => {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { parentInfo } = useParent();
  
  const fetchChildProfiles = useCallback(async (parentId: string) => {
    if (!parentInfo) {
      console.log("Parent info not available yet, will fetch children later");
      return;
    }
    
    try {
      console.log("Fetching child profiles for parent:", parentId);
      const profiles = await childrenDb.fetchChildrenProfiles(parentId);
      console.log("Fetched profiles:", profiles);
      setChildProfiles(profiles);
      
      if (!currentChildId && profiles.length > 0) {
        console.log("Setting current child to first profile:", profiles[0].id);
        setCurrentChildId(profiles[0].id);
      }
    } catch (error) {
      console.error("Error in fetchChildProfiles:", error);
    }
  }, [parentInfo, currentChildId]);
  
  useEffect(() => {
    if (user?.id) {
      fetchChildProfiles(user.id);
    }
  }, [user?.id, parentInfo, fetchChildProfiles]);
  
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
  
  const addChildProfile = useCallback(async (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">): Promise<string | undefined> => {
    if (isSubmittingProfile) {
      console.log("Submission already in progress, ignoring duplicate request");
      return undefined;
    }
    
    if (!user || !parentInfo) {
      console.error("Cannot add child profile: no user logged in or parent profile not created");
      toast({
        title: "Error",
        description: "Parent profile must be created before adding a child. Please try again.",
        variant: "destructive"
      });
      return undefined;
    }
    
    try {
      setIsSubmittingProfile(true);
      
      const existingProfile = childProfiles.find(
        child => child.nickname === profile.nickname && 
                child.dateOfBirth === profile.dateOfBirth
      );
      
      if (existingProfile) {
        toast({
          title: "Profile already exists",
          description: `A profile for ${profile.nickname} with the same date of birth already exists.`,
          variant: "destructive"
        });
        return undefined;
      }
      
      const childId = await childrenDb.createChildProfile(user.id, profile);
      console.log("Child profile created with ID:", childId);
      
      const updatedProfiles = await childrenDb.fetchChildrenProfiles(user.id);
      console.log("Updated child profiles after creation:", updatedProfiles);
      
      setChildProfiles(updatedProfiles);
      
      toast({
        title: "Success",
        description: `Profile for ${profile.nickname} created successfully!`
      });
      
      setCurrentChildId(childId);
      
      return childId;
    } catch (error) {
      console.error("Error in addChildProfile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
      return undefined;
    } finally {
      setIsSubmittingProfile(false);
    }
  }, [user, parentInfo, toast, childProfiles, isSubmittingProfile]);
  
  const updateChildProfile = useCallback(async (id: string, updatedInfo: Partial<ChildProfile>) => {
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
  }, [childProfiles, toast]);
  
  const deleteChildProfile = useCallback(async (id: string) => {
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
  }, [childProfiles, currentChildId, toast]);
  
  const getChildById = useCallback(() => getCurrentChild(childProfiles, currentChildId), [childProfiles, currentChildId]);
  
  const handleMarkDailyCheckInComplete = useCallback((childId: string, date = new Date().toISOString()) => {
    markDailyCheckInComplete(childId, childProfiles, setChildProfiles, date);
  }, [childProfiles]);
  
  const handleSetRelationshipToParent = useCallback(async (childId: string, relationship: string) => {
    await setChildRelationship(childId, relationship, updateChildProfile);
  }, [updateChildProfile]);
  
  const contextValue = useMemo(() => ({
    childProfiles,
    setChildProfiles,
    addChildProfile,
    updateChildProfile,
    deleteChildProfile,
    currentChildId,
    setCurrentChildId,
    getCurrentChild: getChildById,
    calculateAgeFromDOB,
    markDailyCheckInComplete: handleMarkDailyCheckInComplete,
    setRelationshipToParent: handleSetRelationshipToParent,
    fetchChildProfiles,
    isSubmittingProfile
  }), [
    childProfiles, 
    setChildProfiles,
    addChildProfile, 
    updateChildProfile, 
    deleteChildProfile, 
    currentChildId,
    setCurrentChildId, 
    getChildById, 
    handleMarkDailyCheckInComplete, 
    handleSetRelationshipToParent,
    fetchChildProfiles,
    isSubmittingProfile
  ]);
  
  return (
    <ChildrenContext.Provider value={contextValue}>
      {children}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => useContext(ChildrenContext);
export type { ChildProfile };
