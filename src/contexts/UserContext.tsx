import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Session, User } from "@supabase/supabase-js";

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
  calculateAgeFromDOB: (dob: string) => number;
  markDailyCheckInComplete: (id: string) => void;
  setRelationshipToParent: (childId: string, relationship: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  user: User | null;
  session: Session | null;
};

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
  loginWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  loading: false,
  user: null,
  session: null,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
        
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setParentInfo(null);
          setChildProfiles([]);
          setCurrentChildId(null);
        }
      }
    );
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
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
        const { data: preferencesData } = await supabase
          .from('child_preferences')
          .select('*')
          .eq('child_id', child.id)
          .maybeSingle();
          
        const { data: progressData } = await supabase
          .from('child_progress')
          .select('*')
          .eq('child_id', child.id)
          .maybeSingle();
          
        profiles.push({
          id: child.id,
          nickname: child.nickname,
          age: child.age,
          dateOfBirth: child.date_of_birth,
          gender: child.gender,
          grade: child.grade,
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
  
  const fetchUserData = async (userId: string) => {
    try {
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (parentError) {
        console.error("Error fetching parent data:", parentError);
      } else if (parentData) {
        setParentInfo({
          id: parentData.id,
          name: parentData.name,
          relationship: parentData.relationship,
          email: parentData.email,
          emergencyContact: parentData.emergency_contact,
          additionalInfo: parentData.additional_info
        });
      }
      
      await fetchChildProfiles(userId);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addChildProfile = async (profile: ChildProfile) => {
    if (!parentInfo) return;
    
    try {
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          id: profile.id,
          parent_id: parentInfo.id,
          nickname: profile.nickname,
          age: profile.age,
          date_of_birth: profile.dateOfBirth,
          gender: profile.gender,
          grade: profile.grade,
          avatar: profile.avatar,
          creation_status: profile.creationStatus,
          relationship_to_parent: profile.relationshipToParent
        })
        .select()
        .single();
        
      if (childError) {
        console.error("Error adding child:", childError);
        toast({
          title: "Error",
          description: "Could not add child profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      await supabase
        .from('child_preferences')
        .insert({
          child_id: profile.id,
          learning_styles: profile.learningStyles,
          strengths: profile.selStrengths,
          interests: profile.interests,
          story_preferences: profile.storyPreferences,
          challenges: profile.selChallenges
        });
        
      await supabase
        .from('child_progress')
        .insert({
          child_id: profile.id,
          streak_count: profile.streakCount,
          xp_points: profile.xpPoints,
          badges: profile.badges,
          daily_check_in_completed: profile.dailyCheckInCompleted
        });
      
      setChildProfiles((prev) => [...prev, profile]);
      
      toast({
        title: "Success",
        description: `Profile for ${profile.nickname} created successfully!`
      });
      
      if (childProfiles.length === 0) {
        setCurrentChildId(profile.id);
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

  const updateParentInfo = async (updatedInfo: Partial<ParentInfo>) => {
    if (!isLoggedIn) return;
    
    try {
      const update: any = {};
      if (updatedInfo.name) update.name = updatedInfo.name;
      if (updatedInfo.relationship) update.relationship = updatedInfo.relationship;
      if (updatedInfo.email) update.email = updatedInfo.email;
      if (updatedInfo.emergencyContact) update.emergency_contact = updatedInfo.emergencyContact;
      if (updatedInfo.additionalInfo) update.additional_info = updatedInfo.additionalInfo;
      
      const { error } = await supabase
        .from('parents')
        .update(update)
        .eq('id', parentInfo?.id || '');
        
      if (error) {
        console.error("Error updating parent info:", error);
        toast({
          title: "Error",
          description: "Could not update profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setParentInfo((prev) => {
        if (!prev) {
          if (
            !updatedInfo.name ||
            !updatedInfo.relationship ||
            !updatedInfo.email ||
            !updatedInfo.emergencyContact ||
            !updatedInfo.id
          ) {
            console.error("Missing required fields for parent info");
            return null;
          }
          return updatedInfo as ParentInfo;
        }
        
        return { ...prev, ...updatedInfo };
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error("Error in updateParentInfo:", error);
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
  
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      setIsLoggedIn(true);
      toast({
        title: "Login successful",
        description: "Welcome back to Happy Sprout!"
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("User creation failed");
      }
      
      const { error: parentError } = await supabase
        .from('parents')
        .insert({
          id: data.user.id,
          name: name,
          relationship: "Parent",
          email: email,
          emergency_contact: ""
        });
        
      if (parentError) {
        console.error("Error creating parent record:", parentError);
      }
      
      setIsLoggedIn(true);
      setUser(data.user);
      setSession(data.session);
      
      if (data.session) {
        toast({
          title: "Registration successful",
          description: "Welcome to Happy Sprout!"
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account."
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setParentInfo(null);
      setChildProfiles([]);
      setCurrentChildId(null);
      setUser(null);
      setSession(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out. Please try again.",
        variant: "destructive"
      });
    }
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
        loginWithEmail,
        signUpWithEmail,
        logout,
        loading,
        user,
        session
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
