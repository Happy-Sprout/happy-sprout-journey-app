
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { JournalHistory } from "@/components/journal/JournalHistory";
import { DEFAULT_FILTERS } from "@/types/journal";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { successToast } from "@/components/ui/toast-extensions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const Journal = () => {
  const { getCurrentChild, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentTab, setCurrentTab] = useState("new");
  const [todayEntryExists, setTodayEntryExists] = useState(false);
  
  const { 
    journalEntries, 
    loading, 
    saveJournalEntry,
    getTodayEntry
  } = useJournalEntries(currentChildId);

  useEffect(() => {
    if (!currentChildId) return;
    
    const checkTodayEntry = async () => {
      try {
        const entry = await getTodayEntry();
        setTodayEntryExists(!!entry);
      } catch (error) {
        console.error("Error checking today's entry:", error);
      }
    };
    
    checkTodayEntry();
  }, [currentChildId, getTodayEntry]);

  const handleSubmitJournalEntry = async (entry: any) => {
    if (!currentChild) {
      successToast({
        title: "No child profile selected",
        description: "Please select a child profile to continue"
      });
      return null;
    }
    
    if (todayEntryExists) {
      successToast({
        title: "Journal entry limit reached",
        description: "You've already created a journal entry today. Come back tomorrow!"
      });
      return null;
    }
    
    try {
      const newEntry = await saveJournalEntry(entry);
      
      if (newEntry) {
        try {
          // Log activity with XP earned
          await supabase
            .from('user_activity_logs')
            .insert([{
              user_id: currentChildId,
              user_type: 'child',
              action_type: 'journal_entry_completed',
              action_details: {
                date: new Date().toISOString(),
                xp_earned: 15
              }
            }]);
          
          // Check if user completed both check-in and journal today for bonus XP
          const { data: todayCheckIn } = await supabase
            .from('user_activity_logs')
            .select('*')
            .eq('user_id', currentChildId)
            .eq('action_type', 'daily_checkin_completed')
            .gte('created_at', new Date().toISOString().split('T')[0])
            .single();
            
          if (todayCheckIn) {
            // Award bonus XP for completing both activities
            const { data: progressData } = await supabase
              .from('child_progress')
              .select('xp_points')
              .eq('child_id', currentChildId)
              .single();
              
            if (progressData) {
              await supabase
                .from('child_progress')
                .update({ xp_points: (progressData.xp_points || 0) + 5 })
                .eq('child_id', currentChildId);
                
              // Log the bonus XP
              await supabase
                .from('user_activity_logs')
                .insert([{
                  user_id: currentChildId,
                  user_type: 'child',
                  action_type: 'daily_activities_bonus',
                  action_details: {
                    date: new Date().toISOString(),
                    xp_earned: 5
                  }
                }]);
                
              successToast({
                title: "Daily Bonus Achieved!",
                description: "You completed both your check-in and journal today! +5 XP bonus awarded!"
              });
            }
          }
        } catch (error) {
          console.error("Error handling XP rewards:", error);
        }
        
        setTodayEntryExists(true);
        setCurrentTab("history");
        return newEntry;
      }
      return null;
    } catch (error) {
      console.error("Error submitting journal entry:", error);
      return null;
    }
  };

  return (
    <Layout requireAuth>
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold mb-2">My Awesome Journal</h1>
        <p className="text-gray-600 mb-8">
          Record your thoughts, feelings, and experiences from today.
        </p>
        
        <Tabs defaultValue="new" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 font-nunito">
            <TabsTrigger value="new">New Entry</TabsTrigger>
            <TabsTrigger value="history">Journal History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
            {todayEntryExists ? (
              <div className="sprout-card text-center py-8">
                <h2 className="text-2xl font-bold text-sprout-purple mb-4">You've completed today's journal entry!</h2>
                <p className="mb-6 text-lg">
                  Great job! You earned 15 XP. You can come back tomorrow to write another entry.
                </p>
                <button 
                  className="sprout-button"
                  onClick={() => setCurrentTab("history")}
                >
                  View Journal History
                </button>
              </div>
            ) : (
              <JournalEntryForm 
                onSubmit={handleSubmitJournalEntry} 
                loading={loading} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <JournalHistory 
              entries={journalEntries}
              filters={filters}
              setFilters={setFilters}
              onNewEntry={() => setCurrentTab("new")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Journal;
