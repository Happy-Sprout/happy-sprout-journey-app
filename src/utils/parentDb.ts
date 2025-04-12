
import { supabase } from "@/integrations/supabase/client";
import { ParentInfo } from "@/types/parentInfo";

// Cache for parent info to prevent excessive database calls
const parentInfoCache = new Map<string, {data: ParentInfo, timestamp: number}>();
const CACHE_TTL = 30000; // 30 seconds cache time

export async function fetchParentInfoById(userId: string) {
  try {
    // Check cache first
    const cachedInfo = parentInfoCache.get(userId);
    if (cachedInfo && (Date.now() - cachedInfo.timestamp) < CACHE_TTL) {
      return cachedInfo.data;
    }
    
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching parent data:", error);
      return null;
    }
    
    if (data) {
      const parentInfo = {
        id: data.id,
        name: data.name,
        relationship: data.relationship,
        email: data.email,
        emergencyContact: data.emergency_contact,
        additionalInfo: data.additional_info
      };
      
      // Update cache
      parentInfoCache.set(userId, {
        data: parentInfo,
        timestamp: Date.now()
      });
      
      return parentInfo;
    }
    
    return null;
  } catch (error) {
    console.error("Error in fetchParentInfoById:", error);
    return null;
  }
}

export async function createParentInfo(user: any) {
  try {
    if (!user?.id || !user.user_metadata?.name) {
      console.error("Missing user data for creating parent record");
      return null;
    }
    
    const newParent = {
      id: user.id,
      name: user.user_metadata.name as string,
      relationship: "Parent",
      email: user.email || "",
      emergency_contact: ""
    };
    
    const { error: insertError } = await supabase
      .from('parents')
      .insert([newParent]);
      
    if (insertError) {
      console.error("Error creating parent record:", insertError);
      return null;
    }
    
    const parentInfo = {
      id: newParent.id,
      name: newParent.name,
      relationship: newParent.relationship,
      email: newParent.email,
      emergencyContact: newParent.emergency_contact,
    };
    
    // Update cache
    parentInfoCache.set(user.id, {
      data: parentInfo,
      timestamp: Date.now()
    });
    
    return parentInfo;
  } catch (error) {
    console.error("Error in createParentInfo:", error);
    return null;
  }
}

export async function saveParentInfo(info: ParentInfo) {
  try {
    const { error } = await supabase
      .from('parents')
      .upsert({
        id: info.id,
        name: info.name,
        relationship: info.relationship,
        email: info.email,
        emergency_contact: info.emergencyContact,
        additional_info: info.additionalInfo
      });
      
    if (error) {
      console.error("Error saving parent info:", error);
      return false;
    }
    
    // Update cache
    parentInfoCache.set(info.id, {
      data: info,
      timestamp: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error in saveParentInfo:", error);
    return false;
  }
}

export async function updateParentInfoFields(parentId: string, updatedFields: Partial<ParentInfo>) {
  try {
    const update: any = {};
    if (updatedFields.name !== undefined) update.name = updatedFields.name;
    if (updatedFields.relationship !== undefined) update.relationship = updatedFields.relationship;
    if (updatedFields.email !== undefined) update.email = updatedFields.email;
    if (updatedFields.emergencyContact !== undefined) update.emergency_contact = updatedFields.emergencyContact;
    if (updatedFields.additionalInfo !== undefined) update.additional_info = updatedFields.additionalInfo;
    
    // Ensure we have fields to update
    if (Object.keys(update).length === 0) {
      console.warn("No fields to update for parent:", parentId);
      return true; // Return true as this isn't an error
    }
    
    const { error } = await supabase
      .from('parents')
      .update(update)
      .eq('id', parentId);
      
    if (error) {
      console.error("Error updating parent info:", error);
      return false;
    }
    
    // Update cache if it exists
    const cachedInfo = parentInfoCache.get(parentId);
    if (cachedInfo) {
      parentInfoCache.set(parentId, {
        data: { ...cachedInfo.data, ...updatedFields },
        timestamp: Date.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateParentInfoFields:", error);
    return false;
  }
}

// Clear cache for a specific parent
export function clearParentCache(parentId: string) {
  parentInfoCache.delete(parentId);
}

// Clear all cache
export function clearAllParentCache() {
  parentInfoCache.clear();
}
