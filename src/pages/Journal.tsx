import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { CheckCircle, ChevronDown, Clock, HeartPulse, Mic, Droplet, Save, Heart, Sun } from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import { JournalFilters } from "@/components/JournalFilters";
import { supabase } from "@/integrations/supabase/client";

type JournalEntry = {
  id: string;
  childId: string;
  date: string;
  mood: number;
  water: number;
  sleep: number;
  exercise: number;
  mindfulness: number;
  kindness: number;
  positivity: number;
  confidence: number;
  wentWell: string;
  wentBadly: string;
  gratitude: string;
  challenge: string;
  tomorrowPlan: string;
  completed?: boolean;
};

interface DBJournalEntry {
  id: string;
  child_id: string;
  created_at: string;
  title: string;
  content: string;
  mood: string;
  mood_intensity: number;
  water: number;
  sleep: number;
  exercise: number;
  mindfulness: number;
  kindness: number;
  positivity: number;
  confidence: number;
  went_well: string;
  went_badly: string;
  gratitude: string;
  challenge: string;
  tomorrow_plan: string;
}

const DEFAULT_FILTERS = {
  startDate: undefined,
  endDate: undefined,
  searchTerm: "",
  moodFilter: "",
};

const Journal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentChild, updateChildProfile, currentChildId } = useUser();
  const currentChild = getCurrentChild();
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  
  const [mood, setMood] = useState(5);
  const [water, setWater] = useState(4);
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState(3);
  const [mindfulness, setMindfulness] = useState(5);
  const [kindness, setKindness] = useState(5);
  const [positivity, setPositivity] = useState(6);
  const [confidence, setConfidence] = useState(5);
  
  const [wentWell, setWentWell] = useState("");
  const [wentBadly, setWentBadly] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [challenge, setChallenge] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  
  const [currentTab, setCurrentTab] = useState("new");
  const [isRecording, setIsRecording] = useState(false);
  
  useEffect(() => {
    if (currentChildId) {
      fetchJournalEntries();
    }
  }, [currentChildId]);
  
  const fetchJournalEntries = async () => {
    if (!currentChildId) return;
    
    try {
      console.log("Fetching journal entries for child:", currentChildId);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('child_id', currentChildId)
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
        console.log("No journal entries found for child:", currentChildId);
      }
    } catch (error) {
      console.error("Error in fetchJournalEntries:", error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentChild) {
      toast({
        title: "No child profile selected",
        description: "Please select a child profile to continue",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Saving journal entry for child:", currentChild.id);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            child_id: currentChild.id,
            title: `Journal Entry - ${format(new Date(), "MMMM d, yyyy")}`,
            content: `${wentWell}\n\n${wentBadly}\n\n${gratitude}\n\n${challenge}\n\n${tomorrowPlan}`,
            mood: "neutral",
            mood_intensity: mood,
            water: water,
            sleep: sleep,
            exercise: exercise,
            mindfulness: mindfulness,
            kindness: kindness,
            positivity: positivity,
            confidence: confidence,
            went_well: wentWell,
            went_badly: wentBadly,
            gratitude: gratitude,
            challenge: challenge,
            tomorrow_plan: tomorrowPlan
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
        return;
      }
      
      console.log("Journal entry saved successfully:", data);
      
      if (data && data.length > 0) {
        const newEntry: JournalEntry = {
          id: data[0].id,
          childId: currentChild.id,
          date: format(new Date(), "yyyy-MM-dd"),
          mood,
          water,
          sleep,
          exercise,
          mindfulness,
          kindness,
          positivity,
          confidence,
          wentWell,
          wentBadly,
          gratitude,
          challenge,
          tomorrowPlan,
          completed: true,
        };
        
        setJournalEntries([newEntry, ...journalEntries]);
      }
      
      if (currentChild && typeof currentChild.xpPoints === 'number') {
        updateChildProfile(currentChild.id, {
          xpPoints: currentChild.xpPoints + 15,
        });
      } else {
        console.warn("Cannot update XP points: currentChild or xpPoints is undefined");
      }
      
      toast({
        title: "Journal Entry Saved!",
        description: "Great job on completing your journal entry today.",
      });
      
      resetForm();
      setCurrentTab("history");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setMood(5);
    setWater(4);
    setSleep(7);
    setExercise(3);
    setMindfulness(5);
    setKindness(5);
    setPositivity(6);
    setConfidence(5);
    setWentWell("");
    setWentBadly("");
    setGratitude("");
    setChallenge("");
    setTomorrowPlan("");
  };
  
  const toggleRecording = (field: string) => {
    setIsRecording(!isRecording);
    if (isRecording) {
      toast({
        title: "Recording stopped",
        description: "Your audio has been converted to text.",
      });
      
      setTimeout(() => {
        const sampleResponses: Record<string, string> = {
          wentWell: "I had a great time playing with my friends at recess today.",
          wentBadly: "I got frustrated during math class when I couldn't solve a problem.",
          gratitude: "I'm thankful for my family and the delicious dinner we had.",
          challenge: "I found it hard to focus on my homework this evening.",
          tomorrowPlan: "I want to remember to bring my library book back to school.",
        };
        
        switch (field) {
          case "wentWell":
            setWentWell(sampleResponses.wentWell);
            break;
          case "wentBadly":
            setWentBadly(sampleResponses.wentBadly);
            break;
          case "gratitude":
            setGratitude(sampleResponses.gratitude);
            break;
          case "challenge":
            setChallenge(sampleResponses.challenge);
            break;
          case "tomorrowPlan":
            setTomorrowPlan(sampleResponses.tomorrowPlan);
            break;
        }
      }, 1000);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };
  
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.startDate ||
      !!filters.endDate ||
      !!filters.searchTerm ||
      !!filters.moodFilter
    );
  }, [filters]);
  
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };
  
  const filteredEntries = useMemo(() => {
    let filtered = journalEntries.filter(entry => {
      if (!currentChildId) return false;
      return entry.childId === currentChildId;
    });
    
    if (filters.startDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isAfter(entryDate, filters.startDate) || entry.date === format(filters.startDate, "yyyy-MM-dd");
      });
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isBefore(entryDate, filters.endDate) || entry.date === format(filters.endDate, "yyyy-MM-dd");
      });
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        return (
          entry.wentWell.toLowerCase().includes(searchLower) ||
          entry.wentBadly.toLowerCase().includes(searchLower) ||
          entry.gratitude.toLowerCase().includes(searchLower) ||
          entry.challenge.toLowerCase().includes(searchLower) ||
          entry.tomorrowPlan.toLowerCase().includes(searchLower)
        );
      });
    }
    
    if (filters.moodFilter) {
      const [high, low] = filters.moodFilter.split("-").map(Number);
      filtered = filtered.filter(entry => {
        return entry.mood <= high && entry.mood >= low;
      });
    }
    
    return filtered;
  }, [journalEntries, filters, currentChildId]);
  
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
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Date</CardTitle>
                    <CardDescription>
                      {format(new Date(), "EEEE, MMMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>My Mood Today:</Label>
                          <span>{mood}/10</span>
                        </div>
                        <Slider
                          value={[mood]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) => setMood(value[0])}
                          className="mb-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>😢</span>
                          <span>😐</span>
                          <span>😊</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="flex items-center">
                            <Droplet className="w-4 h-4 mr-1" /> Water Intake:
                          </Label>
                          <span>{water} glasses</span>
                        </div>
                        <Slider
                          value={[water]}
                          min={0}
                          max={8}
                          step={1}
                          onValueChange={(value) => setWater(value[0])}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> Sleep Hours:
                          </Label>
                          <span>{sleep} hours</span>
                        </div>
                        <Slider
                          value={[sleep]}
                          min={0}
                          max={12}
                          step={0.5}
                          onValueChange={(value) => setSleep(value[0])}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="flex items-center">
                            <HeartPulse className="w-4 h-4 mr-1" /> Exercise Level:
                          </Label>
                          <span>{exercise}/10</span>
                        </div>
                        <Slider
                          value={[exercise]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={(value) => setExercise(value[0])}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>My Daily Trackers</CardTitle>
                    <CardDescription>
                      How did you do with these important activities today?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Mindfulness Practice:</Label>
                          <span>{mindfulness}/10</span>
                        </div>
                        <Slider
                          value={[mindfulness]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={(value) => setMindfulness(value[0])}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Kind Actions:</Label>
                          <span>{kindness}/10</span>
                        </div>
                        <Slider
                          value={[kindness]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={(value) => setKindness(value[0])}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Positivity Level:</Label>
                          <span>{positivity}/10</span>
                        </div>
                        <Slider
                          value={[positivity]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={(value) => setPositivity(value[0])}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Confidence Level:</Label>
                          <span>{confidence}/10</span>
                        </div>
                        <Slider
                          value={[confidence]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={(value) => setConfidence(value[0])}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>My Journal Reflection</CardTitle>
                  <CardDescription>
                    Share your thoughts about today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="wentWell" className="block mb-2">
                        What went well today?
                      </Label>
                      <div className="flex">
                        <Textarea
                          id="wentWell"
                          value={wentWell}
                          onChange={(e) => setWentWell(e.target.value)}
                          placeholder="I'm proud of..."
                          className="min-h-24 sprout-input flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-2"
                          onClick={() => toggleRecording("wentWell")}
                        >
                          <Mic className={`h-4 w-4 ${isRecording ? "text-red-500" : ""}`} />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="wentBadly" className="block mb-2">
                        What didn't go so well?
                      </Label>
                      <div className="flex">
                        <Textarea
                          id="wentBadly"
                          value={wentBadly}
                          onChange={(e) => setWentBadly(e.target.value)}
                          placeholder="I struggled with..."
                          className="min-h-24 sprout-input flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-2"
                          onClick={() => toggleRecording("wentBadly")}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="gratitude" className="block mb-2">
                          3 things I'm thankful for:
                        </Label>
                        <div className="flex">
                          <Textarea
                            id="gratitude"
                            value={gratitude}
                            onChange={(e) => setGratitude(e.target.value)}
                            placeholder="I'm thankful for..."
                            className="min-h-24 sprout-input flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={() => toggleRecording("gratitude")}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="challenge" className="block mb-2">
                          Today's challenge:
                        </Label>
                        <div className="flex">
                          <Textarea
                            id="challenge"
                            value={challenge}
                            onChange={(e) => setChallenge(e.target.value)}
                            placeholder="I found it difficult to..."
                            className="min-h-24 sprout-input flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={() => toggleRecording("challenge")}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="tomorrowPlan" className="block mb-2">
                          Tomorrow's plan:
                        </Label>
                        <div className="flex">
                          <Textarea
                            id="tomorrowPlan"
                            value={tomorrowPlan}
                            onChange={(e) => setTomorrowPlan(e.target.value)}
                            placeholder="Tomorrow I will..."
                            className="min-h-24 sprout-input flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={() => toggleRecording("tomorrowPlan")}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  Reset
                </Button>
                <Button className="sprout-button" type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Journal Entry"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="history">
            <JournalFilters 
              filters={filters}
              setFilters={setFilters}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />
            
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">
                  {hasActiveFilters 
                    ? "No Entries Match Your Filters" 
                    : "No Journal Entries Yet"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? "Try adjusting or clearing your filters to see more entries."
                    : "Start writing in your journal to see your entries here."}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                ) : (
                  <Button className="sprout-button" onClick={() => setCurrentTab("new")}>
                    Create First Entry
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEntries.map((entry) => (
                  <Card key={entry.id} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{formatDate(entry.date)}</CardTitle>
                        <div className="text-xl">
                          {entry.mood >= 8 ? "😄" : entry.mood >= 5 ? "🙂" : entry.mood >= 3 ? "😐" : "😔"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer list-none">
                          <div className="font-medium">Daily Trackers</div>
                          <div className="transition-transform group-open:rotate-180">
                            <ChevronDown className="h-5 w-5" />
                          </div>
                        </summary>
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center">
                              <Droplet className="w-4 h-4 mr-1 text-blue-500" /> Water: {entry.water} glasses
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-purple-500" /> Sleep: {entry.sleep} hours
                            </div>
                            <div className="flex items-center">
                              <HeartPulse className="w-4 h-4 mr-1 text-red-500" /> Exercise: {entry.exercise}/10
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Mindfulness: {entry.mindfulness}/10
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1 text-pink-500" /> Kind Acts: {entry.kindness}/10
                            </div>
                            <div className="flex items-center">
                              <Sun className="w-4 h-4 mr-1 text-yellow-500" /> Positivity: {entry.positivity}/10
                            </div>
                          </div>
                        </div>
                      </details>
                      
                      <div className="mt-4 space-y-3">
                        {entry.wentWell && (
                          <div>
                            <div className="font-medium text-sprout-green">What went well:</div>
                            <p className="text-gray-700 mt-1">{entry.wentWell}</p>
                          </div>
                        )}
                        
                        {entry.wentBadly && (
                          <div>
                            <div className="font-medium text-sprout-orange">What didn't go well:</div>
                            <p className="text-gray-700 mt-1">{entry.wentBadly}</p>
                          </div>
                        )}
                        
                        {entry.gratitude && (
                          <div>
                            <div className="font-medium text-sprout-purple">Gratitude:</div>
                            <p className="text-gray-700 mt-1">{entry.gratitude}</p>
                          </div>
                        )}
                        
                        {entry.challenge && (
                          <div>
                            <div className="font-medium text-sprout-orange">Challenge:</div>
                            <p className="text-gray-700 mt-1">{entry.challenge}</p>
                          </div>
                        )}
                        
                        {entry.tomorrowPlan && (
                          <div>
                            <div className="font-medium text-sprout-green">Tomorrow's Plan:</div>
                            <p className="text-gray-700 mt-1">{entry.tomorrowPlan}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Journal;
