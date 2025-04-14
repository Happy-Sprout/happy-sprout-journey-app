
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
import { useEmotionalInsights } from "@/hooks/useEmotionalInsights";
import { checkForBadgeUnlocks, getBadgeInfo } from "@/utils/childUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";

const Journal = () => {
  const { getCurrentChild, currentChildId, childProfiles, setChildProfiles } = useUser();
  const currentChild = getCurrentChild();
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentTab, setCurrentTab] = useState("new");
  const [todayEntryExists, setTodayEntryExists] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptHighlightId, setPromptHighlightId] = useState<number | null>(null);
  
  const { 
    journalEntries, 
    loading, 
    saveJournalEntry,
    getTodayEntry
  } = useJournalEntries(currentChildId);
  
  const { 
    analyzeEntry, 
    latestInsight,
    lowestSELArea
  } = useEmotionalInsights(currentChildId);

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
      // Include the selected prompt in the journal entry data
      const entryWithPrompt = {
        ...entry,
        selectedPrompt: selectedPrompt || null
      };
      
      const newEntry = await saveJournalEntry(entryWithPrompt);
      
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
                xp_earned: 15,
                prompt_used: selectedPrompt || null
              }
            }]);
          
          // Trigger emotional insight analysis
          const journalText = `
            What went well: ${entry.wentWell}
            What went badly: ${entry.wentBadly}
            Gratitude: ${entry.gratitude}
            Challenge: ${entry.challenge}
            Tomorrow's plan: ${entry.tomorrowPlan}
          `;
          
          // We'll call this in the background, we don't need to wait for it
          const newInsight = await analyzeEntry(journalText);
          
          // Check for SEL badge unlocks if we have an insight
          if (newInsight && currentChild) {
            const selScores = {
              selfAwareness: newInsight.self_awareness,
              selfManagement: newInsight.self_management, 
              socialAwareness: newInsight.social_awareness,
              relationshipSkills: newInsight.relationship_skills,
              responsibleDecisionMaking: newInsight.responsible_decision_making
            };
            
            const newBadges = checkForBadgeUnlocks(currentChild, {
              journalEntry: true,
              selScores
            });
            
            if (newBadges.length > 0) {
              // Update child badges in the database
              const combinedBadges = [...(currentChild.badges || []), ...newBadges];
              
              await supabase
                .from('child_progress')
                .update({ badges: combinedBadges })
                .eq('child_id', currentChildId);
                
              // Update in the local state as well
              if (childProfiles) {
                const updatedProfiles = childProfiles.map(profile => 
                  profile.id === currentChildId 
                    ? { ...profile, badges: combinedBadges } 
                    : profile
                );
                setChildProfiles(updatedProfiles);
              }
              
              // Show notification for new badges
              newBadges.forEach(badge => {
                const badgeInfo = getBadgeInfo(badge);
                successToast({
                  title: `New Badge Earned: ${badgeInfo.icon} ${badgeInfo.title}`,
                  description: badgeInfo.description
                });
              });
            }
          }
          
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

  // Handler to select a prompt for the journal
  const handleSelectPrompt = (prompt: string, index: number) => {
    setSelectedPrompt(prompt);
    // Highlight the selected prompt
    setPromptHighlightId(index);
    
    // Auto-scroll to the journal form
    setTimeout(() => {
      document.getElementById('journal-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 300);
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
              <>
                {lowestSELArea && (
                  <Card className="mb-8 border-l-4 border-l-amber-500">
                    <CardHeader>
                      <CardTitle className="text-xl">Growth Opportunity: {lowestSELArea.title}</CardTitle>
                      <CardDescription>{lowestSELArea.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Try one of these prompts to help develop this skill:</p>
                      <div className="space-y-3">
                        {lowestSELArea.prompts.map((prompt, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                              promptHighlightId === index ? 'bg-amber-50 border-amber-300' : 'hover:bg-slate-50 cursor-pointer'
                            }`}
                            onClick={() => handleSelectPrompt(prompt, index)}
                          >
                            <p className="text-sm">{prompt}</p>
                            <Button variant="ghost" size="sm">
                              <ArrowRightCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div id="journal-form">
                  <JournalEntryForm 
                    onSubmit={handleSubmitJournalEntry} 
                    loading={loading}
                    selectedPrompt={selectedPrompt}
                  />
                </div>
              </>
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
