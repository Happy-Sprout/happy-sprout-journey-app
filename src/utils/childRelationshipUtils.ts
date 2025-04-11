
import * as childrenDb from "@/utils/childrenDb";

export const setRelationshipToParent = async (childId: string, relationship: string, updateChildProfile: (id: string, profile: any) => Promise<void>) => {
  await updateChildProfile(childId, { relationshipToParent: relationship });
};
