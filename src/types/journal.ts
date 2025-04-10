
export type JournalEntry = {
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
  emotion?: string; // The exact emotion from the daily check-in
};

export interface DBJournalEntry {
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
  emotion?: string; // Exact emotion from daily check-in
}

export type JournalFilters = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  moodFilter: string;
  emotionFilter?: string; // New filter for exact emotion matching
};

export const DEFAULT_FILTERS: JournalFilters = {
  startDate: undefined,
  endDate: undefined,
  searchTerm: "",
  moodFilter: "all",
  emotionFilter: undefined
};

// Mapping of emotion names to descriptive feelings
export const EMOTION_FEELINGS_MAP: Record<string, string[]> = {
  "happy": ["Excited", "Happy", "Proud", "Successful", "Motivated", "Inspired", "Energized", "Fulfilled", "Confident"],
  "calm": ["Grateful", "Peaceful", "Included", "Valued", "Optimistic", "Focused", "Curious", "Creative", "Awed"],
  "neutral": ["Okay", "Fine", "Bored", "Tired", "Indifferent", "Blank", "Numb", "Unsure", "Disconnected"],
  "sad": ["Sad", "Worried", "Anxious", "Lonely", "Disappointed", "Embarrassed", "Hurt", "Confused", "Discouraged"],
  "angry": ["Angry", "Frustrated", "Annoyed", "Mad", "Jealous", "Impatient", "Overwhelmed", "Resentful", "Defensive"]
};

// XP point values for activities
export const XP_VALUES = {
  DAILY_CHECKIN: 10,
  JOURNAL_ENTRY: 15,
  SOCIAL_SCENARIO: 10,
  DAILY_BONUS: 5 // Bonus for completing both check-in and journal in one day
};
