
import { useState } from "react";
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
  
  const { 
    journalEntries, 
    loading, 
    saveJournalEntry 
  } = useJournalEntries(currentChildId);

  const handleSubmitJournalEntry = async (entry: any) => {
    if (!currentChild) {
      toast({
        title: "No child profile selected",
        description: "Please select a child profile to continue",
        variant: "destructive",
      });
      return null;
    }
    
    const newEntry = await saveJournalEntry(entry);
    
    if (newEntry) {
      if (currentChild && typeof currentChild.xpPoints === 'number') {
        updateChildProfile(currentChild.id, {
          xpPoints: currentChild.xpPoints + 15,
        });
      } else {
        console.warn("Cannot update XP points: currentChild or xpPoints is undefined");
      }
      
      setCurrentTab("history");
      return newEntry;
    }
    
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="new">New Entry</TabsTrigger>
            <TabsTrigger value="history">Journal History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
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
