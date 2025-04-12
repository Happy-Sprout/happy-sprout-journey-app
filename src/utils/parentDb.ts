
import { supabase } from "@/integrations/supabase/client";
import { ParentInfo } from "@/types/parentInfo";

// Cache for parent info to prevent excessive database calls
const parentInfoCache = new Map<string, {data: ParentInfo, timestamp: number}>();
const CACHE_TTL = 300000; // 5 minutes cache time (increased from 30 seconds)
const CACHE_ERROR_LOCK = new Map<string, number>(); // Prevent hammering the database on errors
const ERROR_LOCK_TIME = 5000; // 5 seconds lock time after errors

export async function fetchParentInfoById(userId: string) {
  try {
    console.log("fetchParentInfoById called for:", userId);
    
    // Check if we had a recent error for this user
    const errorLockTime = CACHE_ERROR_LOCK.get(userId);
    if (errorLockTime && (Date.now() - errorLockTime) < ERROR_LOCK_TIME) {
      console.log("Error lock active for user, using cache if available");
      const cachedInfo = parentInfoCache.get(userId);
      return cachedInfo?.data || null;
    }
    
    // Check cache first
    const cachedInfo = parentInfoCache.get(userId);
    if (cachedInfo && (Date.now() - cachedInfo.timestamp) < CACHE_TTL) {
      console.log("Using cached parent info for user:", userId);
      return cachedInfo.data;
    }
    
    console.log("Fetching fresh parent info from database for user:", userId);
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching parent data:", error);
      // Add to error lock to prevent hammering
      CACHE_ERROR_LOCK.set(userId, Date.now());
      return cachedInfo?.data || null; // Return cached data as fallback
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
    // Add to error lock to prevent hammering
    CACHE_ERROR_LOCK.set(userId, Date.now());
    const cachedInfo = parentInfoCache.get(userId);
    return cachedInfo?.data || null; // Return cached data as fallback
  }
}

export async function createParentInfo(user: any) {
  try {
    if (!user?.id || !user.user_metadata?.name) {
      console.error("Missing user data for creating parent record");
      return null;
    }
    
    // Check if a record already exists before creating
    const existingParent = await fetchParentInfoById(user.id);
    if (existingParent) {
      console.log("Parent record already exists, returning existing record");
      return existingParent;
    }
    
    console.log("Creating new parent record for user:", user.id);
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
    
    // Clear any error locks
    CACHE_ERROR_LOCK.delete(user.id);
    
    return parentInfo;
  } catch (error) {
    console.error("Error in createParentInfo:", error);
    return null;
  }
}

export async function saveParentInfo(info: ParentInfo) {
  try {
    console.log("Saving parent info for:", info.id);
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
    
    // Clear any error locks
    CACHE_ERROR_LOCK.delete(info.id);
    
    return true;
  } catch (error) {
    console.error("Error in saveParentInfo:", error);
    return false;
  }
}

export async function updateParentInfoFields(parentId: string, updatedFields: Partial<ParentInfo>) {
  try {
    console.log("Updating parent info fields for:", parentId);
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
    
    // Clear any error locks
    CACHE_ERROR_LOCK.delete(parentId);
    
    return true;
  } catch (error) {
    console.error("Error in updateParentInfoFields:", error);
    return false;
  }
}

// Clear cache for a specific parent
export function clearParentCache(parentId: string) {
  console.log("Clearing parent cache for:", parentId);
  parentInfoCache.delete(parentId);
  CACHE_ERROR_LOCK.delete(parentId);
}

// Clear all cache
export function clearAllParentCache() {
  console.log("Clearing all parent cache");
  parentInfoCache.clear();
  CACHE_ERROR_LOCK.clear();
}
