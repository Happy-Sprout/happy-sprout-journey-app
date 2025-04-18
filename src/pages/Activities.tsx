
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarDays, Check, List, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import WellnessRadarChart from "@/components/wellness/WellnessRadarChart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Activities = () => {
  const navigate = useNavigate();
  const { getCurrentChild, currentChildId } = useUser();
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [dailyCheckInCompleted, setDailyCheckInCompleted] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  // Use a stable key for view mode state to prevent unintended re-renders
  const [viewMode, setViewMode] = useState<"list" | "visual">("list");
  const currentChild = getCurrentChild();
  const { getTodayEntry } = useJournalEntries(currentChildId);

  useEffect(() => {
    const checkTodayJournalEntry = async () => {
      if (currentChildId) {
        const entry = await getTodayEntry();
        console.log("Found today's entry:", entry);
        setJournalCompleted(!!entry);
        setTodayEntry(entry);
      }
    };
    
    checkTodayJournalEntry();
  }, [currentChildId, getTodayEntry]);

  useEffect(() => {
    if (currentChild) {
      const isToday = (date) => {
        if (!date) return false;
        const checkInDate = new Date(date);
        const today = new Date();
        return checkInDate.toDateString() === today.toDateString();
      };
      
      setDailyCheckInCompleted(
        currentChild.dailyCheckInCompleted && 
        isToday(currentChild.lastCheckInDate)
      );
    }
  }, [currentChild]);

  // Memoize the handler to prevent unnecessary re-renders
  const handleViewModeChange = (value: string | null) => {
    if (value) {
      setViewMode(value as "list" | "visual");
    }
  };

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Daily Activities</h1>
        
        <div className="mb-6">
          <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
            <ToggleGroupItem value="list" aria-label="List View" className="flex items-center gap-2 z-0">
              <List className="h-4 w-4" />
              List View
            </ToggleGroupItem>
            <ToggleGroupItem value="visual" aria-label="Visual View" className="flex items-center gap-2 z-0">
              <Activity className="h-4 w-4" />
              Visual View
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {viewMode === "list" ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex flex-col sm:flex-row items-start sm:items-center p-3 ${dailyCheckInCompleted ? 'bg-sprout-green/10' : 'bg-sprout-orange/10'} rounded-lg`}>
                  <div className={`mr-4 ${dailyCheckInCompleted ? 'bg-sprout-green' : 'bg-sprout-orange'} text-white p-2 rounded-full mb-2 sm:mb-0`}>
                    {dailyCheckInCompleted ? <Check className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h3 className="font-medium">How are you feeling today?</h3>
                    <p className="text-sm text-gray-600">
                      {dailyCheckInCompleted 
                        ? "You've completed today's check-in!" 
                        : "Share your emotions and energy levels"}
                    </p>
                  </div>
                  <Button 
                    className="sm:ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full mt-2 sm:mt-0 z-0"
                    onClick={() => navigate("/daily-check-in")}
                    disabled={dailyCheckInCompleted}
                  >
                    {dailyCheckInCompleted ? 'Completed' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journal Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex flex-col sm:flex-row items-start sm:items-center p-3 ${journalCompleted ? 'bg-sprout-green/10' : 'bg-sprout-purple/10'} rounded-lg`}>
                  <div className={`mr-4 ${journalCompleted ? 'bg-sprout-green' : 'bg-sprout-purple'} text-white p-2 rounded-full mb-2 sm:mb-0`}>
                    {journalCompleted ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h3 className="font-medium">Write in your journal</h3>
                    <p className="text-sm text-gray-600">
                      {journalCompleted 
                        ? "You've written your journal entry for today!" 
                        : "Express your thoughts and feelings"}
                    </p>
                  </div>
                  <Button 
                    className="sm:ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full mt-2 sm:mt-0 z-0"
                    onClick={() => navigate("/journal")}
                    disabled={journalCompleted}
                  >
                    {journalCompleted ? 'Completed' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Wellness Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <WellnessRadarChart journalEntry={todayEntry} />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Check-in</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center p-3 ${dailyCheckInCompleted ? 'bg-sprout-green/10' : 'bg-sprout-orange/10'} rounded-lg`}>
                    <div className={`mr-4 ${dailyCheckInCompleted ? 'bg-sprout-green' : 'bg-sprout-orange'} text-white p-2 rounded-full mb-2 sm:mb-0`}>
                      {dailyCheckInCompleted ? <Check className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 mb-2 sm:mb-0">
                      <h3 className="font-medium">How are you feeling today?</h3>
                      <p className="text-sm text-gray-600">
                        {dailyCheckInCompleted 
                          ? "You've completed today's check-in!" 
                          : "Share your emotions and energy levels"}
                      </p>
                    </div>
                    <Button 
                      className="sm:ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full mt-2 sm:mt-0 z-0"
                      onClick={() => navigate("/daily-check-in")}
                      disabled={dailyCheckInCompleted}
                    >
                      {dailyCheckInCompleted ? 'Completed' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Journal Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center p-3 ${journalCompleted ? 'bg-sprout-green/10' : 'bg-sprout-purple/10'} rounded-lg`}>
                    <div className={`mr-4 ${journalCompleted ? 'bg-sprout-green' : 'bg-sprout-purple'} text-white p-2 rounded-full mb-2 sm:mb-0`}>
                      {journalCompleted ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 mb-2 sm:mb-0">
                      <h3 className="font-medium">Write in your journal</h3>
                      <p className="text-sm text-gray-600">
                        {journalCompleted 
                          ? "You've written your journal entry for today!" 
                          : "Express your thoughts and feelings"}
                      </p>
                    </div>
                    <Button 
                      className="sm:ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full mt-2 sm:mt-0 z-0"
                      onClick={() => navigate("/journal")}
                      disabled={journalCompleted}
                    >
                      {journalCompleted ? 'Completed' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Activities;
