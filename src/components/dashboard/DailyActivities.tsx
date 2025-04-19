import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarDays, Check, Star } from "lucide-react";
import { ChildProfile } from "@/types/childProfile";
import { useJournalEntries } from "@/hooks/useJournalEntries";

interface DailyActivitiesProps {
  currentChild: ChildProfile;
  currentChildId: string;
}

const DailyActivities = ({ currentChild, currentChildId }: DailyActivitiesProps) => {
  const navigate = useNavigate();
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [dailyCheckInCompleted, setDailyCheckInCompleted] = useState(false);
  
  const { getTodayEntry, todayEntryLoaded, cachedTodayEntry } = useJournalEntries(currentChildId);
  
  useEffect(() => {
    const checkTodayJournalEntry = async () => {
      if (currentChildId) {
        try {
          console.log("DailyActivities: Checking for today's journal entry");
          const todayEntry = await getTodayEntry();
          console.log("DailyActivities: Today's entry check result:", todayEntry);
          setJournalCompleted(!!todayEntry);
        } catch (error) {
          console.error("DailyActivities: Error checking today's entry:", error);
        }
      }
    };
    
    checkTodayJournalEntry();
  }, [currentChildId, getTodayEntry]);
  
  useEffect(() => {
    if (todayEntryLoaded) {
      console.log("DailyActivities: Using cached today entry status:", !!cachedTodayEntry);
      setJournalCompleted(!!cachedTodayEntry);
    }
  }, [cachedTodayEntry, todayEntryLoaded]);
  
  useEffect(() => {
    if (currentChild) {
      const isToday = (date) => {
        if (!date) return false;
        const checkInDate = new Date(date);
        const today = new Date();
        return checkInDate.toDateString() === today.toDateString();
      };
      
      const isCompleted = currentChild.dailyCheckInCompleted && 
                         isToday(currentChild.lastCheckInDate);
                         
      console.log("Daily check-in status:", {
        isCompleted,
        dailyCheckInCompleted: currentChild.dailyCheckInCompleted,
        lastCheckInDate: currentChild.lastCheckInDate,
        isToday: isToday(currentChild.lastCheckInDate)
      });
      
      setDailyCheckInCompleted(isCompleted);
    }
  }, [currentChild]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Activities for Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center p-3 ${dailyCheckInCompleted ? 'bg-sprout-green/10' : 'bg-sprout-orange/10'} rounded-lg`}>
            <div className={`mr-4 ${dailyCheckInCompleted ? 'bg-sprout-green' : 'bg-sprout-orange'} text-white p-2 rounded-full mb-2 sm:mb-0`}>
              {dailyCheckInCompleted ? <Check className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
            </div>
            <div className="flex-1 mb-2 sm:mb-0">
              <h3 className="font-medium">Daily Check-In</h3>
              <p className="text-sm text-gray-600">
                {dailyCheckInCompleted 
                  ? "You've completed today's check-in!" 
                  : "Share how you're feeling today!"}
              </p>
            </div>
            <Button 
              className="sm:ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full mt-2 sm:mt-0"
              onClick={() => navigate("/daily-check-in")}
              disabled={dailyCheckInCompleted}
            >
              {dailyCheckInCompleted ? 'Completed' : 'Start'}
            </Button>
          </div>
          
          <div className={`flex flex-col sm:flex-row items-start sm:items-center p-3 ${journalCompleted ? 'bg-sprout-green/10' : 'bg-sprout-purple/10'} rounded-lg`}>
            <div className={`mr-4 ${journalCompleted ? 'bg-sprout-green' : 'bg-sprout-purple'} text-white p-2 rounded-full mb-2 sm:mb-0`}>
              {journalCompleted ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div className="flex-1 mb-2 sm:mb-0">
              <h3 className="font-medium">Journal Entry</h3>
              <p className="text-sm text-gray-600">
                {journalCompleted 
                  ? "You've completed today's journal entry!" 
                  : "Write about your day and thoughts"}
              </p>
            </div>
            <Button 
              className="sm:ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full mt-2 sm:mt-0"
              onClick={() => navigate("/journal")}
              disabled={journalCompleted}
            >
              {journalCompleted ? 'Completed' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyActivities;
