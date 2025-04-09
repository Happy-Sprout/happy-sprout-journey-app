
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
}

export type JournalFilters = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  moodFilter: string;
};

export const DEFAULT_FILTERS: JournalFilters = {
  startDate: undefined,
  endDate: undefined,
  searchTerm: "",
  moodFilter: "all",
};
