
import { useAuth } from "./useAuth";
import { useParent } from "./useParent";
import { useChildren, type ChildProfile } from "./useChildren";
import type { ParentInfo } from "@/types/parentInfo";

// This hook combines all the functionality from the separate contexts
// for backwards compatibility
export const useUser = () => {
  const auth = useAuth();
  const parent = useParent();
  const children = useChildren();

  return {
    // Auth properties
    isLoggedIn: auth.isLoggedIn,
    loading: auth.loading,
    user: auth.user,
    session: auth.session,
    loginWithEmail: auth.loginWithEmail,
    signUpWithEmail: auth.signUpWithEmail,
    logout: auth.logout,
    
    // Parent properties
    parentInfo: parent.parentInfo,
    setParentInfo: parent.setParentInfo,
    updateParentInfo: parent.updateParentInfo,
    refreshParentInfo: parent.refreshParentInfo,
    fetchParentInfo: parent.fetchParentInfo,
    
    // Children properties
    childProfiles: children.childProfiles,
    setChildProfiles: children.setChildProfiles,
    addChildProfile: children.addChildProfile,
    updateChildProfile: children.updateChildProfile,
    removeChildProfile: children.deleteChildProfile,
    deleteChildProfile: children.deleteChildProfile,
    currentChildId: children.currentChildId,
    setCurrentChildId: children.setCurrentChildId,
    getCurrentChild: children.getCurrentChild,
    calculateAgeFromDOB: children.calculateAgeFromDOB,
    markDailyCheckInComplete: children.markDailyCheckInComplete,
    refreshChildProfiles: children.fetchChildProfiles,
    setRelationshipToParent: children.setRelationshipToParent
  };
};

// Re-export types for usage elsewhere
export type { ParentInfo, ChildProfile };
