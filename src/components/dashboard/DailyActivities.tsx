
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarDays, Check, Sparkles } from "lucide-react";
import { ChildProfile } from "@/types/childProfile";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DailyActivitiesProps {
  currentChild: ChildProfile;
  currentChildId: string;
}

const DailyActivities = ({ currentChild, currentChildId }: DailyActivitiesProps) => {
  const navigate = useNavigate();
  const [dailyCheckInCompleted, setDailyCheckInCompleted] = useState(false);
  const [checkingDailyStatus, setCheckingDailyStatus] = useState(true);
  
  const { 
    getTodayEntry, 
    todayEntryLoaded, 
    cachedTodayEntry,
    isCheckingTodayEntry 
  } = useJournalEntries(currentChildId);
  
  const journalCompleted = todayEntryLoaded && !!cachedTodayEntry;
  
  useEffect(() => {
    if (currentChild) {
      setCheckingDailyStatus(true);
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
      setCheckingDailyStatus(false);
    }
  }, [currentChild]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <Sparkles className="h-5 w-5 mr-2 text-sprout-purple" />
            Activities for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Daily Check-In Activity */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className={`relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                dailyCheckInCompleted 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm' 
                  : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Success confetti effect */}
              {dailyCheckInCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <span className="text-lg">🎉</span>
                </motion.div>
              )}
              
              <motion.div 
                whileHover={{ rotate: 5 }}
                className={`mr-4 ${
                  dailyCheckInCompleted ? 'bg-emerald-500' : 'bg-orange-500'
                } text-white p-3 rounded-full mb-2 sm:mb-0 shadow-lg`}
              >
                {dailyCheckInCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <CalendarDays className="h-5 w-5" />
                )}
              </motion.div>
              
              <div className="flex-1 mb-2 sm:mb-0">
                <h3 className="font-bold text-lg text-gray-800">Daily Check-In</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {dailyCheckInCompleted 
                    ? "Amazing! You've shared your feelings today! 🌟" 
                    : "Let's see how you're feeling today! 😊"}
                </p>
              </div>
              
              {checkingDailyStatus ? (
                <div className="sm:ml-auto flex items-center space-x-2 bg-white/80 rounded-full px-3 py-2">
                  <LoadingSpinner size={20} />
                  <span className="text-sm text-gray-500">Checking...</span>
                </div>
              ) : (
                <Button 
                  className={`sm:ml-auto font-semibold rounded-full px-6 py-2 transition-all duration-300 mt-2 sm:mt-0 ${
                    dailyCheckInCompleted
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-sprout-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => navigate("/daily-check-in")}
                  disabled={dailyCheckInCompleted}
                >
                  {dailyCheckInCompleted ? '✓ Completed' : 'Start Check-In'}
                </Button>
              )}
            </motion.div>
            
            {/* Journal Entry Activity */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className={`relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                journalCompleted 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm' 
                  : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Success confetti effect */}
              {journalCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <span className="text-lg">📝</span>
                </motion.div>
              )}
              
              <motion.div 
                whileHover={{ rotate: 5 }}
                className={`mr-4 ${
                  journalCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-sprout-purple to-purple-600'
                } text-white p-3 rounded-full mb-2 sm:mb-0 shadow-lg`}
              >
                {journalCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
              </motion.div>
              
              <div className="flex-1 mb-2 sm:mb-0">
                <h3 className="font-bold text-lg text-gray-800">Journal Entry</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {journalCompleted 
                    ? "Wonderful! You've captured your thoughts today! 📖" 
                    : "Share your thoughts and experiences! ✍️"}
                </p>
              </div>
              
              {isCheckingTodayEntry ? (
                <div className="sm:ml-auto flex items-center space-x-2 bg-white/80 rounded-full px-3 py-2">
                  <LoadingSpinner size={20} />
                  <span className="text-sm text-gray-500">Checking...</span>
                </div>
              ) : (
                <Button 
                  className={`sm:ml-auto font-semibold rounded-full px-6 py-2 transition-all duration-300 mt-2 sm:mt-0 ${
                    journalCompleted
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-sprout-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => navigate("/journal")}
                  disabled={journalCompleted}
                >
                  {journalCompleted ? '✓ Completed' : 'Start Writing'}
                </Button>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyActivities;
