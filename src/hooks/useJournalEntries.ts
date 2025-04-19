
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { successToast, warningToast } from "@/components/ui/toast-extensions";
import { JournalEntry, DBJournalEntry } from "@/types/journal";
import { format, startOfDay, endOfDay, parseISO, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const useJournalEntries = (childId: string | undefined) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayEntryLoaded, setTodayEntryLoaded] = useState(false);
  const [cachedTodayEntry, setCachedTodayEntry] = useState<JournalEntry | null>(null);

  const formatDateString = useCallback((date: Date | string): string => {
    if (typeof date === 'string') {
      const parsedDate = parseISO(date);
      if (!isValid(parsedDate)) {
        console.error("Invalid date string:", date);
        return format(new Date(), "yyyy-MM-dd");
      }
      return format(parsedDate, "yyyy-MM-dd");
    }
    return format(date, "yyyy-MM-dd");
  }, []);

  const getTodayDateString = useCallback((): string => {
    return formatDateString(new Date());
  }, [formatDateString]);

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
        warningToast({
          title: "Error",
          description: "Could not fetch journal entries. Please try again."
        });
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Journal entries found:", data);
        const formattedEntries: JournalEntry[] = data.map((entry: DBJournalEntry) => ({
          id: entry.id,
          childId: entry.child_id,
          date: formatDateString(new Date(entry.created_at)),
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
        
        const todayDateString = getTodayDateString();
        console.log("Checking for today's entry with date:", todayDateString);
        
        const todayEntry = formattedEntries.find(entry => {
          const entryMatches = entry.date === todayDateString;
          console.log(`Entry date: ${entry.date}, matches today (${todayDateString}): ${entryMatches}`);
          return entryMatches;
        });
        
        if (todayEntry) {
          console.log("Today's entry found in fetched entries:", todayEntry);
          setCachedTodayEntry(todayEntry);
          setTodayEntryLoaded(true);
        } else {
          console.log("No entry found for today:", todayDateString);
          setCachedTodayEntry(null);
          setTodayEntryLoaded(true);
        }
      } else {
        console.log("No journal entries found for child:", childId);
        setJournalEntries([]);
        setCachedTodayEntry(null);
        setTodayEntryLoaded(true);
      }
    } catch (error) {
      console.error("Error in fetchJournalEntries:", error);
      warningToast({
        title: "Error",
        description: "Failed to fetch journal entries. Please try again."
      });
    }
  };

  const getTodayEntry = useCallback(async (): Promise<JournalEntry | null> => {
    if (!childId) return null;
    
    if (todayEntryLoaded) {
      console.log("Using cached today's entry status:", !!cachedTodayEntry);
      return cachedTodayEntry;
    }
    
    try {
      // Get today's date in YYYY-MM-DD format, zeroed to start of day
      const todayString = getTodayDateString();
      
      // Format for SQL query, using UTC midnight to end of day
      const todayStart = `${todayString}T00:00:00.000Z`;
      const todayEnd = `${todayString}T23:59:59.999Z`;
      
      console.log("Checking for journal entry between:", todayStart, "and", todayEnd);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('child_id', childId)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error("Error checking for today's entry:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log("Found today's entry:", data[0]);
        const todayEntry = {
          id: data[0].id,
          childId: data[0].child_id,
          date: formatDateString(new Date(data[0].created_at)),
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
        
        setCachedTodayEntry(todayEntry);
        setTodayEntryLoaded(true);
        
        return todayEntry;
      }
      
      setTodayEntryLoaded(true);
      setCachedTodayEntry(null);
      return null;
    } catch (error) {
      console.error("Error checking for today's entry:", error);
      return null;
    }
  }, [childId, cachedTodayEntry, todayEntryLoaded, formatDateString, getTodayDateString]);

  const saveJournalEntry = async (entry: Omit<JournalEntry, "id" | "childId" | "date" | "completed">) => {
    if (!childId) {
      warningToast({
        title: "No child profile selected",
        description: "Please select a child profile to continue"
      });
      return null;
    }
    
    setLoading(true);
    
    try {
      console.log("Saving journal entry for child:", childId);
      console.log("Entry data:", entry);
      
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
      let savedEntry: JournalEntry | null = null;
      
      if (todayEntry) {
        console.log("Updating existing journal entry for today with ID:", todayEntry.id);
        result = await supabase
          .from('journal_entries')
          .update(journalData)
          .eq('id', todayEntry.id)
          .select();
          
        if (result.error) {
          console.error("Error updating journal entry:", result.error);
          warningToast({
            title: "Error",
            description: "Could not update your journal entry. Please try again."
          });
          setLoading(false);
          return null;
        }
        
        console.log("Journal entry updated successfully:", result.data);
        
        const updatedEntry: JournalEntry = {
          id: todayEntry.id,
          childId: childId,
          date: formatDateString(new Date()),
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
        
        setJournalEntries(prevEntries => {
          const filtered = prevEntries.filter(e => e.id !== todayEntry.id);
          return [updatedEntry, ...filtered];
        });
        
        savedEntry = updatedEntry;
        
        successToast({
          title: "Journal Entry Updated!",
          description: "Your journal entry for today has been updated.",
        });
      } else {
        console.log("Creating new journal entry for today");
        result = await supabase
          .from('journal_entries')
          .insert([journalData])
          .select();
          
        if (result.error) {
          console.error("Error saving journal entry:", result.error);
          warningToast({
            title: "Error",
            description: "Could not save your journal entry. Please try again."
          });
          setLoading(false);
          return null;
        }
        
        console.log("Journal entry saved successfully:", result.data);
        
        if (result.data && result.data.length > 0) {
          const newEntry: JournalEntry = {
            id: result.data[0].id,
            childId: childId,
            date: formatDateString(new Date()),
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
          
          try {
            const { data: childData } = await supabase
              .from('child_progress')
              .select('xp_points')
              .eq('child_id', childId)
              .single();
              
            if (childData) {
              const currentXP = childData.xp_points || 0;
              const newXP = currentXP + 15;
              
              await supabase
                .from('child_progress')
                .update({ xp_points: newXP })
                .eq('child_id', childId);
                
              console.log(`Awarded 15 XP for journal entry. New total: ${newXP}`);
            }
          } catch (xpError) {
            console.error("Error awarding XP:", xpError);
          }
          
          setJournalEntries(prevEntries => [newEntry, ...prevEntries]);
          savedEntry = newEntry;
          
          successToast({
            title: "Journal Entry Saved!",
            description: "Great job on completing your journal entry today. You earned 15 XP!",
          });
        }
      }
      
      if (savedEntry) {
        try {
          await fetch('https://ghucegvhempgmdykosiw.functions.supabase.co/analyze-emotional-growth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              journalText: journalData.content,
              childId: childId
            })
          });
          console.log("Emotional growth analysis triggered");
        } catch (analysisError) {
          console.error("Error triggering emotional growth analysis:", analysisError);
        }
      }
      
      return savedEntry;
    } catch (error) {
      console.error("Error in saveJournalEntry:", error);
      warningToast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again."
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
    getTodayEntry,
    todayEntryLoaded,
    cachedTodayEntry,
    getTodayDateString
  };
};
