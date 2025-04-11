
import { ChildProfile } from "@/contexts/UserContext";

export const scenarioQuestions = [
  {
    question: "Your friend won't let you join their game during recess. What would you do?",
    options: [
      { value: "ask", label: "Politely ask why you can't join" },
      { value: "other", label: "Find another game to play" },
      { value: "teacher", label: "Tell a teacher" },
      { value: "upset", label: "Get upset and tell them they're being mean" },
    ],
  },
  {
    question: "Someone in your class is being teased. What would you do?",
    options: [
      { value: "support", label: "Go support them and be friendly" },
      { value: "tell", label: "Tell a teacher about what you saw" },
      { value: "ignore", label: "Stay out of it to avoid trouble" },
      { value: "join", label: "Join in if everyone else is doing it" },
    ],
  },
  {
    question: "You accidentally broke something that belongs to someone else. What would you do?",
    options: [
      { value: "admit", label: "Tell them right away and offer to fix it" },
      { value: "hide", label: "Put it back and hope they don't notice" },
      { value: "blame", label: "Say someone else did it" },
      { value: "avoid", label: "Avoid them so you don't have to explain" },
    ],
  }
];

export const motivationalQuotes = [
  "Great job! Remember that sharing your feelings helps you grow stronger!",
  "You're doing amazing! Recognizing your emotions is the first step to managing them.",
  "Awesome check-in! Each day you learn more about yourself and your emotions.",
  "Well done! Your emotional awareness is growing every day.",
  "Fantastic! Understanding your feelings today helps you handle tomorrow better.",
];

export const getRandomQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

export const getScenarioQuestion = (currentChildId: string | null) => {
  if (!currentChildId) return scenarioQuestions[0];
  
  const childIdSum = currentChildId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  const questionIndex = (childIdSum + dayOfYear) % scenarioQuestions.length;
  return scenarioQuestions[questionIndex];
};

export const isCheckInCompletedToday = (currentChild?: ChildProfile): boolean => {
  if (!currentChild) return false;
  
  const isToday = (date?: string) => {
    if (!date) return false;
    const checkInDate = new Date(date);
    const today = new Date();
    return checkInDate.toDateString() === today.toDateString();
  };
  
  return Boolean(currentChild.dailyCheckInCompleted && 
                 currentChild.lastCheckInDate && 
                 isToday(currentChild.lastCheckInDate));
};
