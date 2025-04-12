
import { supabase } from "@/integrations/supabase/client";
import { ParentInfo } from "@/types/parentInfo";

export async function fetchParentInfoById(userId: string) {
  try {
    console.log("Fetching parent info for user:", userId);
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
      console.log("Parent data found:", data);
      return {
        id: data.id,
        name: data.name,
        relationship: data.relationship,
        email: data.email,
        emergencyContact: data.emergency_contact,
        additionalInfo: data.additional_info
      };
    }
    
    console.log("No parent data found for user:", userId);
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
    
    console.log("Creating parent record for user:", user.id);
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
    
    console.log("Parent record created successfully");
    
    return {
      id: newParent.id,
      name: newParent.name,
      relationship: newParent.relationship,
      email: newParent.email,
      emergencyContact: newParent.emergency_contact,
    };
  } catch (error) {
    console.error("Error in createParentInfo:", error);
    return null;
  }
}

export async function saveParentInfo(info: ParentInfo) {
  try {
    console.log("Setting parent info:", info);
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
      console.error("Error setting parent info:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in saveParentInfo:", error);
    return false;
  }
}

export async function updateParentInfoFields(parentId: string, updatedFields: Partial<ParentInfo>) {
  try {
    console.log("Updating parent info:", updatedFields);
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
    
    return true;
  } catch (error) {
    console.error("Error in updateParentInfoFields:", error);
    return false;
  }
}
