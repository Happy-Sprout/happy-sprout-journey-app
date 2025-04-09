
import { createContext, useContext, useState, ReactNode } from "react";

// Types for our context
type ChildProfile = {
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

type ParentInfo = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  emergencyContact: string;
  additionalInfo?: string;
};

type UserContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  parentInfo: ParentInfo | null;
  setParentInfo: (info: ParentInfo | null) => void;
  updateParentInfo: (info: Partial<ParentInfo>) => void;
  childProfiles: ChildProfile[];
  setChildProfiles: (profiles: ChildProfile[]) => void;
  addChildProfile: (profile: ChildProfile) => void;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => void;
  deleteChildProfile: (id: string) => void;
  currentChildId: string | null;
  setCurrentChildId: (id: string | null) => void;
  getCurrentChild: () => ChildProfile | undefined;
  // New methods
  calculateAgeFromDOB: (dob: string) => number;
  markDailyCheckInComplete: (id: string) => void;
  setRelationshipToParent: (childId: string, relationship: string) => void;
};

// Create context with default values
const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  parentInfo: null,
  setParentInfo: () => {},
  updateParentInfo: () => {},
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
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);

  // Add a new child profile
  const addChildProfile = (profile: ChildProfile) => {
    setChildProfiles((prev) => [...prev, profile]);
  };

  // Update an existing child profile
  const updateChildProfile = (id: string, updatedInfo: Partial<ChildProfile>) => {
    setChildProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id ? { ...profile, ...updatedInfo } : profile
      )
    );
  };

  // Update parent info
  const updateParentInfo = (updatedInfo: Partial<ParentInfo>) => {
    setParentInfo((prev) => prev ? { ...prev, ...updatedInfo } : null);
  };

  // Delete a child profile
  const deleteChildProfile = (id: string) => {
    setChildProfiles((prev) => prev.filter((profile) => profile.id !== id));
    if (currentChildId === id) {
      setCurrentChildId(null);
    }
  };

  // Get the current active child profile
  const getCurrentChild = () => {
    return childProfiles.find((profile) => profile.id === currentChildId);
  };

  // Calculate age from date of birth
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

  // Mark daily check-in as completed for a child
  const markDailyCheckInComplete = (id: string) => {
    updateChildProfile(id, { dailyCheckInCompleted: true });
  };

  // Set relationship to parent for a child
  const setRelationshipToParent = (childId: string, relationship: string) => {
    updateChildProfile(childId, { relationshipToParent: relationship });
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        parentInfo,
        setParentInfo,
        updateParentInfo,
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUser = () => useContext(UserContext);
