
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { JournalHistory } from "@/components/journal/JournalHistory";
import { DEFAULT_FILTERS } from "@/types/journal";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Journal = () => {
  const { getCurrentChild, updateChildProfile, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  const { toast } = useToast();
  
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
    const checkTodayEntry = async () => {
      const entry = await getTodayEntry();
      setTodayEntryExists(!!entry);
    };
    
    if (currentChildId) {
      checkTodayEntry();
    }
  }, [currentChildId, getTodayEntry]);

  const handleSubmitJournalEntry = async (entry: any) => {
    if (!currentChild) {
      toast({
        title: "No child profile selected",
        description: "Please select a child profile to continue",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if an entry already exists for today before saving
    if (todayEntryExists) {
      toast({
        title: "Journal entry limit reached",
        description: "You've already created a journal entry today. Come back tomorrow!",
        variant: "destructive",
      });
      return null;
    }
    
    console.log("Handling journal entry submission:", entry);
    console.log("Current child:", currentChild);
    
    const newEntry = await saveJournalEntry(entry);
    
    if (newEntry) {
      console.log("Journal entry saved, updating XP points");
      
      if (currentChild && typeof currentChild.xpPoints === 'number') {
        updateChildProfile(currentChild.id, {
          xpPoints: currentChild.xpPoints + 15,
        });
        console.log("XP points updated");
      } else {
        console.warn("Cannot update XP points: currentChild or xpPoints is undefined");
      }
      
      setTodayEntryExists(true);
      setCurrentTab("history");
      return newEntry;
    }
    
    console.log("Failed to save journal entry");
    return null;
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
                  Great job! You can come back tomorrow to write another entry.
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
