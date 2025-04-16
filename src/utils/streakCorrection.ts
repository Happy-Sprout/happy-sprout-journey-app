
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, isSameDay, isYesterday } from "date-fns";

/**
 * One-time utility to correct streak counts for users who missed days
 * but didn't have their streak properly reset due to a previous bug.
 * 
 * This should be run once after deploying the streak calculation fix.
 */
export async function correctExistingStreakCounts() {
  try {
    console.log("Starting streak count correction process...");
    
    // Get all child progress records with streak_count > 0
    const { data: childProgress, error: fetchError } = await supabase
      .from('child_progress')
      .select('*')
      .gt('streak_count', 0);
      
    if (fetchError) {
      console.error("Error fetching child progress:", fetchError);
      return { success: false, error: fetchError.message };
    }
    
    console.log(`Found ${childProgress?.length || 0} children with non-zero streak counts to check`);
    
    // Track children needing updates
    const childrenToUpdate = [];
    const today = new Date();
    
    // Identify children whose streaks should be reset
    for (const child of childProgress || []) {
      if (!child.last_check_in) continue;
      
      const lastCheckInDate = new Date(child.last_check_in);
      
      // If last check-in was not yesterday and not today, reset streak
      if (!isYesterday(lastCheckInDate) && !isSameDay(lastCheckInDate, today)) {
        const daysMissed = differenceInDays(today, lastCheckInDate);
        console.log(`Child ${child.child_id} missed ${daysMissed} days. Last checked in on ${lastCheckInDate.toISOString()}`);
        childrenToUpdate.push(child.child_id);
      }
    }
    
    console.log(`Found ${childrenToUpdate.length} children needing streak count reset`);
    
    // Perform batch update if there are children to fix
    if (childrenToUpdate.length > 0) {
      // Use a transaction to update all records at once
      const { error: updateError } = await supabase
        .from('child_progress')
        .update({ streak_count: 0 })
        .in('child_id', childrenToUpdate);
        
      if (updateError) {
        console.error("Error updating streak counts:", updateError);
        return { success: false, error: updateError.message };
      }
      
      console.log(`Successfully reset streak counts for ${childrenToUpdate.length} children`);
      return { 
        success: true, 
        message: `Reset streak counts for ${childrenToUpdate.length} children who missed check-ins`,
        resetChildren: childrenToUpdate
      };
    }
    
    return { success: true, message: "No streak count corrections needed" };
  } catch (error) {
    console.error("Error in correctExistingStreakCounts:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
