
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { CalendarDays, BookOpen, Award, TrendingUp, Plus, Check, Star, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { avatarOptions } from "@/constants/profileOptions";
import { useEffect, useState } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { childProfiles, getCurrentChild, currentChildId, setCurrentChildId } = useUser();
  const currentChild = getCurrentChild();
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [dailyCheckInCompleted, setDailyCheckInCompleted] = useState(false);
  
  // Get journal entries to check if today's entry exists
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
  
  // Check if daily check-in was done today
  useEffect(() => {
    if (currentChild) {
      // Compare the date of the latest check-in with today's date
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
  
  // Mock quotes for demo
  const motivationalQuotes = [
    "Believe you can and you're halfway there.",
    "You are braver than you believe, stronger than you seem, and smarter than you think.",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    "It always seems impossible until it's done.",
    "You're off to great places! Today is your day! Your mountain is waiting, so get on your way!"
  ];
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Get avatar image for the child
  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return avatarOptions[0].src;
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.src : avatarOptions[0].src;
  };

  // Mockup achievements and what's next
  const achievements = [
    { 
      title: "First Login", 
      description: "Completed your first login", 
      icon: "🏆", 
      completed: true 
    },
    { 
      title: "Profile Creator", 
      description: "Created your profile", 
      icon: "🎨", 
      completed: currentChild ? !!currentChild.creationStatus : false 
    },
    { 
      title: "Emotion Explorer", 
      description: "Completed first daily check-in", 
      icon: "😊", 
      completed: currentChild ? !!currentChild.dailyCheckInCompleted : false 
    },
    { 
      title: "Journal Master", 
      description: "Created your first journal entry", 
      icon: "📝", 
      completed: journalCompleted
    },
    { 
      title: "Week Streak", 
      description: "Completed check-ins for 7 days in a row", 
      icon: "🔥", 
      completed: currentChild ? currentChild.streakCount >= 7 : false 
    },
  ];
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4">
        {childProfiles.length === 0 ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Welcome to Happy Sprout!</h1>
            <p className="text-gray-600 mb-8">Let's get started by creating a profile for your child</p>
            <Button 
              className="sprout-button"
              onClick={() => navigate("/create-profile")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Child Profile
            </Button>
          </div>
        ) : (
          <>
            {!currentChildId && childProfiles.length > 0 && (
              <div className="mb-8 sprout-card">
                <h2 className="text-xl font-bold mb-4">Select a Child Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {childProfiles.map(profile => (
                    <div 
                      key={profile.id}
                      className="p-4 bg-white rounded-lg border-2 border-sprout-purple/20 hover:border-sprout-purple cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setCurrentChildId(profile.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={getAvatarImage(profile.avatar)} alt={profile.nickname} />
                          <AvatarFallback>{profile.nickname.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">{profile.nickname}</h3>
                        <p className="text-sm text-gray-500">Age: {profile.age}</p>
                        <p className="text-sm text-gray-500">Grade: {profile.grade}</p>
                        {profile.creationStatus && (
                          <Badge className={profile.creationStatus === 'completed' ? 'bg-green-500' : 'bg-amber-500'}>
                            {profile.creationStatus === 'completed' ? 'Complete' : 'Pending'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentChild && (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={getAvatarImage(currentChild.avatar)} alt={currentChild.nickname} />
                      <AvatarFallback>{currentChild.nickname.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl font-bold mb-1">Welcome back, {currentChild.nickname}!</h1>
                      <p className="text-gray-600">Let's continue growing your emotional skills today.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                      <div className="h-4 w-4 rounded-full bg-sprout-orange text-white flex items-center justify-center">
                        <Award className="h-3 w-3" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentChild.streakCount} days</div>
                      <p className="text-xs text-muted-foreground">Keep the streak going!</p>
                      <Progress value={20} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
                      <div className="h-4 w-4 rounded-full bg-sprout-green text-white flex items-center justify-center">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentChild.xpPoints} XP</div>
                      <p className="text-xs text-muted-foreground">Level 1 - Growing Seedling</p>
                      <Progress value={40} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                      <div className="h-4 w-4 rounded-full bg-sprout-purple text-white flex items-center justify-center">
                        <Award className="h-3 w-3" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentChild.badges.length}</div>
                      <p className="text-xs text-muted-foreground">Keep going to earn more!</p>
                      <div className="flex mt-3">
                        {currentChild.badges.length === 0 ? (
                          <div className="text-sm text-gray-500">No badges yet</div>
                        ) : (
                          currentChild.badges.map((badge, index) => (
                            <div key={index} className="mr-2">🏆</div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
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
                </div>

                {/* New Achievements Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-sprout-orange" />
                    Achievements
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border ${
                          achievement.completed 
                            ? 'bg-sprout-green/10 border-sprout-green' 
                            : 'bg-gray-100 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {achievement.title}
                              {achievement.completed && (
                                <Check className="h-4 w-4 text-sprout-green" />
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-sprout-yellow" />
                      What's Next
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {achievements.filter(a => !a.completed).map((nextAchievement, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                              <div className="text-xl text-gray-400">{nextAchievement.icon}</div>
                              <div>
                                <h4 className="font-medium">{nextAchievement.title}</h4>
                                <p className="text-sm text-gray-500">{nextAchievement.description}</p>
                              </div>
                            </div>
                          ))}
                          {achievements.filter(a => !a.completed).length === 0 && (
                            <p className="text-center text-gray-500">Great job! You've completed all the beginning achievements!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
