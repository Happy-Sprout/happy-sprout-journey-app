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

export interface ChildrenContextType {
  childProfiles: ChildProfile[];
  setChildProfiles: (profiles: ChildProfile[]) => void;
  addChildProfile: (profile: Omit<ChildProfile, "id" | "createdAt" | "xpPoints" | "streakCount" | "badges">) => Promise<string | undefined>;
  updateChildProfile: (id: string, updatedInfo: Partial<ChildProfile>) => Promise<void>;
  deleteChildProfile: (id: string) => Promise<void>;
  currentChildId: string | null;
  setCurrentChildId: (id: string | null) => void;
  getCurrentChild: () => ChildProfile | undefined;
  calculateAgeFromDOB: (dateOfBirth: string) => number;
  markDailyCheckInComplete: (childId: string, date?: string) => void;
  fetchChildProfiles: (parentId: string) => Promise<void>;
  setRelationshipToParent: (childId: string, relationship: string) => Promise<void>;
  isSubmittingProfile: boolean;
}
