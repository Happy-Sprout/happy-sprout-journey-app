
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
      }
    } catch (error) {
      console.error("Error in fetchJournalEntries:", error);
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
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
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
          }
        ])
        .select();
        
      if (error) {
        console.error("Error saving journal entry:", error);
        toast({
          title: "Error",
          description: "Could not save your journal entry. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return null;
      }
      
      console.log("Journal entry saved successfully:", data);
      
      if (data && data.length > 0) {
        const newEntry: JournalEntry = {
          id: data[0].id,
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
        
        setJournalEntries([newEntry, ...journalEntries]);
        toast({
          title: "Journal Entry Saved!",
          description: "Great job on completing your journal entry today.",
        });
        
        return newEntry;
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
    saveJournalEntry
  };
};
