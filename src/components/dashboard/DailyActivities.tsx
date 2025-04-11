
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarDays, Check } from "lucide-react";
import { ChildProfile } from "@/contexts/UserContext";
import { useJournalEntries } from "@/hooks/useJournalEntries";

interface DailyActivitiesProps {
  currentChild: ChildProfile;
  currentChildId: string;
}

const DailyActivities = ({ currentChild, currentChildId }: DailyActivitiesProps) => {
  const navigate = useNavigate();
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [dailyCheckInCompleted, setDailyCheckInCompleted] = useState(false);
  
  const { getTodayEntry } = useJournalEntries(currentChildId);
  
  useEffect(() => {
    const checkTodayJournalEntry = async () => {
      if (currentChildId) {
        const todayEntry = await getTodayEntry();
        setJournalCompleted(!!todayEntry);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Activities for Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center p-3 ${dailyCheckInCompleted ? 'bg-sprout-green/10' : 'bg-sprout-orange/10'} rounded-lg`}>
                <div className={`mr-4 ${dailyCheckInCompleted ? 'bg-sprout-green' : 'bg-sprout-orange'} text-white p-2 rounded-full`}>
                  {dailyCheckInCompleted ? <Check className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-medium">Daily Check-In</h3>
                  <p className="text-sm text-gray-600">
                    {dailyCheckInCompleted 
                      ? "You've completed today's check-in!" 
                      : "Share how you're feeling today!"}
                  </p>
                </div>
                <Button 
                  className="ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
                  onClick={() => navigate("/daily-check-in")}
                  disabled={dailyCheckInCompleted}
                >
                  {dailyCheckInCompleted ? 'Completed' : 'Start'}
                </Button>
              </div>
              
              <div className={`flex items-center p-3 ${journalCompleted ? 'bg-sprout-green/10' : 'bg-sprout-purple/10'} rounded-lg`}>
                <div className={`mr-4 ${journalCompleted ? 'bg-sprout-green' : 'bg-sprout-purple'} text-white p-2 rounded-full`}>
                  {journalCompleted ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-medium">Journal Entry</h3>
                  <p className="text-sm text-gray-600">
                    {journalCompleted 
                      ? "You've completed today's journal entry!" 
                      : "Write about your day and thoughts"}
                  </p>
                </div>
                <Button 
                  className="ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
                  onClick={() => navigate("/journal")}
                  disabled={journalCompleted}
                >
                  {journalCompleted ? 'Completed' : 'Start'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DailyInspirationCard />
    </div>
  );
};

const DailyInspirationCard = () => {
  const motivationalQuotes = [
    "Believe you can and you're halfway there.",
    "You are braver than you believe, stronger than you seem, and smarter than you think.",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    "It always seems impossible until it's done.",
    "You're off to great places! Today is your day! Your mountain is waiting, so get on your way!"
  ];
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Inspiration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-gradient-to-br from-sprout-yellow/30 to-sprout-orange/30 rounded-lg text-center">
          <p className="italic text-gray-800">"{randomQuote}"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyActivities;
