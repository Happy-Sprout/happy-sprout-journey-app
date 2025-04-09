
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
    
    console.log("Handling journal entry submission:", entry);
    console.log("Current child:", currentChild);
    
    const newEntry = await saveJournalEntry(entry);
    
    if (newEntry) {
      console.log("Journal entry saved, updating XP points");
      
      // Only award XP if this was a new entry, not an update
      if (!todayEntryExists && currentChild && typeof currentChild.xpPoints === 'number') {
        updateChildProfile(currentChild.id, {
          xpPoints: currentChild.xpPoints + 15,
        });
        console.log("XP points updated");
      } else if (todayEntryExists) {
        console.log("No XP awarded for updating an existing entry");
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
            <TabsTrigger value="new">{todayEntryExists ? "Edit Today's Entry" : "New Entry"}</TabsTrigger>
            <TabsTrigger value="history">Journal History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
            {todayEntryExists ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
                <p className="text-amber-800">
                  You've already created a journal entry today. Any changes will update your existing entry.
                </p>
              </div>
            ) : null}
            
            <JournalEntryForm 
              onSubmit={handleSubmitJournalEntry} 
              loading={loading} 
            />
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
