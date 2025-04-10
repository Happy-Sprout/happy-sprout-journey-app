
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { JournalEntry, DBJournalEntry } from "@/types/journal";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const useJournalEntries = (childId: string | undefined) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (childId) {
      fetchJournalEntries();
    }
  }, [childId]);

  const fetchJournalEntries = async () => {
    if (!childId) return;
    
    try {
      console.log("Fetching journal entries for child:", childId);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching journal entries:", error);
        toast({
          title: "Error",
          description: "Could not fetch journal entries. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Journal entries found:", data);
        const formattedEntries: JournalEntry[] = data.map((entry: DBJournalEntry) => ({
          id: entry.id,
          childId: entry.child_id,
          date: format(new Date(entry.created_at), "yyyy-MM-dd"),
          mood: entry.mood_intensity || 5,
          water: entry.water || 4,
          sleep: entry.sleep || 7,
          exercise: entry.exercise || 3,
          mindfulness: entry.mindfulness || 5,
          kindness: entry.kindness || 5,
          positivity: entry.positivity || 6,
          confidence: entry.confidence || 5,
          wentWell: entry.went_well || "",
          wentBadly: entry.went_badly || "",
          gratitude: entry.gratitude || "",
          challenge: entry.challenge || "",
          tomorrowPlan: entry.tomorrow_plan || "",
          completed: true
        }));
        
        setJournalEntries(formattedEntries);
      } else {
        console.log("No journal entries found for child:", childId);
        setJournalEntries([]);
      }
    } catch (error) {
      console.error("Error in fetchJournalEntries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch journal entries. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTodayEntry = async (): Promise<JournalEntry | null> => {
    if (!childId) return null;
    
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('child_id', childId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error("Error checking for today's entry:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log("Found today's entry:", data[0]);
        return {
          id: data[0].id,
          childId: data[0].child_id,
          date: format(new Date(data[0].created_at), "yyyy-MM-dd"),
          mood: data[0].mood_intensity || 5,
          water: data[0].water || 4,
          sleep: data[0].sleep || 7,
          exercise: data[0].exercise || 3,
          mindfulness: data[0].mindfulness || 5,
          kindness: data[0].kindness || 5,
          positivity: data[0].positivity || 6,
          confidence: data[0].confidence || 5,
          wentWell: data[0].went_well || "",
          wentBadly: data[0].went_badly || "",
          gratitude: data[0].gratitude || "",
          challenge: data[0].challenge || "",
          tomorrowPlan: data[0].tomorrow_plan || "",
          completed: true
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error checking for today's entry:", error);
      return null;
    }
  };

  const saveJournalEntry = async (entry: Omit<JournalEntry, "id" | "childId" | "date" | "completed">) => {
    if (!childId) {
      toast({
        title: "No child profile selected",
        description: "Please select a child profile to continue",
        variant: "destructive",
      });
      return null;
    }
    
    setLoading(true);
    
    try {
      console.log("Saving journal entry for child:", childId);
      console.log("Entry data:", entry);
      
      // Check if there's already an entry for today
      const todayEntry = await getTodayEntry();
      
      const journalData = {
        child_id: childId,
        title: `Journal Entry - ${format(new Date(), "MMMM d, yyyy")}`,
        content: `${entry.wentWell}\n\n${entry.wentBadly}\n\n${entry.gratitude}\n\n${entry.challenge}\n\n${entry.tomorrowPlan}`,
        mood: "neutral",
        mood_intensity: entry.mood,
        water: entry.water,
        sleep: entry.sleep,
        exercise: entry.exercise,
        mindfulness: entry.mindfulness,
        kindness: entry.kindness,
        positivity: entry.positivity,
        confidence: entry.confidence,
        went_well: entry.wentWell,
        went_badly: entry.wentBadly,
        gratitude: entry.gratitude,
        challenge: entry.challenge,
        tomorrow_plan: entry.tomorrowPlan
      };
      
      let result;
      
      if (todayEntry) {
        // Update today's entry
        console.log("Updating existing journal entry for today with ID:", todayEntry.id);
        result = await supabase
          .from('journal_entries')
          .update(journalData)
          .eq('id', todayEntry.id)
          .select();
          
        if (result.error) {
          console.error("Error updating journal entry:", result.error);
          toast({
            title: "Error",
            description: "Could not update your journal entry. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return null;
        }
        
        console.log("Journal entry updated successfully:", result.data);
        
        // Update state with the updated entry
        const updatedEntry: JournalEntry = {
          id: todayEntry.id,
          childId: childId,
          date: format(new Date(), "yyyy-MM-dd"),
          mood: entry.mood,
          water: entry.water,
          sleep: entry.sleep,
          exercise: entry.exercise,
          mindfulness: entry.mindfulness,
          kindness: entry.kindness,
          positivity: entry.positivity,
          confidence: entry.confidence,
          wentWell: entry.wentWell,
          wentBadly: entry.wentBadly,
          gratitude: entry.gratitude,
          challenge: entry.challenge,
          tomorrowPlan: entry.tomorrowPlan,
          completed: true,
        };
        
        // Update the state to replace the old entry with the new one
        setJournalEntries(prevEntries => {
          const filtered = prevEntries.filter(e => e.id !== todayEntry.id);
          return [updatedEntry, ...filtered];
        });
        
        toast({
          title: "Journal Entry Updated!",
          description: "Your journal entry for today has been updated.",
        });
        
        return updatedEntry;
      } else {
        // Create new entry
        console.log("Creating new journal entry for today");
        result = await supabase
          .from('journal_entries')
          .insert([journalData])
          .select();
          
        if (result.error) {
          console.error("Error saving journal entry:", result.error);
          toast({
            title: "Error",
            description: "Could not save your journal entry. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return null;
        }
        
        console.log("Journal entry saved successfully:", result.data);
        
        if (result.data && result.data.length > 0) {
          const newEntry: JournalEntry = {
            id: result.data[0].id,
            childId: childId,
            date: format(new Date(), "yyyy-MM-dd"),
            mood: entry.mood,
            water: entry.water,
            sleep: entry.sleep,
            exercise: entry.exercise,
            mindfulness: entry.mindfulness,
            kindness: entry.kindness,
            positivity: entry.positivity,
            confidence: entry.confidence,
            wentWell: entry.wentWell,
            wentBadly: entry.wentBadly,
            gratitude: entry.gratitude,
            challenge: entry.challenge,
            tomorrowPlan: entry.tomorrowPlan,
            completed: true,
          };
          
          // Award XP for completing a journal entry (15 XP as per requirements)
          try {
            const { data: childData } = await supabase
              .from('child_progress')
              .select('xp_points')
              .eq('child_id', childId)
              .single();
              
            if (childData) {
              const currentXP = childData.xp_points || 0;
              const newXP = currentXP + 15; // Award 15 XP for journal entry
              
              await supabase
                .from('child_progress')
                .update({ xp_points: newXP })
                .eq('child_id', childId);
                
              console.log(`Awarded 15 XP for journal entry. New total: ${newXP}`);
              
              // Log activity
              await supabase
                .from('user_activity_logs')
                .insert([{
                  user_id: childId,
                  user_type: 'child',
                  action_type: 'journal_entry_completed',
                  action_details: {
                    date: new Date().toISOString(),
                    xp_earned: 15
                  }
                }]);
            }
          } catch (xpError) {
            console.error("Error awarding XP:", xpError);
            // Continue even if XP award fails
          }
          
          setJournalEntries(prevEntries => [newEntry, ...prevEntries]);
          toast({
            title: "Journal Entry Saved!",
            description: "Great job on completing your journal entry today. You earned 15 XP!",
          });
          
          return newEntry;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error in saveJournalEntry:", error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    journalEntries,
    loading,
    fetchJournalEntries,
    saveJournalEntry,
    getTodayEntry
  };
};
